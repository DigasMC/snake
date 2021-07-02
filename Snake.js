const rows = 40, cols = 40, sqSize = 20
var snake, apple
var frameRate = 6, infinite = false
var gameItvl, live = false
var nextDirection, score = 0
var highscore = 0

const canvas = document.getElementById('canvas')
canvas.height = rows * sqSize
canvas.width = cols * sqSize

const ctx = canvas.getContext('2d')

class Pos {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  getX() {
    return this.x
  }

  getY() {
    return this.y
  }

  setPos(x, y) {
    this.x = x
    this.y = y
  }
}
class Snake  {
  constructor() {
    this.pos = new Pos(2, 0)
    this.body = [ new Pos(0, 0),new Pos(1, 0),new Pos(2, 0) ]
    this.direction = 'right'
  }

  hasBody(pos) {
    for(let i in this.body) {
      if(this.body[i].x == pos.x && this.body[i].y == pos.y) {
        return true
      }
    }
    return false
  }

}

function move() {
    let newHead
    snake.direction = nextDirection
    if(snake.direction == 'right') {
      newHead = new Pos(snake.pos.getX() + 1, snake.pos.getY())
    } else if(snake.direction == 'left') {
      newHead = new Pos(snake.pos.getX() - 1, snake.pos.getY())
    } else if(snake.direction == 'up') {
      newHead = new Pos(snake.pos.getX(), snake.pos.getY() - 1)
    } else if(snake.direction == 'down') {
      newHead = new Pos(snake.pos.getX(), snake.pos.getY() + 1)
    }
    
    if(!hasFood(newHead)) {
      snake.body.shift()
    } else {
      if(snake.body.length % 2) {
        frameRate = frameRate + 1
        updateFPS()
      }
      score = score + 10
      generateApple()
    }
    if((!hasWall(newHead) || infinite) && !snake.hasBody(newHead)) {
      if(infinite) {
        if(newHead.getX() < 0) newHead.setPos(cols - 1, newHead.getY())
        if(newHead.getY() < 0) newHead.setPos(newHead.getX(), rows - 1)
        if(newHead.getX() > cols - 1) newHead.setPos(0, newHead.getY())
        if(newHead.getY() > rows - 1) newHead.setPos(newHead.getX(), 0)
      }
      snake.body.push(newHead)
      snake.pos = newHead
      score = score + 1
      draw()
    } else {
      stopGame()
    }
    if(score > highscore) {
      highscore = score
    }
}

function setup() {
  ctx.fillStyle = "#000000"
  ctx.textAlign = "center";
  ctx.font = "30px Arial";
  ctx.fillText("Press space to start", canvas.width / 2, 20 * sqSize);
  snake = new Snake()
  nextDirection = snake.direction
  frameRate = 6
  generateApple()
}

function draw() {
  ctx.clearRect(0, 0, rows * sqSize, cols * sqSize)

  for(let x = 0; x < cols; x++) {
    for(let y = 0; y < rows; y++) {
      if(apple.getX() == x && apple.getY() == y) {
        ctx.beginPath()
        ctx.arc(x * sqSize  + (sqSize / 2), y * sqSize +  (sqSize / 2), sqSize / 2, 2 * Math.PI, false)
        ctx.fillStyle = "#FF0800" 
        ctx.fill()
      }
      if(snake.hasBody(new Pos(x, y))) {
          ctx.fillStyle = "#569527" 
          ctx.fillRect(x * sqSize, y * sqSize, sqSize, sqSize)
      }
    }
  }
}

function generateApple() {
  let newApple = new Pos(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows))

  while(snake.hasBody(newApple)) {
    newApple = new Pos(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows))
  }
  
  apple = newApple
}

function hasFood(pos) {
  return apple.x == pos.x && apple.y == pos.y
}

function hasWall(pos) {
  return pos.x == -1 || pos.y == -1 || pos.x == cols || pos.y == rows
}

function stopGame() {
  live = false
  clearInterval(gameItvl)
  ctx.textAlign = "center";
  ctx.font = "30px Arial";
  ctx.fillStyle = "#FF0000"  
  ctx.fillText("You died!", canvas.width / 2, 15 * sqSize);
  ctx.fillText("Press space to start", canvas.width / 2, 25 * sqSize );
  document.getElementById('infinite').disabled = false
}

function updateFPS() {
  clearInterval(gameItvl)
  gameItvl = setInterval(function() {
    move()
    document.getElementById('score').innerHTML = score
    document.getElementById('speed').innerHTML = frameRate
    document.getElementById('highscore').innerHTML = highscore
  }, 1000/frameRate)
}

function startGame() {
  setup()
  score = 0;
  clearInterval(gameItvl)
  gameItvl = setInterval(function() {
    move()
    document.getElementById('score').innerHTML = score
    document.getElementById('speed').innerHTML = frameRate
    document.getElementById('highscore').innerHTML = highscore
  }, 1000/frameRate)
  live = true
  document.getElementById('infinite').disabled = true
}

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        if(snake.direction != 'down') {
          nextDirection = 'up'
        }
    }
    else if (e.keyCode == '40') {
        // down arrow
        if(snake.direction != 'up') {
          nextDirection = 'down'
        }
    }
    else if (e.keyCode == '37') {
       // left arrow
       if(snake.direction != 'right') {
        nextDirection = 'left'
      }
    }
    else if (e.keyCode == '39') {
       // right arrow
       if(snake.direction != 'left') {
        nextDirection = 'right'
      }
    }
    else if (e.keyCode == '32') {
      // right arrow
      if(!live) {
        startGame()
      }
   }

}

function toggleInfinite() {
  if(!live) {
    infinite = document.getElementById('infinite').checked 
  }
}

setup()