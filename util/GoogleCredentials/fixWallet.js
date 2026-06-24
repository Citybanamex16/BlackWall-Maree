/* Script para revisar las imagenes de los sellos en cloudify
 */

const { actualizarLoyaltyObject } = require('../../models/googleWallet.model.js')
const db = require('../database.js')

;(async () => {
  const [clientes] = await db.execute(`
    SELECT c.Numero_Telefonico AS telefono, c.Nombre, c.Visitas_Actuales AS visitas,
           c.Nombre_Royalty, e.Max_Visitas
    FROM cliente c
    JOIN estado_royalty e ON c.Nombre_Royalty = e.Nombre_Royalty
  `)

  for (const c of clientes) {
    try {
      await actualizarLoyaltyObject(c.telefono, c.Nombre, c.Nombre_Royalty, c.visitas, c.Max_Visitas)
      console.log(`✅ ${c.Nombre}`)
    } catch (e) {
      console.log(`❌ ${c.Nombre}: ${e.message}`)
    }
  }

  process.exit(0)
})()
