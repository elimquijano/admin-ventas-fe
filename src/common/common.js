import Swal from 'sweetalert2';

export const URL = process.env.REACT_APP_URL;
export const API_HOST = process.env.REACT_APP_URL_API;
export const OFFLINE_URL = process.env.REACT_APP_URL_API;

export const API_URL = API_HOST + 'api/';
export const API_URL_ROL = API_URL + 'rol';
export const API_URL_PRODUCTO = API_URL + 'producto';
export const API_URL_CATEGORIA = API_URL + 'categoria';
export const API_URL_PROVEEDOR = API_URL + 'proveedor';
export const API_URL_CLIENTE = API_URL + 'cliente';
export const API_URL_NEGOCIO = API_URL + 'negocio';
export const API_URL_EXISTENCIA = API_URL + 'stock';
export const API_URL_LOGIN = API_URL + 'login';
export const API_URL_COMPRA = API_URL + 'compra';
export const API_URL_DETCOMPRA = API_URL + 'detcompra';
export const API_URL_VENTA = API_URL + 'venta';
export const API_URL_DETVENTA = API_URL + 'detventa';
export const API_URL_MODULO = API_URL + 'modulo';
export const API_URL_PRIVILEGIO = API_URL + 'privilegio';
export const API_URL_ROL_PRIVILEGIO = API_URL + 'rolprivilegio';
export const API_URL_USER = API_URL + 'user';
export const API_URL_USER_ROL = API_URL + 'roluser';
export const API_URL_USER_DOCUMENTO = API_URL + 'userdocumento';
export const API_URL_USER_NEGOCIO = API_URL + 'usernegocio';
export const API_URL_USER_LOCAL = API_URL + 'userlocal';
export const API_URL_USER_TIPO_TICKET = API_URL + 'usertipotickets';
export const API_URL_DETREPUESTO = API_URL + 'sertecdetrep';
export const API_URL_MODELOEQUIPO = API_URL + 'modeloequipo';
export const API_URL_SERVTECNICO = API_URL + 'serviciotecnico';
export const API_URL_DETSERVTECNICO = API_URL + 'detsertecnico';
export const API_URL_PRODUCTOSPDF = API_URL + 'productopdf';
export const API_URL_MODELOAUTOCOMPLETE = API_URL + 'modeloAutocomplete';
export const API_URL_TRANSACCIONES = API_URL + 'transacciones';
export const API_URL_INFORME = API_URL + 'informe';
export const API_URL_DES_INFORME = API_URL + 'informePdf';
export const API_URL_DES_INGRESO = API_URL + 'ingresoPdf';
export const API_URL_DES_ENTREGA = API_URL + 'entregaPdf';
export const API_URL_DES_COTIZACION = API_URL + 'cotizacionPdf';

export const API_URL_TICKETS = API_URL + 'tickets';
export const API_URL_HABITACION = API_URL + 'habitacion';
export const API_URL_TIPO_TICKETS = API_URL + 'tipoTicket';
export const API_URL_CAJA = API_URL + 'cajas';
export const API_URL_DOCUMENTOS = API_URL + 'documento';
export const API_URL_IMPRESORAS = API_URL + 'impresora';
export const API_URL_SMS = API_URL + 'sms';
export const API_URL_IMPRESION = API_URL + 'imprimir';
export const API_URL_COMPROBANTES = API_URL + 'comprobantes';
export const API_URL_FACTURACION = API_URL + 'facturacion';

