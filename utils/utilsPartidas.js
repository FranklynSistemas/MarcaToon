var mongoose = require('mongoose');
var uuid = require('uuid');


require('../models/user');
require('../models/promociones');
require('../models/equipos');
require('../models/partidas')
var User = mongoose.model('user');
var Promo = mongoose.model('promociones');
var Equipo = mongoose.model('equipos');
var Partidas = mongoose.model('partidas');

var utils = require('./utils');

exports.guardaUser =  function (data,callback) {
	Partidas.findOne({"id" : data.partida}, function(err, datos){
		if(datos){
			nombreEquipo(data.grupo,function(result){
				datos.usuarios.push({
									Nombre: data.nombre, 
									idEquipo: data.grupo, 
									NombreEquipo: result.nombre,
									userId: data.userId,
									conectado: 'on',
									Puntaje: 0
								});
				Partidas.update({"_id" : mongoose.Types.ObjectId(datos._id)},{usuarios: datos.usuarios},{upsert:true},function(Error,numAffected){
                    if(numAffected){
                      callback({data: {
										Nombre: data.nombre, 
										idEquipo: data.grupo, 
										NombreEquipo: result.nombre,
										userId: data.userId,
										conectado: 'on',
										Puntaje: 0
									  },
								status:true,
								completo: result.numJugadores * 2 == datos.usuarios.length ? true : false,
								juego: datos.juego,
								usuarios: datos.usuarios});
                    }else{
                     callback({status:false});
                    }
             	});
			});	
		}else{
			callback({status:false});
		}
	});
}

function nombreEquipo(id,callback){
	Equipo.findOne({"id" : id}, function(err, datos){
		if(datos){
			callback({nombre:datos.name, numJugadores: datos.numJugadores});
		}
	});
}

exports.jueganPartida = function(idPartida,data, callback){
	 Partidas.findOne({id:idPartida},function(err,datos){
	 	if(datos){
		 	for(i in datos.usuarios){
	          if(datos.usuarios[i].userId === data.id){
	             datos.usuarios[i].Puntaje = data.Puntaje;
	             break;
	          }
	        }
	        Partidas.update({"_id" : mongoose.Types.ObjectId(datos._id)},{usuarios: datos.usuarios, juego: data.Juego, NumClicks: data.Clicks},{upsert:true},function(Error,numAffected){
	                console.log(Error);
	                if(numAffected){
	                  callback({status:true,
	                  			DibujeJuego: {Juego: data.Juego, Clicks: data.Clicks},
	                  			Rank: ordenarArrayPartida(datos.usuarios)
	                  			});
	                }else{
	                  callback({status:false});
	                }
	          });
	    }else{
	    	callback({status:false});
	    }
	});
}

exports.Deconectados = function(idPartida,userId, callback){
	 Partidas.findOne({id:idPartida},function(err,datos){
	 	if(datos){
		 	for(i in datos.usuarios){
	          if(datos.usuarios[i].userId === userId){
	             datos.usuarios[i].conectado = 'off';
	             break;
	          }
	        }
	        Partidas.update({"_id" : mongoose.Types.ObjectId(datos._id)},{usuarios: datos.usuarios},{upsert:true},function(Error,numAffected){
	                console.log(Error);
	                if(numAffected){
	                  callback({status:true,
	                  			Rank: ordenarArrayPartida(datos.usuarios)
	                  			});
	                }else{
	                  callback({status:false});
	                }
	          });
	    }else{
	    	callback({status:false});
	    }
	});
}

exports.actualizaEquipos = function(data, callback){ 
	Equipo.update({"id" : { $in :[data.equipo1,data.equipo2]}},{$set: {"jugando":true}},{multi:true},function(Error,numAffected){
	        console.log(Error);
	        if(numAffected){
	          callback({status:true});
	        }else{
	          callback({status:false});
	        }
	});
}

exports.finPartida =function(data,callback){
	Partidas.findOne({id:data.idPartida},function(err,datos){
		if(datos){
			if(!datos.terminada){
				datos.terminada = true;
				Partidas.update({id:data.idPartida},{terminada: datos.terminada},{upsert:true},function(Error,numAffected){
			        if(numAffected){
			          llenaEstadisticas({miEquipo: data.Equipos.miEquipo,userId:data.userId},function(result){
			          	if(result.status){
			          		Equipo.update({"id" : data.grupo},{$set: {"gano":data.Equipos.miEquipo.gano,"puntaje": data.Equipos.miEquipo.Puntaje}},{upsert:true},function(Error,numAffected){
						        if(numAffected){
						          callback(result);
						        }else{
						          callback({status:false});
						        }
							});
			          	}else{
			          		callback({status:false});
			          	}
			          });
			        }else{
			         callback({status:false});
			        }	
				});
			}else{
				llenaEstadisticas({miEquipo: data.Equipos.miEquipo,userId:data.userId},function(data){
					if (data.status) {
						callback(data);
					}else{
						callback({status:false});
					}
				});
			}
		}else{
			callback({status:false});
		}
	});
}

function llenaEstadisticas(data,callback){
	var tbActualizar = {};
	User.findOne({"provider_id" : data.userId},function(err,datos){
		if(datos){
			if(data.miEquipo.usuarios.length === 1){
				datos.tbEstadisticaI.push({
					id: datos.tbEstadisticaI.length+1,
					nombreEquipo: data.miEquipo.NombreEquipo,
					fecha: utils.GeneraFechaHora().Fecha,
					resultado: data.miEquipo.gano ? 'Ganada' : 'Perdida'
				});
				tbActualizar = {tbEstadisticaI : datos.tbEstadisticaI};
			}else{
				datos.tbEstadisticaG.push({
				id: datos.tbEstadisticaG.length+1,
				nombreEquipo: data.miEquipo.NombreEquipo,
				fecha: utils.GeneraFechaHora().Fecha,
				participantes: data.miEquipo.usuarios,
				resultado: data.miEquipo.gano ? 'Ganada' : 'Perdida'
			});
				tbActualizar = {tbEstadisticaG : datos.tbEstadisticaG};
			}
			User.update({"provider_id" : data.userId},tbActualizar,{upsert:true},function(Error,numAffected){
		        if(numAffected){
		          callback({status:true});
		        }else{
		          callback({status:false});
		        }	
			});
		}else{
			callback({status:false,err:err});
		}
	});
}

function ordenarArrayPartida(usr){
  var ArrayOrdenado = usr;
  var cont = 0;
  ArrayOrdenado.sort(function (a, b) {
  if (a.Puntaje > b.Puntaje) {
    return 1;
  }
  if (a.Puntaje < b.Puntaje) {
    return -1;
  }
  return 0;
});
return ArrayOrdenado;
}