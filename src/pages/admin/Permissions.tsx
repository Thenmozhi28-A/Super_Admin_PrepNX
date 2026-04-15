import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Shield,
  X,
  AlertCircle
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { permissionFormSchema } from '../../Yup/Schema';
import {
  useGetPermissionsQuery,
  useAddPermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation
} from '../../store/api/permissionApi';
import type { ApiPermission, PermissionFormValues } from '../../types/Types';
import { Input } from '../../components/Input';

const Permissions: React.FC = () => {
  // API Queries & Mutations
  const { data: permissionsResponse, isLoading } = useGetPermissionsQuery();
  const [addPermission, { isLoading: isAdding }] = useAddPermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();
  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation();

  // Local State
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  // Form Setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: yupResolver(permissionFormSchema),
    defaultValues: {
      label: '',
      module: '',
      category: '',
      description: '',
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
    }
  });

  // Filtered Data
  const filteredPermissions = useMemo(() => {
    if (!permissionsResponse?.data) return [];
    return permissionsResponse.data.filter(p =>
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [permissionsResponse, searchQuery]);

  // Handlers
  const handleOpenModal = (permission?: ApiPermission) => {
    if (permission) {
      setIsEditing(true);
      setEditingId(permission.id);
      reset({
        label: permission.label,
        module: permission.module,
        category: permission.category,
        description: permission.description,
        canCreate: permission.canCreate,
        canRead: permission.canRead,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      reset({
        label: '',
        module: '',
        category: '',
        description: '',
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit: SubmitHandler<PermissionFormValues> = async (data) => {
    try {
      if (isEditing && editingId) {
        await updatePermission({ id: editingId, permission: data }).unwrap();
        toast.success('Permission updated successfully');
      } else {
        await addPermission(data).unwrap();
        toast.success('Permission created successfully');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    }
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      try {
        await deletePermission(idToDelete).unwrap();
        toast.success('Permission deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete permission');
      }
    }
  };

  const OperationBadge = ({ char, active, color }: { char: string, active: boolean, color: string }) => (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 800,
        backgroundColor: active ? `${color}15` : '#F1F5F9',
        color: active ? color : '#CBD5E1',
        border: `1px solid ${active ? color : '#E2E8F0'}20`
      }}
    >
      {char}
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Permission Definitions</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500 }}>Manage global system permissions and their available operations.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenModal()}
          sx={{ borderRadius: '12px', textTransform: 'none', px: 3, py: 1.5, fontWeight: 700, backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}
        >
          Create Permission
        </Button>
      </Box>

      {/* Toolbar */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <TextField
          fullWidth
          placeholder="Search permissions by label, module or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#64748B" />
                </InputAdornment>
              ),
              sx: { borderRadius: '12px', bgcolor: '#F8FAFC' }
            }
          }}
        />
      </Paper>

      {/* List Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', color: '#64748B', fontWeight: 700, fontSize: '0.875rem' }}>
        <Box sx={{ flex: 2 }}>Label & Module</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Category</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Operations</Box>
        <Box sx={{ width: 100, textAlign: 'right' }}>Actions</Box>
      </Box>

      {/* List Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredPermissions.map((permission) => (
            <Paper
              key={permission.id}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid #F1F5F9',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#2563EB',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#EFF6FF' }}>
                  <Shield size={20} color="#2563EB" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>{permission.label}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{permission.module}</Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '20px',
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {permission.category}
                </Box>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <OperationBadge char="C" active={permission.canCreate} color="#10B981" />
                <OperationBadge char="R" active={permission.canRead} color="#3B82F6" />
                <OperationBadge char="U" active={permission.canUpdate} color="#F59E0B" />
                <OperationBadge char="D" active={permission.canDelete} color="#EF4444" />
              </Box>

              <Box sx={{ width: 100, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleOpenModal(permission)} sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
                    <Pencil size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteClick(permission.id)} sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
          {filteredPermissions.length === 0 && (
            <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '16px', border: '2px dashed #E2E8F0' }}>
              <Typography sx={{ color: '#64748B', fontWeight: 600 }}>No permissions found matching your search.</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '24px', p: 2 } }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#EFF6FF' }}>
              <Shield size={24} color="#2563EB" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
                {isEditing ? 'Edit Permission' : 'Create New Permission'}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>
                Define access control parameters for the system.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseModal} sx={{ color: '#64748B' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="label"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Display Label *"
                    placeholder="e.g., Manage Users"
                    errorText={errors.label?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="module"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Module Code *"
                    placeholder="e.g., user_management"
                    errorText={errors.module?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Category *"
                    placeholder="e.g., Administration"
                    errorText={errors.category?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Description *"
                    multiline
                    rows={3}
                    placeholder="Brief explanation of what this permission allows..."
                    errorText={errors.description?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '0.875rem', color: '#475569' }}>
                  Allowed Operations
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Controller
                    name="canCreate"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} color="primary" />}
                        label="Create"
                        sx={{ '& .MuiTypography-root': { fontWeight: 600, fontSize: '0.875rem' } }}
                      />
                    )}
                  />
                  <Controller
                    name="canRead"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} color="primary" />}
                        label="Read"
                        sx={{ '& .MuiTypography-root': { fontWeight: 600, fontSize: '0.875rem' } }}
                      />
                    )}
                  />
                  <Controller
                    name="canUpdate"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} color="primary" />}
                        label="Update"
                        sx={{ '& .MuiTypography-root': { fontWeight: 600, fontSize: '0.875rem' } }}
                      />
                    )}
                  />
                  <Controller
                    name="canDelete"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} color="primary" />}
                        label="Delete"
                        sx={{ '& .MuiTypography-root': { fontWeight: 600, fontSize: '0.875rem' } }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseModal} sx={{ fontWeight: 700, color: '#64748B', px: 3 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit as any)}
            disabled={isAdding || isUpdating}
            sx={{ borderRadius: '12px', bgcolor: '#2563EB', fontWeight: 700, px: 4, py: 1.5 }}
          >
            {isAdding || isUpdating ? <CircularProgress size={20} color="inherit" /> : isEditing ? 'Update Definition' : 'Create Definition'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        slotProps={{
          paper: { sx: { borderRadius: '24px', p: 2, maxWidth: 400 } }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#FEF2F2', display: 'inline-flex', mb: 2 }}>
            <AlertCircle size={40} color="#EF4444" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Delete Permission?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
            This action cannot be undone. All roles assigned this permission will be affected.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setIsDeleteModalOpen(false)} sx={{ fontWeight: 700, color: '#64748B', flex: 1 }}>
            Wait, cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmDelete}
            disabled={isDeleting}
            sx={{ borderRadius: '12px', bgcolor: '#EF4444', fontWeight: 700, flex: 1, '&:hover': { bgcolor: '#DC2626' } }}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Permissions;
