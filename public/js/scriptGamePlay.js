$(function()
{
	var websocket = io.connect();
		var Puntaje=0, // variable que guardara el puntaje del usuario  
		tiempo = 1000; //Velocidad del reloj en milisegundos
		segundos = 00;
		minutos = 1;
		horas = 1;
		numExitos = 0,
		NumNumeros=121,
		numClick = 0, // Variable que guarda el numero de clicks realizados por el usuario
		Juego = [], //Guarda toda la matriz del juego
		NomUser = '',
		tabla = '',
		newJuego = 30,
		jugando = false,
		ArrayUsers=[];



// Inicialización de componentes repetitivos del DOM
	var DomPuntos = $("#Puntos"),
		DomMensajes = $('#Mensajes'),
		DomNum = $("#NumeroaBuscar"),
		DomUser = $("#Usuario"),
		DomId = $("#id");

		
//se crea un json con sonidos...
	var audios = [
					{
						sonido 	: 	"success.mp3", 
						label	: 	"success"
					},
					{
						sonido 	: 	"error.mp3", 
						label	: 	"error"
					},
					{
						sonido 	: 	"tada.mp3", 
						label	: 	"tada"
					}
				 ];
	var sound = true;	

var Myid = '';

var infoGrupos = $("#infoGrupos"),
	infoUser = $("#idUser").text(),
	grupo = $("#grupo").text(),
	partida = $("#partida").text();

var websocket = io.connect();

  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    }
}
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '569063826598421',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use version 2.2
  });
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v2.6&appId=569063826598421";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));


  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    FB.api('/me', function(response) {
      console.log(JSON.stringify(response));
      console.log('Successful login for: ' + response.name);
      websocket.emit('newUserPartida',{nombre: response.name, userId: response.id,grupo: grupo, partida: partida});
      $("#nombrefb").html(response.name);
      NomUser = response.name;
      Myid = response.id;
    });
  }
	
//Genera una nueva de grilla de numeros Aleatorios
	function iniciaJuego(){
		Juego = lib.generaGrilla();
		if(Juego[0].length === 12){Juego[0].shift(); DibujaJuego(Juego);}else{DibujaJuego(Juego);};
	};

	websocket.on('newUsuarioPartida',function(data){
		alertify.success("Bienvenido "+data.Nombre);
		dibujaUsuarios(data.Usuarios);
	});

	websocket.on('InicioJuego',function(data){
		console.log('llego');
		$("#contRegre").removeClass('contenedorHide').addClass('contenedor');
		iniciarJuego(data.juego);
	});

	websocket.on('DibujeJuegoPartida',function(data){
		Juego = data.Juego;
		numClick = data.Clicks;
		DibujaJuego(Juego);
	});

	websocket.on('ActualizaUsurios',function(data){dibujaUsuarios(data);});

	websocket.on('PuntuaPartida',function(Nombre){
		alertify.error("El usuario: "+Nombre+" ¡Puntua!");
	});

	websocket.on("DesconectadoPartida",function(data){
		alertify.error("El usuario: "+data.nombre+" se a desconectado");
		dibujaUsuarios(data.usuarios);
	});


// Función que permite dibujar la cuadricula en el id="Juego" segun la mariz optenida por lib.generaGrilla() del Archivo juego.js
function DibujaJuego(Juego){
      DomMensajes.html("");
      DomNum.html(numClick+1);
       var tds = '<table id="MyTable">'+
                    '<tbody>';
    	for (var i = 0; i < Juego.length; i++) {
    		tds += '<tr>';
    		for (var j = 0; j < Juego[i].length; j++) {
    				if(!Juego[i][j].Clickeado){
    					tds += "<td><div id='"+Juego[i][j].Id+"' class='cuadrado "+Juego[i][j].Clase+"' style='background-color:"+Juego[i][j].Color+"'><div id='Numero'>"+Juego[i][j].Numero+"<div></div></td>";
    				}
    		};
    		tds += '</tr>';
    	};
    		tds += '</tbody></table>';
			$("#Juego").html(tds);
// Se asignan los eventos a todos los div de clase .cuadrado			
	$(".cuadrado").click(function() {
		  numClick++;
          var oID = $(this).attr("id");
          console.log(oID);
          validaClick(oID,numClick);
	});
}

