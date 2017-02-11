// server.js
var uuid = require('uuid');
var cons  = require("consolidate");
var bodyParser  = require('body-parser');
var express        = require('express');
var app            = express();
var session = require('express-session');
var httpServer = require("http").createServer(app);
httpServer.listen(3002);

var multipart = require('connect-multiparty');
app.use(multipart()) //Express 4

// Login Facebook
var mongoose = require('mongoose');
var passport = require('passport');
require('./models/user');
require('./models/salas');
require('./models/equipos');
require('./models/partidas');
require('./routes/passport')(passport);

var routes = require('./routes/rutas'),
    consultas = require('./utils/consultas'),
    utils = require('./utils/utils'),
    utilsPartidas = require('./utils/utilsPartidas');

var io= require('socket.io').listen(httpServer);

io.set('log level',1);


mongoose.connect('mongodb://104.197.252.243:80/trikatuka',
  function(err, res) {
    if(err) throw err;
    console.log('Conectado con exito a la BD');
});


app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));


//app.use(express.cookieParser());
//app.use(express.methodOverride());
app.use(session({ secret: 'secretkey' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Configuración de Express
app.use(passport.initialize());
app.use(passport.session());



app.use('/', routes);

var usuarios = [];
var Juego = [];
var usuariosConectados = {};
var NumClicks = 0;
var newGame = false,
    UsuariosSalas = {};

var Salas = mongoose.model('salas');
var Equipos = mongoose.model('equipos');
var Partidas = mongoose.model('partidas');
console.log('Servidor disponible en http://localhost:' + 3002);

//Socket connection handler

io.sockets.on("connection",function(socket)
{
  console.log(socket.id);
  console.log('Un cliente se ha conectado');

//============MarcaToon=====================
socket.on('traeUsers',function(data){
  consultas.traeEquipo(data.equipo.id,function(result){
    if(!result.status){
      consultas.CreaEquipo(data,function(response){
        io.sockets.emit('Equipo',response);
      });
    }else{
      consultas.AddUser({datos:data, equipo: result.datos},function(response){
        if(!response.status){
          io.sockets.emit('Equipo',result);
        }else{
          io.sockets.emit('Equipo',response);
        }
        
      });
      
    }
  });
});

socket.on('updatePuntaje',function(data){
  consultas.updPuntaje(data,function(result){
     io.sockets.emit('Equipo',result);
  });
});

socket.on('traeEquipos',function(){
  consultas.getEquipos(function(result){
     io.sockets.emit('Equipos',result);
  });
});


//============Fin MarcaToon=================





//=================Partidas====================
socket.on('newUserPartida',function(data){
    socket.join(data.partida);
    socket.nickname = data.nombre;
    socket.equipo = data.grupo;
    socket.partida = data.partida;
    socket.userId = data.userId;
    utilsPartidas.guardaUser(data,function(datos){
      if(datos.status){
          io.sockets.in(data.partida).emit('newUsuarioPartida',{Nombre:data.nombre,Usuarios: datos.usuarios});
        if(datos.completo){
          io.sockets.in(data.partida).emit('InicioJuego',{Usuarios:datos.usuarios, juego: datos.juego});
        }
      }
    });
  });

 socket.on('jueganPartida',function(data){
    console.log(data.Nombre);
    utilsPartidas.jueganPartida(socket.partida,data, function(result){
      if(result.status){
        io.sockets.in(socket.partida).emit('DibujeJuegoPartida',result.DibujeJuego);
        io.sockets.in(socket.partida).emit('ActualizaUsurios',result.Rank);
        io.sockets.in(socket.partida).emit("PuntuaPartida",socket.nickname);
      }
    });
  });

 socket.on('FinPartida',function(data){
  utilsPartidas.finPartida(data,function(data){
    if(data.status){
      console.log(socket.nickname+' ha actualizado sus estadisticas');
    }else{
      console.log(socket.nickname+' error');
    }
  });
 });
//=============================================
//====================Grupos===================

  socket.on('newUserGrup',function(data){
    socket.join(data.grupo);
    socket.nickname = data.nombre;
    socket.equipo = data.grupo;
    consultas.gruposCompletos(function(data){
      io.sockets.emit('ActualizaGrupos',data);
    });
    io.sockets.in(data.grupo).emit('newUsuarioEquipo',{Nombre:data.nombre});
  });

  socket.on('invitacion', function(data){
    var idPartida = uuid.v1();
    Equipos.findOne({id:data.MiGrupo},function(err, datos){
      if(datos){
        if(datos.participantes.length === datos.numJugadores){
          io.sockets.in(data.grupo).emit('invitacion',  {msg: 'El equipo '+datos.name+' los ha retado',
                                                      partida: idPartida,
                                                      numJugadores: datos.numJugadores,
                                                      grupos: {Equipo: data.MiGrupo, Rival: data.grupo}
                                                      });
         var newPartida = new Partidas({
                id: idPartida,
                NumClicks: 0,
                usuarios: []
            });
            newPartida.save(function(err) {
                if(err) throw err;
            });
        }else{
          socket.emit('errorGrupos',{err: 'Su equipo aún no está completo'});
        }
      }
    });
  });

  socket.on('Acepta',function(data){
    Partidas.findOne({id: data.partida},function(err,datos){
      if (datos) {
        if(datos.usuarios.length <= data.numJugadores){
           datos.usuarios.push({Nombre: socket.nickname, Equipo: socket.equipo, Puntaje: 0});
           Partidas.update({"_id" : mongoose.Types.ObjectId(datos._id)},{usuarios: datos.usuarios},{upsert:true},function(Error,numAffected){
                if(numAffected && datos.usuarios.length === 1){
                datos.usuarios = [];
                Partidas.update({"_id" : mongoose.Types.ObjectId(datos._id)},{juego: utils.generaGrilla(),usuarios: datos.usuarios, terminada:false},{upsert:true},function(Error,numAffected){
                    if(numAffected){
                      utilsPartidas.actualizaEquipos({equipo1:data.grupos.Equipo,equipo2:data.grupos.Rival},function(result){
                        if(result.status){
                          io.sockets.emit('Grupos');
                          io.sockets.in(data.grupos.Equipo).emit('Comenzar',{Partida: data.partida});
                          io.sockets.in(data.grupos.Rival).emit('Comenzar',{Partida: data.partida});
                        }
                      });
                    }
                });
                }else{
                  console.log(datos.usuarios.length);
                }
          });
        }
      }else{
        io.sockets.in(data.grupos.Equipo).emit('Rechazado');
        io.sockets.in(data.grupos.Rival).emit('Rechazado');
      }
    });
  });

  socket.on('Rechaza',function(data){
    Partidas.remove({id : data.partida},function(error){console.log(error)});
    io.sockets.in(data.grupos.Equipo).emit('Rechazado');
    io.sockets.in(data.grupos.Rival).emit('Rechazado');
  });
//=============================================

//=====================Salas Libres=============
  socket.on('TraerSalas',function(){
    Salas.find({},function(err,data){
    io.sockets.emit('Salas',data);
  });
  });
  socket.on('newSala',function(data){
    Salas.findOne({nombre: data.namerom}, function(err, user) {
      if(!user){
        var id = uuid.v1();
        var newSala = new Salas({
                id: id,
                nombre: data.namerom,
                NumClicks: 0,
                usuarios: [{
                                  Nombre:data.nombre,
                                  Puntaje: data.Puntaje,
                                  Color: data.Color
                          }]
            });
            newSala.save(function(err) {
                if(err) throw err;
            });
      socket.join(id);
      socket.nickname = data.nombre;
      socket.sala = id;
      io.sockets.in(id).emit('UsersSalas',{id: id, usuarios : [{ Nombre:data.nombre,
                                        Puntaje: data.Puntaje,
                                        Color: data.Color}]});
      io.sockets.in(id).emit('newConection',{Nombre: socket.nickname, Clicks: 0, id: id});
      }else{
        socket.emit('msg','La sala ya existe');
      }
    });
  });

   socket.on('juegaSala',function(data){
    console.log(data.Nombre);
      Salas.findOne({id:data.id},function(err,datos){
        for(i in datos.usuarios){
          console.log("Iteracion "+i);
          if(datos.usuarios[i].Nombre === socket.nickname){
             datos.usuarios[i].Puntaje = data.Puntaje;
             console.log("Usuario ");
             console.log(datos.usuarios[i]);
             break;
          }
        }
        Salas.update({"_id" : mongoose.Types.ObjectId(datos._id)},{usuarios: datos.usuarios, juego: data.Juego, NumClicks: data.Clicks},{upsert:true},function(Error,numAffected){
                console.log(Error);
                if(numAffected){
                  console.log("Bien");
                  io.sockets.in(data.id).emit('DibujeJuegoSala',{Juego: data.Juego, Clicks: data.Clicks});
                  io.sockets.in(data.id).emit('ActualizaSala',ordenarArraySala(datos.usuarios));
                  io.sockets.in(data.id).emit("PuntuaSala",socket.nickname);
                }else{
                  console.log("Mal");
                }
          });
      });
  });

  socket.on('IniJuegoSala',function(data){
      console.log("Id "+data.id);
      Salas.update({id : data.id},{juego: data.juego,NumClicks: 0 },{upsert:true},function(Error,numAffected){
                console.log(numAffected);
                if(numAffected){
                  console.log("Bien");
                }else{
                  console.log("Mal");
                }
          });
  });

  socket.on('ingresaNewUserSala',function(data){
    socket.join(data.id);
    socket.nickname = data.nombre;
    socket.sala = data.id;
    Salas.findOne({id: data.id},function(err,datos){
      datos.usuarios.push({ Nombre:data.nombre,
                            Puntaje: 0,
                            Color: data.Color});
      Salas.update({id : data.id},{usuarios: datos.usuarios},{upsert:true},function(Error,numAffected){
                console.log(numAffected);
                if(numAffected){
                  io.sockets.in(data.id).emit('inicioJuegoSala',{juego: datos.juego});
                  io.sockets.in(data.id).emit('ActualizaSala',ordenarArraySala(datos.usuarios));
                  io.sockets.in(data.id).emit('newConection',{Nombre: socket.nickname, Clicks: datos.NumClicks, id:  data.id});
                }else{
                  console.log("Mal");
                }
          });
    });

  });

   socket.on('reiniciaJuegoSala',function(data){
    if(!newGame){
      //reiniciaUsuariosSalas();
      Salas.findOne({id: data.id},function(err,datos){
        var usuariosSalas = reiniciaUsuariosSalas(datos.usuarios);
        Salas.update({id : data.id},{juego: datos.Juego, usuarios: usuariosSalas},{upsert:true},function(Error,numAffected){
                console.log(numAffected);
                if(numAffected){
                  io.sockets.in(data.id).emit('SeReiniciaJuegoSala',{usuarios: ordenarArraySala(datos.usuarios), User: socket.nickname});
                  io.sockets.in(data.id).emit('ActualizaSala',ordenarArraySala(datos.usuarios));
                  io.sockets.in(data.id).emit('DibujeJuegoSala',{Juego: data.Juego, Clicks: data.Clicks});
                }else{
                  console.log("Mal");
                }
          });

      });
      //io.sockets.in(data.id).emit('BorraPuntajes');
      setTimeout(function(){newGame=false},10000);
    }

  });

//========================================== Juego Todos Contra Todos========================================
  socket.on('newUser',function(data){
    console.log(data);
    if(usuariosConectados[data.Nombre]){
      socket.emit('error',true);
    }else{
      socket.emit('error',false);
      socket.nickname = data.Nombre;
      usuariosConectados[data.Nombre] = socket.nickname;
      console.log(socket.nickname);
      usuarios.push(data);
      io.sockets.emit('Users',usuarios);
      io.sockets.emit("conectados", {Nombre: socket.nickname, Clicks: NumClicks});
    }
  });

  socket.on('IniJuego',function(juego){
     Juego = juego;
     NumClicks = 0;
     io.sockets.emit("conectados", {Nombre: socket.nickname, Clicks: NumClicks});
  });

  socket.on('ingresaNewUser',function(){
    socket.emit('inicioJuego',Juego);
  });

  socket.on('juega',function(data){
    findUser(socket.nickname,data.Puntaje);
    Juego = data.Juego;
    NumClicks = data.Clicks;
    io.sockets.emit('DibujeJuego',{Juego: data.Juego, Clicks: data.Clicks});
    io.sockets.emit('Actualiza',ordenarArray());
    io.sockets.emit("Puntua",socket.nickname);

  });

  socket.on('reiniciaJuego',function(data){
    if(!newGame){
      Juego = data.Juego;
      reiniciaUsuarios();

      //new line
      io.sockets.emit('SeReiniciaJuego',{usuarios: usuarios, User: socket.nickname});
      io.sockets.emit('Actualiza',usuarios);
      io.sockets.emit('DibujeJuego',{Juego: data.Juego, Clicks: data.Clicks});
      io.sockets.emit('BorraPuntajes');
      setTimeout(function(){newGame=false},10000);
    }

  });

  socket.on("ActualizaClicks",function(){
    NumClicks = 0
  });


  socket.on('disconnect', function ()
  {
      if(socket.sala ===  undefined && socket.equipo === undefined){
      console.log(socket.nickname+" Se ha desconectado ");
      //Eliminamos al usuario de los conectados
      delete usuariosConectados[socket.nickname];
      if(buscaEliminar(socket.nickname)!=-1){
        usuarios.splice(buscaEliminar(socket.nickname),1);
      }
      //Mandamos la información a las Sockets
      io.sockets.emit("Actualiza",usuarios);
      io.sockets.emit("Desconectado", socket.nickname);
      }else if(socket.equipo === undefined){
        console.log(socket.nickname+" Se ha desconectado "+socket.sala);
        Salas.findOne({id:socket.sala},function(err,datos){
          if(datos){
            var newArrayUsers = buscaPosUser({usuarios: datos.usuarios, Nombre: socket.nickname});
            if(newArrayUsers.length>0){
               Salas.update({id : socket.sala},{usuarios:newArrayUsers},{upsert:true},function(Error,numAffected){
                console.log(numAffected);
                if(numAffected){
                  io.sockets.in(socket.sala).emit("ActualizaSala",ordenarArraySala(newArrayUsers));
                  io.sockets.in(socket.sala).emit("DesconectadoSala", socket.nickname);
                  socket.leave(socket.sala);
                }else{
                  console.log("Mal");
                }
              });
            }else{
              Salas.remove({id : socket.sala},function(error){console.log(error)});
            }
          }
        });
      }else if(socket.partida === undefined){
        console.log(socket.nickname+" Se ha desconectado del equipo");
        socket.leave(socket.equipo);
      }else{
        utilsPartidas.Deconectados(socket.partida,socket.userId, function(result){
          if(result.status){
            socket.leave(socket.partida);
            io.sockets.in(socket.partida).emit("DesconectadoPartida", {nombre: socket.nickname,usuarios: result.Rank});
          }
        });
      }
  });

});
function reiniciaUsuariosSalas(data){
  for(i in data){
    data[i].Puntaje = 0;
  }
  return data;
}

function reiniciaUsuarios(){
  for(i in usuarios){
    usuarios[i].Puntaje = 0;
  }
}

function findUser(user,puntaje){
  for(i in usuarios){
    if(usuarios[i].Nombre === user){
      usuarios[i].Puntaje = puntaje;
      break;
    }
  }
}

function buscaEliminar(nombre){
  for(i in usuarios){
      if(usuarios[i].Nombre === nombre){
         return i;
         break;
      };
    }
  return -1;
}

function ordenarArray(){
  var ArrayOrdenado = usuarios;
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

function ordenarArraySala(usr){
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

function buscaPosUser(data){
  var pos = 0;
  for(i in data.usuarios){
    if(data.usuarios[i] === data.Nombre){
      pos = i;
      break;
    };
  }
  data.usuarios.splice(pos,1);
  return data.usuarios;
}

console.log('Waiting for connection');
