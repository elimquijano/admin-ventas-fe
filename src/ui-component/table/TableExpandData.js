import { Collapse, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Alert } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useState } from 'react';
import { Fragment } from 'react';
import { restarCincoHoras } from 'common/common';

const columnsDetVentas = [
  { id: 'producto', label: 'PRODUCTO', align: 'left', minWidth: 10 },
  { id: 'quantity', label: 'CANTIDAD', align: 'right', minWidth: 10 },
  { id: 'total', label: 'TOTAL', align: 'right', minWidth: 10 }
];

const Row = ({ row = {}, columnsTable }) => {
  const [open, setOpen] = useState(false); // Estado local para cada fila
  return (
    <Fragment>
      <TableRow hover role="checkbox" tabIndex={-1}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        {columnsTable.map((column, index) => (
          <TableCell key={index} align={column.align}>
            {column.id == 'total' ? `PEN ${row[column.id]}` : column.id == 'created_at' ? restarCincoHoras(row[column.id]) : row[column.id]}
          </TableCell>
        ))}
      </TableRow>
      {row?.detalles && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Alert className="text-center">
                <Typography variant="h4" className="text-center" gutterBottom component="div">
                  Detalle de venta
                </Typography>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      {columnsDetVentas.map((column, index) => {
                        return (
                          <TableCell key={index} align={column.align} className="py-0 bg-warning" variant="contained">
                            {column.label}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.detalles.map((fila, rowIndex) => {
                      return (
                        <TableRow key={rowIndex}>
                          {columnsDetVentas.map((column, columnIndex) => {
                            const value =
                              column.id == 'producto'
                                ? fila[column.id]?.name
                                : column.id == 'total'
                                ? `${fila['moneda']} ${fila[column.id]}`
                                : fila[column.id];
                            return (
                              <TableCell key={columnIndex} align={column.align} className="py-0">
                                {value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Alert>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

const TableExpandData = ({ columnsTable, data = [] }) => {
  return (
    <>
      {data.length > 0 ? (
        <TableContainer sx={{ maxHeight: 500 }} className="table table-responsive shadow">
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell className="bg-info text-white" align="center" />
                {columnsTable.map((column, index) => (
                  <TableCell className="bg-info text-white" key={index} align={'center'} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {
                return <Row row={row} columnsTable={columnsTable} key={index} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div className="alert alert-warning" role="alert">
          No se encontraron resultados.
        </div>
      )}
    </>
  );
};

export default TableExpandData;