//Valida si al div que le dan click posee el numero que debe ser dependendo la cantidad de clicks dados
function validaClick(id,click){
 var idSeparado = id.split("_");
	if(Juego[idSeparado[0]][idSeparado[1]].Numero === click){
		sound === true ? createjs.Sound.play("success") : console.log("nosound");
		numExitos++;
		Juego[idSeparado[0]][idSeparado[1]].Clickeado = true;
		$("#"+id).removeClass("cuadrado ").addClass("Puntaje");
		$("#"+id).html("<div id='Numero'><b>¡10 puntos!<b></div>").fadeOut(800);
		DomPuntos.html(Puntaje+=10);
		if(numClick<NumNumeros){
			DomNum.html(numClick+1);
		}
		websocket.emit('jueganPartida',{Juego:Juego,Clicks:click,Nombre:NomUser,Puntaje: Puntaje, id: Myid});	
		return true;
	}else{
		numClick--;
		sound === true ? createjs.Sound.play("error") : console.log("nosound");
		return false;
	}

}

// Genera el tiempo para completar el juego y lo muestra en el DOM
var     segundosString = '00',
		minutosString = '00',
		horasString = '00',
		reloj='',
		fin = false;
function timer(){
	if(numClick<NumNumeros){	
		if(segundos<60){
			segundosString = segundos<10 ? "0"+segundos++ : segundos++;
		}else if(minutos<60){
			minutosString = minutos<10 ? "0"+minutos++ : minutos++;
			segundos=0;
		}else if(horas<24){
			horasString = horas<10 ? "0"+horas++ : horas++;
			minutos=0;
		}
	}else{
		if(!fin){
			//alertify.alert("<b>Felicitaciones a terminado el juego en: "+horas+":"+minutos+":"+segundos+" y su puntaje fue de: "+Puntaje+"</b>");
			/*alertify.dialog('alert').set({transition:'slide',title: "Fin del juego" ,message: "<h3>Los puntajes quedaron así: </h3>"+tabla}).show(); 
			numClick = 0;
			websocket.emit("ActualizaClicksSala");
			sound === true ? createjs.Sound.play("tada") : console.log("nosound");
			fin = true;
			newGame();
			*/
			fin = true;
			finJuego();
		}
	}
	reloj = horasString+":"+minutosString+":"+segundosString;
	$("#Cronometro").html(reloj);
	setTimeout(function(){timer()},tiempo);
}

function finJuego(){
	sound === true ? createjs.Sound.play("tada") : console.log("nosound"); 
	var Equipos	= sumaPuntajes(),
		Ganador = Equipos.Equipo1.gano ? Equipos.Equipo1 : !Equipos.Equipo1.gano && !Equipos.Equipo2.gano ? 'Empate' : Equipos.Equipo2,
		msgGanador = Ganador === 'Empate' ? '<h3>Ningun Equipo ganó el resultado es un empate</h3>' : "<h3>El equipo ganador es: "+Ganador.NombreEquipo+" con: "+Ganador.Puntaje+" puntos</h3>",
		informe = "<h3>Los puntajes quedaron así: </h3>"+tabla+"<br><hr>"+msgGanador+"<br><h3>En 30 segundos el sistema los devolverá a la pagina principal, Gracias por participar</h3>";
	alertify.dialog('alert').set({transition:'slide',title: "Fin del juego" ,message: informe}).show();
	websocket.emit('FinPartida',{Equipos: Equipos, idPartida:partida, userId: Myid, grupo: grupo});
	direccionar();
}

