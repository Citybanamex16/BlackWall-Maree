const db = require('../../util/database.js')

module.exports = class Categoría {
  static async hasColumn (tableName, columnName) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`,
      [tableName, columnName]
    )

    return Number(rows[0]?.total || 0) > 0
  }

  static async fecthAll () {
    const hasVisibleMenu = await Categoría.hasColumn('categoría', 'Visible_Menu')
    const query = hasVisibleMenu
      ? 'SELECT * FROM categoría WHERE Visible_Menu = 1'
      : "SELECT * FROM categoría WHERE Nombre <> 'CrepaPerso'"

    return db.execute(query)
  }
}
