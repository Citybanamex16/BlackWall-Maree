const { walletClient, ISSUER_ID, CLASS_ID} = requiere ('./googleWallet')

async function crearClase () {
    try {
        await walletClient.loyaltyclass.insert({
            requestBody: {
                id: CLASS_ID,
                issuerName: 'Maree Cepe',
                programName: 'Royalty Maree',
                programLogo: {
                    sourceUri: { uri: }
                    contentDescription: { defaultValue: {language: 'es', value: 'Logo Maee'}}
                },
                reviewStatus: "UNDER_REVIEW"
            }
        })
        console.log("Clase creada correctamente")
    } catch (error) {
        console.log("Error al crear clase:", error.message)
    }
}

crearClase()