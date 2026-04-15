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
  CircularProgress,
  Avatar,
  Chip,
  Switch,
  Tabs,
  Tab,
  AvatarGroup,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  X,
  AlertCircle,
  Users,
  Database,
  Layers as LayersIcon,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { pricePlanFormSchema } from '../../Yup/Schema';
import { 
  useGetPricePlansQuery, 
  useAddPricePlanMutation, 
  useUpdatePricePlanMutation, 
  useDeletePricePlanMutation 
} from '../../store/api/pricePlanApi';
import { useGetProductsQuery } from '../../store/api/productApi';
import type { PricePlan } from '../../types/Types';
import { Input, Label } from '../../components/Input';

const PricePlans: React.FC = () => {
  // API Queries & Mutations
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const { data: plansResponse, isLoading } = useGetPricePlansQuery({ 
    page: 0, 
    size: 10, 
    search: searchQuery 
  });
  
  const { data: productsResponse } = useGetProductsQuery({ page: 0, size: 100 });
  const allProducts = productsResponse?.data?.content || [];

  const [addPlan, { isLoading: isAdding }] = useAddPricePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePricePlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePricePlanMutation();

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: yupResolver(pricePlanFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      planType: 'BASE',
      category: 'BUSINESS',
      days: 30,
      userCount: 0,
      maxTeams: 'Unlimited',
      maxStorageGB: 0,
      features: [],
      includedProductIds: [],
      active: true,
      default: false,
    }
  });

  const watchFeatures = watch('features', []);

  // Handlers
  const handleOpenModal = (plan?: PricePlan) => {
    if (plan) {
      setIsEditing(true);
      setEditingId(plan.id);
      
      // Parse features: some are "Feature1,Feature2" strings in the array
      const flatFeatures = plan.features.flatMap(f => f.includes(',') ? f.split(',') : f);
      
      reset({
        name: plan.name,
        price: plan.price,
        planType: plan.planType,
        category: plan.category,
        days: plan.days,
        userCount: plan.userCount,
        maxTeams: plan.maxTeams === null ? 'Unlimited' : plan.maxTeams,
        maxStorageGB: plan.maxStorageGB,
        features: flatFeatures,
        includedProductIds: plan.products.map(p => p.id),
        active: plan.active,
        default: plan.default,
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      reset({
        name: '',
        price: 0,
        planType: 'BASE',
        category: 'BUSINESS',
        days: 30,
        userCount: 0,
        maxTeams: 'Unlimited',
        maxStorageGB: 0,
        features: [],
        includedProductIds: [],
        active: true,
        default: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const formattedData = {
        ...data,
        maxTeams: data.maxTeams === 'Unlimited' ? null : Number(data.maxTeams)
      };

      if (isEditing && editingId) {
        await updatePlan({ id: editingId, plan: formattedData as any }).unwrap();
        toast.success('Price plan updated successfully');
      } else {
        await addPlan(formattedData as any).unwrap();
        toast.success('Price plan created successfully');
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
        await deletePlan(idToDelete).unwrap();
        toast.success('Price plan deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete price plan');
      }
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setValue('features', [...watchFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setValue('features', watchFeatures.filter((_: any, i: number) => i !== index));
  };

  // Filtered Data
  const filteredPlans = useMemo(() => {
    if (!plansResponse?.data) return [];
    
    return plansResponse.data.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.planType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'ALL' || p.category === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [plansResponse, activeTab, searchQuery]);

  // Metrics
  const stats = useMemo(() => {
    const plans = plansResponse?.data || [];
    const total = plans.length;
    const active = plans.filter(p => p.active).length;
    const avgPrice = plans.length > 0 
      ? Math.round(plans.reduce((acc, p) => acc + p.price, 0) / plans.length) 
      : 0;
    return { total, active, avgPrice };
  }, [plansResponse]);

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B', mb: 1 }}>Price Plans</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500 }}>Configure subscription tiers and resource quotas for all organizations.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenModal()}
          sx={{ borderRadius: '12px', textTransform: 'none', px: 3, py: 1.5, fontWeight: 700, backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}
        >
          New Plan
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: 1 }}>Total Plans</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#0F172A', mt: 1 }}>{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #DCFCE7', bgcolor: '#F0FDF4', boxShadow: 'none' }}>
            <Typography variant="overline" sx={{ color: '#166534', fontWeight: 800, letterSpacing: 1 }}>Active Plans</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#166534', mt: 1 }}>{stats.active}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #F5F3FF', bgcolor: '#F5F3FF', boxShadow: 'none' }}>
            <Typography variant="overline" sx={{ color: '#5B21B6', fontWeight: 800, letterSpacing: 1 }}>Avg. Monthly Price</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#5B21B6', mt: 1 }}>₹{stats.avgPrice}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Toolbar & Filters */}
      <Paper sx={{ p: 2, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, v) => setActiveTab(v)}
            sx={{ 
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': { 
                textTransform: 'none', 
                minHeight: '40px',
                borderRadius: '12px', 
                mx: 0.5,
                fontWeight: 700,
                color: '#64748B',
                '&.Mui-selected': { color: '#2563EB', bgcolor: '#EFF6FF' }
              }
            }}
          >
            <Tab label={`All Plans ${stats.total}`} value="ALL" />
            <Tab label="Business" value="BUSINESS" />
            <Tab label="Individual" value="INDIVIDUAL" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search plans by name or type..."
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
          <Button
            variant="outlined"
            startIcon={<Filter size={18} />}
            sx={{ 
              borderRadius: '12px', 
              borderColor: '#E2E8F0', 
              color: '#64748B', 
              textTransform: 'none', 
              fontWeight: 700,
              px: 3,
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' }
            }}
          >
            Filters
          </Button>
        </Box>
      </Paper>

      {/* Table Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
        <Box sx={{ flex: 2 }}>Plan Name</Box>
        <Box sx={{ flex: 1 }}>Pricing</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Category</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Type</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Validity</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Products</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Quotas</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Status</Box>
        <Box sx={{ width: 100, textAlign: 'right' }}>Actions</Box>
      </Box>

      {/* List Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredPlans.map((plan) => (
            <Paper 
              key={plan.id} 
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
                  boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <Box sx={{ flex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>{plan.name}</Typography>
                  {plan.default && (
                    <Chip label="Default" size="small" sx={{ height: 20, bgcolor: '#2563EB', color: 'white', fontWeight: 800, fontSize: '0.65rem' }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{plan.features.length} features included</Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>₹{plan.price}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>per month</Typography>
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Chip 
                  label={plan.category} 
                  size="small"
                  sx={{ 
                    bgcolor: plan.category === 'BUSINESS' ? '#DCFCE7' : '#FFEDD5',
                    color: plan.category === 'BUSINESS' ? '#166534' : '#9A3412',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Chip 
                  label={plan.planType} 
                  variant="outlined"
                  size="small"
                  sx={{ color: '#2563EB', borderColor: '#BFDBFE', fontWeight: 800, fontSize: '0.75rem' }}
                />
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>{plan.days} Days</Typography>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.75rem' } }}>
                  {plan.products.map(p => (
                    <Avatar key={p.id} src={p.logoUrl || ''} title={p.name}>
                      {p.name.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                <Tooltip title={`Users: ${plan.userCount}`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                    <Users size={14} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{plan.userCount}</Typography>
                  </Box>
                </Tooltip>
                <Tooltip title={`Teams: ${plan.maxTeams || 'Unlimited'}`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                    <LayersIcon size={14} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{plan.maxTeams || '∞'}</Typography>
                  </Box>
                </Tooltip>
                <Tooltip title={`Storage: ${plan.maxStorageGB}GB`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                    <Database size={14} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{plan.maxStorageGB}</Typography>
                  </Box>
                </Tooltip>
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Chip 
                  label="Public" 
                  size="small"
                  sx={{ 
                    bgcolor: plan.active ? '#166534' : '#F1F5F9',
                    color: plan.active ? 'white' : '#64748B',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              <Box sx={{ width: 100, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleOpenModal(plan)} sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
                    <Pencil size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteClick(plan.id)} sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
          
          {filteredPlans.length === 0 && (
            <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
              <Typography sx={{ color: '#64748B', fontWeight: 600 }}>No price plans found.</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Add/Edit Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '24px', p: 2 } }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
            {isEditing ? `Edit Plan: ${watch('name')}` : 'Create New Price Plan'}
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: '#64748B' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} label="Plan Name *" placeholder="e.g., Enterprise" errorText={errors.name?.message as string} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" label="Price (₹) *" errorText={errors.price?.message as string} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Label>Plan Type *</Label>
              <Controller
                name="planType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <Select {...field} sx={{ borderRadius: '12px' }}>
                      <MenuItem value="BASE">Base / Starter</MenuItem>
                      <MenuItem value="MID">Mid / Growth</MenuItem>
                      <MenuItem value="PREMIUM">Premium / Enterprise</MenuItem>
                      <MenuItem value="CUSTOM">Custom</MenuItem>
                      <MenuItem value="FREE">Free Trial</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Label>Category *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <Select {...field} sx={{ borderRadius: '12px' }}>
                      <MenuItem value="BUSINESS">Business</MenuItem>
                      <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" label="Validity (Days) *" errorText={errors.days?.message as string} />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontWeight: 800, mb: 1, fontSize: '0.875rem' }}>Included Products *</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>Select at least one product to include in this plan.</Typography>
                <Controller
                  name="includedProductIds"
                  control={control}
                  render={({ field }) => (
                    <Grid container spacing={2}>
                      {allProducts.map((product) => (
                        <Grid size={{ xs: 6, md: 4 }} key={product.id}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={field.value.includes(product.id)}
                                onChange={(e) => {
                                  const newVal = e.target.checked 
                                    ? [...field.value, product.id]
                                    : field.value.filter((id: string) => id !== product.id);
                                  field.onChange(newVal);
                                }}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={product.logoUrl || ''} sx={{ width: 24, height: 24 }}>{product.name.charAt(0)}</Avatar>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{product.name}</Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                />
                {errors.includedProductIds && (
                  <Typography variant="caption" color="error">{errors.includedProductIds.message as string}</Typography>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="userCount"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" label="User Count *" errorText={errors.userCount?.message as string} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="maxTeams"
                control={control}
                render={({ field }) => (
                  <Input {...field} label="Max Teams" placeholder="Unlimited or number" errorText={errors.maxTeams?.message as string} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="maxStorageGB"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" label="Max Storage (GB) *" errorText={errors.maxStorageGB?.message as string} />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Label>Features</Label>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="Add a feature..." 
                  value={newFeature} 
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <Button variant="outlined" onClick={addFeature} sx={{ borderRadius: '12px', textTransform: 'none' }}>Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {watchFeatures.map((feature: string, i: number) => (
                  <Chip 
                    key={i} 
                    label={feature} 
                    onDelete={() => removeFeature(i)}
                    sx={{ borderRadius: '8px', bgcolor: '#F1F5F9', fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Available for signup</Typography>}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="default"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Set as Default Plan</Typography>}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleCloseModal} sx={{ fontWeight: 700, color: '#64748B' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit(onSubmit as any)}
            disabled={isAdding || isUpdating}
            startIcon={!(isAdding || isUpdating) && <CheckCircle2 size={18} />}
            sx={{ borderRadius: '12px', bgcolor: '#2563EB', fontWeight: 700, px: 4, py: 1.5 }}
          >
            {isAdding || isUpdating ? <CircularProgress size={20} color="inherit" /> : isEditing ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
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
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Delete Plan?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
            This will permanently remove the price plan. Organizations currently on this plan will not be immediately affected but no new signups will be possible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setIsDeleteModalOpen(false)} sx={{ fontWeight: 700, color: '#64748B', flex: 1 }}>Cancel</Button>
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

export default PricePlans;
