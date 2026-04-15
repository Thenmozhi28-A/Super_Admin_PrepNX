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
  Chip,
  Avatar,
  TablePagination,
  Skeleton,
  Button,
} from '@mui/material';
import { X, Shield, RefreshCw } from 'lucide-react';
import { useGetUserLogsQuery } from '../../store/api/userApi';

const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp));
};

const formatTime = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(timestamp));
};

interface IndividualUserLogsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const IndividualUserLogsModal: React.FC<IndividualUserLogsModalProps> = ({
  open,
  onClose,
  userId,
  userName,
}) => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data: logsResponse, isLoading, isFetching, refetch } = useGetUserLogsQuery(
    { userId, page, size },
    { skip: !open }
  );

  const logs = logsResponse?.data?.content || [];
  const pagination = logsResponse?.data?.page;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px' } }}>
      <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex' }}>
            <Shield size={24} color="#2563EB" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>Audit History</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
              Activity logs for <span style={{ color: '#E11D48', fontWeight: 800 }}>{userName}</span>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#E2E8F0', color: '#1E293B' }}
          >
            Refresh Logs
          </Button>
          <IconButton onClick={onClose} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: '60vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', backgroundColor: '#F8FAFC', fontSize: '0.75rem', textTransform: 'uppercase' }}>Identity</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', backgroundColor: '#F8FAFC', fontSize: '0.75rem', textTransform: 'uppercase' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', backgroundColor: '#F8FAFC', fontSize: '0.75rem', textTransform: 'uppercase' }}>IP Address</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', backgroundColor: '#F8FAFC', fontSize: '0.75rem', textTransform: 'uppercase' }}>System Info</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', backgroundColor: '#F8FAFC', fontSize: '0.75rem', textTransform: 'uppercase' }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} sx={{ py: 3 }}><Skeleton height={40} /></TableCell></TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                    <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>No audit logs found for this user.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={log.user.profilePicture || undefined} sx={{ width: 32, height: 32, borderRadius: '8px' }}>
                          {log.user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0F172A' }}>{log.user.name}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{log.user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        sx={{
                          backgroundColor: '#F0FDF4',
                          color: '#166534',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                          border: '1px solid #DCFCE7'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#475569', fontSize: '0.8125rem', fontWeight: 600 }}>{log.ipAddress}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: '#64748B',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#F1F5F9',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}
                        title={log.userAgent}
                      >
                        {log.userAgent}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0F172A' }}>
                          {formatDate(log.timestamp)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                          {formatTime(log.timestamp)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination && (
          <TablePagination
            component="div"
            count={pagination.totalElements}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={size}
            onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ borderTop: '1px solid #F1F5F9' }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
