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

const snakeColors = [Color.GREEN, Color.BLUE, Color.PINK, Color.ORANGE];

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
  speed = 7;
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
        if (this.body[i].x == position.x && this.body[i].y == position.y) {
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
      if (singlePlayer) {
        this.resting = this.speed;
      } else {
        if(this.superSpeed) {
          this.superSpeed = this.superSpeed - 1;
          this.resting = 0;
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
    ctx.beginPath();
      ctx.arc(
        this.position.x * squareSize + squareSize / 2,
        this.position.y * squareSize + squareSize / 2,
        squareSize / 2,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = Color.RED;
      ctx.fill();
      ctx.closePath();
  }
  
}

class Pepper extends Consumible {

  constructor(position) {
    super(position)
    this.eat = 1;
    this.superSpeed = 150;
  }

  draw(ctx, squareSize) {
      let squareX = this.position.x * squareSize;
      let squareY = this.position.y * squareSize; 
      
      ctx.fillStyle = 'red';

      ctx.save();
      ctx.translate(squareX + squareSize * 1.15, squareY + squareSize * 0.25);
      ctx.rotate(Math.PI / 2);

      ctx.beginPath();
      ctx.moveTo(5 - squareSize / 2, 25 - squareSize / 2);
      ctx.quadraticCurveTo(15 - squareSize / 2, 10 - squareSize / 2, 25 - squareSize / 2, 25 - squareSize / 2);
      ctx.lineTo(22 - squareSize / 2, 28 - squareSize / 2);
      ctx.quadraticCurveTo(15 - squareSize / 2, 20 - squareSize / 2, 8 - squareSize / 2, 28 - squareSize / 2);
      ctx.lineTo(5 - squareSize / 2, 25 - squareSize / 2);
      ctx.fill();

      ctx.restore();
  }
  
}


class Banana extends Consumible {

  constructor(position) {
    super(position)
    this.eat = 1;
    this.invicibility = 200;
  }

  draw(ctx, squareSize) {
      let squareX = this.position.x * squareSize;
      let squareY = this.position.y * squareSize;
      
      ctx.fillStyle = 'gold';

      ctx.save();
      ctx.translate(squareX - squareSize / 5, squareY + squareSize / 1.25);
      ctx.rotate(Math.PI * 1.5);

      ctx.beginPath();
      ctx.moveTo(5 - squareSize / 2, 25 - squareSize / 2);
      ctx.quadraticCurveTo(15 - squareSize / 2, 10 - squareSize / 2, 25 - squareSize / 2, 25 - squareSize / 2);
      ctx.lineTo(22 - squareSize / 2, 28 - squareSize / 2);
      ctx.quadraticCurveTo(15 - squareSize / 2, 20 - squareSize / 2, 8 - squareSize / 2, 28 - squareSize / 2);
      ctx.lineTo(5 - squareSize / 2, 25 - squareSize / 2);
      ctx.fill();

      ctx.restore();
  }
  
}


class Watermelon extends Consumible {

  constructor(position) {
    super(position)
    this.eat = 4;
  }

  draw(ctx, squareSize) {
    ctx.save()

    ctx.beginPath();
    
    ctx.translate(0, squareSize / 4)
    ctx.arc(
      this.position.x * squareSize + squareSize / 2,
      this.position.y * squareSize + squareSize / 2,
      squareSize / 2,
      Math.PI,
      false
    );
    ctx.fillStyle = Color.GREEN;
    ctx.fill();

    ctx.beginPath()

    ctx.arc(
      this.position.x * squareSize + squareSize / 2,
      this.position.y * squareSize + squareSize / 2,
      squareSize / 3,
      Math.PI,
      false
    );
    ctx.fillStyle = Color.RED;
    ctx.fill();
    ctx.restore()
  }
  
}

class Game {
  snakes = [];
  consumibles = [];
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
    let screenHeight = window.innerHeight - 78;
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

    this.cols = this.canvas.width / this.squareSize;
    this.rows = this.canvas.height / this.squareSize;
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
      this.addSnake(snakeColors[i]);
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
    this.snakes.push(new Snake(pos, this.getBestStartDirection(pos), color));
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

    if (newFruit < 7)
      this.consumibles.push(new Apple(pos));
    else if (newFruit < 5000)
      this.consumibles.push(new Banana(pos));
    else if (newFruit < 5001)
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
      if (!this.snakes[s].isDead) {
        for (let b in this.snakes[s].body) {
          this.ctx.fillStyle = this.snakes[s].color;
          this.ctx.fillRect(
            this.snakes[s].body[b].x * this.squareSize,
            this.snakes[s].body[b].y * this.squareSize,
            this.squareSize,
            this.squareSize
          );

          if(this.snakes[s].superSpeed > (this.snakes[s].body.length - b) * 10) {
            this.ctx.beginPath();
            this.ctx.arc(
              this.snakes[s].body[b].x * this.squareSize + this.squareSize / 2,
              this.snakes[s].body[b].y * this.squareSize + this.squareSize / 2,
              this.squareSize / 2.5,
              2 * Math.PI,
              false
            );
            this.ctx.fillStyle = Color.RED;
            this.ctx.fill();
          }

          if(this.snakes[s].invicibility > (this.snakes[s].body.length - b) * 10) {
            this.ctx.fillStyle = 'gold';
            this.ctx.fillRect(
              this.snakes[s].body[b].x * this.squareSize + this.squareSize * 0.25,
              this.snakes[s].body[b].y * this.squareSize + this.squareSize * 0.25,
              this.squareSize * 0.5,
              this.squareSize * 0.5
            );
          }

          
        }
      }
    }
    for (let a in this.consumibles) {
      this.consumibles[a].draw(this.ctx, this.squareSize)
    }
  }

  start() {
    this.setup();
    var gm = this;
    this.isLive = true;
    clearInterval(this.gameInterval);

    if (this.numOfPlayers == 1) {
      this.frameTime = 35;
    } else {
      this.frameTime = 50;
    }

    document.getElementById("infinite").disabled = true;
    document.getElementById("start").disabled = true;
    document.getElementById("numOfPlayers").disabled = true;
    document.getElementById("fullscreen").disabled = true;
    this.gameInterval = setInterval(function () {
      gm.iterate();
    }, this.frameTime);
  }

  stop() {
    this.isLive = false;
    clearInterval(this.gameInterval);
    document.getElementById("infinite").disabled = false;
    document.getElementById("start").disabled = false;
    document.getElementById("numOfPlayers").disabled = false;
    document.getElementById("fullscreen").disabled = false;
  }

  endDraw(collisions) {
    this.stop();
    this.ctx.textAlign = "center";
    this.ctx.font = "30px Righteous";
    this.ctx.fillStyle = "#000";
    for (let i in this.snakes) {
      this.pontuation[i] = this.pontuation[i] + this.snakes[i].body.length - 2;
    }

    if (this.numOfPlayers == 1) {
      this.ctx.fillText(
        `Game ended with ${this.snakes[0].body.length} points.`,
        this.canvas.width / 2,
        15 * this.squareSize
      );
    } else {
      if (collisions.length == this.numOfPlayers) {
        this.ctx.fillText("Draw", this.canvas.width / 2, 15 * this.squareSize);
        this.ctx.fillText(
          `Score: `,
          this.canvas.width / 2,
          17 * this.squareSize
        );
        for (let i in this.snakes) {
          this.ctx.fillText(
            `Player ${Number(i) + 1}: ${this.pontuation[i]}`,
            this.canvas.width / 2,
            (19 + i * 2) * this.squareSize
          );
        }
      } else {
        let winner;
        for (let i in this.pontuation) {
          if (!collisions.includes(i)) {
            winner = i;
          }
        }
        this.pontuation[winner] = this.pontuation[winner] + 5;
        this.ctx.fillText(
          `Player ${Number(winner) + 1} won!`,
          this.canvas.width / 2,
          15 * this.squareSize
        );
        this.ctx.fillText(
          `Score: `,
          this.canvas.width / 2,
          17 * this.squareSize
        );
        for (let i in this.snakes) {
          this.ctx.fillText(
            `Player ${Number(i) + 1}: ${this.pontuation[i]}`,
            this.canvas.width / 2,
            (19 + i * 2) * this.squareSize
          );
        }
      }
    }
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
        this.consumibleInterval = 100;
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
                  if (this.snakes[s].head.equals(this.snakes[o].head)) {
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

  input(e, gm) {
    switch (e.key.toLowerCase()) {
      case " ":
        if (!this.isLive) {
          this.start();
        }
        break;
      case "arrowup":
        if (gm.snakes.length > 0) {
          if (
            gm.snakes[0].direction != Direction.DOWN ||
            gm.snakes[0].body.length == 1
          ) {
            gm.snakes[0].nextDirection = Direction.UP;
          }
        }
        break;
      case "arrowdown":
        if (gm.snakes.length > 0) {
          if (
            gm.snakes[0].direction != Direction.UP ||
            gm.snakes[0].body.length == 1
          ) {
            gm.snakes[0].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "arrowleft":
        if (gm.snakes.length > 0) {
          if (
            gm.snakes[0].direction != Direction.RIGHT ||
            gm.snakes[0].body.length == 1
          ) {
            gm.snakes[0].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "arrowright":
        if (gm.snakes.length > 0) {
          if (
            gm.snakes[0].direction != Direction.LEFT ||
            gm.snakes[0].body.length == 1
          ) {
            gm.snakes[0].nextDirection = Direction.RIGHT;
          }
        }
        break;
      case "a":
        if (gm.snakes.length > 1) {
          if (
            gm.snakes[1].direction != Direction.RIGHT ||
            gm.snakes[1].body.length == 1
          ) {
            gm.snakes[1].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "s":
        if (gm.snakes.length > 1) {
          if (
            gm.snakes[1].direction != Direction.UP ||
            gm.snakes[1].body.length == 1
          ) {
            gm.snakes[1].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "w":
        if (gm.snakes.length > 1) {
          if (
            gm.snakes[1].direction != Direction.DOWN ||
            gm.snakes[1].body.length == 1
          ) {
            gm.snakes[1].nextDirection = Direction.UP;
          }
        }
        break;
      case "d":
        if (gm.snakes.length > 1) {
          if (
            gm.snakes[1].direction != Direction.LEFT ||
            gm.snakes[1].body.length == 1
          ) {
            gm.snakes[1].nextDirection = Direction.RIGHT;
          }
        }
        break;
      case "i":
        if (gm.snakes.length > 2) {
          if (
            gm.snakes[2].direction != Direction.DOWN ||
            gm.snakes[2].body.length == 1
          ) {
            gm.snakes[2].nextDirection = Direction.UP;
          }
        }
        break;
      case "k":
        if (gm.snakes.length > 2) {
          if (
            gm.snakes[2].direction != Direction.UP ||
            gm.snakes[2].body.length == 1
          ) {
            gm.snakes[2].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "j":
        if (gm.snakes.length > 2) {
          if (
            gm.snakes[2].direction != Direction.RIGHT ||
            gm.snakes[2].body.length == 1
          ) {
            gm.snakes[2].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "l":
        if (gm.snakes.length > 2) {
          if (
            gm.snakes[2].direction != Direction.LEFT ||
            gm.snakes[2].body.length == 1
          ) {
            gm.snakes[2].nextDirection = Direction.RIGHT;
          }
        }
        break;
      case "8":
        if (gm.snakes.length > 3) {
          if (
            gm.snakes[3].direction != Direction.DOWN ||
            gm.snakes[3].body.length == 1
          ) {
            gm.snakes[3].nextDirection = Direction.UP;
          }
        }
        break;
      case "5":
        if (gm.snakes.length > 3) {
          if (
            gm.snakes[3].direction != Direction.UP ||
            gm.snakes[3].body.length == 1
          ) {
            gm.snakes[3].nextDirection = Direction.DOWN;
          }
        }
        break;
      case "4":
        if (gm.snakes.length > 3) {
          if (
            gm.snakes[3].direction != Direction.RIGHT ||
            gm.snakes[3].body.length == 1
          ) {
            gm.snakes[3].nextDirection = Direction.LEFT;
          }
        }
        break;
      case "6":
        if (gm.snakes.length > 3) {
          if (
            gm.snakes[3].direction != Direction.LEFT ||
            gm.snakes[3].body.length == 1
          ) {
            gm.snakes[3].nextDirection = Direction.RIGHT;
          }
        }
        break;
    }
  }
}

const gameManager = new Game(1, false);

window.addEventListener("resize", function (event) {
  gameManager.resize();
});

window.addEventListener("keydown", function (event) {
  gameManager.input(event, gameManager);
});

function toggleInfinite(e) {
  if (!gameManager.isLive) {
    gameManager.setInfinite(e.target.checked);
  }
}

function startGame() {
  if (!gameManager.isLive) {
    gameManager.start();
  }
}

function setPlayers(e) {
  if (!gameManager.isLive) {
    gameManager.numOfPlayers = e.target.value;
  }
}

function toggleFullscreen(e) {
  if (!gameManager.isLive) {
    gameManager.isFullscreen = e.target.checked;
    gameManager.resize();
  }
}
