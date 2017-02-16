 

var restart = 0,
    finSound,
    Juego,
    user = {},
    equipo = {},
    pausa = true,
    comenzar = false,
    sound = true,
    jump=false,
    down=false,
    left=false,
    right=false,
    contSound = 0;

$( document ).ready(function() {
  var $flechas = $("#flechas");
  var $botones = $("#Botones");
  var $Ocultar = $("#Ocultar");

  (function btn(){
    if(isMobile.any()){
      $botones.fadeIn();
      $flechas.fadeIn();
      $Ocultar.fadeIn();
    }
    
    if(isMobile.any() && window.innerHeight > window.innerWidth){
        NoPortrait();
    }
  })();

  function NoPortrait(){
    $("#NoPortrait").fadeIn();
  }
  
  
  $( window ).on( "orientationchange", function( event ) {
    if(window.orientation === -90 || window.orientation === 90){
      $("#NoPortrait").fadeOut();
    }else{
      NoPortrait();
    }
  });

  
  var $nameUser = $("#nameUser").text();
  var $idFace = $("#idFace").html();
  var $miPos = $("#miPos");
  var $start = $("#start");
  var $pausa = $("#pausa");
  var $sound = $("#sound");
  var $jump = $("#jump");
  var $down = $("#down");
  var $left = $("#left");
  var $right = $("#right");
  var $Equipos = $("#Equipos");
  var $numUsers = $("#numUsers");
  var $dias = $("#dias");
  var $info = $("#info");
  var $contentRank = $("#contentRank");
  var $juego = $("#juego");


  var idEquipo = parseInt(localStorage.getItem("Equipo"));

  equipo ={
    id: idEquipo,
    name: idEquipo === 1 ? "Cocacola" : "Pepsi"
  } //Pendiente Por definir
  user = {
    foto: "http://graph.facebook.com/" + $idFace + "/picture?type=small",
    nomUser: $nameUser,
    puntaje: 0
  }


  //  Socket y Dom 
  var $divRank = $("#divRank");

  var websocket = io.connect();
  websocket.emit('traeUsers',{user:user,equipo:equipo});

  websocket.on('Equipo',function(data){
    var idUser = buscaUser(user.nomUser,data.datos.participantes);
    if(idUser!=-1){user.puntaje < data.datos.participantes[idUser].Puntaje ? user.puntaje = data.datos.participantes[idUser].Puntaje : data.datos.participantes[idUser].Puntaje = user.puntaje;}
    llenaRank(data.datos);
  });



  function llenaRank(datos){
    var html = "";
    var participantesOrdenados = ordenarArray(datos.participantes);
    miRank(participantesOrdenados);
    var cont = 0;
    for (var i = 0; i < participantesOrdenados.length; i++) {
      cont++;
      html += "<p>"+cont+". <img class='imgPerfil' src='"+participantesOrdenados[i].Foto+"'>"+participantesOrdenados[i].Nombre+" - <b>"+participantesOrdenados[i].Puntaje+" Pts</b></p>";
    }
    $divRank.html(html);
  }

  websocket.emit('traeEquipos');
  websocket.on('Equipos',function(result){
    llenaPosEquipo(result);
  });

  websocket.on('numUsers',function(cont){
    $numUsers.html("En Línea: "+cont)

  });

  function llenaPosEquipo(result){
    var html = "<h1>Rank General</h1>";
    
    if(result.status){
      if(result.datos[0].puntaje < result.datos[1].puntaje){
        html += "<h3>"+result.datos[1].name+" - "+result.datos[1].puntaje+" pts</h3>";
        html += "<h3>"+result.datos[0].name+" - "+result.datos[0].puntaje+" pts</h3>";
      }else{
        html += "<h3>"+result.datos[0].name+" - "+result.datos[0].puntaje+" pts</h3>";
        html += "<h3>"+result.datos[1].name+" - "+result.datos[1].puntaje+" pts</h3>";
      } 
      $Equipos.html(html);
    }
  }

  function buscaUser(nombre,array){
    for(i in array){
        if(array[i].Nombre === nombre){
           return i;
           break;
        };
      }
    return -1;
  }

  function ordenarArray(array){
    var ArrayOrdenado = array;
    var cont = 0;
    ArrayOrdenado.sort(function (a, b) {
      if (a.Puntaje > b.Puntaje) {
        return -1;
      }
      if (a.Puntaje < b.Puntaje) {
        return 1;
      }
      return 0;
    });
    return ArrayOrdenado;
  }

  function miRank(array){
    var pos = buscaUser(user.nomUser,array);
    $miPos.html("Eres el: #"+eval(parseInt(pos)+1));
  }

  $start.click(function(){
      comenzar = true;
      $(this).fadeOut(500);
      pausa = !pausa;
      Juego.paused = pausa;
  });

  $pausa.click(function(){
      pausar();
  });

  $("body").keypress(function(e){
    e.preventDefault();
    if(e.keyCode=== 32){
      pausar();
    }else if(e.keyCode===109){
      chageSound();
    }
  });

  function pausar(){
    if(comenzar){
          pausa = !pausa;
        if(pausa){
          $pausa.removeClass("paused");
          $pausa.addClass("play");
        }else{
          $pausa.removeClass("play");
          $pausa.addClass("paused");
        }
        Juego.paused = pausa;
      }
  }

  function chageSound(){
    if(sound){
      $sound.removeClass("nosound");
      $sound.addClass("sound");
    }else{
      $sound.removeClass("sound");
      $sound.addClass("nosound");
      contSound = 0;
    } 
    sound = !sound;
  }

  $sound.click(function(){
    chageSound();
  });

 
  $jump.on('touchstart mousedown',function(){
    jump=true; 
  });

  $jump.on('touchend mouseup',function(){
    jump=false; 
  });

  $down.on('touchstart mousedown',function(){
    down=true; 
  });

  $down.on('touchend mouseup',function(){
    down=false; 
  });

  $left.on('touchstart mousedown',function(){
    left=true; 
  });

  $left.on('touchend mouseup',function(){
    left=false; 
  });

  $right.on('touchstart mousedown',function(){
    right=true; 
  });

  $right.on('touchend mouseup',function(){
    right=false; 
  });

  $info.click(function(){
    alertInfo();
  });
  

  function alertInfo(){
     swal({
      title: 'Información',
      html:
        '<h3>Finalidad</h3>'+
        '<p align="center">Intenta ser el primero en el ranking al final de la cuenta regresiva y ganarás uno de los premios que tenemos para ti.</p>'+
        '<h3>Controles</h3>'+
        '<p align="center">En PC puedes utilizar las teclas de movimiento "Arriba", "Abajo", "Izquierda", "Derecha" también puedes pausar el juego oprimiendo la "Barra de espacio" y quitar el sonido oprimiendo la tecla "M".</p>'+
        '<p align="center">En Celular puedes utilizar los botones: "A" para saltar, "B" para agacharse, "Flecha Izquierda" moverse hacia atrás y "Flecha Derecha"  moverse hacia adelante.</p>'+
        '<h3>Sobre nosotros</h3>'+
        '<a id="tree" href="http://tree-it.co/" target="_blank">Tree-IT</a>'
    });
  }; alertInfo();

  $Ocultar.on('touchend mouseup',function(){
    $contentRank.fadeOut('slow');
    $juego.removeClass('conRank').addClass('sinRank');
    $('#Mostrar').fadeIn('slow');
  });

  $('#Mostrar').on('touchend mouseup',function(){
    $contentRank.fadeIn('slow');
    $juego.removeClass('sinRank').addClass('conRank');
    $(this).fadeOut('slow');
  });

  function diasFaltantes(){
    var Hoy=new Date();
    var Nav=new Date(Hoy.getFullYear(), 01,28 );
    var mseg_dia=1000*60*60*24;
    var dias;
    if (Hoy.getMonth()==11 && Hoy.getDate()>25){ 
      Nav.setFullYear(Nav.getFullYear()+1); 
      dias = Math.ceil((Nav.getTime()-Hoy.getTime())/(mseg_dia));
      $dias.html("Faltan: "+dias);
    }else{
      dias = Math.ceil((Nav.getTime()-Hoy.getTime())/(mseg_dia));
      $dias.html("Faltan: "+dias+" días");
    }
    
  };diasFaltantes();

});


