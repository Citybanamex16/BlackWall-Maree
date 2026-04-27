const fs = require('fs')
const path = require('path')
const { GoogleAuth } = require('google-auth-library')
const { google } = require('googleapis')

const ISSUER_ID = '3388000000023114855' // Merchant ID
const credentialsPath = path.join(__dirname, 'Google-Wallet.json')
const googleWalletDisponible = fs.existsSync(credentialsPath)

let walletClient = null

if (googleWalletDisponible) {
  const auth = new GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
  })

  walletClient = google.walletobjects({ version: 'v1', auth })
}

module.exports = {
  walletClient,
  ISSUER_ID,
  googleWalletDisponible,
  credentialsPath
}
