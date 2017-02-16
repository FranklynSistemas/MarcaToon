
var preloaderDelay = 1500;

  function hidePreloader() {
      //will first fade out the loading animation
      $(".preloader").fadeOut();
      //then background color will fade out slowly
      $("#faceoff").delay(preloaderDelay).fadeOut("slow");
    }

var SideScroller = SideScroller || {};

//loading the game assets
SideScroller.Preload = function(){};



SideScroller.Preload.prototype = {
  preload: function() {

    $Load = $("#Load");

    //show loading screen
    //this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    //this.preloadBar.anchor.setTo(0.5);
    //this.preloadBar.scale.setTo(3);

    //this.load.setPreloadSprite(this.preloadBar);

    //load game assets
    this.load.image('player', 'assets/images/player.png');
    this.load.image('playerDuck', 'assets/images/player_duck.png');
    this.load.image('playerDead', 'assets/images/player_dead.png');
    this.load.image('goldCoin', 'assets/images/goldCoin.png');
    this.load.image('floor', 'assets/images/floor.png');
    this.load.image('yellowBlock', 'assets/images/yellow-block.png');
    this.load.image('square', 'assets/images/square.png');
    this.load.image('marca', 'assets/images/marca.png');
    this.load.image('fondo', 'assets/images/Titulo.png');
    this.load.image("background", "assets/images/mountains-back.png"); 
    this.load.image('coca', 'assets/images/Coca.png');
    this.load.image('pepsi', 'assets/images/Pepsi.png');
    this.load.spritesheet('button', 'assets/images/button_sprite_sheet.png', 193, 71);

    this.load.audio('coin', 'assets/audio/success.mp3');
    this.load.audio('fin', 'assets/audio/caidaCut.mp3');
    this.load.audio('finPared', 'assets/audio/splash.mp3');
    this.load.audio('lollipop', 'assets/audio/lollipop.mp3');


    //create a progress display text

    var loadingText = this.game.add.text(200, 270, '', { fill: '#000000' });

    var progressDisplay = 0;
 

    var timerEvt = this.game.time.events.loop(Phaser.Timer.SECOND/100, function (){
        if(this.game.load.progress < 100){
            $Load.html("<h3>"+'loading... '+this.game.load.progress+"%</h3>");
        }else{
            hidePreloader();
            this.game.time.events.remove(timerEvt);
        }
    }, this);
  },
  create: function() {
    this.state.start('Game');
  }
};