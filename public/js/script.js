$(function()
{
	var wow = new WOW(
	  {
	    boxClass:     'wow',      // animated element css class (default is wow)
	    animateClass: 'animated', // animation css class (default is animated)
	    offset:       0,          // distance to the element when triggering the animation (default is 0)
	    mobile:       true,       // trigger animations on mobile devices (default is true)
	    live:         true,       // act on asynchronously loaded content (default is true)
	    callback:     function(box) {
	      // the callback is fired every time an animation is started
	      // the argument that is passed in is the DOM node being animated
	    },
	    scrollContainer: null // optional scroll container selector, otherwise use window
	  }
	);
	wow.init();
	
	var campos = ['empresa','persona','telefono','correo'];
	var camposCto = ['nombreCto','correoCto','mensaje'];

	/*(function init(){
		if (isMobile.any()) {
			$(".fillWidth").css('display','none');
		}
	})();*/

	$('#'+campos[3]).keydown(function(){
		if(validarEmail( $(this).val() )){
			$(this).css('border-color','#444f5a');
		}else{
			$(this).css('border-color','red');
		}
	});

	$('#'+camposCto[1]).keydown(function(){
		if(validarEmail( $(this).val() )){
			$(this).css('border-color','#444f5a');
		}else{
			$(this).css('border-color','red');
		}
	});

	$('#btnEnviar').click(function(){
		var result = validaCampos(campos,1);
		if(typeof result == 'object'){
			enviarDatos(result,1);
		}else{
			$('#'+campos[result]).css('border-color','red');
		}
	});

	$('.inputPaute').keydown(function(){
		for (var i = 0; i < campos.length; i++) {
			if(i!=3){
				$('#'+campos[i]).css('border-color','#444f5a');
			}
		}
		for (var i = 0; i < camposCto.length; i++) {
			if(i!=1){
				$('#'+camposCto[i]).css('border-color','#444f5a');
			}
		}
	});

	$('#mensaje').keydown(function(){
		$('#'+camposCto[2]).css('border-color','#444f5a');
	});

	$('#btnEnviarCto').click(function(){
		var result = validaCampos(camposCto,2);
		if(typeof result == 'object'){
			enviarDatos(result,2);
		}else{
			$('#'+camposCto[result]).css('border-color','red');
		}
	});
	
	function validaCampos(cps,type){
		var datos =[];
		for (var i = 0; i < cps.length; i++) {
			var campo = $('#'+cps[i]).val();
			if(campo === ""){
				return i;
			}else{
				datos.push(campo);
			} 
		}
		return type === 1 ? {Empresa:datos[0], Persona:datos[1], Telfono: datos[2], Correo: datos[3] } : {Nombre:datos[0], Correo:datos[1], Mensaje: datos[2] } ;	
	}

	function validarEmail( email ) {
	    expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	    if ( !expr.test(email) ){
	        return false;
	    }else{
	    	return true;
	    }
	}

	function enviarDatos(datos,type){
		$.ajax(
		    {
		      url     : "/registrar",
		      type    : "POST", 
		      data    : JSON.stringify({type:type, info: datos}), 
		      dataType  : "json",
		      contentType: "application/json; charset=utf-8"
		    }).done(function(data)
		    { 
		    	if(data.status){
		    		swal(
						  'Se envió la información correctamente',
						  'Pronto nos pondremos en contacto contigo',
						  'success'
						)
		    		limpiaCampos();
		    	}
		    });
	}

	function limpiaCampos(){
		for (var i = 0; i < campos.length; i++) {
			$('#'+campos[i]).val("");
		}
		for (var i = 0; i < camposCto.length; i++) {
			$('#'+camposCto[i]).val("");	
		}
	}

$(window).load(function() {
	var preloaderDelay = 1500;

	  function hidePreloader() {
	      //will first fade out the loading animation
	      $(".preloader").fadeOut();
	      //then background color will fade out slowly
	      $("#faceoff").delay(preloaderDelay).fadeOut("slow");
	    }

	hidePreloader();
});

$( document ).ready(function() {
	

    scaleVideoContainer();

    initBannerVideoSize('.video-container .poster img');
    initBannerVideoSize('.video-container .filter');
    initBannerVideoSize('.video-container video');

    $(window).on('resize', function() {
        scaleVideoContainer();
        scaleBannerVideoSize('.video-container .poster img');
        scaleBannerVideoSize('.video-container .filter');
        scaleBannerVideoSize('.video-container video');
    });

});

function scaleVideoContainer() {

    var height = $(window).height() + 5;
    var unitHeight = parseInt(height) + 'px';
    $('.homepage-hero-module').css('height',unitHeight);

}

function initBannerVideoSize(element){

    $(element).each(function(){
        $(this).data('height', $(this).height());
        $(this).data('width', $(this).width());
    });

    scaleBannerVideoSize(element);

}

function scaleBannerVideoSize(element){

    var windowWidth = $(window).width(),
    windowHeight = $(window).height() + 5,
    videoWidth,
    videoHeight;

    $(element).each(function(){
        var videoAspectRatio = $(this).data('height')/$(this).data('width');

        $(this).width(windowWidth);

        if(windowWidth < 1000){
            videoHeight = windowHeight;
            videoWidth = videoHeight / videoAspectRatio;
            $(this).css({'margin-top' : 0, 'margin-left' : -(videoWidth - windowWidth) / 2 + 'px'});

            $(this).width(videoWidth).height(videoHeight);
        }

        $('.homepage-hero-module .video-container video').addClass('fadeIn animated');

    });
}
	
});
