import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  Pagination,
  Skeleton,
  styled,
} from '@mui/material';
import { X, RefreshCcw, Shield } from 'lucide-react';
import { useGetAuditLogsQuery } from '../../store/api/organizationApi';

interface AuditHistoryModalProps {
  open: boolean;
  onClose: () => void;
  organisationId: string;
  organisationName: string;
}

const StyledTableCell = styled(TableCell)(() => ({
  padding: '16px 24px',
  fontSize: '0.85rem',
  borderBottom: '1px solid #F1F5F9',
}));

const ActionChip = styled(Chip)(() => ({
  borderRadius: '6px',
  height: '24px',
  fontWeight: 700,
  fontSize: '0.7rem',
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  color: '#16A34A',
  border: '1px solid rgba(34, 197, 94, 0.2)',
  '& .MuiChip-label': { padding: '0 8px' }
}));

const SystemInfoBox = styled(Box)(() => ({
  backgroundColor: '#F8FAFC',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  color: '#64748B',
  maxWidth: '200px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  open,
  onClose,
  organisationId,
  organisationName,
}) => {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data: auditResponse, isLoading, refetch } = useGetAuditLogsQuery(
    { organisationId, page, size },
    { skip: !open }
  );

  const logs = auditResponse?.data?.content || [];
  const pagination = auditResponse?.data?.page;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '20px' } }}>
      <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, backgroundColor: '#EFF6FF', borderRadius: '8px', color: '#2563EB' }}>
            <Shield size={24} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>Audit History</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Activity logs for <Typography component="span" sx={{ color: '#2563EB', fontWeight: 700 }}>{organisationName}</Typography></Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshCcw size={16} />}
            onClick={() => refetch()}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Refresh Logs
          </Button>
          <IconButton onClick={onClose} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Identity</StyledTableCell>
                <StyledTableCell sx={{ backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Action</StyledTableCell>
                <StyledTableCell sx={{ backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>IP Address</StyledTableCell>
                <StyledTableCell sx={{ backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>System Info</StyledTableCell>
                <StyledTableCell sx={{ backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Time Stamp</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} sx={{ p: 2 }}><Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px' }} /></TableCell>
                  </TableRow>
                ))
              ) : logs.length > 0 ? (
                logs.map((log: any) => (
                  <TableRow key={log.id} hover>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: '#2563EB', fontSize: '0.875rem', fontWeight: 700 }}>
                          {log.user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{log.user.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>{log.user.email}</Typography>
                        </Box>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <ActionChip label={log.action} />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography sx={{ color: '#64748B', fontWeight: 600 }}>{log.ipAddress}</Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <SystemInfoBox title={log.userAgent}>
                        {log.userAgent}
                      </SystemInfoBox>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.875rem' }}>
                          {formatDate(log.timestamp).split(', ')[0]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <RefreshCcw size={12} style={{ opacity: 0.5 }} /> {formatDate(log.timestamp).split(', ')[1]}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                    <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>No audit logs found for this organization</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {pagination && pagination.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, borderTop: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>Rows per page:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>{size}</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
              {page * size + 1}-{Math.min((page + 1) * size, pagination.totalElements)} of {pagination.totalElements}
            </Typography>
            <Pagination
              count={pagination.totalPages}
              page={page + 1}
              onChange={(_, v) => setPage(v - 1)}
              size="small"
              sx={{ '& .MuiPaginationItem-root': { borderRadius: '8px', fontWeight: 700 } }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