export function convertToQueryStringGET(jsonObject) {
  const queryString = Object.keys(jsonObject)
    .filter((key) => jsonObject[key] !== null && jsonObject[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(jsonObject[key])}`)
    .join('&');
  return `?${queryString}`;
}
export function jsonToFormData(datosEnviar) {
  const formdata = new FormData();

  for (const key in datosEnviar) {
    if (datosEnviar[key] !== null && datosEnviar[key] !== '') {
      if (key === 'images' && Array.isArray(datosEnviar[key])) {
        datosEnviar[key].forEach((file, index) => {
          // Agregar cada archivo con un nombre único
          formdata.append(`${key}[${index}]`, file);
        });
      } else {
        formdata.append(key, datosEnviar[key]);
      }
    }
  }

  return formdata;
}

export async function fetchAPIAsync(url, filter, method) {
  try {
    let urlApi = url;
    let requestOptions = {
      method: method,
      redirect: 'follow'
    };

    if (method === 'GET') {
      urlApi = urlApi + convertToQueryStringGET(filter);
    } else if (method === 'POST') {
      requestOptions.body = jsonToFormData(filter);
    }
    const response = await fetch(urlApi, requestOptions);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    notificationSwal('error', error);
    throw error;
  }
}

export function notificationSwal(icon, title) {
  Swal.fire({
    position: 'top-end',
    icon: icon,
    title: title,
    showConfirmButton: false,
    timer: 3000
  });
}
export async function postData(url, data) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(data),
    redirect: 'follow'
  };

  try {
    const response = await fetch(url, requestOptions);
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      notificationSwal('error', response.statusText);
      throw response.statusText;
    }
  } catch (error) {
    notificationSwal('error', error);
    throw error;
  }
}
// Crear una sesión
export function createSession(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Obtener una sesión
export function getSession(key) {
  const sessionData = localStorage.getItem(key);
  if (sessionData) {
    return JSON.parse(sessionData);
  }
  return null;
}

// Actualizar una sesión
export function updateSession(key, value) {
  if (getSession(key)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Eliminar una sesión
export function deleteSession(key) {
  localStorage.removeItem(key);
}
export function redirectToRelativePage(relativePath) {
  const currentPath = window.location.pathname;

  if (currentPath !== relativePath) {
    window.location.href = relativePath;
  }
}

export function eliminarSwal(id, api, onSuccessCallback) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Una vez eliminado no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const apiUrl = `${api}/${id}`;
      var requestOptions = {
        method: 'DELETE',
        redirect: 'follow'
      };
      fetch(apiUrl, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((result) => {
          if (result && result.message) {
            notificationSwal('success', result.message);
            if (typeof onSuccessCallback === 'function') {
              onSuccessCallback();
            }
          } else {
            throw new Error('Respuesta inesperada del servidor');
          }
        })
        .catch((error) => {
          console.error('Error al eliminar:', error);
          notificationSwal('error', 'No se pudo eliminar');
        });
    }
  });
}

export function imageSwal(imageUrl) {
  const fullImageUrl = URL + imageUrl;

  const img = new Image();
  img.src = fullImageUrl;

  img.onload = function () {
    Swal.fire({
      imageUrl: fullImageUrl,
      imageWidth: 400,
      imageHeight: 400
    });
  };

  img.onerror = function () {
    Swal.fire({
      title: 'Sin imagen',
      icon: 'warning'
    });
  };
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function editarSwal(api, id, updatedData, onSuccessCallback) {
  if (!api || !id || !updatedData) {
    notificationSwal('error', 'Parámetros inválidos');
    return;
  }
  console.log('updatedData:', updatedData);

  // Verificar si hay una imagen antes de intentar convertirla a base64
  const imageBase64 = updatedData.image ? await readFileAsBase64(updatedData.image) : null;
  const receiptBase64 = updatedData.receipt ? await readFileAsBase64(updatedData.receipt) : null;

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...updatedData,
      // Incluir image solo si hay una imagen
      image: imageBase64 || null,
      receipt: receiptBase64 || null
    })
  };

  console.log('requestOptions:', requestOptions);

  try {
    const response = await fetch(api + '/' + id, requestOptions);

    if (response.ok) {
      notificationSwal('success', 'Actualizado con éxito');
      if (typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
    } else {
      if (response.status === 404) {
        notificationSwal('error', 'Recurso no encontrado');
      } else {
        notificationSwal('error', 'Error al actualizar');
      }
    }
  } catch (error) {
    notificationSwal('error', 'Error en la solicitud: ' + error.message);
  }
}

export function FechaActualCompleta() {
  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
  const dia = fechaActual.getDate().toString().padStart(2, '0');
  const horas = fechaActual.getHours().toString().padStart(2, '0');
  const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
  const segundos = fechaActual.getSeconds().toString().padStart(2, '0');
  const fechaEnFormato = `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  return fechaEnFormato;
}
export function ListLocales() {
  let LocalesList = [];
  let privilegios = JSON.parse(getSession('PRIVILEGIOS'));
  LocalesList = privilegios.filter((item) => item.type === 'LOC');
  return LocalesList;
}
export async function descargarDocumento(url, nombreArchivo) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = urlBlob;

    // Generar un nombre único basado en la fecha si no se proporciona un nombre de archivo
    const fechaActual = FechaActualCompleta();
    const nombreDescarga = nombreArchivo + `_${fechaActual}.pdf`;

    a.download = nombreDescarga;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(urlBlob);
  } catch (error) {
    console.error('Error al descargar el documento:', error);
  }
}

export function restarCincoHoras(fechaHora) {
  // Parsea la cadena de fecha y hora en un objeto Date
  const fechaActual = new Date(fechaHora);

  // Resta 5 horas al valor de la hora
  fechaActual.setHours(fechaActual.getHours() - 5);

  // Formatea la nueva fecha y hora en el formato deseado
  const resultado = fechaActual.toISOString().replace(/T/, ' ').replace(/\..+/, '');

  return resultado;
}

export const numeroALetras = (() => {
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

export const getOfflinePathImage = (name) => {
  return OFFLINE_URL + 'images/' + name.split('/').pop();
};
