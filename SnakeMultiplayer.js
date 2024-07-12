const Direction = {
  RIGHT: 1,
  LEFT: 2,
  UP: 3,
  DOWN: 4,
};
Object.freeze(Direction);

const Color = {
  BLUE: "#004999",
  GREEN: "#569527",
  RED: "#FF0800",
  PINK: "#FF80CE",
  ORANGE: "#FF781F",
  GREY: "#CCCCCC",
};
Object.freeze(Color);

class Pos {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(position) {
    if (position instanceof Pos) {
      return this.x == position.x && this.y == position.y;
    } else {
      throw new Error("[ERROR] Comparing Positions - Position not valid.");
    }
  }
}

class Snake {
  head;
  body = [];
  direction;
  speed = 6;
  baseSpeed = 7;
  resting = 0;
  nextDirection;
  color;
  eating = false;
  isDead = false;
  toEat = 0;
  superSpeed = 0;
  invicibility = 0;

  constructor(position, direction, color) {
    this.color = color;
    if (position instanceof Pos) {
      this.head = position;
    } else {
      throw new Error("[ERROR] Creating Snake - Position is not valid.");
    }

    if (Object.values(Direction).includes(direction)) {
      this.direction = direction;
      this.nextDirection = direction;
      switch (direction) {
        case Direction.LEFT:
          this.body.push(new Pos(this.head.x + 1, this.head.y));
          break;
        case Direction.RIGHT:
          this.body.push(new Pos(this.head.x - 1, this.head.y));
          break;
        case Direction.UP:
          this.body.push(new Pos(this.head.x, this.head.y + 1));
          break;
        case Direction.DOWN:
          this.body.push(new Pos(this.head.x, this.head.y - 1));
          break;
      }
    } else {
      throw new Error(
        `[ERROR] Creating Snake - Direction ${direction} not valid.`
      );
    }
    this.body.push(this.head);
  }

  hasBody(position) {
    if (position instanceof Pos) {
      for (let i in this.body) {
        if (this.body[i].equals(position)) {
          return true;
        }
      }
    } else {
      throw new Error("[ERROR] Checking Snake body - Position invalid.");
    }
    return false;
  }

  nextPos() {
    if (this.resting == 0 || !this.numOfPlayers > 1) {
      let newHead;
      if (this.nextDirection == Direction.RIGHT) {
        newHead = new Pos(this.head.x + 1, this.head.y);
      } else if (this.nextDirection == Direction.LEFT) {
        newHead = new Pos(this.head.x - 1, this.head.y);
      } else if (this.nextDirection == Direction.UP) {
        newHead = new Pos(this.head.x, this.head.y - 1);
      } else if (this.nextDirection == Direction.DOWN) {
        newHead = new Pos(this.head.x, this.head.y + 1);
      }
      return newHead;
    } else {
      return this.head;
    }
  }

  addSuperSpeed(s) {
    this.superSpeed = this.superSpeed + s;
  }

  addInvicibility(inv) {
    this.invicibility = this.invicibility + inv;
  }

  move(eat = 0, singlePlayer = false) {
    
    this.toEat = this.toEat + eat
    this.invicibility = Math.max(this.invicibility - 1, 0) 

    if (this.resting == 0) {
      let newHead = this.nextPos();
      this.head = newHead;
      this.body.push(newHead);
      this.direction = this.nextDirection;
      if (this.toEat == 0) {
        this.body.shift();
      } else { 
        this.toEat = this.toEat - 1;   
        if (this.body.length % 15 == 0) {
          this.speed = Math.max(0, this.speed - 1);
        }
      }
      if(this.superSpeed) {
        this.superSpeed = this.superSpeed - 1;
        this.resting = 0;
      } else {
        if (singlePlayer) {
          this.resting = this.speed;
        } else {
          
          this.resting = this.baseSpeed - this.speed;
        }
      }

      return true;
    } else {
      this.resting = this.resting - 1;
      return false;
    }
  }

