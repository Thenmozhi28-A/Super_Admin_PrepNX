import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Button,
  Divider,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
} from '@mui/material';
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  History, 
  Send,
  MessageCircle,
} from 'lucide-react';
import type { IndividualUser } from '../../types/Types';
import { useResendInviteMutation } from '../../store/api/userApi';
import { toast } from 'react-toastify';
import { IndividualUserLogsModal } from './IndividualUserLogsModal';

interface IndividualUserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  user: IndividualUser | null;
}

const InfoBox = styled(Box)(() => ({
  padding: '20px',
  borderRadius: '16px',
  border: '1px solid #E2E8F0',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}));

export const IndividualUserDetailsModal: React.FC<IndividualUserDetailsModalProps> = ({
  open,
  onClose,
  user,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [resendInvite] = useResendInviteMutation();

  if (!user) return null;

  const handleSendLinkClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleResend = async (type: 'email' | 'whatsapp') => {
    try {
      const emailOrNumber = type === 'email' ? user.email : user.mobileNumber;
      await resendInvite({ emailOrNumber }).unwrap();
      toast.success(`Invite resent via ${type} successfully`);
      handleClosePopover();
    } catch (error) {
      toast.error('Failed to resend invite');
    }
  };

  const isPopoverOpen = Boolean(anchorEl);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px' } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={onClose} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 0 }}>
          {/* User Profile Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              src={user.profilePictureUrl || undefined}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, borderRadius: '32px', border: '4px solid #F1F5F9' }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.5 }}>{user.name}</Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.875rem', mb: 2 }}>Individual User</Typography>
            <Chip
              label={user.status}
              sx={{
                backgroundColor: user.status === 'ACTIVE' ? '#D1FAE5' : '#FEE2E2',
                color: user.status === 'ACTIVE' ? '#065F46' : '#991B1B',
                fontWeight: 800,
                borderRadius: '10px',
                px: 1
              }}
            />
          </Box>

          {/* Contact Information */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Phone size={18} color="#64748B" />
              <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.925rem' }}>Contact Information</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <InfoBox>
                  <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: '#EEF2FF', display: 'flex' }}>
                    <Mail size={20} color="#4F46E5" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>{user.email}</Typography>
                  </Box>
                </InfoBox>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoBox>
                  <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex' }}>
                    <Phone size={20} color="#10B981" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Mobile Number</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>{user.mobileNumber}</Typography>
                  </Box>
                </InfoBox>
              </Grid>
            </Grid>
          </Box>

          {/* Subscription Plan */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Calendar size={18} color="#64748B" />
              <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.925rem' }}>Subscription Plan</Typography>
            </Box>
            <Box sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: '16px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.125rem' }}>{user.pricePlan.name}</Typography>
                  <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.875rem' }}>{user.pricePlan.planType} Plan</Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#2563EB', fontSize: '1.25rem' }}>₹{user.pricePlan.price}/mo</Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<History size={18} />}
                onClick={() => setIsLogsOpen(true)}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  borderColor: '#E2E8F0',
                  color: '#2563EB',
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Logs
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Send size={18} />}
                onClick={handleSendLinkClick}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  backgroundColor: '#6366F1',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#4F46E5' }
                }}
              >
                Send Link
              </Button>
              <Popover
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ '& .MuiPaper-root': { borderRadius: '16px', mt: 1, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } }}
              >
                <List sx={{ p: 1 }}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleResend('email')} sx={{ borderRadius: '10px' }}>
                      <ListItemIcon sx={{ minWidth: 40 }}><Mail size={18} color="#4F46E5" /></ListItemIcon>
                      <ListItemText 
                        primary={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Send via Email</Typography>} 
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleResend('whatsapp')} sx={{ borderRadius: '10px' }}>
                      <ListItemIcon sx={{ minWidth: 40 }}><MessageCircle size={18} color="#10B981" /></ListItemIcon>
                      <ListItemText 
                        primary={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Send via WhatsApp</Typography>} 
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Popover>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={onClose} sx={{ px: 4, py: 1, borderRadius: '12px', backgroundColor: '#2563EB', fontWeight: 700, textTransform: 'none' }}>Close</Button>
        </Box>
      </Dialog>

      <IndividualUserLogsModal
        open={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        userId={user.id}
        userName={user.name}
      />
    </>
  );
};
