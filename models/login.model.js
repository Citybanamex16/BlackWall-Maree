const db = require('../util/database.js')

const normalizePhone = (telefono) => String(telefono || '').replace(/\D/g, '')

// Métodos de cliente

module.exports = class Cliente {
  static async findByPhoneForLogin (telefono) {
    const cleanPhone = normalizePhone(telefono)
    const query = `
            SELECT 
                c.Nombre, 
                c.Numero_Telefonico AS telefono, 
                c.Correo AS mail, 
                c.Genero AS genero, 
                c.Fecha_Nacimiento AS birthday,
                v.Codigo AS codigoVerificacion,
                v.Fecha_Expiracion AS expiracionVerificacion
            FROM cliente c
            LEFT JOIN codigo_verificacion v ON c.Numero_Telefonico = v.Numero_Telefonico
            WHERE c.Numero_Telefonico LIKE ? 
            LIMIT 1
        `

    const [rows] = await db.execute(query, [`%${cleanPhone}`])
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

  static save (nuevoCliente) {
    return db.execute(
            `INSERT INTO cliente (Nombre, Numero_Telefonico, Correo, Genero, Fecha_Nacimiento,ID_Rol) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              nuevoCliente.nombre,
              nuevoCliente.telefono,
              nuevoCliente.mail || null,
              nuevoCliente.genero,
              nuevoCliente.birthday,
              'Usuario'
            ]
    )
  }

  // Métodos de Colaborador

  static fetchColaborador (idColaborador) {
    const query = `
                SELECT 
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
