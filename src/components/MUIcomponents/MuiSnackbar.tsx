import * as React from 'react';

import { ThemeProvider } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';

import theme from '../../configs/textFieldTheme';

import type { AlertProps } from '@mui/material/Alert';
// eslint-disable-next-line import/order
import type { SnackbarProps } from '../../types/props';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
));

const snackbarStyle: React.CSSProperties = {
  bottom: '5.5rem',
};

function MuiSnackbar(props: SnackbarProps) {
  const { open, severity, message, setBarInfo } = props;

  const handleClose = () => {
    const setObj = {
      open: false,
      severity,
      message,
    };
    setBarInfo(setObj);
  };

  return (
    <ThemeProvider theme={theme}>
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Snackbar open={open} autoHideDuration={1500} onClose={handleClose} style={snackbarStyle}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </Stack>
    </ThemeProvider>
  );
}

export default MuiSnackbar;