function sumaPuntajes(){
 var equipo1 = {nombre:false,Puntaje:0, usuarios: []},
 	 equipo2 = {nombre:false,Puntaje:0, usuarios: []},
 	 miEquipo = '';
 for (i in ArrayUsers){
 	if (Myid === ArrayUsers[i].userId){miEquipo=ArrayUsers[i].NombreEquipo};
 	if(ArrayUsers[0].idEquipo ===  ArrayUsers[i].idEquipo){
 		if(equipo1.nombre === false){equipo1.NombreEquipo = ArrayUsers[i].NombreEquipo; equipo1.nombre=true;}  
 		equipo1.Puntaje += ArrayUsers[i].Puntaje;
 		equipo1.usuarios.push(ArrayUsers[i]);
 	}else{
 		if(equipo2.nombre === false){equipo2.NombreEquipo = ArrayUsers[i].NombreEquipo; equipo2.nombre=true;} 
 		equipo2.Puntaje += ArrayUsers[i].Puntaje;
 		equipo2.usuarios.push(ArrayUsers[i]);
 	}
 }
 if(equipo1.Puntaje > equipo2.Puntaje){
 	equipo1.gano = true;
 }else if(equipo1.Puntaje === equipo2.Puntaje){
 	equipo1.gano = false;
 	equipo2.gano = false;
 }else{
 	equipo2.gano = true;
 }
 var infoEquipo = equipo1.NombreEquipo === miEquipo ? equipo1 : equipo2; 

 return {Equipo1: equipo1, Equipo2: equipo2, miEquipo: infoEquipo};
}

var contDir = 0;
function direccionar(){
	contDir++;
	if(contDir<=30){
		setTimeout(function(){direccionar();},1000);
	}else{
		window.location.href = "/profile";
	}
}


// Prohíbe el uso de ctrl + f tomado de http://stackoverflow.com/questions/7091538/is-it-possible-to-disable-ctrl-f-of-find-in-page
window.addEventListener("keydown",function (e) {
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) { 
        e.preventDefault();
    }
});


function dibujaUsuarios(userArray){
	var color = '',
		cont = 0;
		ArrayUsers = userArray;
		tabla = '';
	for (var i = userArray.length - 1; i >= 0; i--){
		cont++;
			if(userArray[0].idEquipo != userArray[i].idEquipo){
				color="blue";
			}else{
				color="black";
			}
		var colorConectado = userArray[i].conectado === 'on' ? 'green' : 'red';
		tabla += "<div id='txt'><b id='b' style='color:"+color+"'>"+cont+". "+userArray[i].Nombre+" - "+userArray[i].NombreEquipo+" - "+userArray[i].Puntaje+" - <span style='color:"+colorConectado+"'>"+userArray[i].conectado+"</span></b></div>";
	}
	$("#Users").html(tabla);
}

var conteo = 21;
function iniciarJuego(juego){
	conteo--;
	if (conteo>0) {
		setTimeout(function(){
			iniciarJuego(juego);
		},1000);
		$("#contador").html("<div id='NumCont' class='animated zoomIn' style='color:"+lib.randomColor()+"'>"+conteo+"</div>");
	}else{
		$("#contRegre").removeClass('contenedor').addClass('contenedorHide');
		$('#ui').removeClass('fixedHide').addClass('fixed');
		DibujaJuego(juego);
		Juego = juego;
		timer();
	};
}

//======================Area sonidos==============================================

				 
	//Se cargan los sonidos...	
	function Sonidos(){
		for(var audio = 0; audio < audios.length; audio++)
	{
		createjs.Sound.registerSound("sounds/" + audios[audio].sonido, audios[audio].label);
	}
	$("#sound").click(function(event)
	{
		if(sound)
		{
			sound=false;
			$("#sound").removeClass('sound');
			$("#sound").addClass('nosound');
		}
		else
		{
			sound=true;
			$("#sound").removeClass('nosound');
			$("#sound").addClass('sound');
		}
	});
}Sonidos();			 
	

});
