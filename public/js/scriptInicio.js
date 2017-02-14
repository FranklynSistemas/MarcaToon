$(function() {
	$Uno = $("#uno");
	$Dos = $("#dos");
	$Tres = $("#tres");

	$vistaUno = $("#vistaUno");
	$marcaUno = $("#marcaUno");
	$marcaDos = $("#marcaDos");

	$vistaDos = $("#vistaDos");
	$equipoUno = $("#equipoUno");
	$equipoDos = $("#equipoDos");
	$Continuar = $("#Continuar");
	$imgJuego = $("#imgJuego");


	$vistaTres = $("#vistaTres");


	function init(){
		$vistaDos.fadeOut();
		$equipoUno.fadeOut();
		$equipoDos.fadeOut();
		$vistaTres.fadeOut();
	}; init();

	var equipo = 1;

	$marcaUno.click(function(){
		ocultaVista(1,1);
		equipo = 1;
	});

	$marcaDos.click(function(){
		ocultaVista(1,2);
		equipo = 2;
	});

	$Continuar.click(function(){
		ocultaVista(2,0);
	});

	$Uno.click(function(){
		ocultaVista(3,0);
	});

	$Dos.click(function(){
		ocultaVista(4,0);
	});

	function ocultaVista(type,eq){
		switch(type){
			case 1:
				$vistaUno.fadeOut();
				$Uno.removeClass("unoSin");
				$Uno.addClass("unoCom");
				$vistaDos.fadeIn(500);
				localStorage.setItem("Equipo", eq);
				if(eq === 1){ $equipoUno.fadeIn(); $imgJuego.addClass('imgCoca'); }else{ $equipoDos.fadeIn(); $imgJuego.addClass('imgPepsi'); }; 

			break;
			case 2:
				$vistaDos.fadeOut();
				$Dos.removeClass("dosSin");
				$Dos.addClass("dosCom");
				$vistaTres.fadeIn();
			break;
			case 3:
				init();
				$vistaUno.fadeIn();
				$Uno.removeClass("unoCom");
				$Uno.addClass("unoSin");
				$Dos.removeClass("dosCom");
				$Dos.addClass("dosSin");
			break;
			case 4:
				init();
				$vistaDos.fadeIn();
				$Dos.removeClass("dosCom");
				$Dos.addClass("dosSin");
			break;
		}
	}


	
});
