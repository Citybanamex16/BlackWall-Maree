const db = require('../util/database.js')

module.exports = class Cliente {
  static async findByPhoneForLogin (telefono) {
    const n = telefono.replace(/\D/g, '')
    const telBD = (n.length === 10) ? `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6)}` : telefono

    const query = `
      SELECT 
          c.Nombre, 
          c.Numero_Telefonico AS telefono, 
          c.username AS username,
          c.Correo AS mail, 
          c.Genero AS genero, 
          c.Fecha_Nacimiento AS birthday,
          c.ID_Rol AS rol,
          v.Codigo AS codigoVerificacion,
          v.Fecha_Expiracion AS expiracionVerificacion
      FROM cliente c
      LEFT JOIN codigo_verificacion v ON c.Numero_Telefonico = v.Numero_Telefonico
      WHERE c.Numero_Telefonico = ? 
      LIMIT 1
    `

    const [rows] = await db.execute(query, [telBD])
    return rows[0] || null
  }

  static updateVerificationCodeByPhone (telefono, codigo, expiracion) {
    return db.execute(
      `INSERT INTO codigo_verificacion (Numero_Telefonico, Codigo, Fecha_Expiracion)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
          Codigo = VALUES(Codigo),
          Fecha_Expiracion = VALUES(Fecha_Expiracion)`,
      [telefono, codigo, expiracion]
    )
  }

  static deleteVerificationCode (telefono) {
    return db.execute('DELETE FROM codigo_verificacion WHERE Numero_Telefonico = ?', [telefono])
  }

  static save (nuevoCliente) {
    return db.execute(
      `INSERT INTO cliente (Nombre, Numero_Telefonico, username, Correo, Genero, Fecha_Nacimiento, ID_Rol, Nombre_Royalty) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nuevoCliente.nombre,
        nuevoCliente.telefono,
        nuevoCliente.username,
        nuevoCliente.mail || null,
        nuevoCliente.genero,
        nuevoCliente.birthday,
        'Usuario',
        'Fan'
      ]
    )
  }

  // --- MÉTODOS DE COLABORADOR ---
  static fetchColaborador (idColaborador) {
    const query = `
      SELECT 
      ID_Colaborador AS id_colaborador,
          Nombre AS nombre,
          Contraseña AS password, 
          ID_Rol AS id_rol
      FROM colaborador
      WHERE ID_Colaborador = ? 
      LIMIT 1
    `
    return db.execute(query, [idColaborador])
  }
}
