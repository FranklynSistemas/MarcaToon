var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EquipoSchema = new Schema({
    name: String,
    id: Number,
    createdAt: {type: Date, default: Date.now},
    participantes: Array,
    puntaje: Number,
    numJugadores: Number,
    jugando: Boolean,
    gano: Boolean
});

var Equipo = mongoose.model('equipos', EquipoSchema);
