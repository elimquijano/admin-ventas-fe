import * as React from 'react';
import { useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@mui/material/Modal';
import { API_URL_USER, editarSwal, fetchAPIAsync, getSession, notificationSwal } from 'common/common';

export default function PerfilPage() {
  const [userData, setUserData] = React.useState(null);
  const [openModal1, setOpenModal1] = React.useState(false);
  const [openModal2, setOpenModal2] = React.useState(false);
  const [editData, setEditData] = React.useState({});
  const [passwordData, setPasswordData] = React.useState({});

  useEffect(() => {
    SearchFilter();
  }, []);

  /* const cargaInicial = () => {
    const storedUserMail = localStorage.getItem('USER_MAIL');
    const userEmailWithoutQuotes = storedUserMail.replace(/^"(.*)"$/, '$1');

    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch(API_URL_USER + '?form_email=' + userEmailWithoutQuotes, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setUserData(result.data[0]);
      })
      .catch((error) => console.log('error', error));
  }; */

  const SearchFilter = async () => {
    const idUser = getSession('USER_ID');
    try {
      const response = await fetchAPIAsync(API_URL_USER + '/' + idUser, {}, 'GET');
      if (response) {
        setUserData(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditUserData = () => {
    // Abre el modal y carga los datos actuales en el estado de edición
    setEditData({
      name: userData.name,
      ape_p: userData.ape_p,
      ape_m: userData.ape_m,
      dni: userData.dni,
      phone: userData.phone,
      email: userData.email
    });

    handleOpenModal1();
  };

  const handleUpdateUserData = () => {
    const userId = userData.id;
    editarSwal(API_URL_USER, userId, editData, SearchFilter);
    handleCloseModal1();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleConfirmPasswordChange = () => {
    const userId = userData.id;

    fetch(API_URL_USER + '/' + userId + '/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation
      })
    })
      .then((response) => response.json())
      .then((data) => {
        notificationSwal('success', data.message);
        handleCloseModal2();
      })
      .catch((error) => {
        notificationSwal('error', error);
      });
  };

  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  const handleOpenModal2 = () => {
    setOpenModal2(true);
  };

  const handleCloseModal2 = () => {
    setOpenModal2(false);
  };

  return (
    <div className="container mt-5 d-flex justify-content-center align-items-center">
      {userData && (
        <div className="card w-75">
          <h1 className="card-header text-center bg-primary text-white">Mi Perfil</h1>
          <div className="card-body text-center">
            <h5 className="card-title">Bienvenido(a)</h5>
            <h4 className="card-title">
              {userData.name} {userData.ape_p} {userData.ape_m}
            </h4>
            <h5 className="card-title mt-2">Tu información</h5>
            <div className="row">
              <div className="col">
                <p className="card-text font-weight-bold">DNI:</p>
                <p className="card-text">{userData.dni}</p>
              </div>
              <div className="col">
                <p className="card-text font-weight-bold">Teléfono:</p>
                <p className="card-text">{userData.phone}</p>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <p className="card-text font-weight-bold">Correo Electrónico:</p>
                <p className="card-text">{userData.email}</p>
              </div>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-center">
            <button className="btn btn-success mx-2" onClick={handleEditUserData}>
              Editar Datos
            </button>
            <button className="btn btn-primary mx-2" onClick={handleOpenModal2}>
              Cambiar Contraseña
            </button>
          </div>
        </div>
      )}

      {/* Si userData es null o aún no se ha cargado, puedes mostrar un mensaje de carga */}
      {!userData && <p className="text-center">Cargando datos del usuario...</p>}

      <Modal open={openModal1} onClose={handleCloseModal1} aria-labelledby="edit-modal-title" aria-describedby="edit-modal-description">
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar mis datos</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              {/* Campos de edición */}
              <div className='row'>
                <div className="form-group col-6">
                  <label htmlFor="name" className="form-label">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="form-group col-6">
                  <label htmlFor="ape_p" className="form-label">
                    Primer Apellido:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="ape_p"
                    value={editData.ape_p || ''}
                    onChange={(e) => setEditData({ ...editData, ape_p: e.target.value })}
                  />
                </div>
                <div className="form-group col-6">
                  <label htmlFor="ape_m" className="form-label">
                    Segundo Apellido:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="ape_m"
                    value={editData.ape_m || ''}
                    onChange={(e) => setEditData({ ...editData, ape_m: e.target.value })}
                  />
                </div>
                <div className="form-group col-6">
                  <label htmlFor="dni" className="form-label">
                    DNI:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="dni"
                    value={editData.dni || ''}
                    onChange={(e) => setEditData({ ...editData, dni: e.target.value })}
                  />
                </div>
                <div className="form-group col-6">
                  <label htmlFor="phone" className="form-label">
                    Teléfono:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="phone"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group col-6">
                  <label htmlFor="email" className="form-label">
                    E-mail:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
              </div>
              {/* Agrega más campos según tus necesidades */}
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-warning" onClick={handleUpdateUserData}>
                <EditIcon /> ACTUALIZAR
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={openModal2} onClose={handleCloseModal2} aria-labelledby="pass-modal-title" aria-describedby="pass-modal-description">
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Cambiar Contraseña</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="current_password">Contraseña Actual:</label>
                <input type="password" id="current_password" name="current_password" className="form-control" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="new_password">Nueva Contraseña:</label>
                <input type="password" id="new_password" name="new_password" className="form-control" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="new_password_confirmation">Confirmar Nueva Contraseña:</label>
                <input
                  type="password"
                  id="new_password_confirmation"
                  name="new_password_confirmation"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-warning" onClick={handleConfirmPasswordChange}>
                <EditIcon /> Confirmar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
