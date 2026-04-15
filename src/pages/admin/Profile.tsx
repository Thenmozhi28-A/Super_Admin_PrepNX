import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  TextField,
  Button as MuiButton,
  IconButton,
  InputAdornment,
  styled,
  CircularProgress,
} from '@mui/material';
import {
  Camera,
  Eye,
  EyeOff,
  Save,
  User,
  Phone,
  Mail,
  Lock,
  Edit3,
  X,
  CheckCircle2,
} from 'lucide-react';
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation, 
  useChangePasswordMutation 
} from '../../store/api/profileApi';
import { toast } from 'react-toastify';

const StyledPaper = styled(Paper)(() => ({
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
  border: '1px solid #E2E8F0',
  backgroundColor: '#fff',
}));

const ActionButton = styled(MuiButton)(() => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 700,
  padding: '10px 24px',
  fontSize: '0.875rem',
  transition: 'all 0.2s',
}));

const Profile: React.FC = () => {
  // Queries & Mutations
  const { data: profileResponse, isLoading: isFetching } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingInfo }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isUpdatingPassword }] = useChangePasswordMutation();

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userData = profileResponse?.data;

  // Initialize state when data is fetched
  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setMobileNumber(userData.mobileNumber);
    }
  }, [userData]);

  const handleCancel = () => {
    setIsEditing(false);
    setName(userData?.name || '');
    setMobileNumber(userData?.mobileNumber || '');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSaveInfo = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('mobileNumber', mobileNumber);
      formData.append('mfaEnabled', userData?.mfaEnabled.toString() || 'false');
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      await updateProfile(formData).unwrap();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await changePassword({
        currentPassword,
        newPassword
      }).unwrap();
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header with Dynamic Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
            Account Settings
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500 }}>
            Manage your professional identity and security credentials.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isEditing ? (
            <ActionButton
              variant="outlined"
              startIcon={<Edit3 size={18} />}
              onClick={() => setIsEditing(true)}
              sx={{ borderColor: '#E2E8F0', color: '#0F172A', '&:hover': { bgcolor: '#F8FAFC' } }}
            >
              Edit Profile
            </ActionButton>
          ) : (
            <>
              <ActionButton
                variant="outlined"
                startIcon={<X size={18} />}
                onClick={handleCancel}
                sx={{ borderColor: '#E2E8F0', color: '#64748B' }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="contained"
                startIcon={<Save size={18} />}
                onClick={handleSaveInfo}
                disabled={isUpdatingInfo}
                sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}
              >
                {isUpdatingInfo ? 'Saving...' : 'Save Changes'}
              </ActionButton>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Visual Profile */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <StyledPaper sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={previewUrl || userData?.profilePicture}
                  sx={{
                    width: 160,
                    height: 160,
                    borderRadius: '32px',
                    fontSize: '4rem',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    border: '4px solid #fff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {userData?.name?.charAt(0) || 'U'}
                </Avatar>
                {isEditing && (
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      bgcolor: '#fff',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      '&:hover': { bgcolor: '#F8FAFC' },
                    }}
                  >
                    <Camera size={20} color="#4F46E5" />
                  </IconButton>
                )}
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                {userData?.name}
              </Typography>
              <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.875rem', mb: 3 }}>
                {userData?.roles?.[0]?.name?.replace('ROLE_', '').replace('_', ' ')}
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Mail size={16} color="#4F46E5" />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>{userData?.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone size={16} color="#4F46E5" />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>{userData?.mobileNumber}</Typography>
                </Box>
              </Box>
            </StyledPaper>

            <StyledPaper sx={{ bgcolor: userData?.active ? '#F0FDF4' : '#FFF1F2', borderColor: userData?.active ? '#DCFCE7' : '#FFE4E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: userData?.active ? '#22C55E' : '#EF4444' }} />
                <Typography sx={{ fontWeight: 800, color: userData?.active ? '#166534' : '#991B1B', fontSize: '0.875rem' }}>
                  Account Status: {userData?.active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </StyledPaper>
          </Box>
        </Grid>

        {/* Right Column: Information Forms */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Personal Details */}
            <StyledPaper>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <User size={20} color="#4F46E5" />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>General Information</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    slotProps={{
                      input: { sx: { borderRadius: '12px', fontWeight: 600 } }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    disabled={!isEditing}
                    slotProps={{
                      input: { sx: { borderRadius: '12px', fontWeight: 600 } }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={userData?.email}
                    disabled
                    slotProps={{
                      input: { sx: { borderRadius: '12px', bgcolor: '#F8FAFC', fontWeight: 600 } }
                    }}
                  />
                </Grid>
              </Grid>
            </StyledPaper>

            {/* Security Section */}
            <StyledPaper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Lock size={20} color="#4F46E5" />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Security & Password</Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your current password to authorize changes"
                    slotProps={{
                      input: { sx: { borderRadius: '12px' } }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!isEditing}
                    slotProps={{
                      input: {
                        sx: { borderRadius: '12px' },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!isEditing}
                    slotProps={{
                      input: {
                        sx: { borderRadius: '12px' },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                  <ActionButton
                    variant="contained"
                    startIcon={<CheckCircle2 size={18} />}
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword || !newPassword}
                    sx={{ bgcolor: '#0F172A', color: '#fff', '&:hover': { bgcolor: '#1E293B' } }}
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password Only'}
                  </ActionButton>
                </Box>
              )}
            </StyledPaper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
