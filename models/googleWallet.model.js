/* eslint-env browser */
/* eslint-disable no-unused-vars */

const { walletClient, ISSUER_ID } = require('../util/GoogleCredentials/googleWallet')
const { GoogleAuth } = require('google-auth-library')
const db = require('../util/database')
const jwt = require('jsonwebtoken')
const credentials = require('../util/GoogleCredentials/Google-Wallet.json')

function limpiarTelefono (telefono) {
  return String(telefono).replace(/[^a-zA-Z0-9_]/g, '_')
  // convierte de string a entero
}

function limpiarNombre (nombre) {
  return String(nombre).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
}

function getClassId (nombreRoyalty) {
  return `${ISSUER_ID}.royalty_${limpiarNombre(nombreRoyalty)}`
}

function generarStampInfos (puntosActuales, maxPuntos) {
  const sellos = []
  for (let i = 0; i < maxPuntos; i++) {
    sellos.push({
      stampIndex: i,
      pinned: i < puntosActuales
    })
  }
  return sellos
}

function generarSellos (visitasActuales, maxVisitas) {
  const sellados = '✅'.repeat(Math.min(visitasActuales, maxVisitas))
  const vacios = '⬜'.repeat(Math.max(maxVisitas - visitasActuales, 0))
  return sellados + vacios
}

// Crear clases dinámicas
async function crearLoyaltyClass (nombreRoyalty, maxVisita) {
  const classId = getClassId(nombreRoyalty)
  try {
    await walletClient.loyaltyclass.insert({
      requestBody: {
        id: classId,
        issuerName: 'Marée',
        programName: `${nombreRoyalty}`,
        reviewStatus: 'UNDER_REVIEW',
        hexBackgroundColor: '#fcebeb',
        // Imagen global que aparece en todas las tarjetas de este nivel
        // Posiblemente imagen para sellos
        heroImage: {
          sourceUri: {
            uri: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/cc/06/f3/crepa-manzane-cajeta.jpg?w=900&h=500&s=1'
          },
          contentDescription: {
            defaultValue: { language: 'es', value: 'Marée Rewards' }
          }
        },
        programLogo: {
          sourceUri: { uri: 'https://images.rappi.com.mx/restaurants_logo/logo1-1670627103359.png?e=webp&d=10x10&q=10' },
          contentDescription: { defaultValue: { language: 'es', value: 'Logo Marée' } }
        }
      }
    })
    console.log(`✅ Clase creada: ${classId}`)
  } catch (error) {
    if (error.code === 409) {
      await walletClient.loyaltyclass.patch({
        resourceId: classId,
        requestBody: {
          reviewStatus: 'UNDER_REVIEW',
          programName: `${nombreRoyalty}`,
          heroImage: {
            sourceUri: {
              uri: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/cc/06/f3/crepa-manzane-cajeta.jpg?w=900&h=500&s=1'
            },
            contentDescription: {
              defaultValue: { language: 'es', value: 'Marée Rewards' }
            }
          },
          hexBackgroundColor: '#fcebeb'
        }
      })
      console.log(`Clase ya existía, imagen actualizada: ${classId}`)
    } else {
      throw error
    }
  }
}

// Cuando se modifica un estado royalty:
async function actualizarLoyaltyClass (nombreOriginal, nuevoNombre, maxVisitas, nombreCliente) {
  const classIdOriginal = getClassId(nombreOriginal)
  const classIdNuevo = getClassId(nuevoNombre)

  try {
    // Si se cambio la clase se deben de migrar los datos
    if (limpiarNombre(nombreOriginal) !== limpiarNombre(nuevoNombre)) {
      await crearLoyaltyClass(nuevoNombre, maxVisitas)
    } else {
      // Solo actualizar el conteo de estampas
      await walletClient.loyaltyclass.patch({
        resourceId: classIdOriginal,
        requestBody: {
          stampInfos: { stampCount: maxVisitas },
          programName: `${nuevoNombre}`
        }
      })
      console.log(`Clase actualizada: ${classIdOriginal}`)
    }
  } catch (error) {
    console.log('Error al actualizar clase:', error.message)
    throw error
  }
}

// Si se elimina un estado royalty
async function eliminarLoyaltyClass (nombreRoyalty) {
  const classId = getClassId(nombreRoyalty)
  try {
    await walletClient.loyaltyclass.patch({
      resourceId: classId,
      requestBody: { reviewStatus: 'REJECTED' } // Google no permite borrar clases, se desactivan
    })
    console.log(`Clase desactivada: ${classId}`)
  } catch (error) {
    console.log('Error al desactivar clase:', error.message)
  }
}

