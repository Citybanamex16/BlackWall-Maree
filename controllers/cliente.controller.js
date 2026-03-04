// Llamar al model

// const path = require('path')

// Exports
/** ejemplo:
 * exports.get_new = (request, response, next) => {
    response.render('new');
};
*/

exports.get_main = (request, response, next) => {
  response.render('index')
}
