import React, { useEffect } from 'react';

// material-ui
import { useState } from 'react';
import {
  API_URL_LOGIN,
  /* API_URL_USER, */ createSession,
  /* getSession, */
  notificationSwal,
  postData,
  redirectToRelativePage
} from 'common/common';
import LoginButtons from 'ui-component/loginButtons/loginButtons';
import { Circle } from '@mui/icons-material';

// ================================|| AUTH3 - LOGIN ||================================ //

const Login = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [username, setUsername] = useState('');
  const [label, setLabel] = useState('Ingrese su DNI');
  const handleSubmit = async (value) => {
    if (value.length < 6) {
      notificationSwal('error', `Su ${username === '' ? 'DNI' : 'CONTRASEÑA'} debe tener 6 caractéres como mínimo`);
      return;
    }

    if (username === '') {
      setUsername(value);
      setLabel('Ingrese su Clave');
      return;
    }

    const formLogin = {
      username: username,
      password: value
    };

    try {
      if (isOnline) {
        // LOGEO ONLINE
        const result = await postData(API_URL_LOGIN, formLogin);

        if (result.status) {
          createSession('SESSION_TOKEN', result.token);
          createSession('USER_ID', result.user_id);
          createSession('NEG_ID', result.neg_id);
          createSession('PRIVILEGIOS', JSON.stringify(result.privilegios));

          /* const isBarra = result?.privilegios?.find((p) => p.code == 'PRIV_MOD_BARRAS');
          const isEntrada = result?.privilegios?.find((p) => p.code == 'PRIV_MOD_TICKETS');
          const isHabitacion = result?.privilegios?.find((p) => p.code == 'PRIV_MOD_HABITACIONES');

          if (isBarra || isEntrada || isHabitacion) {
            console.log('is barra or entrada');
            
            const localData = getSession('OFFLINE') ? getSession('OFFLINE') : [];
            const isUserOffline = localData.find((ld) => ld.id == result.user_id);
            
            const url = isBarra || isHabitacion ? API_URL_USER + `barra/${result.user_id}` : API_URL_USER + `entrada/${result.user_id}`;
            console.log(url);
            const response = await fetch(url);
            let data = await response.json();
            data.privilegios = result?.privilegios;
            const newLocalData = isUserOffline ? [...localData.filter((f) => f.id != result?.user_id), data] : [...localData, data];
            createSession('OFFLINE', newLocalData);
            const documentoUser = data?.documentos?.map((d) => {
              return { documento_id: d.id, numero: d.numero_folio };
            });
            createSession('LATEST_NUMBER', documentoUser);
          } */
          redirectToRelativePage('/#/');
          window.location.reload();
        } else {
          notificationSwal('error', result.msg);
          setUsername('');
          setLabel('Ingrese su DNI');
        }
      } else {
        // LOGEO OFFLINE
        notificationSwal('error', 'No hay conexión a internet');
        setUsername('');
        setLabel('Ingrese su DNI');
        /* const localData = getSession('OFFLINE') ? getSession('OFFLINE') : [];
        const isUserOffline = localData.find((ld) => ld.dni == formLogin?.username);
        if (!isUserOffline) {
          notificationSwal('error', 'Para usar el modo Offline debe iniciar sesión al menos una vez con conexión a internet');
          setUsername('');
          setLabel('Ingrese su DNI');
        } else {
          createSession('SESSION_TOKEN', isUserOffline?.name);
          createSession('USER_ID', isUserOffline?.id);
          createSession('NEG_ID', isUserOffline?.negocio_id);
          createSession('PRIVILEGIOS', JSON.stringify(isUserOffline?.privilegios));
          const documentoUser = isUserOffline?.documentos?.map((d) => {
            return { documento_id: d.id, numero: d.numero_folio };
          });
          createSession('LATEST_NUMBER', documentoUser);
          redirectToRelativePage('/#/');
          window.location.reload();
        } */
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup the event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return (
    <div
      style={{ background: 'linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)', height: '100vh' }}
      className="container-fluid d-flex justify-content-center align-items-center p-4"
    >
      <span>
        <div className="d-flex justify-content-center align-items-center">
          <Circle fontSize="small" sx={{ fontSize: '15px' }} className={`${isOnline ? 'text-success' : 'text-danger'}`} />
          <span className="text-white px-1">{isOnline ? 'Conectado' : 'Sin Conexión'}</span>
        </div>
        <LoginButtons titulo={'Log-In'} onSubmitLoginForm={handleSubmit} label={label} />
      </span>
    </div>
  );
};

export default Login;
