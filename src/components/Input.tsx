import { forwardRef } from 'react';
import type { FC } from 'react';
import { TextField, styled, Box, Typography } from '@mui/material';
import type { TextFieldProps, TypographyProps } from '@mui/material';

// --- Styled Label ---
const StyledLabel = styled(Typography)<TypographyProps>(() => ({
  marginBottom: '8px',
  fontWeight: 540,
  color: '#374151',
  display: 'block',
  fontSize: '14px',
}));

export const Label: FC<TypographyProps & { htmlFor?: string }> = (props) => {
  return <StyledLabel variant="body2" component="label" {...props} />;
};

// --- Styled TextField ---
const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D1D5DB',
      },
      '&.Mui-disabled': {
        backgroundColor: '#fff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E5E7EB',
        },
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
        borderColor: '#2463EB',
      },
    },
    '&.Mui-disabled': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#E5E7EB',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E5E7EB',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    fontSize: '14px',
    height: '48px',
    lineHeight: '24px',
    color: '#1F2937',
    boxSizing: 'border-box',
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
      fontSize: '14px',
    },
    '&.Mui-disabled': {
      color: '#6B7280',
      WebkitTextFillColor: '#6B7280',
    },
  },
}));

export interface CustomInputProps extends Omit<TextFieldProps, 'label'> {
  label?: React.ReactNode;
  errorText?: string;
  hideLabel?: boolean;
  InputProps?: any;
}

export const Input = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, errorText, hideLabel, id: providedId, sx, ...props }, ref) => {
    const labelString = typeof label === 'string' ? label : '';
    const id = providedId || `input-${labelString.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).substr(2, 9)}`;

    return (
      <Box sx={{ mb: 2, width: '100%', ...sx }}>
        {label && !hideLabel && <Label htmlFor={id}>{label}</Label>}
        <StyledTextField
          id={id}
          fullWidth
          error={!!errorText}
          helperText={errorText}
          inputRef={ref}
          {...(props as any)}
        />
      </Box>
    );
  }
);

Input.displayName = 'Input';

export default Input;
