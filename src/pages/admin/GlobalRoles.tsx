import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  Checkbox,
  CircularProgress,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  Plus,
  PlusCircle,
  Eye,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
  Users as UsersIcon,
  Mail,
  Building2,
  Clock,
  CreditCard,
  Layout,
  TrendingUp,
  Star,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { roleSchema } from '../../Yup/Schema';
import { useGetPermissionsQuery } from '../../store/api/permissionApi';
import { 
  useGetRolesQuery, 
  useAddRoleMutation, 
  useUpdateRoleMutation, 
  useDeleteRoleMutation 
} from '../../store/api/rolesApi';
import type { 
  PermissionActionState, 
  PermissionCategory, 
  ApiPermission, 
  RoleForm 
} from '../../types/Types';

const GlobalRoles: React.FC = () => {
  // API Queries
  const { data: permissionsResponse, isLoading: permissionsLoading } = useGetPermissionsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: rolesResponse, isLoading: rolesLoading } = useGetRolesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [addRole, { isLoading: isAddingRole }] = useAddRoleMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  // Local State
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [viewAssignedOnly, setViewAssignedOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const [masterPermissions, setMasterPermissions] = useState<PermissionCategory[]>([]);
  const [localPermissionIds, setLocalPermissionIds] = useState<string[]>([]);
  const [originalPermissionIds, setOriginalPermissionIds] = useState<string[]>([]);

  // Form setup
  const { register, handleSubmit, formState: { errors }, reset: resetRoleForm } = useForm<RoleForm>({
    resolver: yupResolver(roleSchema),
    defaultValues: { name: '', description: '' }
  });

  // Icon Mapper
  const getIcon = (module: string) => {
    switch (module) {
      case 'Users': return <UsersIcon size={18} />;
      case 'Email Templates': return <Mail size={18} />;
      case 'Organization': return <Building2 size={18} />;
      case 'Audit': return <Clock size={18} />;
      case 'Roles & Permissions': return <ShieldCheck size={18} />;
      case 'Billing & Plans': return <CreditCard size={18} />;
      case 'Student Progress': return <TrendingUp size={18} />;
      case 'Content Management': return <Layout size={18} />;
      default: return <Star size={18} />;
    }
  };

  const ACTION_ICONS = {
    CREATE: { icon: PlusCircle, color: '#3B82F6' },
    READ: { icon: Eye, color: '#10B981' },
    UPDATE: { icon: Pencil, color: '#F59E0B' },
    DELETE: { icon: Trash2, color: '#EF4444' },
  };

  // Transformation logic
  const transformApiPermissions = (apiPerms: ApiPermission[]): PermissionCategory[] => {
    const categories: Map<string, PermissionCategory> = new Map();
    apiPerms.forEach(apiPerm => {
      const catName = apiPerm.module;
      if (!categories.has(catName)) {
        categories.set(catName, {
          id: catName.toUpperCase().replace(/\s+/g, '_'),
          name: catName,
          permissions: []
        });
      }
      categories.get(catName)!.permissions.push({
        id: apiPerm.id,
        module: apiPerm.module,
        name: apiPerm.label,
        description: apiPerm.description,
        icon: getIcon(apiPerm.module),
        originalCategory: apiPerm.category,
        actions: {
          CREATE: apiPerm.canCreate,
          READ: apiPerm.canRead,
          UPDATE: apiPerm.canUpdate,
          DELETE: apiPerm.canDelete
        }
      });
    });
    return Array.from(categories.values());
  };

  const roles = useMemo(() => {
    if (!rolesResponse?.data) return [];
    return rolesResponse.data.map(apiRole => ({
      id: apiRole.id,
      name: apiRole.name,
      description: apiRole.description,
      categories: transformApiPermissions(apiRole.permissions)
    }));
  }, [rolesResponse]);

  // Sync master permissions
  useEffect(() => {
    if (permissionsResponse?.data) {
      setMasterPermissions(transformApiPermissions(permissionsResponse.data));
    }
  }, [permissionsResponse]);

  // Initial selection and State Sync
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    const role = roles.find(r => r.id === selectedRoleId);
    if (role) {
      const ids = role.categories.flatMap(c => c.permissions)
        .filter(p => Object.values(p.actions).some(v => v))
        .map(p => p.id);
      setLocalPermissionIds(ids);
      setOriginalPermissionIds(ids);
    } else {
      setLocalPermissionIds([]);
      setOriginalPermissionIds([]);
    }
  }, [selectedRoleId, rolesResponse]);



  const currentRole = roles.find(r => r.id === selectedRoleId);

  // Filtered Roles
  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  // Filtered Permissions based on master list
  const filteredPermissions = useMemo(() => {
    return masterPermissions.map(cat => ({
      ...cat,
      permissions: cat.permissions.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(permSearchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(permSearchQuery.toLowerCase());
        
        // In Assigned Only mode, we filter based on what WAS originally assigned
        const isOriginallyAssigned = originalPermissionIds.includes(p.id);
        
        return matchesSearch && (!viewAssignedOnly || isOriginallyAssigned);
      })
    })).filter(cat => cat.permissions.length > 0);
  }, [masterPermissions, permSearchQuery, viewAssignedOnly, originalPermissionIds]);

  // Handlers
  const handleToggleAction = async (_categoryId: string, permissionId: string, _action: keyof PermissionActionState) => {
    if (!currentRole) return;
    
    setLocalPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleDeselectAll = async (categoryId: string) => {
    if (!currentRole) return;
    
    // Find all permissions belonging to this category from the master list
    const categoryPermIds = masterPermissions.find(c => c.name === categoryId || c.id === categoryId)?.permissions.map(p => p.id) || [];
    setLocalPermissionIds(prev => prev.filter(id => !categoryPermIds.includes(id)));
  };

  const handleSavePermissions = async () => {
    if (!currentRole) return;
    try {
      await updateRole({
        id: currentRole.id,
        role: {
          name: currentRole.name,
          description: currentRole.description,
          permissionIds: localPermissionIds
        }
      }).unwrap();
      setViewAssignedOnly(true);
      toast.success('Permissions saved successfully');
    } catch (error) {
      toast.error('Failed to save permissions');
    }
  };



  const handleNewRole = () => {
    setIsEditing(false);
    setEditingRoleId(null);
    resetRoleForm({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEditRoleIdentity = (role: any) => {
    setIsEditing(true);
    setEditingRoleId(role.id);
    resetRoleForm({ name: role.name, description: role.description });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      try {
        await deleteRole(roleToDelete).unwrap();
        toast.success('Role deleted successfully');
        if (selectedRoleId === roleToDelete) setSelectedRoleId(roles[0]?.id || '');
        setIsDeleteModalOpen(false);
      } catch (e) {
        toast.error('Failed to delete role');
      }
    }
  };

  const onSaveRole = async (formData: RoleForm) => {
    try {
      if (isEditing && editingRoleId) {
        // Just update identity
        const role = roles.find(r => r.id === editingRoleId);
        const permissionIds = role?.categories.flatMap(c => c.permissions).filter(p => Object.values(p.actions).some(v => v)).map(p => p.id) || [];
        await updateRole({
          id: editingRoleId,
          role: { ...formData, permissionIds }
        }).unwrap();
        setSelectedRoleId(editingRoleId);
        setViewAssignedOnly(false); // Switch to all permissions for configuration
        toast.success('Identity updated. Configure permissions now.');
      } else {
        // Create new with zero permissions initially
        const result = await addRole({ ...formData, permissionIds: [] }).unwrap();
        // Assuming result contains the new role or it's refetched
        if (result?.data?.id) setSelectedRoleId(result.data.id);
        setViewAssignedOnly(false); // Switch to all permissions for configuration
        toast.success('Role created. Assign permissions now.');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Operation failed');
    }
  };

  if (permissionsLoading || rolesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Permissions</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500 }}>Manage access control policies for roles.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" sx={{ borderRadius: '12px', bgcolor: 'white' }} onClick={() => setViewAssignedOnly(!viewAssignedOnly)}>
            {viewAssignedOnly ? 'View All Permissions' : 'View Assigned Only'}
          </Button>
          <Button 
            variant="contained" 
            sx={{ borderRadius: '12px', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}
            onClick={handleSavePermissions}
            disabled={isUpdatingRole}
          >
            {isUpdatingRole ? 'Saving...' : 'Save Permissions'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Sidebar - Roles */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1E293B' }}>Roles</Typography>
                <MuiButton 
                  onClick={handleNewRole}
                  sx={{ color: '#2563EB', fontWeight: 800, textTransform: 'none', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Plus size={16} /> New Role
                </MuiButton>
              </Box>
              <Input
                placeholder="Search roles..."
                value={roleSearchQuery}
                onChange={(e) => setRoleSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                }}
              />
            </Box>
            <List sx={{ p: 0 }}>
              {filteredRoles.map((role) => (
                <ListItem key={role.id} disablePadding>
                  <ListItemButton 
                    selected={selectedRoleId === role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    sx={{
                      px: 3,
                      py: 2,
                      borderLeft: '4px solid transparent',
                      '&.Mui-selected': {
                        backgroundColor: '#F0F9FF',
                        color: '#2563EB',
                        borderLeftColor: '#2563EB',
                        '& .MuiListItemText-primary': { color: '#2563EB', fontWeight: 800 }
                      },
                      '&:hover': { backgroundColor: '#F8FAFC' }
                    }}
                  >
                    <ListItemText 
                      primary={role.name} 
                      sx={{ '& .MuiListItemText-primary': { fontSize: '0.9375rem', fontWeight: 600, color: '#475569' } }} 
                    />
                    <Box sx={{ display: 'flex', opacity: 0, '.MuiListItemButton-root:hover &': { opacity: 1 } }}>
                       <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditRoleIdentity(role); }}>
                         <Pencil size={14} />
                       </IconButton>
                       <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setRoleToDelete(role.id); setIsDeleteModalOpen(true); }}>
                         <Trash2 size={14} />
                       </IconButton>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Panel - Permissions */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E293B' }}>
                Permissions - <span style={{ color: '#2563EB' }}>{currentRole?.name || 'Loading...'}</span>
              </Typography>
              <Box sx={{ width: 300 }}>
                <Input
                  placeholder="Filter permissions..."
                  value={permSearchQuery}
                  onChange={(e) => setPermSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                  }}
                />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
              Select the actions this role is allowed to perform.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filteredPermissions.map((category) => (
              <Grid size={{ xs: 12, sm: 6 }} key={category.id}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.875rem' }}>{category.name}</Typography>
                  {!viewAssignedOnly && (
                    <Typography 
                      variant="caption" 
                      onClick={() => handleDeselectAll(category.id)}
                      sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', '&:hover': { color: '#EF4444' } }}
                    >
                      Deselect All
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {category.permissions.map((perm) => (
                    <Paper 
                      key={perm.id} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: '16px', 
                        border: '1px solid #F1F5F9', 
                        boxShadow: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        '&:hover': { borderColor: '#2563EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.875rem' }}>{perm.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>{perm.description}</Typography>
                        </Box>
                        {!viewAssignedOnly && (
                          <Checkbox 
                            checked={localPermissionIds.includes(perm.id)} 
                            size="small"
                            onChange={() => handleToggleAction(category.id, perm.id, 'READ')}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {(['CREATE', 'READ', 'UPDATE', 'DELETE'] as const).map(action => {
                          const actionConfig = ACTION_ICONS[action];
                          const Icon = actionConfig.icon;
                          const isAssigned = localPermissionIds.includes(perm.id);
                          const isSupported = perm.actions[action];

                          if (!isSupported) return null;

                          return (
                            <Tooltip key={action} title={action}>
                              <Box 
                                sx={{ 
                                  p: 0.5, 
                                  color: isAssigned ? actionConfig.color : '#E2E8F0',
                                  transition: 'color 0.2s'
                                }}
                              >
                                <Icon size={16} />
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Role Identity Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maxWidth="xs" 
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', p: 1 } } }}
      >
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{isEditing ? 'Edit Role' : 'Create New Role'}</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 4 }}>Set basic role information before configuring permissions.</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Input label="Role Name" placeholder="e.g. ROLE_EDITOR" {...register('name')} errorText={errors.name?.message} />
            <Input label="Description" placeholder="Access to module editors..." multiline rows={3} {...register('description')} errorText={errors.description?.message} />
          </Box>

          <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '12px' }}>Cancel</Button>
            <Button 
              type="submit"
              variant="contained" 
              fullWidth
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
              onClick={handleSubmit((data) => { onSaveRole(data); setViewAssignedOnly(false); })}
              disabled={isAddingRole || isUpdatingRole}
            >
              {isAddingRole || isUpdatingRole ? 'Processing...' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Delete Modal */}
      <Dialog 
        open={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        slotProps={{ paper: { sx: { borderRadius: '20px', width: 400 } } }}
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <AlertCircle size={32} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Delete Role?</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>This will permanently remove the role and all its assigned permissions.</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="contained" fullWidth color="error" onClick={confirmDelete}>Delete</Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

const MuiButton = ({ children, sx, onClick }: any) => (
  <Box component="span" sx={{ ...sx, cursor: 'pointer', '&:hover': { opacity: 0.8 } }} onClick={onClick}>
    {children}
  </Box>
);

export default GlobalRoles;
