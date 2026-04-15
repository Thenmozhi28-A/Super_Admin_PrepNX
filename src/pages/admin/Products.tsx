import React, { useState } from 'react';
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
  Pagination,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
  AlertCircle,
  Upload,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { productFormSchema } from '../../Yup/Schema';
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} from '../../store/api/productApi';
import type { Product, ProductFormValues } from '../../types/Types';
import { Input } from '../../components/Input';

const Products: React.FC = () => {
  // API Queries & Mutations
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: productsResponse, isLoading } = useGetProductsQuery({
    page,
    size: 10,
    search: searchQuery
  });
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  // Form Setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: yupResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'Software',
      status: 'ACTIVE',
      default: false,
      logoUrl: '',
    }
  });

  // Handlers
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setIsEditing(true);
      setEditingId(product.id);
      reset({
        name: product.name,
        description: product.description,
        category: product.category || 'Software',
        logoUrl: product.logoUrl || '',
        status: product.status,
        default: product.default,
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      reset({
        name: '',
        description: '',
        category: 'Software',
        logoUrl: '',
        status: 'ACTIVE',
        default: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      if (isEditing && editingId) {
        await updateProduct({ id: editingId, product: data }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await addProduct(data).unwrap();
        toast.success('Product added successfully');
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
        await deleteProduct(idToDelete).unwrap();
        toast.success('Product deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Product Catalog</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500 }}>Manage internal products and services available to tenants.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenModal()}
          sx={{ borderRadius: '12px', textTransform: 'none', px: 3, py: 1.5, fontWeight: 700, backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' } }}
        >
          Add Product
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none', position: 'relative', overflow: 'hidden' }}>
            <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: 1 }}>Total Products</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#0F172A', mt: 1 }}>{productsResponse?.data?.page?.totalElements || 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #DCFCE7', bgcolor: '#F0FDF4', boxShadow: 'none' }}>
            <Typography variant="overline" sx={{ color: '#166534', fontWeight: 800, letterSpacing: 1 }}>Active Products</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#166534', mt: 1 }}>
              {productsResponse?.data?.content?.filter(p => p.status === 'ACTIVE').length || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products by name, key or category..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0); // Reset to first page on search
          }}
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
          variant={activeCategory || activeStatus ? "contained" : "outlined"}
          startIcon={<Layers size={18} />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          sx={{ 
            borderRadius: '12px', 
            borderColor: activeCategory || activeStatus ? '#2563EB' : '#E2E8F0', 
            color: activeCategory || activeStatus ? 'white' : '#64748B', 
            textTransform: 'none', 
            fontWeight: 700,
            px: 3,
            '&:hover': { borderColor: '#CBD5E1', bgcolor: activeCategory || activeStatus ? '#1D4ED8' : '#F8FAFC' }
          }}
        >
          {activeCategory || activeStatus ? 'Filtered' : 'Filters'}
        </Button>
      </Paper>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: '16px', mt: 1, width: 200, p: 1 } } }}
      >
        <Typography variant="overline" sx={{ px: 2, fontWeight: 800, color: '#64748B' }}>Category</Typography>
        <List>
          {['Software', 'Medicare', 'Chat', 'Tools'].map((cat) => (
            <ListItem key={cat} disablePadding>
              <ListItemButton 
                onClick={() => {
                  setActiveCategory(activeCategory === cat ? null : cat);
                  setFilterAnchorEl(null);
                }}
                selected={activeCategory === cat}
                sx={{ borderRadius: '8px' }}
              >
                <ListItemText primary={<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{cat}</Typography>} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Typography variant="overline" sx={{ px: 2, fontWeight: 800, color: '#64748B' }}>Status</Typography>
        <List>
          {['ACTIVE', 'INACTIVE'].map((status) => (
            <ListItem key={status} disablePadding>
              <ListItemButton 
                onClick={() => {
                  setActiveStatus(activeStatus === status ? null : status);
                  setFilterAnchorEl(null);
                }}
                selected={activeStatus === status}
                sx={{ borderRadius: '8px' }}
              >
                <ListItemText primary={<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{status}</Typography>} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {(activeCategory || activeStatus) && (
          <Button 
            fullWidth 
            size="small" 
            onClick={() => {
              setActiveCategory(null);
              setActiveStatus(null);
              setFilterAnchorEl(null);
            }}
            sx={{ mt: 1, color: '#EF4444', fontWeight: 700 }}
          >
            Clear Filters
          </Button>
        )}
      </Popover>

      {/* List Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', color: '#64748B', fontWeight: 700, fontSize: '0.875rem' }}>
        <Box sx={{ flex: 3 }}>Product</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>Category</Box>
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
          {productsResponse?.data?.content
            ?.filter(p => !searchQuery || 
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            ?.filter(p => !activeCategory || p.category === activeCategory)
            ?.filter(p => !activeStatus || p.status === activeStatus)
            ?.map((product: Product) => (
            <Paper
              key={product.id}
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
              <Box sx={{ flex: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={product.logoUrl || ''}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <Package size={24} color="#64748B" />
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>{product.name}</Typography>
                    {product.default && (
                      <Chip
                        label="Default"
                        size="small"
                        sx={{ height: 20, bgcolor: '#2563EB', color: 'white', fontWeight: 800, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>{product.description}</Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Layers size={14} color="#64748B" />
                <Typography sx={{ color: '#475569', fontWeight: 700, fontSize: '0.875rem' }}>{product.category || 'Standard'}</Typography>
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    bgcolor: product.status === 'ACTIVE' ? '#166534' : '#F1F5F9',
                    color: product.status === 'ACTIVE' ? 'white' : '#64748B',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              <Box sx={{ width: 100, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleOpenModal(product)} sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
                    <Pencil size={18} />
                  </IconButton>
                </Tooltip>
                {!product.default && (
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDeleteClick(product.id)} sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          ))}

          {/* Pagination */}
          {productsResponse?.data?.page && productsResponse.data.page.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={productsResponse.data.page.totalPages}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
                sx={{ '& .MuiPaginationItem-root': { fontWeight: 700 } }}
              />
            </Box>
          )}

          {(!productsResponse?.data?.content || productsResponse.data.content.length === 0 || 
            productsResponse.data.content
              .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
              .filter(p => !activeCategory || p.category === activeCategory)
              .filter(p => !activeStatus || p.status === activeStatus).length === 0) && (
            <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
              <Typography sx={{ color: '#64748B', fontWeight: 600 }}>No products matching your search criteria.</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Add/Edit Modal */}
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
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: '#64748B' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              width: 100,
              height: 100,
              borderRadius: '24px',
              border: '2px dashed #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F8FAFC',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: 1,
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
            }}>
              <Upload size={24} color="#64748B" />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textAlign: 'center', px: 1 }}>
                Upload icon
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ mt: 1, color: '#94A3B8', fontWeight: 600 }}>PNG/SVG recommended</Typography>
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Product Name *"
                    placeholder="e.g., Nrol Connect"
                    errorText={errors.name?.message as string}
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
                    placeholder="Brief description of the product and its purpose..."
                    errorText={errors.description?.message as string}
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
                    label="Category"
                    placeholder="e.g., Software"
                    errorText={errors.category?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', pb: 1 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value === 'ACTIVE'}
                          onChange={(e) => field.onChange(e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                        />
                      }
                      label={
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#475569' }}>
                          Product Active
                        </Typography>
                      }
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="default"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} color="primary" />}
                    label={
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>
                        Set as Default Product
                      </Typography>
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} sx={{ fontWeight: 700, color: '#64748B', px: 3 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit as any)}
            disabled={isAdding || isUpdating}
            startIcon={!(isAdding || isUpdating) && <CheckCircle2 size={18} />}
            sx={{ borderRadius: '12px', bgcolor: '#2563EB', fontWeight: 700, px: 4, py: 1.5 }}
          >
            {isAdding || isUpdating ? <CircularProgress size={20} color="inherit" /> : isEditing ? 'Update Product' : 'Add Product'}
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
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Delete Product?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
            This will permanently remove the product from the catalog. Existing price plans referencing this product might be affected.
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

export default Products;
