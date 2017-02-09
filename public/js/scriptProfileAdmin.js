$(function()
{

var userid = $("#id").text(),
    tbEstInd = $("#tbEstInd"),
    tbEstGrup = $("#tbEstGrup"),
    tbPart = $("#tbPart"),
    tbUsers = $("#tbUsers"),
    tbEventos = $("#tbEventos");

  $("#btnCrearEvento").click(function(event){
        console.log("Crear Evento");
        ValidaCampos();
  });


function traeUser(){
	$.ajax(
    {
      url     : '/traeUser',
      type    : 'POST', 
      data    :  JSON.stringify({id: userid}), 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      llenaTablas(data.datos);
    }); 
};traeUser();

function traeUsers(){
  $.ajax(
    {
      url     : '/traeUsers',
      type    : 'GET', 
      data    :  '', 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      if(data.status){
        llenaTablaUsers(data.datos);
      }else{
        tbUsers.html('Sin información');
      }
    }); 
};traeUsers(); 

function traeEventos(){

  $.ajax(
    {
      url     : '/traeEventos',
      type    : 'GET', 
      data    :  '', 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      if(data.status){
        llenaTablaEventos(data.datos);
      }else{
        tbEventos.html('Sin Información');
      }
      
    }); 
};traeEventos(); 

function llenaTablas(data){
  var EstIndi = '<h3>Estadísticas Individuales</h3><table class="table table-striped"><thead style="background-color: gray;color: white;"><tr><th>id</th><th>Fecha</th><th>Resultado</th></tr></thead><tbody>',
      EstGrup = '<h3>Estadísticas Grupales</h3><table class="table table-striped"><thead style="background-color: gray;color: white;"><tr><th>id</th><th>Fecha</th><th>Participantes</th><th>Resultado</th></tr></thead><tbody>';
  for(i in data.tbEstadisticaI){
    EstIndi += '<tr><td>'+data.tbEstadisticaI[i].id+'</td><td>'+data.tbEstadisticaI[i].fecha+'</td><td>'+data.tbEstadisticaI[i].resultado+'</td><tr>';
  }
  EstIndi += '</tbody></table>';  
  tbEstInd.html(EstIndi);

  for(i in data.tbEstadisticaG){
    EstGrup += '<tr><td>'+data.tbEstadisticaG[i].id+'</td><td>'+data.tbEstadisticaG[i].fecha+'</td><td><button type="button" class=" btn ver btn-info" id="'+i+'" data-toggle="modal" data-target="#Part">Ver</button></td><td>'+data.tbEstadisticaG[i].resultado+'</td><tr>';
  }
  EstGrup += '</tbody></table>';  
  tbEstGrup.html(EstGrup);

  $(".ver").click(function(event){
    var oID = $(this).attr("id");
    showParticipantes(data.tbEstadisticaG[oID].participantes);
  });
}

function llenaTablaUsers(data){
  var usuarios = '<table class="table table-striped"><thead style="background-color: gray;color: white;"><tr><th>id</th><th>Nombre</th><th>Rol</th><th>Editar</th></tr></thead><tbody>';
  for(i in data){
    usuarios += '<tr><td>'+eval(parseInt(i)+1)+'</td><td>'+data[i].name+'</td><td>'+data[i].rol+'</td><td><button type="button" class=" btn verUser btn-info" id="'+i+'" data-toggle="modal" data-target="#User">Ver</button></td><tr>';
  }
  usuarios += '</tbody></table>';  
  tbUsers.html(usuarios);

  $(".verUser").click(function(event){
    var oID = $(this).attr("id");
    showUser(data[oID]);
  });
}

function llenaTablaEventos(data){
  var eventos = '<table class="table table-striped"><thead style="background-color: gray;color: white;"><tr><th>id</th><th>Nombre</th><th>Descripción</th><th>#Participantes</th><th>Ver Más</th></tr></thead><tbody>';
  for(i in data){
    eventos += '<tr><td>'+eval(parseInt(i)+1)+'</td><td>'+data[i].nombre+'</td><td>'+data[i].descripcion+'</td><td>'+data[i].numParticipantes+'</td><td><button type="button" class=" btn verEvento btn-info" id="'+i+'" data-toggle="modal" data-target="#Evento">Ver</button></td><tr>';
  }
  eventos += '</tbody></table>';  
  tbEventos.html(eventos);

  $(".verEvento").click(function(event){
    var oID = $(this).attr("id");
    showEvento(data[oID]);
  });
};

function showParticipantes(data){
  var Partic = '<table class="table table-striped"><thead style="background-color: gray;color: white;"><tr><th>Nombre</th><th>Puntos</th></tr></thead><tbody>';
  for(i in data){
    Partic += '<tr><td>'+data[i].Nombre+'</td><td>'+data[i].Puntaje+'</td><tr>';
  }
  Partic += '</tbody></table>';  
  tbPart.html(Partic);
};
var datosUsuario = '';
function showUser(data){
  datosUsuario = '';
  var dataUser =  '<label>Nombre: '+data.name+'</label><br><label>Rol: <select id="rolUser"> <option value="user">Usuario</option><option value="admin">Administrador</option></select></label>';
  $("#tbUser").html(dataUser);

  datosUsuario = data._id;
};

$("#btnGuardaUser").click(function(event){
    editarUsuario({iduser:datosUsuario, newRol: $("#rolUser").val()});
  });

function editarUsuario(datosUser){
  $.ajax(
    {
      url     : '/editarUser',
      type    : 'POST', 
      data    :  JSON.stringify(datosUser), 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      if(data.status){
        swal("Bien!", "Se ha actualizado el usuario exitosamente", "success");
        traeUsers();
      }else{
        swal("Error", data.info, "error");
      }
    }); 
};
var oIDEvento = '';
function showEvento(data){
  var evento = '<img id="image" src="/img/'+data.img+'" height="100" width="100%">'+
                '<div style="margin-left: 55%;"><form enctype="multipart/form-data" id="formcambiarImg" method="post">'+
                '<label class="btn btn-info btn-file">'+
                'Buscar Imagen <input type="file" style="display: none;" name="photo"></label>'+
                '<input type="submit" class="btn btn-primary" value="Cambiar Imagen"></form><div id="mensajesu"></div></div>'+
                '<label>Nombre Imagen: <input type="text" id="nombreImg" value="'+data.img+'" disabled></label><br>'+
                '<label>Nombre Evento: <input type="text" id="nombre" value="'+data.nombre+'"></label><br>'+
                '<label>Fecha Inicial:<input type="text" id="fechai" value="'+data.fechaIni+'"></label><br>'+
                '<label>Fecha Final:<input type="text" id="fechaf" value="'+data.fechaFin+'"></label><br>'+
                '<label># Participantes:<input type="number" id="numPart" value="'+data.numParticipantes+'"></label><br>'+
                '<label>Descripción: <textarea id="descrip" rows="4" cols="50">'+data.descripcion+'</textarea></label><br>'+
                '<label>Términos:    <textarea id="terminos"  rows="4" cols="50">'+data.terminos+'</textarea></label><br>'+
                '<p id="idEvent" style="display:none;">'+data._id+'</p>';
  
  $("#tbEvento").html(evento);
  oIDEvento = data._id;

  $("#formcambiarImg").on("submit", function(e){
            $("#mensajesu").html("");
            $("#nombreImg").val("");
            e.preventDefault();
            var f = $(this);
            var formData = new FormData(document.getElementById("formcambiarImg"));
            formData.append("id", $("#idEvent").text());
            //formData.append("dato", "valor");
            //formData.append(f.attr("name"), $(this)[0].files[0]);
            $.ajax({
                url: "/upload",
                type: "post",
                dataType: "html",
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }).done(function(datos){
              var result = JSON.parse(datos);
              console.log(result);
              if(result.status){
                $("#image").attr("src","/img/"+result.nombre);
                $("#nombreImg").val(result.nombre);
                $("#mensajesu").html("<p style='color:green; font-size:12px;'>"+result.info+"</p>");
                traeEventos();
              }else{
                $("#mensajesu").html("<p style='color:red; font-size:12px;'>"+result.info+"</p>");
              }
                
            });
        });
};

 $("#btnGuardaEvento").click(function(event){
    editarEvento( { id: oIDEvento, 
                      nombre: $("#nombre").val(),
                      fechaIni: $("#fechai").val(),
                      fechaFin: $("#fechaf").val(),
                      numParticipantes: $("#numPart").val(),
                      descripcion: $("#descrip").val(),
                      terminos: $("#terminos").val()
                    });
  });

function editarEvento(datos){
  $.ajax(
    {
      url     : '/editarEvento',
      type    : 'POST', 
      data    :  JSON.stringify(datos), 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      if(data.status){
        swal("Bien!", "Se ha actualizado el evento exitosamente", "success");
        traeEventos();
      }else{
        swal("Error", data.info, "error");
      }
    }); 
}


function crearEvento(){
          var info = { 
                      nombre: $("#cnombre").val(),
                      fechaIni: $("#cfechai").val(),
                      fechaFin: $("#cfechaf").val(),
                      numParticipantes: $("#cnumPart").val(),
                      descripcion: $("#cdescrip").val(),
                      terminos: $("#cterminos").val(),
                      img: $("#cimagen").val()
                     };
    $.ajax(
    {
      url     : '/crearEvento',
      type    : 'POST', 
      data    :  JSON.stringify(info), 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      if(data.status){
        swal("Bien!", "Se ha creado el evento '"+info.nombre+"' exitosamente", "success");
        traeEventos();
        limpiarCampos();
      }else{
        swal("Error", data.info, "error");
      }
    }); 

};

var campos = ["#cimagen","#cnombre","#cfechai","#cfechaf","#cnumPart","#cdescrip","#cterminos"];
function ValidaCampos(){
  var validos = false;
  for (var i = 0; i < campos.length; i++) {
    if($(campos[i]).val()===''){
      if(i===0){
        $("#msg").html("<center><p class='animated infinite flash' style='font-size:15px; color:red;'>Debe cargar una imagen</p><center>");
        return;
      }else{
        $("#msg").html("<center><p class='animated infinite flash' style='font-size:15px; color:red;'>Faltan algunos campos por llenar</p><center>");
        $(campos[i]).focus();
        return;
      }
    }else{
      $("#msg").html("");
      validos = true;
    }
  }
  if(validos){crearEvento()};
}

function limpiarCampos(){
  $("#mensaje").html("");
  $("#img").attr("src","");
  for (var i = 0; i < campos.length; i++) {
    $(campos[i]).val("");
  }
};

$("#formuploadajax").on("submit", function(e){
            $("#mensaje").html("");
            $("#cimagen").val("");
            e.preventDefault();
            var f = $(this);
            var formData = new FormData(document.getElementById("formuploadajax"));
            formData.append("dato", "valor");
            //formData.append(f.attr("name"), $(this)[0].files[0]);
            $.ajax({
                url: "/upload",
                type: "post",
                dataType: "html",
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }).done(function(datos){
              var result = JSON.parse(datos);
              if(result.status){
                $("#cimagen").val(result.nombre);
                $("#mensaje").html("<p style='color:green; font-size:12px;'>"+result.info+"</p>");
                $("#img").attr("src","/img/"+result.nombre);
              }else{
                $("#mensaje").html("<p style='color:red; font-size:12px;'>"+result.info+"</p>");
              }
                
            });
        });


});




