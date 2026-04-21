/* eslint-env browser */

/* eslint-disable no-unused-vars */

// Obtenemos las librerias de Google API's
const { GoogleAuth } = require('google-auth-library')
const { google } = require('googleapis')
const ISSUER_ID = '3388000000023114150' // ID de la entidad emisora
const CLASS_ID = `${ISSUER_ID}.royalty_maree`

const auth = new GoogleAuth({
  // ruta del archivo JSON que se descargo
  keyFile: './util/GoogleCredentials/google-wallet.json',
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
})

const walletClient = google.walletobjects({ version: 'v1', auth })
module.exports = { walletClient, ISSUER_ID, CLASS_ID }
