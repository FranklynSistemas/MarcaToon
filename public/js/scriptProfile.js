$(function()
{

var userid = $("#id").text(),
    tbEstInd = $("#tbEstInd"),
    tbEstGrup = $("#tbEstGrup"),
    tbPart = $("#tbPart");

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
 

function llenaTablas(data){
  console.log(data.tbEstadisticaI);
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


function showParticipantes(data){
  var Partic = '<table class="table table-striped"><thead style="background-color: gray;color: white;"><tr><th>Nombre</th><th>Puntos</th></tr></thead><tbody>';
  for(i in data){
    Partic += '<tr><td>'+data[i].Nombre+'</td><td>'+data[i].Puntaje+'</td><tr>';
  }
  Partic += '</tbody></table>';  
  tbPart.html(Partic);
}



});