const { GoogleAuth } = require('google-auth-library')
const { google } = require('googleapis')

const ISSUER_ID = '3388000000023114855' // Merchant ID

const auth = new GoogleAuth({
  keyFile: './util/GoogleCredentials/Google-Wallet.json', // ruta al JSON que descargaste
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
})

const walletClient = google.walletobjects({ version: 'v1', auth })

module.exports = { walletClient, ISSUER_ID }
