import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Grid, Stack, Typography } from '@mui/material';
import { notificationSwal } from 'common/common';
import { useState } from 'react';

const MainTickets = ({ data=[], addTicketFunction, totalDinnerCaja = 0 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (id) => {
    if (isSubmitting) return; // Retornar si ya se está enviando el formulario
    setIsSubmitting(true); // Establecer isSubmitting a true
    try {
      const response = await addTicketFunction(id);
      console.log(response);

      if (!response?.success) {
        notificationSwal('error', response?.message);
      }
    } catch (error) {
      notificationSwal('error', 'Ocurrió un error al enviar la solicitud');
    } finally {
      setIsSubmitting(false); // Establecer isSubmitting a false
    }
  };
  return (
    <>
      <Grid container>
        <Stack direction="row" justifyContent="end" alignItems="center" className="py-1">
          <Alert icon={false} severity="success" variant="filled">
            <AlertTitle className="m-0">
              <Typography variant="h2">
                {'S/. ' + Number(totalDinnerCaja.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
            </AlertTitle>
          </Alert>
        </Stack>
        <Grid item xs={12} className="d-grid">
          {data.length > 0 &&
            data.map((ticket, index) => {
              return (
                <LoadingButton
                  loading={isSubmitting}
                  loadingPosition="start"
                  key={index}
                  type="button"
                  className="m-1"
                  sx={{ width: '300px', height: '300px', overflow: 'hidden' }}
                  variant="contained"
                  color="warning"
                  onClick={() => handleSubmit(ticket?.id)}
                  startIcon={<></>}
                >
                  {isSubmitting ? (
                    <Grid container>Enviando...</Grid>
                  ) : (
                    <Grid container>
                      <Grid item xs={12}>
                        <Stack direction="row" justifyContent="start">
                          <Typography className="h5"> {ticket?.ventas || 0}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="column" alignItems="center">
                          <img src={ticket.image} alt="" height={150} />
                          <Typography className="h4 py-2">{ticket?.name || ''}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" justifyContent="end">
                          <Typography className="h5">s/. {Number(ticket?.price).toFixed(2) || 0}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  )}
                </LoadingButton>
              );
            })}
        </Grid>
      </Grid>
    </>
  );
};

export default MainTickets;
