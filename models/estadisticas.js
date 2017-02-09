var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EstadisSchema = new Schema({
    id: Number,
    idProm: String,
    ranking: {
    	pos: Number,
    	nomJugador: String,
    	fecha: String,
    	cantJuegos: Number
    }
});
var Estadis = mongoose.model('estadisticas', EstadisSchema);