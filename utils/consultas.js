var mongoose = require('mongoose');
var uuid = require('uuid');


require('../models/user');
require('../models/promociones');
require('../models/equipos');
var User = mongoose.model('user');
var Promo = mongoose.model('promociones');
var Equipo = mongoose.model('equipos');


exports.traeEquipo =  function (idEquipo, callback) {
	getEquipo(idEquipo,function(result){
		callback(result);
	});
}

function getEquipo(idEquipo,callback){
	Equipo.findOne({"id":idEquipo}, function(err, data){
		if(data){
			callback({status:true, datos: data});
		}else{
			callback({status:false});
		}
	});
}

exports.CreaEquipo = function(datos,callback){
	var equipo = new Equipo({
                name: datos.equipo.name,
    						id: datos.equipo.id,
    						participantes: 	[{ 	Nombre: datos.user.nomUser,
    																Puntaje: 0
    														}],
			    			numJugadores: 1,
			    			puntaje: 0,
			    			jugando: false,
			    			gano: false
            	});
            equipo.save(function(err) {
                if(err) throw err;
						getEquipo(datos.equipo.id,function(result){
							callback(result);
						});
            });
}


exports.AddUser = function(data, callback){
	var idBuscaUser = buscaUser(data.datos.user.nomUser,data.equipo.participantes);
	if(idBuscaUser != -1){
		callback({status:false});
	}else{
		data.equipo.participantes.push({
			Nombre: data.datos.user.nomUser,
			Puntaje: 0
		});
		updateEquipo({id:data.equipo.id, dateUpd: {participantes:data.equipo.participantes} }, function(result){
			if (result.status) {
				callback({status:true, datos: data.equipo});
			}else{
				callback(result);
			}
		});
	}
}

function updateEquipo(query, callback){
	Equipo.update({id : query.id},query.dateUpd,{upsert:true},function(Error,numAffected){
			console.log(numAffected);
			if(numAffected){
			    callback({status:true});
			}else{
			    callback({status:false,info:"ErrorActulizando"});
			}
		});
}

exports.updPuntaje = function(data,callback){
	 getEquipo(data.equipo.id,function(result){
	 	if(result.status){
	 		var idBuscaUser = buscaUser(data.user.nomUser,result.datos.participantes);
	 		if(idBuscaUser!=-1){
	 			result.datos.participantes[idBuscaUser].Puntaje = data.user.puntaje;
	 			updateEquipo({id:data.equipo.id, dateUpd: {participantes:result.datos.participantes} }, function(response){
					if (response.status) {
						callback({status:true, datos: result.datos});
					}else{
						callback(response);
					}
				});
	 		}
	 	}
	 });
}

exports.getEquipos = function(callback){
	Equipo.find({}, function(err, data){
		if(data){
			callback({status:true, datos: calculaPuntajes(data)});
		}else{
			callback({status:false});
		}
	});
}

function buscaUser(nombre,array){
  for(i in array){
      if(array[i].Nombre === nombre){
         return i;
         break;
      };
    }
  return -1;
}

function calculaPuntajes(data){
	var puntajes = [0,0];
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].participantes.length; j++) {
			puntajes[i] += data[i].participantes[j].Puntaje;
		}
	}

	return [
				{	id: data[0].id,
					name: data[0].name,
					puntaje: puntajes[0]
				},
				{	id: data[1].id,
					name: data[1].name,
					puntaje: puntajes[1]
				},

			];
};

exports.traeUser =  function (req, res) {
	User.findOne({"_id" : req.body.id}, function(err, data){
		if(data){
			res.json({status:true, datos: data});
		}else{
			res.json({status:false});
		}

	});
}

exports.traeUsers =  function (req, res) {
	User.find({}, function(err, data){
		if(data){
			res.json({status:true, datos: data});
		}else{
			res.json({status:false});
		}

	});
}

exports.traeEventos =  function (req, res) {
	Promo.find({}, function(err, data){
		if(data){
			res.json({status:true, datos: data});
		}else{
			res.json({status:false});
		}

	});
}

exports.traeEvento =  function (req, res) {
	if(req.user){
	Promo.findOne({"_id":req.query.id}, function(err, data){
		if(data){
			res.render('evento',{datos: data, user: req.user, idEvent: req.query.id, token: uuid.v1()});
		}else{
			res.json({status:false});
		}
	});
	}else{
		res.render('index');
	}
}



exports.traeGrupos =  function(req, res){
 Equipo.find({},function(err,data){
 	if(data){
 		res.json(data);
 	}
 });
}