var SideScroller = SideScroller || {};
SideScroller.Game = function(){};  
var websocket = io.connect();

SideScroller.Game.prototype = {
  preload: function() {
      this.game.time.advancedTiming = true;
      this.game.stage.backgroundColor = '#079bc3';
      this.game.paused = pausa;  
    },
  create: function() {
    var newItem;
    fondoMontanas = this.game.add.tileSprite(0, -400, this.game.world.width, this.game.world.height*2, 'background'); 
    fondo = this.game.add.tileSprite( this.game.world.width/2 -145, 40, 300, 70, 'fondo');

    

    //game params
    this.tileSize = 70;
    this.probCliff = 0.4;
    this.probVertical = 0.4;
    this.probMoreVertical = 0.5;
    this.probOtherCoins = 0.2;
    this.puntaje = 0;
    this.levelSpeed = -200;
    this.level = 1;

    //initiate groups, we'll recycle elements
    this.floors = this.game.add.group();
    this.floors.enableBody = true;

    for(var i=0; i<12; i++) {
      newItem = this.floors.create(i * this.tileSize, this.game.world.height - this.tileSize, 'floor');
      newItem.body.immovable = true;
      newItem.body.velocity.x = this.levelSpeed;
    }

    //keep track of the last floor
    this.lastFloor = newItem;

    //keep track of the last element
    this.lastCliff = false;
    this.lastVertical = false;

    this.verticalObstacles = this.game.add.group();
    this.verticalObstacles.enableBody = true;
    //this.verticalObstacles.createMultiple(12, 'yellowBlock');
    this.verticalObstacles.createMultiple(12, 'square');
    this.verticalObstacles.setAll('checkWorldBounds', true);
    this.verticalObstacles.setAll('outOfBoundsKill', true);
/*
    for(var i=0; i<12; i++) {
      newItem = this.verticalObstacles.create(i * this.tileSize, this.game.world.height - this.tileSize+60, 'square');
      newItem.body.immovable = true;
      newItem.body.velocity.x = this.this.levelSpeed;
    }
*/
    var monedas = {
        coins: equipo.id === 1 ? 'coca' : 'pepsi',
        Othercoins: equipo.id === 1 ? 'pepsi' : 'coca'
    }

    

    this.coins = this.game.add.group();
    this.coins.enableBody = true;
    //this.coins.createMultiple(6, 'goldCoin');
    //this.coins.createMultiple(12, 'coca');
    this.coins.createMultiple(12, monedas.coins);
    this.coins.setAll('checkWorldBounds', true);
    this.coins.setAll('outOfBoundsKill', true);

    this.Othercoins = this.game.add.group();
    this.Othercoins.enableBody = true;
    //this.coins.createMultiple(6, 'goldCoin');
    //this.Othercoins.createMultiple(12, 'pepsi');
    this.Othercoins.createMultiple(12, monedas.Othercoins);
    this.Othercoins.setAll('checkWorldBounds', true);
    this.Othercoins.setAll('outOfBoundsKill', true);

    //create player
    this.player = this.game.add.sprite(250, 320, 'player');
    // /this.player.scale.setTo(0.8);

    //enable physics on the player
    this.game.physics.arcade.enable(this.player);

    //player gravity
    this.player.body.gravity.y = 1500;

    //properties when the player is ducked and standing, so we can use in update()
    var playerDuckImg = this.game.cache.getImage('playerDuck');
    this.player.duckedDimensions = {width: playerDuckImg.width, height: playerDuckImg.height};
    this.player.standDimensions = {width: this.player.width, height: this.player.height};
    this.player.anchor.setTo(0.5, 1);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

    Juego = this.game;

    // create our virtual game controller buttons 
    /*buttonjump = this.game.add.button(10, this.game.world.height-140, 'buttonjump', null, this, 0, 1, 0, 1);  //game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame
    buttonjump.fixedToCamera = true;  //our buttons should stay on the same place  
    buttonjump.events.onInputDown.add(function(){jump=true;},this);
    buttonjump.events.onInputUp.add(function(){jump=false;});

    // create our virtual game controller buttons 
    buttondown = this.game.add.button(80, this.game.world.height-140, 'buttondown', null, this, 0, 1, 0, 1);  //game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame
    buttondown.fixedToCamera = true;  //our buttons should stay on the same place  
    buttondown.events.onInputDown.add(function(){down=true;});
    buttondown.events.onInputUp.add(function(){down=false;});*/

    
    //init game controller
    this.initGameController();

    //sounds
    this.coinSound = this.game.add.audio('coin');
    finSound = this.game.add.audio('fin');
    finSoundPared = this.game.add.audio('finPared');

    soundFondo = this.add.audio('lollipop',1,true);  

    
    //console.log(soundFondo);
    
    //this.game.sound.setDecodedCallback([ soundFondo ], this.startAudio, this);
    //soundFondo.play();
    //soundFondo.loopFull(0.6);
  }, 
  update: function() {

    if(!pausa){
       this.game.paused = pausa;
    }

    //collision
    this.game.physics.arcade.collide(this.player, this.floors, this.playerHit, null, this);
    this.game.physics.arcade.collide(this.player, this.verticalObstacles, this.playerHito, null, this);
    this.game.physics.arcade.overlap(this.player, this.coins, this.collect, null, this);
    this.game.physics.arcade.overlap(this.player, this.Othercoins, this.OtherCollect, null, this);
    //this.game.physics.arcade.overlap(this.player, this.coins, this.collect, null, this);

    //only respond to keys and keep the speed if the player is alive
    if(this.player.alive) {

      if(this.player.body.touching.down) {
        this.player.body.velocity.x = -this.levelSpeed;
      }
      else {
        this.player.body.velocity.x = 0;
      }


      if(this.cursors.up.isDown || jump) {
        this.playerJump();
      }
      else if(this.cursors.down.isDown || down) {
        this.playerDuck();
      }
      
      if(!this.cursors.down.isDown && this.player.isDucked && !this.pressingDown && !down) {
        //change image and update the body size for the physics engine
        this.player.loadTexture('player');
        this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
        this.player.isDucked = false;
      }

      if(this.cursors.right.isDown || right){
        this.playerRight();
      }else if(this.cursors.left.isDown || left){
        this.playerLeft()
      }

      //restart the game if reaching the edge
      if(this.player.x <= -this.tileSize+20) {
       this.playerDead(2);
      }
      if(this.player.y >= this.game.world.height + this.tileSize) {
        this.playerDead(1);
      }
    }

    if(user.puntaje < this.puntaje){
      user.puntaje=this.puntaje
      websocket.emit('updatePuntaje',{user:user,equipo:equipo});
      websocket.emit('traeEquipos');
    };

    /*
    if (restart) {
      restart = false;
      this.game.state.start('Game');
      Juego.state.start('Game');
    }
    */
    //generate further terrain
    fondoMontanas.tilePosition.x += this.levelSpeed/800;
    this.initSound();
    this.generateTerrain();

  },
  initSound: function(){
    contSound += 1;
    if(!sound){
      soundFondo.stop();
    }else if(sound && contSound===1){
      soundFondo.play('', 0, 1, true);
      soundFondo.onLoop.add(this.playLevelMusic, this);
    }
  },
  generateTerrain: function(){
    var i, delta = 0, block;
    for(i = 0; i < this.floors.length; i++) {
      if(this.floors.getAt(i).body.x <= -this.tileSize) {

        if(Math.random() < this.probCliff && !this.lastCliff && !this.lastVertical) {
          delta = 1;
          this.lastCliff = true;
          this.lastVertical = false;
        }
        else if(Math.random() < this.probVertical && !this.lastCliff) {
          this.lastCliff = false;
          this.lastVertical = true;
          block = this.verticalObstacles.getFirstExists(false);
          if(block!= null){
            block.reset(this.lastFloor.body.x + this.tileSize, this.game.world.height - 3 * this.tileSize);
            block.body.velocity.x = this.levelSpeed;
            block.body.immovable = true;
          }
          coin = this.coins.getFirstExists(false);
          if(coin != null){
            coin.reset(this.lastFloor.body.x + this.tileSize, this.game.world.height - 4 * this.tileSize);
            coin.body.velocity.x = this.levelSpeed;
            coin.body.immovable = true;
          }


          if(Math.random() < this.probMoreVertical) {
            block = this.verticalObstacles.getFirstExists(false);
            coin = this.verticalObstacles.getFirstExists(false);
            if(block) {
              block.reset(this.lastFloor.body.x + this.tileSize, this.game.world.height - 4 * this.tileSize);
              block.body.velocity.x = this.levelSpeed;
              block.body.immovable = true;
            }
            if(coin) {
              coin.reset(this.lastFloor.body.x + this.tileSize, this.game.world.height - 5 * this.tileSize);
              coin.body.velocity.x = this.levelSpeed;
              coin.body.immovable = true;
            }
            
          }

         if(Math.random() < this.probOtherCoins){
            Othercoin = this.Othercoins.getFirstExists(false);
            if(Othercoin) {
              Othercoin.reset(this.lastFloor.body.x + this.tileSize, this.game.world.height - 1.5 * this.tileSize);
              Othercoin.anchor.setTo(0.5, 0.5);
              Othercoin.body.velocity.x = this.levelSpeed-50;
              Othercoin.body.enable = true;
              //Othercoin.angle = -90;
              //Othercoin.body.angularVelocity = this.game.rnd.integerInRange(100, 125);
              Othercoin.body.angularVelocity = -100;
            }
          }

        }
        else {
          this.lastCliff = false;
          this.lastVertical = false;
        }
        this.floors.getAt(i).body.velocity.x = this.levelSpeed;
        this.floors.getAt(i).body.x = this.lastFloor.body.x + this.tileSize + delta * this.tileSize * 1.5;
        this.lastFloor = this.floors.getAt(i);
        break;
      }
    }
  },
  playerHit: function(player, blockedLayer) {
    //if hits on the right side, die
    if(player.body.touching.right) {

      //set to dead (this doesn't affect rendering)
      this.player.alive = false;

      //stop moving to the right
      this.player.body.velocity.x = 0;

      //change sprite image
      this.player.loadTexture('playerDead');

      this.playerDead(1)
    }
  },
  playerDead: function(type){
     var style = { font: "20px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: 600};
      text = this.game.add.text(this.game.world.width/2 , this.game.world.height/2, "F i n  d e l  j u e g o !", style);
      text.anchor.set(0.5);
      restart += 1;
      if(restart === 1 && sound && type === 1){
        finSound.play();
      }else if(restart === 1 && sound && type === 2){
        finSoundPared.play();
      }
      soundFondo.stop();
      //go to gameover after a few miliseconds
      this.game.time.events.add(1500, this.gameOver, this);
  },
  collect: function(player, collectable) {
    //Suma Puntaje
    this.puntaje += 2;
    if (this.puntaje%30 === 0) {
      this.levelSpeed -= 20;
      this.level += 1;
    }
    //play audio
    if(sound){
      this.coinSound.play();
    }
    
    //remove sprite
    collectable.kill();
  },
  OtherCollect:function(player, collectable){
    //Resta Puntaje
    this.puntaje -= 2;

    //play audio
    if(sound){
      this.coinSound.play();
    }

    //remove sprite
    collectable.kill();
  },
  playLevelMusic: function(){
     soundFondo.play('', 0, 1, true);
  },
  initGameController: function() {

    if(!GameController.hasInitiated) {
      var that = this;

      GameController.init({
          right: {
              type: 'none',
          },
          left: {
              type: 'buttons',
              buttons: [
                false,
                {
                  label: 'J',
                  touchStart: function() {
                    if(!that.player.alive) {
                      return;
                    }
                    that.playerJump();
                  }
                },
                false,
                {
                  label: 'D',
                  touchStart: function() {
                    if(!that.player.alive) {
                      return;
                    }
                    that.pressingDown = true; that.playerDuck();
                  },
                  touchEnd: function(){
                    that.pressingDown = false;
                  }
                }
              ]
          },
      });
      GameController.hasInitiated = true;
    }

  },
  //create coins
  createCoins: function() {
    this.coins = this.game.add.group();
    this.coins.enableBody = true;
    var result = this.findObjectsByType('coin', this.map, 'objectsLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.coins);
    }, this);
  },
  gameOver: function() {
    this.puntaje = 0;
    restart = 0;
    contSound = 0;
    Juego.state.start('Game');
  },
  playerJump: function() {
    if(this.player.body.touching.down) {
      this.player.body.velocity.y -= 700;
    }
  },
  playerRight: function() {
    if(this.player.body.touching.down) {
      this.player.body.velocity.x += 300;
    }
  },
  playerLeft:function(){
    if(this.player.body.touching.down) {
          this.player.body.velocity.x -= 300;
    }
  },
  playerDuck: function() {
      //change image and update the body size for the physics engine
      this.player.loadTexture('playerDuck');
      this.player.body.setSize(this.player.duckedDimensions.width, this.player.duckedDimensions.height);

      //we use this to keep track whether it's ducked or not
      this.player.isDucked = true;
  },
  render: function()
    {
        //this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
        this.game.debug.text(""+this.puntaje || '--', this.world.width-80, 40, "#ffffff", "40px Courier");
        this.game.debug.text("Nivel: "+this.level || '--', 5, 60, "#ffffff", "20px Courier");
    }
};
