$(function() {

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
	
	var h = window.innerHeight;

	$body = $('body');

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

	$('#comenzar').click(function(e){
		e.preventDefault();
		$body.animate({scrollTop:h}, '2000');
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
