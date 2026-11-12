
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const messageBox = document.getElementById("gameMessage");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");

const box = 20;
const totalBoxes = canvas.width / box;

let snake;
let food;
let direction;
let nextDirection;
let score = 0;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;
let gameInterval = null;
let gameRunning = false;
let gamePaused = false;

highScoreElement.textContent = highScore;

// Initialize the game
function initializeGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;

    scoreElement.textContent = score;
    food = createFood();

    drawGame();
}

// Create food at a random position
function createFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * totalBoxes) * box,
            y: Math.floor(Math.random() * totalBoxes) * box
        };
    } while (
        snake.some(part =>
            part.x === newFood.x && part.y === newFood.y
        )
    );

    return newFood;
}

// Draw the game
function drawGame() {
    ctx.fillStyle = "#081311";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(57, 255, 136, 0.07)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += box) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#b6ffcc" : "#39ff88";
        ctx.shadowColor = "#39ff88";
        ctx.shadowBlur = index === 0 ? 15 : 8;

        ctx.fillRect(part.x + 2, part.y + 2, box - 4, box - 4);
    });

    ctx.shadowBlur = 0;

    // Draw food
    ctx.fillStyle = "#ff496c";
    ctx.shadowColor = "#ff496c";
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(
        food.x + box / 2,
        food.y + box / 2,
        box / 2 - 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;
}

// Move the snake
function moveSnake() {
    direction = nextDirection;

    const head = {
        x: snake[0].x,
        y: snake[0].y
    };

    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    // Check wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height
    ) {
        endGame();
        return;
    }

    // Check whether the snake eats food
    const eatingFood =
        head.x === food.x && head.y === food.y;

    // Exclude the tail if it is going to move away
    const bodyToCheck = eatingFood
        ? snake
        : snake.slice(0, -1);

    // Check collision with itself
    if (bodyToCheck.some(part =>
        part.x === head.x && part.y === head.y
    )) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (eatingFood) {
        score += 10;
        scoreElement.textContent = score;

        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }

        food = createFood();

        // Increase difficulty
        if (score % 50 === 0) {
            changeSpeed();
        }
    } else {
        snake.pop();
    }

    drawGame();

    // Check if the player filled the board
    if (snake.length === totalBoxes * totalBoxes) {
        messageTitle.textContent = "YOU WIN!";
        messageText.textContent = "Amazing! You filled the board.";
        stopGame();
    }
}

// Increase snake speed
function changeSpeed() {
    clearInterval(gameInterval);

    const speed = Math.max(55, 130 - score / 5);

    gameInterval = setInterval(moveSnake, speed);
}

// Start the game
function startGame() {
    stopGame();

    initializeGame();

    gameRunning = true;
    gamePaused = false;

    messageBox.classList.add("hidden");
    startBtn.textContent = "RESTART";
    pauseBtn.textContent = "PAUSE";

    gameInterval = setInterval(moveSnake, 130);
}

// Stop the game
function stopGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    gameRunning = false;
}

// Game over
function endGame() {
    stopGame();

    messageTitle.textContent = "GAME OVER!";
    messageText.textContent = "Final Score: " + score;
    messageBox.classList.remove("hidden");
}

// Pause and resume
function togglePause() {
    if (!gameRunning && !gamePaused) return;

    if (gameRunning) {
        clearInterval(gameInterval);
        gameInterval = null;
        gameRunning = false;
        gamePaused = true;

        messageTitle.textContent = "PAUSED";
        messageText.textContent = "Press Resume to continue.";
        messageBox.classList.remove("hidden");
        pauseBtn.textContent = "RESUME";
    } else if (gamePaused) {
        gameRunning = true;
        gamePaused = false;

        messageBox.classList.add("hidden");
        pauseBtn.textContent = "PAUSE";

        gameInterval = setInterval(
            moveSnake,
            Math.max(55, 130 - score / 5)
        );
    }
}

// Change direction
function changeDirection(newDirection) {
    if (!gameRunning) return;

    const opposite = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT"
    };

    if (newDirection !== opposite[direction]) {
        nextDirection = newDirection;
    }
}

// Keyboard controls
document.addEventListener("keydown", function(event) {
    const keys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT"
    };

    const newDirection = keys[event.key];

    if (newDirection) {
        event.preventDefault();
        changeDirection(newDirection);
    }

    if (event.code === "Space") {
        event.preventDefault();
        togglePause();
    }
});

// Mobile controls
document.querySelectorAll("[data-direction]").forEach(button => {
    button.addEventListener("click", function() {
        changeDirection(this.dataset.direction);
    });
});

// Button events
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);

// Show initial game screen
initializeGame();