exports.agregarUser = function(req, res){
 User.findOne({provider_id: req.body.provider_id}, function(err, user) {
            if(err) throw(err);
            if(!err && user!= null){
              ActualizaGrupo({name: req.body.name, token: req.body.tokeGrupo},function(data){
              	res.json(data);
              });
            }else{
            	var user = new User({
	                provider_id: req.body.provider_id,
	                provider: "facebook",
	                name: req.body.name,
	                tbEstadisticaI: [],
	                tbEstadisticaG: [],
	                rol: 'user'
            	});
	            user.save(function(err) {
	                if(err) throw err;
	                ActualizaGrupo({name: req.body.name, token: req.body.tokeGrupo},function(data){
		              	res.json(data);
              		});
	            });
            }
        });
}

function ActualizaGrupo(data, callback){
	 Equipo.findOne({id: data.token},function(err, equipo){
           if(!err && equipo != null){
           	if(equipo.participantes.length < equipo.numJugadores){
	          		equipo.participantes.push({
							          			Nombre: data.name,
							          			Puntaje: 0
	          								 });
	          		Equipo.update({id : data.token},{participantes:equipo.participantes},{upsert:true},function(Error,numAffected){
			            console.log(numAffected);
			            if(numAffected){
			              callback({status:true});
			            }else{
			              callback({status:false,info:"ErrorActulizando"});
			            }
		        	});
           	}else{
           		callback({status:false, info:"SinCupo"});
           	}
           }else{
           	console.log("Error "+err);
           	callback({status:false, info:"NoEquipo"});
           }
    });
}

exports.gruposCompletos = function(callback){
	var list = [];
	Equipo.find({},function(err,response){
		if(response){
			for(i in response){
			if(response[i].participantes.length === response.numJugadores && response.jugando === false){
				list.push(response[i].name);
			}
		}
		callback({equipos:list});
		}else{
			callback({err:err});
		}

	});
}

exports.traeEstadisticas = function(req, res){
	var result = [];
	Equipo.find({},function(err,equipos){
		User.populate(equipos,{path:"creador"},function(err,usuarios){
			Promo.populate(usuarios,{path:"evento"},function(err,response){
				if(response){
					for(i in response){
						if(response[i].gano){
							result.push(response[i]);
						}
					}
					res.status(200).json(result);
				}else{
					res.json({status:false});
				}
			});
		});

	});
}

exports.editarEvento = function(req, res){

	Promo.update({"_id" : req.body.id},{nombre:req.body.nombre,
										fechaIni: req.body.fechaIni,
										fechaFin: req.body.fechaFin,
										numParticipantes: req.body.numParticipantes,
										descripcion: req.body.descripcion,
										terminos: req.body.terminos	},{upsert:true},function(Error,numAffected){
			            if(numAffected){
			              res.json({status:true});
			            }else{
			              res.json({status:false, info:"Error actulizando la información"});
			            }
		        	});
}

exports.editarUser = function(req, res){
	User.update({"_id" : req.body.iduser},{rol: req.body.newRol},{upsert:true},function(Error,numAffected){
			            if(numAffected){
			              res.json({status:true});
			            }else{
			              res.json({status:false, info:"Error actulizando la información"});
			            }
		        	});
}

exports.crearEvento = function(req, res){
	Promo.findOne({nombre: req.body.nombre}, function(err, promo) {
            if(promo){
               res.json({status:false, info:"Existe un evento con el mismo nombre cámbielo o actualice el existente"});
            }else{
            	var prom = new Promo(req.body);
	            prom.save(function(err) {
	                if(err) throw err;
	                res.json({status:true});
	            });
            }
        });
}

exports.Uploads = function(req, res) {
	var fs = require('fs');
	console.log(req.body);
    var tmp_path = req.files.photo.path;
    // Ruta donde colocaremos las imagenes
    var target_path = './public/img/' + req.files.photo.name;
   // Comprobamos que el fichero es de tipo imagen
    if (req.files.photo.type.indexOf('image')==-1){
                res.json({status:false,info:'El fichero que deseas subir no es una imagen'});
    } else {
         // Movemos el fichero temporal tmp_path al directorio que hemos elegido en target_path
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            // Eliminamos el fichero temporal
            fs.unlink(tmp_path, function() {
                if (err) throw err;
                if(req.body.id!=null){
                	actualizaImagen({id:req.body.id,nombre:req.files.photo.originalFilename},function(result){
                		 if(result.status){
                		 	res.json({status:true,info:'¡archivo subido!',nombre:req.files.photo.originalFilename});
                		 }else{
                		 	res.json(result);
                		 }
                	});
                }else{
                	 res.json({status:true,info:'¡archivo subido!',nombre:req.files.photo.originalFilename});
               		 //res.render('upload',{message: '/images/' + req.files.photo.name,title: 'ejemplo de subida de imagen por HispaBigData'});
                }
            });
         });
     }
};

function actualizaImagen(data, callback){
	Promo.update({"_id" : data.id},{img:data.nombre},{upsert:true},function(Error,numAffected){
			            if(numAffected){
			              callback({status:true});
			            }else{
			              callback({status:false, info:"Error actulizando la información"});
			            }
		        	});
}
