/* eslint-env browser */
/* eslint-disable no-unused-vars */

const { walletClient, ISSUER_ID, CLASS_ID } = require('../util/GoogleCredentials/GoogleWallet')
const { GoogleAuth } = require('google-auth-library')
const db = require('../util/database')
const jwt = require('jsonwebtoken')
const credentials = require('../util/GoogleCredentials/google-wallet.json')

function limpiarTelefono (telefono) {
  return String(telefono).replace(/[^a-zA-Z0-9_]/g, '_')
  // convierte de string a entero
}

// Crea la tarjeta de un cliente nuevo
async function crearLoyaltyObject (telefono, nombreRoyalty, puntosActuales, maxPuntos) {
  const objectId = `${ISSUER_ID}.cliente_${limpiarTelefono(telefono)}`

  try {
    await walletClient.loyaltyobject.insert({
      requestBody: {
        id: objectId,
        classId: CLASS_ID,
        state: 'ACTIVE',
        loyaltyPoints: {
          balance: { int: puntosActuales ?? 0 },
          label: 'Visitas'
        },
        secondaryLoyaltyPoints: {
          balance: { int: maxPuntos ?? 0 },
          label: 'Meta'
        },
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
      await actualizarLoyaltyObject(telefono, nombreRoyalty, puntosActuales, maxPuntos)
    } else {
      throw error
    }
  }
}

// Actualiza la tarjeta cuandoo cambia el nivel del cliente
async function actualizarLoyaltyObject (telefono, nombreRoyalty, puntosActuales, maxPuntos) {
  const objectId = `${ISSUER_ID}.cliente_${limpiarTelefono(telefono)}`

  await walletClient.loyaltyobject.patch({
    resourceId: objectId,
    requestBody: {
      loyaltyPoints: {
        balance: { int: puntosActuales },
        label: 'Visitas'
      },
      secondaryLoyaltyPoints: {
        balance: { int: maxPuntos },
        label: 'Meta'
      },
      textModulesData: [
        {
          id: 'nivel',
          header: 'Nivel Actual',
          body: nombreRoyalty
        }
      ]
    }
  })
  console.log(`Tarjeta actualizada para cliente ${telefono}`)
}

// Actualiza todos los clientes de un nivel cuando el admin modifica ese estado royalty
async function actualizarTarjetaPorNivel (nombreRoyalty, nuevoNombre, nuevoDescripcion) {
  const [clientes] = await db.execute(
    'SELECT telefono, Visitas FROM cliente WHERE Nombre_Royalty = ?',
    [nombreRoyalty]
  )

  const promesas = clientes.map(cliente =>
    actualizarLoyaltyObject(cliente.telefono, nuevoNombre || nombreRoyalty, cliente.Visitas, 0)
  )

  await Promise.all(promesas)
  console.log(`${clientes.length} tarjetas actualizadas para nivel ${nombreRoyalty}`)
}

async function generarLinkWallet (telefono, nombreRoyalty, puntosActuales, maxPuntos) {
  await crearLoyaltyObject(telefono, nombreRoyalty, puntosActuales, maxPuntos)
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
    keyFile: './util/GoogleCredentials/google-wallet.json',
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
  crearLoyaltyObject,
  actualizarLoyaltyObject,
  actualizarTarjetaPorNivel,
  generarLinkWallet
}
