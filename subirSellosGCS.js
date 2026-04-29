const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')

cloudinary.config({
  cloud_name: 'dvbrrtput',
  api_key: '566627951834998',
  api_secret: 'glXl4UYP0PAjk6EbQgwryFVOdRs'
})

const SELLOS_DIR = path.resolve('./public/sellos')

// 1.png = stamp_0 (vacía), 2.png = stamp_1, ..., 9.png = stamp_8
const MAPEO = [
  { local: '1.png', publicId: 'sellos/stamp_0' },
  { local: '2.png', publicId: 'sellos/stamp_1' },
  { local: '3.png', publicId: 'sellos/stamp_2' },
  { local: '4.png', publicId: 'sellos/stamp_3' },
  { local: '5.png', publicId: 'sellos/stamp_4' },
  { local: '6.png', publicId: 'sellos/stamp_5' },
  { local: '7.png', publicId: 'sellos/stamp_6' },
  { local: '8.png', publicId: 'sellos/stamp_7' },
  { local: '9.png', publicId: 'sellos/stamp_8' }
]

async function subirImagen (localFile, publicId) {
  const localPath = path.join(SELLOS_DIR, localFile)

  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️  No encontrado: ${localPath}, saltando...`)
    return null
  }

  const result = await cloudinary.uploader.upload(localPath, {
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    format: 'png'
  })

  console.log(`📤 Subido: ${localFile} → ${result.secure_url}`)
  return result.secure_url
}

async function main () {
  console.log('🚀 Subiendo sellos a Cloudinary...\n')

  for (const { local, publicId } of MAPEO) {
    await subirImagen(local, publicId)
  }

  console.log('\n✅ Listo. Copia esta línea en googleWallet.js:\n')
  console.log("const BASE_STAMPS_URL = 'https://res.cloudinary.com/dvbrrtput/image/upload/sellos'\n")
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})