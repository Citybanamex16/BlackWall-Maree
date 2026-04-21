/* eslint-env browser */
/* global alert */

/* eslint-disable no-unused-vars */

const { walletClient, ISSUER_ID, CLASS_ID } = require('../util/GoogleCredentials/GoogleWallet')
const db = require('../util/database')

// Crea la tarjeta de un cliente nuevo
async function crearLoyaltyObject (telefono, nombreRoyalty, puntosActuales, maxPuntos) {
  const objectId = `${ISSUER_ID}.cliente_${telefono}`

  try {
    await walletClient.loyaltyobject.insert({
      requestBody: {
        id: objectId,
        classId: CLASS_ID,
        state: 'ACTIVE',
        loyaltyPoints: {
          balance: { int: puntosActuales },
          label: 'Visitas'
        },
        secondaryLoyaltyPoints: {
          balance: { int: maxPuntos },
          label: 'Meta'
        },
        textModuleData: [
          {
            id: 'nivel',
            header: 'Nivel Actual',
            body: nombreRoyalty
          }
        ]
      }
    })
    console.log(`Tarjeta creada para cliente ${telefono}`)
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
  const objectId = `${ISSUER_ID}.cliente_${telefono}`

  await walletClient.loyaltyobject.patch({
    resurceId: objectId,
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
  const objectId = JSON.stringify({ id: objectId })
  const token = Buffer.from(objectJSON).toString('base64url')

  return `https://pay.google.com/gp/v/save/${token}`
}

module.exports = {
  crearLoyaltyObject,
  actualizarLoyaltyObject,
  actualizarTarjetaPorNivel,
  generarLinkWallet
}
