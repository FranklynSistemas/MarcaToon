$(function()
{

var contenido = $('#info');

function traeTabla(){
	$.ajax(
    {
      url     : '/traeEstadisticas',
      type    : 'GET', 
      data    :  '', 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
      llenaTabla(data);
    }); 
};traeTabla();
 
function llenaTabla(data){
  var html = '<table class="table table-striped"><thead style="background-color: gray;color: white;"><tr><th>id</th><th>Fecha</th><th>Usuario</th><th>Nombre de Equipo</th><th>Evento</th><th>Puntaje</th><th>Resultado</th></tr></thead><tbody>';
  for(i in data){
    html += '<tr><td>'+eval(parseInt(i)+1)+'</td><td>'+data[i].createdAt+'</td><td>'+data[i].creador.name+'</td><td>'+data[i].name+'</td><td>'+data[i].evento.nombre+'</td><td>'+data[i].puntaje+'</td><td>Ganado</td><tr>';
  }
  html += '</tbody></table>';  
  contenido.html(html);
}


});