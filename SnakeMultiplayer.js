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

  move(eat = false, singlePlayer = false) {
    if (eat) {
      this.eating = true;
    }
    if (this.resting == 0) {
      let newHead = this.nextPos();
      this.head = newHead;
      this.body.push(newHead);
      this.direction = this.nextDirection;
      if (!this.eating) {
        this.body.shift();
      } else if (this.body.length % 6 == 0) {
        this.speed = Math.max(0, this.speed - 1);
      }
      this.eating = false;
      if (singlePlayer) {
        this.resting = this.speed;
      } else {
        this.resting = this.baseSpeed - this.speed;
      }

      return true;
    } else {
      this.resting = this.resting - 1;
      return false;
    }
  }
}

class Apple {
  id;
  position;

  constructor(position) {
    this.id = Math.random() * 100000000000000000;
    if (position instanceof Pos) {
      this.position = position;
    }
  }
}

class Game {
  snakes = [];
  apples = [];
  isInfinite = false;
  numOfPlayers = 1;
  isFullscreen = true;
  isLive = false;
  gameInterval;
  canvas;
  ctx;
  rows;
  cols;
  squareSize = 20;
  frameTime = 50; //Max 40fps
  appleInterval = 100;
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
    this.apples = [];
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

    this.addApple();
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

      for (let apple in this.apples) {
        if (this.apples[apple].position.equals(pos)) {
          invalid = true;
        }
      }
    }
    this.snakes.push(new Snake(pos, this.getBestStartDirection(pos), color));
  }

  addApple() {
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

      for (let apple in this.apples) {
        if (this.apples[apple].position.equals(pos)) {
          invalid = true;
        }
      }
    }

    this.apples.push(new Apple(pos));
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
        }
      }
    }
    for (let a in this.apples) {
      this.ctx.beginPath();
      this.ctx.arc(
        this.apples[a].position.x * this.squareSize + this.squareSize / 2,
        this.apples[a].position.y * this.squareSize + this.squareSize / 2,
        this.squareSize / 2,
        2 * Math.PI,
        false
      );
      this.ctx.fillStyle = Color.RED;
      this.ctx.fill();
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
    let applesToRemove = [];
    let ate;
    for (let s in this.snakes) {
      if (!this.snakes[s].isDead) {
        if (!this.snakes[s].nextPos().equals(this.snakes[s].head)) {
          for (let a in this.apples) {
            if (this.apples[a].position.equals(this.snakes[s].nextPos())) {
              applesToRemove.push(this.apples[a].id);
              ate = true;
            }
          }
        }
        this.snakes[s].move(ate, this.numOfPlayers == 1);
        ate = false;
      }
    }
    if (applesToRemove.length > 0) {
      for (let a in this.apples) {
        if (applesToRemove.includes(this.apples[a].id)) {
          this.apples.splice(a, 1);
          if (this.numOfPlayers == 1) {
            this.addApple();
          }
        }
      }
    }

    if (this.numOfPlayers > 1) {
      if (this.appleInterval == 0) {
        this.addApple();
        this.appleInterval = 100;
      } else {
        this.appleInterval--;
      }
    }

    //check collisions
    for (let s in this.snakes) {
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