// Crea la tarjeta de un cliente nuevo
async function crearLoyaltyObject (telefono, nombreCliente, nombreRoyalty, puntosActuales, maxPuntos) {
  const classId = getClassId(nombreRoyalty)
  const objectId = `${ISSUER_ID}.cliente_${limpiarTelefono(telefono)}`
  try {
    await walletClient.loyaltyobject.insert({
      requestBody: {
        id: objectId,
        classId,
        state: 'ACTIVE',
        accountName: `${nombreRoyalty}`,
        barcode: {
          type: 'QR_CODE',
          value: String(telefono),
          alternateText: nombreCliente
        },
        loyaltyPoints: {
          balance: { int: puntosActuales ?? 0 },
          label: 'Visitas'
        },
        secondaryLoyaltyPoints: {
          balance: { int: maxPuntos ?? 0 },
          label: 'Meta de visitas'
        },
        stampInfos: generarStampInfos(puntosActuales ?? 0, maxPuntos ?? 0),
        textModulesData: [
          {
            id: 'nivel',
            header: 'Nivel Actual',
            body: nombreRoyalty || 'Sin nivel'
          }
        ]
      }
    })
    console.log(`Tarjeta creada para cliente ${limpiarTelefono(telefono)}`)
  } catch (error) {
    // Si existe, la actualizamos
    if (error.code === 409) {
      await actualizarLoyaltyObject(telefono, nombreCliente, nombreRoyalty, puntosActuales, maxPuntos)
    } else {
      throw error
    }
  }
}

// Actualiza la tarjeta cuandoo cambia el nivel del cliente
async function actualizarLoyaltyObject (telefono, nombreCliente, nombreRoyalty, puntosActuales, maxPuntos) {
  const classId = getClassId(nombreRoyalty)
  const objectId = `${ISSUER_ID}.cliente_${limpiarTelefono(telefono)}`

  await walletClient.loyaltyobject.patch({
    resourceId: objectId,
    requestBody: {
      classId,
      accountName: `${nombreRoyalty}`,
      barcode: {
        type: 'QR_CODE',
        value: String(telefono),
        alternateText: nombreCliente
      },
      loyaltyPoints: {
        balance: { int: puntosActuales },
        label: 'Visitas'
      },
      secondaryLoyaltyPoints: {
        balance: { int: maxPuntos },
        label: 'Meta'
      },
      stampInfos: generarStampInfos(puntosActuales ?? 0, maxPuntos ?? 0),
      textModulesData: [
        {
          id: 'nivel',
          header: 'Nivel Actual',
          body: nombreRoyalty || 'Sin nivel'
        }
      ]
    }
  })
  console.log(`Tarjeta actualizada para cliente ${telefono}`)
}

// Actualiza todos los clientes de un nivel cuando el admin modifica ese estado royalty
// Query a la base de datos
async function actualizarTarjetaPorNivel (nombreRoyalty, nuevoNombre, nuevoDescripcion, maxVisitas) {
  const [clientes] = await db.execute(
    'SELECT Numero_Telefonico, Visitas_Actuales, Nombre FROM cliente WHERE Nombre_Royalty = ?',
    [nombreRoyalty]
  )

  const promesas = clientes.map(cliente =>
    actualizarLoyaltyObject(cliente.Numero_Telefonico, cliente.Nombre, nuevoNombre || nombreRoyalty, cliente.Visitas_Actuales, maxVisitas)
  )

  await Promise.all(promesas)
  console.log(`${clientes.length} tarjetas actualizadas para nivel ${nombreRoyalty}`)
}

async function generarLinkWallet (telefono, nombreCliente, nombreRoyalty, puntosActuales, maxPuntos) {
  await crearLoyaltyClass(nombreRoyalty, maxPuntos)
  await crearLoyaltyObject(telefono, nombreCliente, nombreRoyalty, puntosActuales, maxPuntos)
  const objectId = `${ISSUER_ID}.cliente_${limpiarTelefono(telefono)}`
  const claims = {
    iss: credentials.client_email, // se obtienen el email del cliente del JSON
    aud: 'google',
    origins: ['http://localhost:3005', 'https://manicure-starless-spending.ngrok-free.dev'], // dominio del sitio web
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [{ id: objectId }]
    }
  }

  const auth = new GoogleAuth({
    keyFile: './util/GoogleCredentials/Google-Wallet.json',
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
  })

  const token = jwt.sign(claims, credentials.private_key, {
    algorithm: 'RS256',
    expiresIn: '1h'
  })
  const objectJSON = JSON.stringify({ id: objectId })
  const client = await auth.getClient()

  return `https://pay.google.com/gp/v/save/${token}`
}

module.exports = {
  crearLoyaltyClass,
  actualizarLoyaltyClass,
  eliminarLoyaltyClass,
  crearLoyaltyObject,
  actualizarLoyaltyObject,
  actualizarTarjetaPorNivel,
  generarLinkWallet
}
