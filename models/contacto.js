
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactoSchema = new Schema({
    Nombre:String, 
    Correo:String, 
    Mensaje: String 
});

var Contacto = mongoose.model('contacto', ContactoSchema);