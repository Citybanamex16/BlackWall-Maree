const path = require('path')
const fs = require('fs')

let PKPass

const CERT_PASSWORD = 'm5GloACQ28XQaWh%cS7p'
const wwdrPath = path.resolve('./util/AppleCredentials/wwdr.pem')
const signerCertPath = path.resolve('./util/AppleCredentials/signerCert.pem')
const signerKeyPath = path.resolve('./util/AppleCredentials/signerKey.pem')
const passPath = path.resolve('./util/AppleCredentials/Passes/royalty.pass')

async function generarApplePass (telefono, nombreCliente, nombreRoyalty, visitasActuales, maxVisitas) {
  if (!PKPass) {
    try {
      ({ PKPass } = require('passkit-generator'))
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('passkit-generator')) {
        const dependencyError = new Error('Apple Wallet no esta disponible en este entorno porque falta passkit-generator.')
        dependencyError.code = 'APPLE_WALLET_DEPENDENCY_MISSING'
        throw dependencyError
      }
      throw error
    }
  }

  const pass = await PKPass.from({
    model: passPath,
    certificates: {
      wwdr: fs.readFileSync(wwdrPath),
      signerCert: fs.readFileSync(signerCertPath),
      signerKey: fs.readFileSync(signerKeyPath),
      signerKeyPassphrase: CERT_PASSWORD
    }
  }, {
    serialNumber: `maree-${String(telefono).replace(/[^a-zA-Z0-9]/g, '')}`,
    barcodes: [{
      message: String(telefono),
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1'
    }]
  })

  // Sobreescribir directamente el objeto interno del pase
  pass.props.storeCard = {
    primaryFields: [
      { key: 'nivel', label: 'Nivel', value: nombreRoyalty || 'Bienvenido' }
    ],
    secondaryFields: [
      { key: 'visitas', label: 'Visitas', value: String(visitasActuales ?? 0) },
      { key: 'meta', label: 'Meta', value: String(maxVisitas ?? 0) }
    ],
    backFields: [
      { key: 'nombre', label: 'Cliente', value: nombreCliente || '' },
      { key: 'telefono', label: 'Teléfono', value: String(telefono) }
    ]
  }

  return await pass.getAsBuffer()
}

module.exports = { generarApplePass }
