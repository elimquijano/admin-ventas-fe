import React from 'react';
// material-ui
import { Circle, Close } from '@mui/icons-material';
import { Button, Grid, Modal, Stack, Typography } from '@mui/material';
import Combobox from 'ui-component/buttons/combobox';
//import { API_HOST } from 'common/common';

const HeaderInterfaceUser = ({ buttons, modals, isOnline = true }) => {
  return (
    <>
      <Grid container>
        <Grid item container gap={1} justifyContent="center">
          {buttons.map((b, index) => {
            const isButton = b.type === 'button';
            return (
              <Grid item xs={12} sm={3} lg={2} key={index} className="d-flex justify-content-center">
                {isButton ? (
                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    className={b.className}
                    color={b.color}
                    onClick={b.onClick}
                  >
                    {b.icon}
                    <Stack direction="row" justifyContent="center">
                      <Typography noWrap>{b.text}</Typography>
                    </Stack>
                  </Button>
                ) : (
                  <Combobox
                    items={b?.items}
                    itemSelect={b?.itemSelect}
                    className={b?.className}
                    color={b?.color}
                    icon={b?.icon}
                    onClick={b?.onClick}
                    onChangeItem={b?.onChangeItem}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>

        <Grid item xs={12} className="d-flex justify-content-center">
          <Circle fontSize="small" sx={{ fontSize: '15px' }} className={`${isOnline ? 'text-success' : 'text-danger'}`} />
          <span className="text-white px-2">{isOnline ? 'Conectado' : 'Sin Conexión'}</span>
        </Grid>
      </Grid>
      {modals.map((m, index) => (
        <Modal key={index} open={m.open} onClose={m.onClose} sx={{ zIndex: 100 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered d-flex justify-content-center align-items-center">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">{m.title}</h4>
                <button onClick={m.onClose} className="btn btn-link">
                  <Close />
                </button>
              </div>
              <div className="modal-body">
                <p>{m.subtitle}</p>
                {m.body}
              </div>
              {m.textButton !== '' ? (
                <div className="modal-footer d-flex justify-content-center">
                  <Button type="button" variant="contained" className="btn-secondary" onClick={m.onClose}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="contained" color={m.colorButton} onClick={m.onClickButton}>
                    {m.textButton}
                  </Button>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </Modal>
      ))}
    </>
  );
};

export default HeaderInterfaceUser;
