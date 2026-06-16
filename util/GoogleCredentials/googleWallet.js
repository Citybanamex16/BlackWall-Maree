const fs = require('fs')
const path = require('path')
const { GoogleAuth } = require('google-auth-library')
const { google } = require('googleapis')
const jwt = require('jsonwebtoken')

const ISSUER_ID = '3388000000023114855' // Merchant ID
const CLASS_ID = `${ISSUER_ID}.royalty_maree`
const MAX_SELLOS = 8

// URL base donde tienes tus imágenes de sellos en tu servidor
// Deben ser URLs públicas accesibles por Google
const BASE_STAMPS_URL = 'https://res.cloudinary.com/dvbrrtput/image/upload/sellos'

const credentials = JSON.parse(fs.readFileSync('./util/GoogleCredentials/Google-Wallet.json'))
const credentialsPath = path.join(__dirname, 'Google-Wallet.json')
const googleWalletDisponible = fs.existsSync(credentialsPath)

let walletClient = null

if (googleWalletDisponible) {
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
  })

  walletClient = google.walletobjects({ version: 'v1', auth }) 
}

// Retorna la URL de la imagen correcta según visitas
// stamp_0.png = sin sellos, stamp_1.png = 1 sello, ..., stamp_8.png = 8 sellos
function getStampImageUrl (visitasActuales) {
  const sellos = Math.min(visitasActuales, MAX_SELLOS)
  return `${BASE_STAMPS_URL}/stamp_${sellos}.png`
}

// Construye el body del objeto de loyalty con los sellos
function buildLoyaltyObjectBody ({ telefono, nombreCliente, nombreRoyalty, visitasActuales, maxVisitas }) {
  const OBJECT_ID = `${ISSUER_ID}.maree_${String(telefono).replace(/[^a-zA-Z0-9]/g, '')}`
  const sellosActuales = Math.min(visitasActuales, MAX_SELLOS)

  return {
    id: OBJECT_ID,
    classId: CLASS_ID,
    state: 'ACTIVE',
    loyaltyPoints: {
      balance: { string: `${sellosActuales}/${MAX_SELLOS}` },
      label: 'Sellos'
    },
    textModulesData: [
      {
        id: 'nivel',
        header: 'Nivel',
        body: nombreRoyalty || 'Bienvenido'
      },
      {
        id: 'visitas',
        header: 'Visitas',
        body: `${visitasActuales} de ${maxVisitas ?? MAX_SELLOS}`
      }
    ],
    barcode: {
      type: 'QR_CODE',
      value: String(telefono),
      alternateText: String(telefono)
    },
    cardTitle: {
      defaultValue: { language: 'es', value: 'Royalty Marée' }
    },
    header: {
      defaultValue: { language: 'es', value: nombreCliente || 'Cliente' }
    }
  }
}

// Crea o actualiza el objeto en Google Wallet
async function upsertLoyaltyObject (datosCliente) {
  const body = buildLoyaltyObjectBody(datosCliente)
  const OBJECT_ID = body.id

  try {
    // Intentamos actualizar (patch) si ya existe
    await walletClient.loyaltyobject.patch({
      resourceId: OBJECT_ID,
      requestBody: body
    })
    console.log(`[GoogleWallet] Objeto actualizado: ${OBJECT_ID}`)
  } catch (error) {
    if (error.code === 404) {
      // No existe, lo creamos
      await walletClient.loyaltyobject.insert({ requestBody: body })
      console.log(`[GoogleWallet] Objeto creado: ${OBJECT_ID}`)
    } else {
      console.error('[GoogleWallet] Error en upsert:', error.message)
      throw error
    }
  }

  return OBJECT_ID
}

// Genera el JWT con el "Save to Google Wallet" link
async function generarGoogleWalletUrl (datosCliente) {
  const body = buildLoyaltyObjectBody(datosCliente)

  const claims = {
  iss: credentials.client_email,
  aud: 'google',
  typ: 'savetowallet',
  iat: Math.floor(Date.now() / 1000),
  payload: { loyaltyObjects: [{ id: objectId }] }

  }

  const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' })
  return `https://pay.google.com/gp/v/save/${token}`
}

module.exports = {
  walletClient,
  ISSUER_ID,
  CLASS_ID,
  MAX_SELLOS,
  upsertLoyaltyObject,
  generarGoogleWalletUrl,
  getStampImageUrl,
  googleWalletDisponible,  
  credentialsPath     
}