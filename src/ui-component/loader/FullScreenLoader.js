import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function GradientCircularProgress() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
    </React.Fragment>
  );
}

function FullScreenLoader({ message, isShow = false }) {
  return isShow ? (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fondo semi-transparente
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Asegúrate de que esté por encima de otros elementos
        userSelect: 'none', // Para navegadores modernos
        WebkitUserSelect: 'none', // Para Safari
        MozUserSelect: 'none', // Para Firefox
        msUserSelect: 'none' // Para Internet Explorer/Edge
      }}
    >
      <GradientCircularProgress />
      <Typography variant="h6" sx={{ marginTop: 2, color: '#fff' }}>
        {message}
      </Typography>
    </Box>
  ) : null; // Cambiado a null en lugar de <></>
}

export default FullScreenLoader;
