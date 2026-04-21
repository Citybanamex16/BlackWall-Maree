const { walletClient, CLASS_ID } = require('./GoogleWallet')

async function crearClase () {
  try {
    await walletClient.loyaltyclass.insert({
      requestBody: {
        id: CLASS_ID,
        issuerName: 'Maree Cepe',
        programName: 'Royalty Maree',
        programLogo: {
          sourceUri: { uri: 'https://images.rappi.com.mx/restaurants_logo/logo1-1670627103359.png?e=webp&d=10x10&q=10' },
          contentDescription: { defaultValue: { language: 'es', value: 'Logo Maee' } }
        },
        reviewStatus: 'UNDER_REVIEW'
      }
    })
    console.log('Clase creada correctamente', CLASS_ID)
  } catch (error) {
    if (error.code === 409) {
      console.log('La clase ya existe:', CLASS_ID)
    } else {
      console.log('Error:', error.message)
    }
  }
}

crearClase()