  draw(ctx, squareSize) {

    if (!this.isDead) {
      for (let b in this.body) {
        ctx.fillStyle = this.color;

        if(b == this.body.length -1) { //Draw head
          ctx.beginPath();
          ctx.arc(
            this.body[b].x * squareSize + squareSize / 2,
            this.body[b].y * squareSize + squareSize / 2,
            squareSize / 2,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = this.color;
          ctx.fill();

          switch (this.direction) {
            case (Direction.DOWN):
              ctx.fillRect(
                this.body[b].x * squareSize,
                this.body[b].y * squareSize,
                squareSize,
                squareSize / 2
              );
              break;
            case (Direction.UP):
              ctx.fillRect(
                this.body[b].x * squareSize,
                this.body[b].y * squareSize + squareSize / 2,
                squareSize,
                squareSize / 2
              );
              break;
            case (Direction.RIGHT):
              ctx.fillRect(
                this.body[b].x * squareSize,
                this.body[b].y * squareSize,
                squareSize / 2,
                squareSize
              );
              break;
            case (Direction.LEFT):
              ctx.fillRect(
                this.body[b].x * squareSize + squareSize / 2 ,
                this.body[b].y * squareSize,
                squareSize / 2,
                squareSize
              );
              break;
          }
        } else if (b == 0) { // Draw tail
          ctx.beginPath()
          if(this.body[Number(b) + 1].x > this.body[b].x) {
            ctx.ellipse( //RIGHT 
              this.body[b].x * squareSize + squareSize, //X
              this.body[b].y * squareSize + squareSize / 2, //Y
              squareSize / 2, //RADIUSX                                              
              squareSize, //RADIUSY
              Math.PI / 2, //ROTATION
              0, //START ANGLE
              Math.PI //END ANGLE
            )
          } else if (this.body[Number(b) + 1].x < this.body[b].x) {
            ctx.ellipse( //LEFT 
              this.body[b].x * squareSize, //X
              this.body[b].y * squareSize + squareSize / 2, //Y
              squareSize / 2, //RADIUSX                                              
              squareSize, //RADIUSY
              Math.PI * 1.5, //ROTATION
              0, //START ANGLE
              Math.PI //END ANGLE
            )
          } else if (this.body[Number(b) + 1].y < this.body[b].y) {
            ctx.ellipse( //UP 
              this.body[b].x * squareSize + squareSize / 2, //X
              this.body[b].y * squareSize, //Y
              squareSize / 2, //RADIUSX                                               
              squareSize, //RADIUSY
              Math.PI * 2, //ROTATION
              0, //START ANGLE
              Math.PI //END ANGLE
            )
          } else if (this.body[Number(b) + 1].y > this.body[b].y) {
            ctx.ellipse( //DOWN 
              this.body[b].x * squareSize + squareSize / 2, //X
              this.body[b].y * squareSize + squareSize, //Y
              squareSize / 2, //RADIUSX                                              
              squareSize, //RADIUSY
              Math.PI , //ROTATION
              0, //START ANGLE
              Math.PI //END ANGLE
            )
          }
          ctx.fill()
        } else { // Draw Body
          ctx.fillRect(
            this.body[b].x * squareSize,
            this.body[b].y * squareSize,
            squareSize,
            squareSize
          );
        }

        

        if(this.superSpeed > (this.body.length - b) * 10) {
          ctx.beginPath();
          ctx.arc(
            this.body[b].x * squareSize + squareSize / 2,
            this.body[b].y * squareSize + squareSize / 2,
            squareSize / 2.5,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = Color.RED;
          ctx.fill();
        }

        if(this.invicibility > (this.body.length - b) * 10) {
          ctx.fillStyle = 'gold';
          ctx.fillRect(
            this.body[b].x * squareSize + squareSize * 0.25,
            this.body[b].y * squareSize + squareSize * 0.25,
            squareSize * 0.5,
            squareSize * 0.5
          );
        }

        
      }
    }
  }
}

class Consumible {
  id;
  position;
  superSpeed = 0;
  eat = 0;
  invicibility = 0;
  
  constructor(position) {
    this.id = Math.random() * 100000000000000000;
    if (position instanceof Pos) {
      this.position = position;
    }
  }

  draw(ctx, squareSize) {
    ctx.beginPath();
      ctx.arc(
        this.position.x * squareSize + squareSize / 2,
        this.position.y * squareSize + squareSize / 2,
        squareSize / 2,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = Color.GREY;
      ctx.fill();
      ctx.closePath();
  }
}

class Apple extends Consumible {

  constructor(position) {
    super(position)
    this.eat = 1;
  }

  draw(ctx, squareSize) {
    ctx.drawImage(document.getElementById("apple"), this.position.x * squareSize, this.position.y * squareSize)
  }
  
}

class Pepper extends Consumible {

  constructor(position) {
    super(position)
    this.eat = 1;
    this.superSpeed = 150;
  }

  draw(ctx, squareSize) {
    ctx.drawImage(document.getElementById("pepper"), this.position.x * squareSize, this.position.y * squareSize)
  }
  
}

class Banana extends Consumible {

  constructor(position) {
    super(position)
    this.eat = 1;
    this.invicibility = 200;
  }

  draw(ctx, squareSize) {
    ctx.drawImage(document.getElementById("banana"), this.position.x * squareSize, this.position.y * squareSize)
  }
  
}

class Watermelon extends Consumible {

  constructor(position) {
    super(position)
    this.eat = 4;
  }

  draw(ctx, squareSize) {
    ctx.drawImage(document.getElementById("watermelon"), this.position.x * squareSize, this.position.y * squareSize)
  }
  
}

class Game {
  snakes = [];
  consumibles = [];
  walls = [];
  isInfinite = false;
  numOfPlayers = 1;
  isFullscreen = false;
  isLive = false;
  gameInterval;
  canvas;
  ctx;
  rows;
  cols;
  squareSize = 20;
  frameTime = 50; //Max 40fps
  consumibleInterval = 100;
  input2;
  pontuation = [0, 0];
  score = 0;
  snakesCollided = [];
  isPaused = false;
  isDrawingMode = false;
  colors = [Color.GREEN, Color.BLUE, Color.PINK, Color.ORANGE]
  names = ["Player 1", "Player 2", "Player 3", "Player 4"]

  constructor(numOfPlayers, isInfinite = false) {
    this.numOfPlayers = numOfPlayers;
    this.isInfinite = isInfinite;
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.resize();
    this.setup();
  }

  resize() {
    let screenWidth = window.innerWidth - 8;
    let screenHeight = window.innerHeight - 8;
    let extraWidth = screenWidth % this.squareSize;
    let extraHeight = screenHeight % this.squareSize;

    if (this.isFullscreen) {
      this.canvas.width = screenWidth - extraWidth;
      this.canvas.height = screenHeight - extraHeight;

      if (extraWidth % 2 == 0) {
        this.canvas.style.marginLeft = `${extraWidth / 2}px`;
      } else {
        this.canvas.style.marginLeft = `${(extraWidth - 1) / 2}px`;
      }
    } else {
      let value = Math.min(
        screenWidth - extraWidth,
        screenHeight - extraHeight
      );
      this.canvas.width = value;
      this.canvas.height = value;

      this.canvas.style.marginLeft = `${(screenWidth - value) / 2}px`;
    }

    if (extraHeight % 2 == 0) {
      this.canvas.style.marginTop = `${extraHeight / 2}px`;
    } else {
      this.canvas.style.marginTop = `${(extraHeight - 1) / 2}px`;
    }

    this.cols = this.canvas.width / this.squareSize;
    this.rows = this.canvas.height / this.squareSize;
  }

  setPlayers(numPlayers) {
    this.numOfPlayers = numPlayers
    this.setup()
  }

  setup() {
    this.snakes = [];
    this.consumibles = [];
    this.snakesCollided = [];

    if (this.pontuation.length != this.numOfPlayers) {
      this.pontuation = [];
      for (let i = 0; i < this.numOfPlayers; i++) {
        this.pontuation.push(0);
      }
    }

    for (let i = 0; i < this.numOfPlayers; i++) {
      this.addSnake(this.colors[i]);
    }

    this.draw()

    this.addConsumible();
  }

  setInfinite(value) {
    this.isInfinite = value || false;
    if (this.isInfinite) {
      this.canvas.style.borderStyle = "dotted";
    } else {
      this.canvas.style.borderStyle = "solid";
    }
  }

  getBestStartDirection(pos) {
    if (pos instanceof Pos) {
      let left = pos.x;
      let right = this.cols - pos.x;
      let up = pos.y;
      let down = this.rows - pos.y;

      let res = Math.max(left, right, up, down);

      switch (res) {
        case left:
          return Direction.LEFT;
        case up:
          return Direction.UP;
        case right:
          return Direction.RIGHT;
        case down:
          return Direction.DOWN;
      }
    } else {
      throw new Error(
        "[ERROR] Get Best Start Direction  - Position not valid."
      );
    }
  }

  addSnake(color) {
    let invalid = true;
    let pos;

    while (invalid) {
      invalid = false;

      pos = new Pos(
        Math.floor(Math.random() * (this.cols - 3) + 1),
        Math.floor(Math.random() * (this.rows - 3) + 1)
      );

      for (let snake in this.snakes) {
        if (this.snakes[snake].hasBody(pos)) {
          invalid = true;
        }
      }

      for (let consumible in this.consumibles) {
        if (this.consumibles[consumible].position.equals(pos)) {
          invalid = true;
        }
      }
    }
    this.snakes.push(new Snake(pos, this.getBestStartDirection(pos), color));
  }

  setColor(idx, color) {
    this.colors[idx] = color;
    this.snakes[idx].color = color;
    this.clear();
    this.draw();
  }

  setName(idx, name) {
    this.names[idx] = name;
  }

  addConsumible() {
    let invalid = true;
    let pos;
    while (invalid) {
      invalid = false;

      pos = new Pos(
        Math.floor(Math.random() * (this.cols - 1)),
        Math.floor(Math.random() * (this.rows - 1))
      );

      for (let snake in this.snakes) {
        if (this.snakes[snake].hasBody(pos)) {
          invalid = true;
        }
      }

      for (let consumible in this.consumibles) {
        if (this.consumibles[consumible].position.equals(pos)) {
          invalid = true;
        }
      }
    }
    

    let newFruit = Math.random() * 10000

    if (newFruit < 7000)
      this.consumibles.push(new Apple(pos));
    else if (newFruit < 8000)
      this.consumibles.push(new Banana(pos));
    else if (newFruit < 9000)
      this.consumibles.push(new Watermelon(pos));
    else 
      this.consumibles.push(new Pepper(pos));
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    this.clear();
    for (let s in this.snakes) {
      this.snakes[s].draw(this.ctx, this.squareSize)
    }
    for (let a in this.consumibles) {
      this.consumibles[a].draw(this.ctx, this.squareSize)
    }
    for (let w in this.walls) {
      this.ctx.fillStyle = "black"
      this.ctx.fillRect(
        this.walls[w].x * this.squareSize,
        this.walls[w].y * this.squareSize,
        this.squareSize,
        this.squareSize
      );
    }
  }

  start() {
    this.setup();
    var gm = this;
    this.isLive = true;
    clearInterval(this.gameInterval);
    this.gameInterval = undefined;

    if (this.numOfPlayers == 1) {
      this.frameTime = 35;
    } else {
      this.frameTime = 50;
    }
    this.gameInterval = setInterval(function () {
      gm.iterate();
    }, this.frameTime);
  }

  stop() {
    this.isLive = false;
    this.isPaused = false;
    clearInterval(this.gameInterval);
    this.gameInterval = undefined;
  }

  pause() {
    if(this.isPaused) {
      let gm = this;
      this.gameInterval = setInterval(function () {
        gm.iterate();
      }, this.frameTime);
      this.isPaused = false;
      closePauseModal();
    } else if (this.isLive){
      clearInterval(this.gameInterval);
      this.gameInterval = undefined;
      this.isPaused = true ;
      openPauseModal();
    }
  }

  endDraw() {
    this.stop();
    for (let i in this.snakes) {
      this.pontuation[i] = this.pontuation[i] + this.snakes[i].body.length - 2;
    }
    let winner = -1;
    if (this.numOfPlayers != 1) {
        for (let i in this.pontuation) {
          if (!this.snakesCollided.includes(i)) {
            winner = i;
          }
        }
        if(winner != -1) {
          this.pontuation[winner] = this.pontuation[winner] + 5;
        }
    }

    showScores(this.pontuation, this.snakes, winner)
  }

  iterate() {
    let consumibleToRemove = [];
    let ate = 0;

    for (let s in this.snakes) {
      if (!this.snakes[s].isDead) {
        if (!this.snakes[s].nextPos().equals(this.snakes[s].head)) {
          for (let a in this.consumibles) {
            if (this.consumibles[a].position.equals(this.snakes[s].nextPos())) {
              consumibleToRemove.push(this.consumibles[a].id);
              ate = this.consumibles[a].eat;
              this.snakes[s].addSuperSpeed(this.consumibles[a].superSpeed);
              this.snakes[s].addInvicibility(this.consumibles[a].invicibility);
            }
          }
        }
        this.snakes[s].move(ate, this.numOfPlayers == 1);
        ate = 0;
      }
    }
    if (consumibleToRemove.length > 0) {
      for (let a in this.consumibles) {
        if (consumibleToRemove.includes(this.consumibles[a].id)) {
          this.consumibles.splice(a, 1);
          if (this.numOfPlayers == 1) {
            this.addConsumible();
          }
        }
      }
    }

    if (this.numOfPlayers > 1) {
      if (this.consumibleInterval == 0) {
        this.addConsumible();
        this.consumibleInterval = 70;
      } else {
        this.consumibleInterval--;
      }
    }

    //check collisions
    for (let s in this.snakes) {
      if(this.snakes[s].invicibility == 0) {
        if (!this.snakes[s].isDead) {
          //colide with itself
          for (let p in this.snakes[s].body.slice(
            0,
            this.snakes[s].body.length - 2
          )) {
            if (this.snakes[s].body[p].equals(this.snakes[s].head)) {
              if (!this.snakesCollided.includes(s)) {
                this.snakesCollided.push(s);
              }
            }
          }
  
          //collide with other snake
  
          for (let o in this.snakes) {
            if (!this.snakes[o].isDead) {
              if (o != s) {
                if (this.snakes[o].hasBody(this.snakes[s].head)) {
                  if (this.snakes[s].head.equals(this.snakes[o].head) && this.snakes[o].invicibility == 0) {
                    if (!this.snakesCollided.includes(o)) {
                      this.snakesCollided.push(o);
                    }
                  }
                  if (!this.snakesCollided.includes(s)) {
                    this.snakesCollided.push(s);
                  }
                }
              }
            }
          }
        }
      }

      //collide with wall
      if (
        this.snakes[s].head.x == -1 ||
        this.snakes[s].head.y == -1 ||
        this.snakes[s].head.x == this.cols ||
        this.snakes[s].head.y == this.rows
      ) {
        if (!this.isInfinite) {
          if (!this.snakesCollided.includes(s)) {
            this.snakesCollided.push(s);
          }
        } else {
          if (this.snakes[s].head.x < 0)
            this.snakes[s].head.x = this.cols - 1;
          if (this.snakes[s].head.y < 0)
            this.snakes[s].head.y = this.rows - 1;
          if (this.snakes[s].head.x > this.cols - 1)
            this.snakes[s].head.x = 0;
          if (this.snakes[s].head.y > this.rows - 1)
            this.snakes[s].head.y = 0;
        }
      }

      for(let w in this.walls) {
        if(this.snakes[s].head.equals(this.walls[w])) {
          if (!this.snakesCollided.includes(s)) {
            this.snakesCollided.push(s);
          }
        }
      }

    }

    this.draw();
    if (this.snakesCollided.length >= Math.max(this.numOfPlayers - 1, 1)) {
      this.endDraw(this.snakesCollided);
    } else if (this.snakesCollided.length > 0) {
      for (let i in this.snakesCollided) {
        this.snakes[this.snakesCollided[i]].isDead = true;
      }
    }
  }

  input(e) {
    switch (e.key.toLowerCase()) {
      case "arrowup":
        if (this.snakes.length > 0) {
          if (
            this.snakes[0].direction != Direction.DOWN ||
            this.snakes[0].body.length == 1
          ) {
            this.snakes[0].nextDirection = Direction.UP;
          }
        }
        break;
      case "arrowdown":
        if (this.snakes.length > 0) {
          if (
            this.snakes[0].direction != Direction.UP ||
            this.snakes[0].body.length == 1
          ) {
            this.snakes[0].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "arrowleft":
        if (this.snakes.length > 0) {
          if (
            this.snakes[0].direction != Direction.RIGHT ||
            this.snakes[0].body.length == 1
          ) {
            this.snakes[0].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "arrowright":
        if (this.snakes.length > 0) {
          if (
            this.snakes[0].direction != Direction.LEFT ||
            this.snakes[0].body.length == 1
          ) {
            this.snakes[0].nextDirection = Direction.RIGHT;
          }
        }
        break;
      case "a":
        if (this.snakes.length > 1) {
          if (
            this.snakes[1].direction != Direction.RIGHT ||
            this.snakes[1].body.length == 1
          ) {
            this.snakes[1].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "s":
        if (this.snakes.length > 1) {
          if (
            this.snakes[1].direction != Direction.UP ||
            this.snakes[1].body.length == 1
          ) {
            this.snakes[1].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "w":
        if (this.snakes.length > 1) {
          if (
            this.snakes[1].direction != Direction.DOWN ||
            this.snakes[1].body.length == 1
          ) {
            this.snakes[1].nextDirection = Direction.UP;
          }
        }
        break;
      case "d":
        if (this.snakes.length > 1) {
          if (
            this.snakes[1].direction != Direction.LEFT ||
            this.snakes[1].body.length == 1
          ) {
            this.snakes[1].nextDirection = Direction.RIGHT;
          }
        }
        break;
      case "i":
        if (this.snakes.length > 2) {
          if (
            this.snakes[2].direction != Direction.DOWN ||
            this.snakes[2].body.length == 1
          ) {
            this.snakes[2].nextDirection = Direction.UP;
          }
        }
        break;
      case "k":
        if (this.snakes.length > 2) {
          if (
            this.snakes[2].direction != Direction.UP ||
            this.snakes[2].body.length == 1
          ) {
            this.snakes[2].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "j":
        if (this.snakes.length > 2) {
          if (
            this.snakes[2].direction != Direction.RIGHT ||
            this.snakes[2].body.length == 1
          ) {
            this.snakes[2].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "l":
        if (this.snakes.length > 2) {
          if (
            this.snakes[2].direction != Direction.LEFT ||
            this.snakes[2].body.length == 1
          ) {
            this.snakes[2].nextDirection = Direction.RIGHT;
          }
        }
        break;
      case "8":
        if (this.snakes.length > 3) {
          if (
            this.snakes[3].direction != Direction.DOWN ||
            this.snakes[3].body.length == 1
          ) {
            this.snakes[3].nextDirection = Direction.UP;
          }
        }
        break;
      case "5":
        if (this.snakes.length > 3) {
          if (
            this.snakes[3].direction != Direction.UP ||
            this.snakes[3].body.length == 1
          ) {
            this.snakes[3].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "4":
        if (this.snakes.length > 3) {
          if (
            this.snakes[3].direction != Direction.RIGHT ||
            this.snakes[3].body.length == 1
          ) {
            this.snakes[3].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "6":
        if (this.snakes.length > 3) {
          if (
            this.snakes[3].direction != Direction.LEFT ||
            this.snakes[3].body.length == 1
          ) {
            this.snakes[3].nextDirection = Direction.RIGHT;
          }
        }
        break;
      case "escape":
        if(this.isDrawingMode) {
          this.toggleDrawingMode();
        } else {
          this.pause();
        }
        break;
    }
  }

  resetDrawing() {
    this.walls = []
    this.draw()
  }

  toggleDrawingMode() {
    if(this.isDrawingMode) {
      this.isDrawingMode = false;
      openInitModal();
      closeMapEditDrawer();
      this.canvas.onclick = () =>  {}
    } else {
      this.isDrawingMode = true;
      closeInitModal();
      openMapEditDrawer();
      this.canvas.onclick = (e) =>  {
        let mX = Math.floor((e.offsetX / 20) % this.cols);
        let mY = Math.floor((e.offsetY / 20) % this.rows);

        let idx = -1;
        for(let w in this.walls) {
          if(this.walls[w].equals(new Pos(mX, mY))) {
            idx = w;
          }
        }

        if(idx != -1) {
          this.walls.splice(idx, 1)
        } else {
          this.walls.push(new Pos(mX, mY))
        }

        this.draw()
      }
    }
  }
}

const gameManager = new Game(1, false);


window.addEventListener("resize", function (event) {
  gameManager.resize();
});

window.addEventListener("keydown", function (event) {
  if(event.key.toLowerCase() == " " && event.target.tagName !== "INPUT") {
    if(gameManager.isPaused) {
      gameManager.pause();
    } else {
      if(!gameManager.isLive && !gameManager.isDrawingMode) {
        startGame();
      }
    }
  } else {
    gameManager.input(event, gameManager);
  }
});

function setInfinite(val) {
  if (!gameManager.isLive) {
    gameManager.setInfinite(val);
    document.querySelector(".btn-borders.selected").classList.remove("selected")
    if(!val) {
      document.getElementById("border-solid").classList.add("selected")
    } else {
      document.getElementById("border-infinite").classList.add("selected")
    }
  }
}

function startGame() {
  if (!gameManager.isLive) {
    gameManager.start();
    closeInitModal();
    closePauseModal();
    closeScoreModal();
    closeControlsModal();
  }
}
function unPause() {
  if(gameManager.isPaused) {
    gameManager.pause();
  }
}

function stopGame() {
  gameManager.stop();
  closePauseModal();
  closeScoreModal();
  openInitModal();
}

function setPlayers(val) {
  if (!gameManager.isLive) {
    gameManager.setPlayers(val);
    document.querySelector(".btn-player.selected").classList.remove("selected")
    document.getElementById("player-" + val).classList.add("selected")
  }
}

function updateColors() {
  for(let i in gameManager.snakes) {
    let pNum = Number(i) + 1
    Array.from(document.querySelectorAll(`#player-${pNum}-snake .body`)).forEach(el => el.style.fill = gameManager.snakes[i].color + "aa")
    Array.from(document.querySelectorAll(`#player-${pNum}-snake .body-details`)).forEach(el => el.style.fill = gameManager.snakes[i].color)
    document.getElementById(`player-${Number(i) + 1}-color-input`).setAttribute("value", gameManager.snakes[i].color)
    document.getElementById(`player-${Number(i) + 1}-color-input`).style.backgroundColor = gameManager.snakes[i].color
  }
}

function updateNames() {
  for(let i in gameManager.snakes) {
    document.getElementById(`player-${Number(i) + 1}-name-input`).setAttribute("value", gameManager.names[i])
  }
}

function updateControls() {
  Array.from(document.querySelectorAll(`.player`)).forEach(el => el.style.display = "none")
  for(let i in gameManager.snakes) {
    let pNum = Number(i) + 1
    document.getElementById(`player-${pNum}-controls`).style.display = "flex";
  }
}

function setFullscreen(val) {
  if (!gameManager.isLive) {
    gameManager.isFullscreen = val;
    gameManager.resize();
    document.querySelector(".btn-map.selected").classList.remove("selected")
    if(!val) {
      document.getElementById("map-square").classList.add("selected")
    } else {
      document.getElementById("map-fullscreen").classList.add("selected")
    }
  }
}

function closeInitModal() {
  document.getElementById("initModal").classList.remove("show")
}

function openInitModal() {
  document.getElementById("initModal").classList.add("show")
}

function closePauseModal() {
  document.getElementById("pauseModal").classList.remove("show")
}

function openPauseModal() {
  document.getElementById("pauseModal").classList.add("show")
}

function closeControlsModal() {
  document.getElementById("controlsModal").classList.remove("show")
}

function openControlsModal() {
  updateColors();
  updateNames();
  updateControls();
  document.getElementById("controlsModal").classList.add("show")
}

function closeScoreModal() {
  document.getElementById("scoreModal").classList.remove("show")
}

function showScores(pontuation = [], snakes = [], winner) {
  let roundScore = document.getElementById("roundScore");
  let totalScore = document.getElementById("totalScore");
  let winnerScore = document.getElementById("winnerScore");

  roundScore.innerHTML = "";
  totalScore.innerHTML = "";
  winnerScore.innerHTML = "";

  let score = []

  let winnerHTML = "";

  if(winner == -1) {
    winnerHTML = "This game ended in a draw!"
    document.getElementById("player-winner-snake").style.display = "none"
  } else {
    winnerHTML = `The winner of this round is <div class="player-color" style="background-color: ${snakes[winner].color};"></div> ${gameManager.names[winner]}!! Congrats!`
    document.getElementById("player-winner-snake").style.display = "inline"
    Array.from(document.querySelectorAll(`#player-winner-snake .body`)).forEach(el => el.style.fill = gameManager.snakes[winner].color + "aa")
    Array.from(document.querySelectorAll(`#player-winner-snake .body-details`)).forEach(el => el.style.fill = gameManager.snakes[winner].color)
  }

  winnerScore.innerHTML = winnerHTML;

  for(let i in snakes) {
    score.push({
      color: snakes[i].color,
      player: gameManager.names[i],
      total: pontuation[i] || 0,
      round: snakes[i].body.length - 2 + (Number(winner) == Number(i) ? 5 : 0)
    })
  }

  let roundHTML = "<table><tr><th>Player</th><th>Score</th></tr>"

  score.sort((a, b) => b.round - a.round)

  for(let i in score) {
    roundHTML += `<tr><td><div class="player-color" style="background-color: ${score[i].color}"></div>${score[i].player}</td><td>${score[i].round}</td></tr>`
  }

  roundHTML += "</table>"

  let totalHTML = "<table><tr><th>Player</th><th>Score</th></tr>"

  score.sort((a, b) => b.total - a.total)

  for(let i in score) {
    totalHTML += `<tr><td><div class="player-color" style="background-color: ${score[i].color}"></div>${score[i].player}</td><td>${score[i].total}</td></tr>`
  }

  totalHTML += "</table>"

  roundScore.innerHTML = roundHTML
  totalScore.innerHTML = totalHTML


  document.getElementById("scoreModal").classList.add("show")

}

function openDrawingMode() {
  gameManager.toggleDrawingMode()
}

function closeDrawingMode() {
  gameManager.toggleDrawingMode()
}

function resetMap() {
  gameManager.resetDrawing()
}

function openMapEditDrawer() {
  document.getElementById('mapEditDrawer').classList.add('show');
}

function closeMapEditDrawer() {
  document.getElementById('mapEditDrawer').classList.remove('show');
}

function setPlayerColor(e, player) {
  let idx = player - 1;
  let color = e.target.value;

  gameManager.setColor(idx, color);
  updateColors()
}

function setPlayerName(e, player) {
  let idx = player - 1;
  let name = e.target.value;

  gameManager.setName(idx, name);
}

var mc = new Hammer(document.body);

// listen to events...
mc.on("panleft swipeleft", function(ev) {
  turnLeft() 
});

mc.on("panright swiperight", function(ev) {
  turnRight() 
});

mc.on("panup swipeup", function(ev) {
  turnUp() 
});

mc.on("pandown swipedown", function(ev) {
  turnDown() 
});

function turnLeft() {
  gameManager.input({key: "arrowleft"}, gameManager)
}
function turnRight() {
  gameManager.input({key: "arrowright"}, gameManager)
}
function turnUp() {
  gameManager.input({key: "arrowup"}, gameManager)
}
function turnDown() {
  gameManager.input({key: "arrowdown"}, gameManager)
}