import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Paper,
  Button,
  Divider,
  styled,
  Skeleton,
} from '@mui/material';
import { X, Database, Globe } from 'lucide-react';
import { useGetOrganisationByIdQuery } from '../../store/api/organizationApi';

interface OrganizationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onViewAudit: () => void;
}

const SectionBox = styled(Box)(() => ({
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  backgroundColor: '#fff',
  height: '100%',
}));

const Label = styled(Typography)(() => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  marginBottom: '4px',
}));

const Value = styled(Typography)(() => ({
  fontSize: '1rem',
  fontWeight: 700,
  color: '#1E293B',
}));

const InfoChip = styled(Chip)(() => ({
  borderRadius: '8px',
  height: '28px',
  backgroundColor: '#F1F5F9',
  fontWeight: 600,
  fontSize: '0.75rem',
}));

export const OrganizationDetailsModal: React.FC<OrganizationDetailsModalProps> = ({
  open,
  onClose,
  organizationId,
  onViewAudit,
}) => {
  const { data: orgResponse, isLoading } = useGetOrganisationByIdQuery(organizationId, { skip: !open });
  const organization = orgResponse?.data;

  if (!open) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '20px' } }}>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
        </DialogContent>
      </Dialog>
    );
  }

  if (!organization) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '20px' } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Organization Details</Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, pt: 1 }}>
        <Grid container spacing={4}>
          {/* Left Panel - Stats & Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4, p: 3, border: '1px solid #E2E8F0', borderRadius: '16px' }}>
              <Avatar
                src={organization.logoUrl || undefined}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, borderRadius: '24px', border: '1px solid #F1F5F9' }}
              >
                {organization.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{organization.name}</Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.875rem', mb: 2 }}>{organization.workspaceUrl}</Typography>
              <Chip
                label={organization.status}
                color={organization.status === 'ACTIVE' ? 'success' : 'error'}
                sx={{ fontWeight: 800, borderRadius: '8px' }}
              />
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1E293B' }}>Subscription</Typography>
            <Paper sx={{ p: 2, border: '1px solid #E2E8F0', boxShadow: 'none', borderRadius: '12px' }}>
              <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '1.25rem' }}>{organization.pricePlan.name}</Typography>
              <Typography sx={{ color: '#2563EB', fontWeight: 600, mb: 2 }}>₹{organization.pricePlan.price}/month</Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>Category</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{organization.pricePlan.category}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>User Count</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{organization.totalUsers}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748B', fontSize: '0.875rem' }}>Billing Status</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10B981' }}>Active</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - Infrastructure & Usage */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <SectionBox>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Database size={20} color="#64748B" />
                    <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>Infrastructure & Usage</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }}>
                      <Label>Current Storage</Label>
                      <Value>{organization.currentStorageGB} GB <Typography component="span" sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>/ 0 GB</Typography></Value>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Label>Org Type</Label>
                      <Value>{organization.type.name}</Value>
                    </Grid>
                  </Grid>
                </SectionBox>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <SectionBox>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Globe size={20} color="#64748B" />
                    <Typography sx={{ fontWeight: 800, color: '#1E293B' }}>Domains & Access</Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Label>Verified Domains</Label>
                    <Typography sx={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.875rem' }}>No custom domains</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }}>
                      <Label>SSO Enabled</Label>
                      <InfoChip label={organization.ssoEnabled ? 'Yes' : 'No'} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Label>Guest Access</Label>
                      <InfoChip label={organization.guestAccessAllowed ? 'Allowed' : 'Restricted'} />
                    </Grid>
                  </Grid>
                </SectionBox>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onViewAudit}
                  sx={{
                    py: 2,
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    color: '#2563EB',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }
                  }}
                >
                  View Full Audit History
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" onClick={onClose} sx={{ px: 4, py: 1, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>Close</Button>
      </Box>
    </Dialog>
  );
};
