var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PauteSchema = new Schema({
    Empresa:String, 
    Persona:String, 
    Telfono: Number, 
    Correo: String
});

var Paute = mongoose.model('paute', PauteSchema);