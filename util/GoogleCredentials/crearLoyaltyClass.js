const { walletClient, CLASS_ID } = require('./GoogleWallet')

async function crearClase () {
  try {
    await walletClient.loyaltyclass.update({
      resourceId: CLASS_ID,
      requestBody: {
        id: CLASS_ID,
        issuerName: 'Maree Crepe',
        programName: 'Royalty Maree',
        reviewStatus: 'UNDER_REVIEW'
      }
    })
    console.log('Clase actualizada correctamente:', CLASS_ID)
  } catch (error) {
    if (error.code === 404) {
      // Si no existe la actualizamos, la creamos
      try {
        await walletClient.loyaltyclass.insert({
          requestBody: {
            id: CLASS_ID,
            issuerName: 'Maree Crepe',
            programName: 'Royalty Maree',
            programLogo: {
              sourceUri: { uri: 'https://images.rappi.com.mx/restaurants_logo/logo1-1670627103359.png?e=webp&d=10x10&q=10' },
              contentDescription: { defaultValue: { language: 'es', value: 'Logo Maree' } }
            },
            reviewStatus: 'UNDER_REVIEW'
          }
        })
        console.log('Clase creada correctamente:', CLASS_ID)
      } catch (insertError) {
        console.log('Error al crear clase:', insertError.message)
      }
    } else {
      console.log('Error:', error.message)
    }
  }
}

crearClase()
