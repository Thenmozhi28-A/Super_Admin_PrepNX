import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress,
} from '@mui/material';
import { 
  Building2, 
  Users, 
  Mail, 
  Database, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useGetPlatformOverviewQuery } from '../../store/api/platformApi';

const PlatformOverview: React.FC = () => {
  const { data: response, isLoading, error } = useGetPlatformOverviewQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !response) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Failed to load platform overview. Please try again later.</Typography>
      </Box>
    );
  }

  const { data } = response;

  const stats = [
    { 
      label: 'Total Tenants', 
      value: data.totalTenants.count, 
      subValue: `+${data.totalTenants.newThisWeek} this week`, 
      icon: Building2, 
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    { 
      label: 'Active Users', 
      value: data.totalActiveUsers, 
      subValue: 'Real-time active', 
      icon: Users, 
      color: '#E11D48',
      bgColor: '#FFF1F2'
    },
    { 
      label: 'Messages Today', 
      value: data.messagesToday.count, 
      subValue: `Peak: ${data.messagesToday.peakRate}`, 
      icon: Mail, 
      color: '#0284C7',
      bgColor: '#F0F9FF'
    },
    { 
      label: 'Global Storage', 
      value: data.globalStorage, 
      subValue: 'Total utilized', 
      icon: Database, 
      color: '#EA580C',
      bgColor: '#FFF7ED'
    },
  ];

  // Transform platformGrowth object into Recharts format
  const chartData = Object.entries(data.platformGrowth).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, letterSpacing: '-0.02em' }}>
          Platform Overview
        </Typography>
        <Typography sx={{ color: '#64748B', fontWeight: 500 }}>
          Real-time metrics and health status for the entire PrepNX infrastructure.
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: '20px', 
                border: '1px solid #F1F5F9', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  <stat.icon size={22} />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.875rem' }}>
                  {stat.label}
                </Typography>
              </Box>
              
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#1E293B', fontSize: '2.25rem' }}>
                {stat.value}
              </Typography>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  color: stat.label === 'Total Tenants' ? '#16A34A' : '#64748B', 
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {stat.label === 'Total Tenants' && <TrendingUp size={14} />}
                {stat.subValue}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Growth Chart */}
      <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: 'none' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Platform Growth
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            New organization signups over time
          </Typography>
        </Box>

        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontWeight: 600, fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontWeight: 600, fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontWeight: 700
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]} 
                barSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#2563EB' : '#E2E8F0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default PlatformOverview;
