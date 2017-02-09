$(function()
{
  
var infoGrupos = $("#infoGrupos"),
	infoUser = $("#idUser").text(),
	grupo = $("#grupo").text();

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
      websocket.emit('newUserGrup',{nombre: response.name, grupo: grupo});
    });
  }


/*
function EnviaInfoNewGrup(){
	websocket.emit('newUserGrup',{name:});
};EnviaInfoNewGrup();
*/
websocket.on('newUsuarioEquipo',function(datos){
	alertify.success('El usuario '+datos.Nombre+' se a integrado a su grupo'); 

});
websocket.on('ActualizaGrupos',function(datos){
	var html='<h2>Grupos Listos</h2>';
	traeGrupos();
	console.log(datos);
	for(i in datos.equipos){html+='<b>'+datos.equipos[i]+'</b><br>'};
	alertify.set('notifier','position', 'top-right');
 	alertify.notify(html,'custom',10);
	// .ajs-message.ajs-custom { color: #31708f;  background-color: #d9edf7;  border-color: #31708f; }
	//alertify.notify('custom message.', 'custom', 2, function(){console.log('dismissed');});
});

websocket.on('invitacion',function(data){
	alertify.confirm('Confirmar Invitación', data.msg+', ¿Aceptan?' , function(){
	 	websocket.emit('Acepta',data);
	},function(){
		websocket.emit('Rechaza',data);
	});
});

websocket.on('Comenzar', function(data){
	window.location.href = "/gameplay?grup="+grupo+"&play="+data.Partida;
});

websocket.on('Rechazado',function(){
	alertify.error('Alguien a rechazado la invitación'); 
});

websocket.on('errorGrupos',function(data){
	alertify.dialog('alert').set({transition:'flipy',message: "<center style='color:red'>"+data.err+"</center>"}).show(); 
	
});

websocket.on('Grupos',function(){
	traeGrupos();
});

function traeGrupos(){
	$.ajax(
    {
      url     : '/traeGrupos',
      type    : 'GET', 
      data    :  '', 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      llenaDatos(data);
    }); 
};traeGrupos();

function llenaDatos(datos){
	console.log(datos);
	var html = '<center>',
		img = '';	
	for(j in datos){
		if(!datos[j].jugando){
			img = ''
			for (var i = 0; i < datos[j].numJugadores; i++) {
				if(datos[j].participantes[i] != undefined){
					img += '<img src="/img/CirculoVerde.png" title="'+datos[j].participantes[i].Nombre+'" width="18px" height="18px">';
				}else{
					img += '<img src="/img/Círculo.png" width="20px" height="20px">';
				}
			};
			var boton = datos[j].participantes.length === datos[j].numJugadores ? '<button type="button" id="'+datos[j].id+'" class="btn btn-success listo">Listo</button>' : '<button type="button" class="btn btn-danger">Incompleto</button>';
			html += '<span><h2>Nombre del Equipo: '+datos[j].name+'</h2>Conectados: '+img+'</span>  '
					+boton+'<hr style="border-top: 1px solid #0C0C0C">';
		}
	}
	html += '</center>';
	infoGrupos.html(html);

$(".listo").click(function(){
	var oID = $(this).attr("id");
	console.log(oID);
	crearSala(oID);
});
}

function crearSala(id){
	if(id===grupo){
		 alertify.dialog('alert').set({transition:'flipy',message: "<center style='color:red'>Debe seleccionar un equipo diferente al suyo</center>"}).show(); 
	}else{
		enviaInvitacion(id);
	}
}

function enviaInvitacion(id){
	websocket.emit('invitacion',{grupo: id, MiGrupo: grupo});
}


});