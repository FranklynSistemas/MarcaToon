$(function()
{

var tbEventos = $("#tbEventos"),
    idUser  = $("#idUser").text(),
    idEvent = $("#idEvent").text(),
    nomGrup = $("#nomGrup"),
    userName = $("#userName").text(),
    token = $("#token").text(),
    numPart = $("#numPart").text();

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
      llenaTablas(data.datos);
    }); 
};traeEventos();
 
function llenaTablas(data){
  var html = '<table class="table"><tbody>';
  for(i in data){
    html += '<tr><td><a href="/traeEvento?id='+data[i]._id+'"><img src="img/'+data[i].img+'" height="100" width="100%"></a></td><tr>';
  }
  html += '</tbody></table>';  
  tbEventos.html(html);
}

function GuardaDatos(){
  var datos = {
          name: nomGrup.val(),
          id: token,
          eventId: idEvent,
          nameUser: userName,
          userId: idUser,
          numPart: numPart
  };
  $.ajax(
    {
      url     : '/creaEquipo',
      type    : 'POST', 
      data    :  JSON.stringify(datos), 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      if(data.status){
        window.location.href = "/grupos?type=0&grup="+token;
      }
    }); 
};

$("#SEspera").click(function(){
 if (nomGrup.val().length != 0) {
  GuardaDatos();
 }else{
  console.log("Debe escribir un nombre");
  alertify.alert("<center><b>Debe escribir un nombre</b></center>");
 };
});

});