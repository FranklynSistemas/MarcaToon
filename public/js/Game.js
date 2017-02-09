var SideScroller = SideScroller || {};

SideScroller.Game = function(){};

var puntaje = 0,
    restart = 0,
    finSound,
    Juego,
    user = {},
    equipo = {},
    pausa = true,
    comenzar = false,
    sound = true;
   
var websocket = io.connect();

$( document ).ready(function() {
  
  var $nameUser = $("#nameUser").text();
  var $miPos = $("#miPos");
  var $start = $("#start");
  var $pausa = $("#pausa");
  var $sound = $("#sound");

  equipo ={
    id: 1,
    name: "Cocacola"
  } //Pendiente Por definir
  user = {
    nomUser: $nameUser,
    puntaje: 0
  }


  /*  Socket y Dom */
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
      html += "<p>"+cont+". "+participantesOrdenados[i].Nombre+" - "+participantesOrdenados[i].Puntaje+"</p>";
    }
    $divRank.html(html);
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
    console.log("Mi Rank: "+pos);
  }

  $start.click(function(){
      comenzar = true;
      $(this).fadeOut(500);
        pausa = !pausa;
        Juego.paused = pausa;
  });

  $pausa.click(function(){
      if(comenzar){
          pausa = !pausa;
        if(pausa){
          $(this).removeClass("paused");
          $(this).addClass("play");
        }else{
          $(this).removeClass("play");
          $(this).addClass("paused");
        }
        Juego.paused = pausa;
      }
  });

  $("body").keypress(function(e){
    if(e.keyCode=== 32){
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
  });

  $sound.click(function(){
    if(sound){
      $(this).removeClass("nosound");
      $(this).addClass("sound");
    }else{
      $(this).removeClass("sound");
      $(this).addClass("nosound");
    } 
    sound = !sound;
  });

});




/* Fin Socket y Dom */


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
    this.levelSpeed = -250;
    this.tileSize = 70;
    this.probCliff = 0.4;
    this.probVertical = 0.4;
    this.probMoreVertical = 0.5;
    this.probOtherCoins = 0.2;

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

    /*for(var i=0; i<12; i++) {
      newItem = this.verticalObstacles.create(null, this.game.world.height - this.tileSize, 'floor');
      newItem.body.immovable = true;
      newItem.body.velocity.x = this.levelSpeed;
    }
*/



    this.coins = this.game.add.group();
    this.coins.enableBody = true;
    //this.coins.createMultiple(6, 'goldCoin');
    this.coins.createMultiple(12, 'coca');
    this.coins.setAll('checkWorldBounds', true);
    this.coins.setAll('outOfBoundsKill', true);

    this.Othercoins = this.game.add.group();
    this.Othercoins.enableBody = true;
    //this.coins.createMultiple(6, 'goldCoin');
    this.Othercoins.createMultiple(12, 'pepsi');
    this.Othercoins.setAll('checkWorldBounds', true);
    this.Othercoins.setAll('outOfBoundsKill', true);

    //create player
    this.player = this.game.add.sprite(250, 320, 'player');
    // /this.player.scale.setTo(0.8);

    //enable physics on the player
    this.game.physics.arcade.enable(this.player);

    //player gravity
    this.player.body.gravity.y = 1000;

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
    //init game controller
    this.initGameController();

    //sounds
    this.coinSound = this.game.add.audio('coin');
    finSound = this.game.add.audio('fin');
  },
  update: function() {
    console.log("update");
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


      if(this.cursors.up.isDown) {
        this.playerJump();
      }
      else if(this.cursors.down.isDown) {
        this.playerDuck();
      }

      if(!this.cursors.down.isDown && this.player.isDucked && !this.pressingDown) {
        //change image and update the body size for the physics engine
        this.player.loadTexture('player');
        this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
        this.player.isDucked = false;
      }

      //restart the game if reaching the edge
      if(this.player.x <= -this.tileSize) {
       this.playerDead();
      }
      if(this.player.y >= this.game.world.height + this.tileSize) {
        this.playerDead();
      }
    }

    if(user.puntaje < puntaje){
          user.puntaje=puntaje
          websocket.emit('updatePuntaje',{user:user,equipo:equipo});
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
    this.generateTerrain();

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
          block.reset(this.lastFloor.body.x + this.tileSize, this.game.world.height - 3 * this.tileSize);
          block.body.velocity.x = this.levelSpeed;
          block.body.immovable = true;

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
              Othercoin.body.angularVelocity = 100;
            }
          }

        }
        else {
          this.lastCliff = false;
          this.lastVertical = false;
        }

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

      this.playerDead()
    }
  },
  playerHito: function(){

  },
  playerDead: function(){
     var style = { font: "20px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: 600};
      text = this.game.add.text(this.game.world.width/2 , this.game.world.height/2, "F i n  d e l  j u e g o !", style);
      text.anchor.set(0.5);
      restart += 1;
      if(restart === 1 && sound){
        finSound.play();
      }
      //go to gameover after a few miliseconds
      this.game.time.events.add(1500, this.gameOver, this);
  },
  collect: function(player, collectable) {
    //Suma Puntaje
    puntaje += 2;

    //play audio
    if(sound){
      this.coinSound.play();
    }
    

    //remove sprite
    collectable.kill();
  },
  OtherCollect:function(player, collectable){
    //Suma Puntaje
    puntaje -= 2;

    //play audio
    if(sound){
      this.coinSound.play();
    }

    //remove sprite
    collectable.kill();
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
    puntaje = 0;
    restart = 0;
    Juego.state.start('Game');
  },
  playerJump: function() {
    if(this.player.body.touching.down) {
      this.player.body.velocity.y -= 700;
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
        this.game.debug.text(""+puntaje || '--', this.world.width-80, 40, "#ffffff", "40px Courier");
    }
};
