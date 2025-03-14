import { API_HOST } from './common';

const filledCaracter = (align, texto, column = 1, salto = true) => {
  const total = 48 / column;
  const center = Math.floor((total - texto.length) / 2);
  let result = '';

  switch (align) {
    case 'start':
      result = texto.padEnd(total, ' ');
      break;
    case 'center':
      result = texto.padStart(texto.length + center, ' ').padEnd(total, ' ');
      break;
    case 'end':
      result = texto.padStart(total, ' ');
      break;
    default:
      result = texto.padEnd(total, ' ');
      break;
  }

  return column > 1 ? result : salto ? result + '\n' : result;
};

const filledLine = (caracter) => {
  return caracter.repeat(48);
};

const numeroALetras = (() => {
  const Unidades = (num) => {
    switch (num) {
      case 1:
        return 'UN';
      case 2:
        return 'DOS';
      case 3:
        return 'TRES';
      case 4:
        return 'CUATRO';
      case 5:
        return 'CINCO';
      case 6:
        return 'SEIS';
      case 7:
        return 'SIETE';
      case 8:
        return 'OCHO';
      case 9:
        return 'NUEVE';
      default:
        return '';
    }
  };

  const Decenas = (num) => {
    const decena = Math.floor(num / 10);
    const unidad = num - decena * 10;

    switch (decena) {
      case 1:
        switch (unidad) {
          case 0:
            return 'DIEZ';
          case 1:
            return 'ONCE';
          case 2:
            return 'DOCE';
          case 3:
            return 'TRECE';
          case 4:
            return 'CATORCE';
          case 5:
            return 'QUINCE';
          default:
            return `DIECI${Unidades(unidad)}`;
        }
      case 2:
        switch (unidad) {
          case 0:
            return 'VEINTE';
          default:
            return `VEINTI${Unidades(unidad)}`;
        }
      case 3:
        return DecenasY('TREINTA', unidad);
      case 4:
        return DecenasY('CUARENTA', unidad);
      case 5:
        return DecenasY('CINCUENTA', unidad);
      case 6:
        return DecenasY('SESENTA', unidad);
      case 7:
        return DecenasY('SETENTA', unidad);
      case 8:
        return DecenasY('OCHENTA', unidad);
      case 9:
        return DecenasY('NOVENTA', unidad);
      default:
        return Unidades(unidad);
    }
  };

  const DecenasY = (strSin, numUnidades) => {
    return numUnidades > 0 ? `${strSin} Y ${Unidades(numUnidades)}` : strSin;
  };

  const Centenas = (num) => {
    const centenas = Math.floor(num / 100);
    const decenas = num - centenas * 100;

    switch (centenas) {
      case 1:
        if (decenas > 0) return `CIENTO ${Decenas(decenas)}`;
        return 'CIEN ';
      case 2:
        return `DOSCIENTOS ${Decenas(decenas)}`;
      case 3:
        return `TRESCIENTOS ${Decenas(decenas)}`;
      case 4:
        return `CUATROCIENTOS ${Decenas(decenas)}`;
      case 5:
        return `QUINIENTOS ${Decenas(decenas)}`;
      case 6:
        return `SEISCIENTOS ${Decenas(decenas)}`;
      case 7:
        return `SETECIENTOS ${Decenas(decenas)}`;
      case 8:
        return `OCHOCIENTOS ${Decenas(decenas)}`;
      case 9:
        return `NOVECIENTOS ${Decenas(decenas)}`;
      default:
        return Decenas(decenas);
    }
  };

  const Seccion = (num, divisor, strSingular, strPlural) => {
    const cientos = Math.floor(num / divisor);
    const resto = num - cientos * divisor;
    let letras = '';

    if (cientos > 0) {
      if (cientos > 1) {
        letras = `${Centenas(cientos)} ${strPlural}`;
      } else {
        letras = strSingular;
      }
    }

    if (resto > 0) {
      letras += '';
    }

    return letras;
  };

  const Miles = (num) => {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - cientos * divisor;
    const strMiles = Seccion(num, divisor, 'MIL', 'MIL');
    const strCentenas = Centenas(resto);

    if (strMiles === '') {
      return strCentenas;
    }

    return `${strMiles} ${strCentenas}`;
  };

  const Millones = (num) => {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - cientos * divisor;
    const strMillones = Seccion(num, divisor, 'UN MILLON', 'MILLONES');
    const strMiles = Miles(resto);

    if (strMillones === '') {
      return strMiles;
    }

    return `${strMillones} ${strMiles}`;
  };

  return (num) => {
    const enteros = Math.floor(num);
    const centavos = (Math.round(num * 100) - Math.floor(num) * 100).toString().padStart(2, '0');
    let letras = '';

    if (enteros > 0) {
      letras = Millones(enteros);
    }

    if (centavos >= 0) {
      letras += ` CON ${centavos}/100`;
    }

    return letras;
  };
})();

