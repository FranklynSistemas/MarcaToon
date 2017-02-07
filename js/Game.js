var SideScroller = SideScroller || {};

SideScroller.Game = function(){};

var puntaje = 0,
    restart = 0,
    finSound,
    Juego;

SideScroller.Game.prototype = {
  preload: function() {
      this.game.time.advancedTiming = true;
      this.game.stage.backgroundColor = '#079bc3';
    },
  create: function() {
    var newItem;
    fondo = this.game.add.tileSprite( this.game.world.width/2 -145, 60, 300, 70, 'fondo'); 
    //game params
    this.levelSpeed = -250;
    this.tileSize = 70;
    this.probCliff = 0.4;
    this.probVertical = 0.4;
    this.probMoreVertical = 0.5;

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
    this.coins.createMultiple(6, 'coca');
    this.coins.setAll('checkWorldBounds', true);
    this.coins.setAll('outOfBoundsKill', true);

 
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
    //collision
    this.game.physics.arcade.collide(this.player, this.floors, this.playerHit, null, this);
    this.game.physics.arcade.collide(this.player, this.verticalObstacles, this.playerHit, null, this);
    this.game.physics.arcade.overlap(this.player, this.coins, this.collect, null, this);
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
      /*if(this.player.x <= -this.tileSize) {
       this.gameOver();
      }
      if(this.player.y >= this.game.world.height + this.tileSize) {
        this.gameOver();
      }*/
    }

    /*
    if (restart) {
      restart = false;
      this.game.state.start('Game');
      Juego.state.start('Game');
    }
    */
    //generate further terrain
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
          coin.reset(this.lastFloor.body.x + this.tileSize, this.game.world.height - 4 * this.tileSize);
          coin.body.velocity.x = this.levelSpeed;
          coin.body.immovable = true;



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
      
      var style = { font: "20px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: 600};
      text = this.game.add.text(this.game.world.width/2 , this.game.world.height/2, "F i n  d e l  j u e g o !", style);
      text.anchor.set(0.5);
      restart += 1;
      if(restart === 1){
        finSound.play();
      }
      
      console.log("ingresa");
      //go to gameover after a few miliseconds
      this.game.time.events.add(1500, this.gameOver, this);
    }
  },
  collect: function(player, collectable) {
    //Suma Puntaje
    puntaje += 2;

    //play audio
    this.coinSound.play();

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
        this.game.debug.text("Puntaje: "+puntaje || 'Puntaje: --', this.world.width/2 - 120, 40, "#ffffff", "40px Courier");  
    }
};