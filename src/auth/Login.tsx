import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, InputAdornment, Link } from '@mui/material';
import { Eye, EyeOff, ShieldCheck, Users, Settings, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { loginSchema } from '../Yup/Schema';
import type { LoginValues } from '../types/Types';
import { useLoginMutation } from '../store/api/authApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const features = [
  { icon: ShieldCheck, title: 'Role Management', desc: 'Secure granular permissions' },
  { icon: Users, title: 'User Administration', desc: 'Manage all prep center staff' },
  { icon: Settings, title: 'System Config', desc: 'Global settings & integrations' },
  { icon: Database, title: 'Data Control', desc: 'Optimize storage & backups' },
];

const stats = [
  { value: '100+', label: 'Organizations' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Monitoring' },
];

const floatingSymbols = [
  { symbol: '◈', top: '8%', left: '6%', size: '2.25rem', opacity: 0.07, color: '#2463EB' },
  { symbol: '✧', top: '14%', right: '8%', size: '2.5rem', opacity: 0.06, color: '#1E40AF' },
  { symbol: '⬢', top: '38%', right: '5%', size: '1.75rem', opacity: 0.06, color: '#2463EB' },
  { symbol: '•', top: '55%', left: '4%', size: '3rem', opacity: 0.10, color: '#1E40AF' },
  { symbol: '◈', bottom: '18%', left: '10%', size: '1.5rem', opacity: 0.05, color: '#2463EB' },
  { symbol: '✧', bottom: '10%', right: '7%', size: '2rem', opacity: 0.06, color: '#1E40AF' },
  { symbol: '⬡', top: '72%', right: '12%', size: '1.25rem', opacity: 0.05, color: '#2463EB' },
  { symbol: '•', top: '25%', left: '3%', size: '2.5rem', opacity: 0.08, color: '#1E40AF' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthData } = useAuth();
  const [loginAction, { isLoading: isLoginLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: yupResolver(loginSchema) as any,
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Validation Errors:', errors);
    }
  }, [errors]);

  const onSubmit = async (data: LoginValues) => {
    try {
      const response = await loginAction(data).unwrap();
      console.log('Login success:', response);

      const token = response.data?.token;

      if (token) {
        setAuthData(token, response);
        toast.success('Super Admin authenticated successfully!');
        navigate('/admin/organization');
      } else {
        toast.error('Authentication token missing from response');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      toast.error(err.data?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: { xs: 'auto', md: '100vh' }, backgroundColor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: { xs: 'column', md: 'row' } }}>

        {/* --- Left Side – Login Form --- */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            flex: { xs: '1 1 100%', md: '1 1 50%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 4, md: 12 },
            py: 12,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 480 }}>

            {/* Logo */}
            <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '8px',
                background: 'linear-gradient(135deg, #2463EB 0%, #1E40AF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>P</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.875rem' }}>
                <Box component="span" sx={{ background: 'linear-gradient(90deg, #2463EB 0%, #1E40AF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Prep
                </Box>
                <Box component="span" sx={{ color: '#1F2937' }}>NX</Box>
              </Typography>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 600, color: '#1F2937', mb: 1.5, lineHeight: 1.2 }}>
                Welcome Back
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: '1rem' }}>
                Access the central command center
              </Typography>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email Address"
                placeholder="superadmin@prepnx.com"
                size="medium"
                autoComplete="off"
                {...register('identifier')}
                errorText={errors.identifier?.message}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                size="medium"
                autoComplete="new-password"
                {...register('password')}
                errorText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#9CA3AF' }}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  sx={{ color: '#2463EB', fontWeight: 500, textDecoration: 'none', '&:hover': { color: '#1E40AF', textDecoration: 'underline' } }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Button type="submit" variant="contained" fullWidth disabled={isLoginLoading}>
                {isLoginLoading ? 'Authenticating...' : 'Login to Console'}
              </Button>

            </form>

          </Box>
        </Box>

        {/* --- Right Side – Super Admin Info Panel --- */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{
            flex: '1 1 58%',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DBEAFE 100%)',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 8,
            py: 4,
            position: 'relative',
            overflowY: 'auto',
          }}
        >

          {/* Floating symbols */}
          {floatingSymbols.map((s, i) => (
            <Box
              key={i}
              component={motion.div}
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              sx={{
                position: 'absolute',
                top: s.top ?? 'auto',
                bottom: s.bottom ?? 'auto',
                left: s.left ?? 'auto',
                right: s.right ?? 'auto',
                fontSize: s.size,
                fontWeight: 700,
                color: s.color,
                opacity: s.opacity,
                userSelect: 'none',
                pointerEvents: 'none',
                lineHeight: 1,
              }}
            >
              {s.symbol}
            </Box>
          ))}

          <Box sx={{ width: '100%', maxWidth: 650, zIndex: 2 }}>

            {/* Badge */}
            {/* <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              borderRadius: '20px', px: 2, py: 1, mb: 4,
            }}>
              <Box sx={{ width: 7, height: 7, background: '#0F172A', borderRadius: '50%' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 600 }}>
                Enterprise Hub Console
              </Typography>
            </Box> */}

            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(36,99,235,0.2)',
              borderRadius: '20px', px: 2, py: 1, mb: 4,
            }}>
              <Box sx={{ width: 7, height: 7, background: '#2463EB', borderRadius: '50%' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#2463EB', fontWeight: 500 }}>
                Enterprise Hub Console
              </Typography>
            </Box>

            {/* Title */}
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 2, fontSize: '42px', lineHeight: 1.2 }}>
              Central Intelligence & Infrastructure
            </Typography>
            <Typography sx={{ color: '#475569', mb: 5, fontSize: '14px', maxWidth: '90%', mx: 'auto', lineHeight: 1.6 }}>
              The definitive dashboard for high-level management. Oversee multiple organizations, analyze global trends, and ensure system peak performance.
            </Typography>

            {/* Features Grid Layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 6 }}>
              {features.map(({ icon: Icon, title, desc }, i) => (
                <Box
                  key={i}
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  sx={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    borderRadius: '20px',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    // boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: 44, height: 44,
                      background: '#F1F5F9',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#2463EB'
                    }}
                  >
                    <Icon size={24} />
                  </Box>
                  <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                    {desc}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Stats Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              {stats.map(({ value, label }, i) => (
                <Box
                  key={i}
                  sx={{
                    textAlign: 'center',
                    px: 3,
                    borderRight: i < stats.length - 1 ? '1px solid rgba(15, 23, 42, 0.1)' : 'none'
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#2463EB', fontSize: '1.5rem', lineHeight: 1 }}>
                    {value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, mt: 0.5, textTransform: 'uppercase' }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

          </Box>
        </Box>

      </Box>
    </Box>
  );
}
