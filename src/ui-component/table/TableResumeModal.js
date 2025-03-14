import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

const TableResumeModal = ({ data, total = 0, columnsTable }) => {
  return (
    <>
      {Object.keys(data).length !== 0 ? (
        <TableContainer sx={{ maxHeight: 500 }} className="table table-responsive shadow">
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columnsTable.map((column) => (
                  <TableCell className="bg-info text-white" key={column.key} align={column.align} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columnsTable.map((column) => {
                      const value = row[column.id];
                      const isNumber = typeof value === 'number' && !(column.id === 'id' || column.id === 'ventas');
                      return (
                        <TableCell key={column.id} align={column.align} className="py-0 my-0">
                          {isNumber
                            ? 's/. ' + Number(value.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 })
                            : String(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
            {total !== 0 ? (
              <TableRow className="bg-warning">
                <TableCell colSpan={columnsTable.length - 1}>Total de hoy</TableCell>
                <TableCell align="right">
                  {'s/. ' + Number(total.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ) : (
              ''
            )}
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

export default TableResumeModal;
