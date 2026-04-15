import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  styled,
  Pagination,
} from '@mui/material';
import {
  Plus,
  Building2,
  Users,
  Pencil,
  Building,
  GraduationCap,
  Briefcase,
  Search as SearchIcon,
} from 'lucide-react';
import {
  useGetOrganisationsQuery,
  useGetOrganisationTypesQuery,
} from '../../store/api/organizationApi';
import { OrganizationDetailsModal } from '../../components/modals/OrganizationDetailsModal';
import { AuditHistoryModal } from '../../components/modals/AuditHistoryModal';
import { AddOrganizationModal } from '../../components/modals/AddOrganizationModal';
import type { Organisation } from '../../types/Types';

const StatCard = styled(Paper)(() => ({
  padding: '24px',
  borderRadius: '24px',
  border: '1px solid #E2E8F0',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  backgroundColor: '#fff',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: '#CBD5E1',
  }
}));

const StyledTableCell = styled(TableCell)(() => ({
  padding: '16px 24px',
  fontSize: '0.875rem',
  color: '#1E293B',
  borderBottom: '1px solid #F1F5F9',
}));

const StatusPill = styled(Chip)<{ status: string }>(({ status }) => ({
  borderRadius: '20px',
  height: '24px',
  padding: '0 4px',
  fontSize: '0.75rem',
  fontWeight: 700,
  backgroundColor: status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
  color: status === 'ACTIVE' ? '#16A34A' : '#DC2626',
  border: `1px solid ${status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
  '& .MuiChip-label': {
    paddingLeft: '8px',
    paddingRight: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&::before': {
      content: '""',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    }
  }
}));

const getTypeIcon = (typeName: string) => {
  const name = typeName.toLowerCase();
  if (name.includes('academy') || name.includes('institution')) return <GraduationCap size={16} />;
  if (name.includes('company')) return <Briefcase size={16} />;
  return <Building size={16} />;
};

const Organization: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('');
  const size = 10;

  // Modal State
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: orgsResponse, isLoading: isLoadingOrgs } = useGetOrganisationsQuery({
    page,
    size,
    typeId: typeFilter || undefined
  });
  const { data: typesResponse } = useGetOrganisationTypesQuery();

  const organizations = orgsResponse?.data?.content || [];
  const pagination = orgsResponse?.data?.page;
  const types = typesResponse?.data || [];

  const stats = useMemo(() => {
    const total = pagination?.totalElements || 0;
    // Calculation for "All Plans Max Users" (Capacity)
    const maxUsers = organizations.reduce((acc, org) => acc + (org.pricePlan?.userCount || 0), 0);
    return { total, maxUsers };
  }, [organizations, pagination]);

  const filteredOrgs = useMemo(() => {
    let result = organizations;
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }
    if (search) {
      result = result.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [organizations, statusFilter, search]);

  const handleEditClick = (org: Organisation) => {
    setSelectedOrg(org);
    setIsDetailsOpen(true);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Super Admin Console Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
          Organization Console
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
          Manage tenants, monitor platform health, and global analytics.
        </Typography>
      </Box>

      {/* Simplified Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, backgroundColor: '#EFF6FF', borderRadius: '8px', color: '#2563EB' }}>
                <Building2 size={20} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B' }}>Total Organizations</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B', mt: 1 }}>{stats.total}</Typography>
            <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 700 }}>Active Count</Typography>
          </StatCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, backgroundColor: '#EFF6FF', borderRadius: '8px', color: '#2563EB' }}>
                <Users size={20} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B' }}>All Plans Max Users</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B', mt: 1 }}>{stats.maxUsers}</Typography>
            <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 700 }}>Capacity</Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* Main Dashboard Section */}
      <Paper sx={{ p: '24px 0', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none', backgroundColor: '#fff' }}>
        <Box sx={{ px: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.5 }}>
            Registered Organizations
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            List of all companies and academies using the platform.
          </Typography>
        </Box>

        {/* Filters Row */}
        <Box sx={{ px: 3, mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={18} color="#94A3B8" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '16px' },
              maxWidth: '360px'
            }}
          />

          <TextField
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            sx={{ minWidth: '160px', '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>

          <TextField
            select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Organization Type"
            sx={{ minWidth: '220px', '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
          >
            <MenuItem value="">All Types</MenuItem>
            {types.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setIsAddOpen(true)}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 800,
              px: 4,
              py: 1.8,
              backgroundColor: '#2463EB',
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#1E40AF', boxShadow: 'none' }
            }}
          >
            Add Organization
          </Button>
        </Box>

        {/* Table Section */}
        <TableContainer sx={{ borderTop: '1px solid #F1F5F9' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>Organization Name</StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>Type</StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>Status</StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>Users Count</StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}>Plan & Price</StyledTableCell>
                <StyledTableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }} align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingOrgs ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} sx={{ p: 2 }}><Skeleton variant="rectangular" height={50} sx={{ borderRadius: '12px' }} /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <TableRow key={org.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' }, transition: 'all 0.2s' }}>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={org.logoUrl || undefined}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            border: '1px solid #F1F5F9',
                            backgroundColor: '#fff',
                            color: '#2463EB',
                            fontSize: '0.9rem',
                            fontWeight: 900
                          }}
                        >
                          {org.name.charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>{org.name}</Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B' }}>
                        {getTypeIcon(org.type.name)}
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{org.type.name}</Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusPill label={org.status} status={org.status} />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{org.totalUsers}</Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.875rem' }}>{org.pricePlan.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>₹{org.pricePlan.price}/mo</Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(org)}
                        sx={{ color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.1)', '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' } }}
                      >
                        <Pencil size={18} />
                      </IconButton>
                    </StyledTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>No organizations found matching your criteria</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Section */}
        {pagination && pagination.totalPages > 1 && (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', borderTop: '1px solid #F1F5F9' }}>
            <Pagination
              count={pagination.totalPages}
              page={page + 1}
              onChange={(_, v) => setPage(v - 1)}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '12px',
                  fontWeight: 800,
                  '&.Mui-selected': {
                    backgroundColor: '#2463EB',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#1E40AF' }
                  }
                }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        organizationId={selectedOrg?.id || ''}
        onViewAudit={() => {
          setIsDetailsOpen(false);
          setIsAuditOpen(true);
        }}
      />

      {/* Audit History Modal */}
      <AuditHistoryModal
        open={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        organisationId={selectedOrg?.id || ''}
        organisationName={selectedOrg?.name || ''}
      />

      {/* Add Organization Modal */}
      <AddOrganizationModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </Box>
  );
};

export default Organization;
