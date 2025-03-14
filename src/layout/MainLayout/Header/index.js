import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import config from 'config';
import { MENU_OPEN } from 'store/actions';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, ButtonBase, Paper } from '@mui/material';

// project imports
//import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';

// assets
import { IconMenu2 } from '@tabler/icons';
import { useState } from 'react';
import { useEffect } from 'react';
import { API_HOST, API_URL_USER, getOfflinePathImage, getSession } from 'common/common';
import { useDispatch, useSelector } from 'react-redux';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
  const defaultId = useSelector((state) => state.customization.defaultId);
  const dispatch = useDispatch();
  const [user, setUser] = useState({});

  useEffect(() => {
    // usuario
    fetch(API_URL_USER + `data/${getSession('USER_ID')}`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
      })
      .catch((error) => console.error('Error en la solicitud de usuario:', error));

    if (getSession('OFFLINE')) {
      const useroffline = getSession('OFFLINE').find((u) => u.id === getSession('USER_ID'));
      if (useroffline) {
        setUser(useroffline);
      }
    }
  }, []);

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          width: 228,
          display: 'flex',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <ButtonBase disableRipple onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })} component={Link} to={config.defaultPath}>
            <Paper>
              <img
                src={
                  user?.negocio === null
                    ? 'https://admin.nwperu.com/static/media/logo_nwperu.2532016b1bec8d25043b.png'
                    : API_HOST + user?.negocio?.logo || getOfflinePathImage(user?.negocio?.logo)
                }
                alt="Logo"
                height="50"
              />
            </Paper>
          </ButtonBase>
        </Box>
        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>

      {/* header search */}
      <SearchSection />
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />

      {/* notification & profile */}
      <NotificationSection />
      <ProfileSection user={user} />
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