export const printBoletaWS = async (user, productos, subTotal, total, resultVenta) => {
  const fechaYHora = String(restarCincoHoras(resultVenta?.created_at));
  const logo = API_HOST + user?.logo;
  let titulo = '\n' + user?.negocio_name;
  let texto = '\n' + filledCaracter('center', 'RUC: ' + user?.ruc);
  texto += filledCaracter('start', user?.address);
  texto += filledLine('-');
  texto += filledCaracter('center', user?.documento_name);
  texto += filledCaracter('center', resultVenta?.numeracion);
  texto += filledLine('-');
  texto += filledCaracter('start', 'Fecha y Hora', 4) + ': ' + fechaYHora + '\n';
  if (resultVenta.ruc) {
    texto += filledCaracter('start', 'Cliente', 4) + ': ' + resultVenta?.name + '\n';
    texto += filledCaracter('start', 'RUC', 4) + ': ' + resultVenta?.ruc + '\n';
    texto += filledCaracter('start', 'Dirección', 4) + ': ' + resultVenta?.address + '\n';
  } else {
    texto += filledCaracter('start', 'Cliente', 4) + ': Cliente Eventual\n';
    texto += filledCaracter('start', 'DNI', 4) + ': 00000000\n';
  }
  texto += filledLine('-');
  texto +=
    filledCaracter('center', 'Cant', 12) +
    filledCaracter('start', ' Producto', 2) +
    filledCaracter('end', 'P.U.', 6) +
    filledCaracter('end', 'Total', 4) +
    '\n';
  texto += filledLine('-');
  for (let i = 0; i < productos.length; i++) {
    texto +=
      filledCaracter('end', String(productos[i].quantity), 12) +
      filledCaracter('start', ' ' + String(productos[i].name), 2) +
      filledCaracter('end', String(Number(productos[i].price).toFixed(2)), 6) +
      filledCaracter('end', String(Number(productos[i].total).toFixed(2)), 4) +
      '\n';
  }
  texto += filledLine('-');
  texto +=
    filledCaracter('start', 'Sub Total', 2) +
    filledCaracter('end', 's/.' + Number(subTotal).toLocaleString('en-US', { minimumFractionDigits: 2 }), 2) +
    '\n';
  texto +=
    filledCaracter('start', 'IGV:', 2) +
    filledCaracter('end', 's/.' + Number((total - subTotal).toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }), 2) +
    '\n';
  texto +=
    filledCaracter('start', 'Total:', 2) +
    filledCaracter('end', 's/.' + Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 }), 2) +
    '\n';
  texto += filledLine('-');
  if (resultVenta.ruc) {
    texto += filledCaracter('start', 'SON: ' + String(numeroALetras(Number(total))).toUpperCase() + ' SOLES');
    texto += filledCaracter('start', 'FORMA DE PAGO: CONTADO');
  }
  let footer = 'GRACIAS POR SU COMPRA';

  await fetch('http://localhost:5000/imprimir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ logo: logo, titulo: titulo, texto: texto, footer: footer })
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error al imprimir:', error);
    });
};

export const printBoletaCierre = async (user, productos, total, caja) => {
  const logo = API_HOST + user?.logo;
  let titulo = '\n' + user?.negocio_name;
  let texto = filledCaracter('center', 'RUC: ' + user?.ruc);
  texto += filledCaracter('start', user?.address);
  texto += filledLine('-');
  texto += filledCaracter('start', 'Empleado', 2) + filledCaracter('start', ': ' + user.name, 2);
  texto += filledCaracter('start', 'Apertura', 2) + filledCaracter('start', ': ' + caja?.opening_datetime, 2);
  texto += filledCaracter('start', 'Cierre', 2) + filledCaracter('start', ': ' + caja?.closing_datetime, 2);
  texto += filledLine('-');
  texto +=
    filledCaracter('center', 'Cant', 12) +
    filledCaracter('start', ' Producto', 2) +
    filledCaracter('end', 'P.U.', 6) +
    filledCaracter('end', 'Total', 4);
  texto += filledLine('-');
  for (let i = 0; i < productos.length; i++) {
    texto +=
      filledCaracter('end', String(productos[i].quantity), 12) +
      filledCaracter('start', ' ' + String(productos[i].name), 2) +
      filledCaracter('end', String(Number(productos[i].price).toFixed(2)), 6) +
      filledCaracter('end', String(Number(productos[i].total).toFixed(2)), 4);
  }
  texto += filledLine('-');
  texto +=
    filledCaracter('start', 'Total:', 2) +
    filledCaracter('end', 's/.' + Number(Number(total).toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }), 2);

  await fetch('http://localhost:5000/imprimir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ logo: logo, titulo: titulo, texto: texto })
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error al imprimir:', error);
    });
};

export const printTicketWS = async (ticket, conPegatina = false) => {
  const [fecha, hora] = String(restarCincoHoras(ticket?.created_at)).split(' ');
  let footer = `Fecha: ${fecha} Hora: ${hora} \nGRACIAS POR SU VISITA`;

  // PARA ENTRADAS
  await fetch('http://localhost:5000/imprimir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      logo: ticket?.logo,
      titulo: ticket?.titulo,
      precio: ticket?.precio,
      subtitulo: ticket?.numeracion,
      //texto: texto,
      qr: ticket?.barcode,
      footer: footer
    })
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error al imprimir en LPT1:', error);
    });

  // EXTRA PARA MOCHILAS
  if (conPegatina || ticket?.id_tipo == 2) {
    const numeroTicket = parseInt(ticket?.numeracion.substr(3), 10);
    let data = JSON.stringify({
      printport: 'LPT2', // configure aqui el puerto LPT1 o LPT2
      titulo: ticket?.titulo,
      subtitulo: ticket?.numeracion,
      barcode: ticket?.barcode,
      footer: footer + '\n'
    });
    if (numeroTicket % 2 == 0) {
      data = JSON.stringify({
        printport: 'LPT2', // configure aqui el puerto LPT1 o LPT2
        titulo: ticket?.titulo,
        texto: filledCaracter('center', String(ticket?.numeracion), 1, false),
        barcode: ticket?.barcode,
        footer: footer + '\n'
      });
    }
    await fetch('http://localhost:5000/imprimir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error al imprimir pegatina:', error);
      });
  }
};
