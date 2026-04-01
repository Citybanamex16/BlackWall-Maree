const db = require('../../util/database.js')


module.exports = class Categoría{
	static async fecthAll(){
		return db.execute(`SELECT * FROM categoría`)
	}
}