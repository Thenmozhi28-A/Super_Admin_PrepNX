import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Avatar,
  CircularProgress,
  styled,
} from '@mui/material';
import { X, UploadCloud } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  useGetOrganisationTypesQuery, 
  useGetPricePlansQuery, 
  useRegisterOrganisationMutation 
} from '../../store/api/organizationApi';
import { toast } from 'react-toastify';

interface AddOrganizationModalProps {
  open: boolean;
  onClose: () => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Organization name is required').min(3, 'Minimum 3 characters'),
  organisationTypeId: yup.string().required('Organization type is required'),
  pricePlanId: yup.string().required('Price plan is required'),
  adminEmail: yup.string().email('Invalid email').required('Admin email is required'),
});

const LogoUploadArea = styled(Box)(() => ({
  width: '100px',
  height: '100px',
  borderRadius: '16px',
  border: '2px dashed #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#F8FAFC',
  '&:hover': {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
}));

export const AddOrganizationModal: React.FC<AddOrganizationModalProps> = ({ open, onClose }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: typesResponse } = useGetOrganisationTypesQuery();
  const { data: plansResponse } = useGetPricePlansQuery('BUSINESS');
  const [registerOrganisation, { isLoading: isRegistering }] = useRegisterOrganisationMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      organisationTypeId: '',
      pricePlanId: '',
      adminEmail: '',
    }
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('organisationTypeId', data.organisationTypeId);
      formData.append('pricePlanId', data.pricePlanId);
      formData.append('adminEmail', data.adminEmail);
      
      // Auto-generated fields
      const workspaceUrl = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
      formData.append('workspaceUrl', workspaceUrl);
      formData.append('adminName', 'Admin User');
      formData.append('adminPassword', 'TempPass123!'); // Secure default, user will reset via email

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await registerOrganisation(formData).unwrap();
      toast.success('Organization provisioned successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to provision organization');
    }
  };

  const handleClose = () => {
    reset();
    setLogoPreview(null);
    setLogoFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px' } }}>
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>Add New Tenant</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, pt: 1 }}>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 4, fontWeight: 500 }}>
          Provision a new organization workspace.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 8 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#1E293B' }}>Organization Name</Typography>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="e.g. Acme Corp"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#1E293B', width: '100%', textAlign: 'center' }}>Brand Logo</Typography>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                onChange={handleLogoChange}
              />
              <label htmlFor="logo-upload">
                <LogoUploadArea>
                  {logoPreview ? (
                    <Avatar src={logoPreview} sx={{ width: '100%', height: '100%', borderRadius: '14px' }} />
                  ) : (
                    <>
                      <UploadCloud size={24} color="#94A3B8" />
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', mt: 0.5 }}>UPLOAD</Typography>
                    </>
                  )}
                </LogoUploadArea>
              </label>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#1E293B' }}>Type</Typography>
              <Controller
                name="organisationTypeId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    error={!!errors.organisationTypeId}
                    helperText={errors.organisationTypeId?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  >
                    <MenuItem value="" disabled>Select Type</MenuItem>
                    {typesResponse?.data?.map(t => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#1E293B' }}>Plan</Typography>
              <Controller
                name="pricePlanId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    error={!!errors.pricePlanId}
                    helperText={errors.pricePlanId?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  >
                    <MenuItem value="" disabled>Select Plan</MenuItem>
                    {plansResponse?.data?.map((p: any) => (
                      <MenuItem key={p.id} value={p.id}>{p.name} - ₹{p.price}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#1E293B' }}>Admin Email</Typography>
              <Controller
                name="adminEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="admin@organization.com"
                    error={!!errors.adminEmail}
                    helperText={errors.adminEmail?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
              />
              <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, display: 'block', fontWeight: 600 }}>
                This email will receive a secure link to set the administrative password.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={handleClose}
                sx={{
                  color: '#64748B',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 4,
                  borderRadius: '12px'
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isRegistering}
                sx={{
                  backgroundColor: '#2563EB',
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                  '&:hover': { backgroundColor: '#1E40AF' }
                }}
              >
                {isRegistering ? <CircularProgress size={24} color="inherit" /> : 'Provision Tenant'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};
