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


var cont = 0;

var Salas = mongoose.model('salas');
var Equipos = mongoose.model('equipos');
var Partidas = mongoose.model('partidas');
console.log('Servidor disponible en http://localhost:' + 3002);

//Socket connection handler

io.sockets.on("connection",function(socket)
{
  console.log(socket.id);
  console.log('Un cliente se ha conectado');
  cont++; 

io.sockets.emit('numUsers',cont);

//============MarcaToon=====================
socket.on('traeUsers',function(data){
      socket.join(data.equipo.id);
      socket.equipo = data.equipo.id;
         
  consultas.traeEquipo(data.equipo.id,function(result){
    if(!result.status){
      consultas.CreaEquipo(data,function(response){
        io.sockets.in(socket.equipo).emit('Equipo',response);
      });
    }else{
      consultas.AddUser({datos:data, equipo: result.datos},function(response){
        if(!response.status){
          io.sockets.in(socket.equipo).emit('Equipo',result);
        }else{
          io.sockets.in(socket.equipo).emit('Equipo',response);
        }
        
      });
      
    }
  });

  
});

socket.on('updatePuntaje',function(data){
  consultas.updPuntaje(data,function(result){
     io.sockets.in(socket.equipo).emit('Equipo',result);
  });
});

socket.on('traeEquipos',function(){
  consultas.getEquipos(function(result){
     io.sockets.emit('Equipos',result);
  });
});


socket.on('disconnect', function (){
  cont--;
  io.sockets.emit('numUsers',cont);
});

//============Fin MarcaToon=================

});
console.log('Waiting for connection');
