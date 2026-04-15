import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Switch,
  Pagination,
  IconButton,
  Skeleton,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  RefreshCw,
  ArrowUpRight,
  Shield,
  Zap,
  Filter,
} from 'lucide-react';
import {
  useGetIndividualUsersQuery,
  useToggleUserStatusMutation,
} from '../../store/api/userApi';
import { toast } from 'react-toastify';
import { IndividualUserDetailsModal } from '../../components/modals/IndividualUserDetailsModal';
import type { IndividualUser } from '../../types/Types';

const ProductIcon = ({ name }: { name: string }) => {
  if (name.includes('Medplex')) return <Shield size={16} color="#2563EB" />;
  return <Zap size={16} color="#6366F1" />;
};

const IndividualUsers: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<IndividualUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: usersResponse, isLoading, refetch } = useGetIndividualUsersQuery({ 
    page, 
    size: 10, 
    search: search || undefined 
  });
  const [toggleStatus] = useToggleUserStatusMutation();

  const handleStatusToggle = async (user: IndividualUser) => {
    try {
      await toggleStatus({ userId: user.id, active: user.status !== 'ACTIVE' }).unwrap();
      toast.success(`User ${user.status === 'ACTIVE' ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const users = (usersResponse?.data?.content || [])
    .filter(u => {
      const matchesSearch = !search || 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.mobileNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  const pagination = usersResponse?.data?.page;

  return (
    <Box sx={{ p: 4 }}>
      {/* Console Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
          Individual Users
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
          PLATFORM MEMBERS
        </Typography>
      </Box>

      {/* Filters & Actions */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search by name, email or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                width: '400px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={18} color="#64748B" />
                    </InputAdornment>
                  ),
                }
              }}
            />
            <Button
              variant={statusFilter ? "contained" : "outlined"}
              startIcon={<Filter size={18} />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{ 
                borderRadius: '12px', 
                borderColor: statusFilter ? '#2563EB' : '#E2E8F0', 
                color: statusFilter ? 'white' : '#64748B', 
                textTransform: 'none', 
                fontWeight: 700,
                px: 3,
                '&:hover': { borderColor: '#CBD5E1', bgcolor: statusFilter ? '#1D4ED8' : '#F8FAFC' }
              }}
            >
              {statusFilter ? 'Filtered' : 'Filters'}
            </Button>
          </Box>

          {/* Filter Popover */}
          <Popover
            open={Boolean(filterAnchorEl)}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{ paper: { sx: { borderRadius: '16px', mt: 1, width: 200, p: 1 } } }}
          >
            <Typography variant="overline" sx={{ px: 2, fontWeight: 800, color: '#64748B' }}>Account Status</Typography>
            <List>
              {['ACTIVE', 'INACTIVE'].map((status) => (
                <ListItem key={status} disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      setStatusFilter(statusFilter === status ? null : status);
                      setFilterAnchorEl(null);
                    }}
                    selected={statusFilter === status}
                    sx={{ borderRadius: '8px' }}
                  >
                    <ListItemText primary={<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{status}</Typography>} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {statusFilter && (
              <Button 
                fullWidth 
                size="small" 
                onClick={() => {
                  setStatusFilter(null);
                  setFilterAnchorEl(null);
                }}
                sx={{ mt: 1, color: '#EF4444', fontWeight: 700 }}
              >
                Clear Filters
              </Button>
            )}
          </Popover>
        <Button
          variant="outlined"
          startIcon={<RefreshCw size={18} />}
          onClick={() => refetch()}
          sx={{ borderRadius: '12px', borderColor: '#E2E8F0', color: '#1E293B', fontWeight: 700, textTransform: 'none', px: 3 }}
        >
          Refresh
        </Button>
      </Box>

      {/* High-Fidelity Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>User Profile</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pricing</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Plan Name</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Products</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index}><TableCell colSpan={7}><Skeleton height={60} /></TableCell></TableRow>
              ))
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={user.profilePictureUrl || undefined}
                        sx={{ width: 44, height: 44, borderRadius: '12px', border: '1px solid #F1F5F9' }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F172A' }}>{user.name}</Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.75rem' }}>{user.email} | {user.mobileNumber}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>₹{user.pricePlan.price}</Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.75rem' }}>per month</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.pricePlan.name}
                      sx={{
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        fontWeight: 700,
                        borderRadius: '8px',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.pricePlan.planType}
                      sx={{
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        fontWeight: 800,
                        borderRadius: '8px',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {user.pricePlan.products.map(p => (
                        <Box key={p.id} sx={{ p: 1, borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex' }}>
                          <ProductIcon name={p.name} />
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Switch
                        checked={user.status === 'ACTIVE'}
                        onChange={() => handleStatusToggle(user)}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10B981' },
                        }}
                      />
                      <Chip
                        label={user.status}
                        size="small"
                        sx={{
                          backgroundColor: user.status === 'ACTIVE' ? '#D1FAE5' : '#FEE2E2',
                          color: user.status === 'ACTIVE' ? '#065F46' : '#991B1B',
                          fontWeight: 800,
                          fontSize: '0.625rem',
                          borderRadius: '6px'
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                      sx={{
                        backgroundColor: '#F1F5F9',
                        color: '#6366F1',
                        borderRadius: '12px',
                        '&:hover': { backgroundColor: '#E2E8F0' }
                      }}
                    >
                      <ArrowUpRight size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 10, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#F8FAFC', border: '1px dashed #E2E8F0' }}>
                      <SearchIcon size={32} color="#94A3B8" />
                    </Box>
                    <Typography sx={{ color: '#64748B', fontWeight: 700 }}>No users matching your search criteria.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {pagination && pagination.totalPages > 1 && (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', borderTop: '1px solid #F1F5F9' }}>
            <Pagination
              count={pagination.totalPages}
              page={page + 1}
              onChange={(_, v) => setPage(v - 1)}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '12px',
                  fontWeight: 800,
                  '&.Mui-selected': {
                    backgroundColor: '#2563EB',
                    color: '#fff',
                  }
                }
              }}
            />
          </Box>
        )}
      </TableContainer>

      {/* User Details Modal */}
      <IndividualUserDetailsModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
      />
    </Box>
  );
};

export default IndividualUsers;
