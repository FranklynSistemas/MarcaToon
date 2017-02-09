var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PromoSchema = new Schema({
    id: Number,
    fechaIni: String,
    fechaFin: String,
    numParticipantes: Number,
    descripcion: String,
    img: String,
    terminos: String,
    nombre: String

});

var Promo = mongoose.model('promociones', PromoSchema);