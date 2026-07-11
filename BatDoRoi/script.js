const board = document.getElementById("gameBoard");
const player = document.getElementById("player");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");
const bestScoreElement = document.getElementById("bestScore");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");

const STORAGE_KEY = "catchAndDodgeBestScore";
const PLAYER_BOTTOM = 22;
const PLAYER_SPEED = 470;
const MAX_LIVES = 5;

const itemTypes = {
    fruit: {
        className: "fruit",
        score: 10,
        damage: 0,
        chance: 0.58
    },
    heart: {
        className: "heart",
        score: 0,
        damage: 0,
        chance: 0.08
    },
    rock: {
        className: "rock",
        score: 0,
        damage: 1,
        chance: 0.22
    },
    bomb: {
        className: "bomb",
        score: 0,
        damage: 2,
        chance: 0.12
    }
};

let score = 0;
let lives = 3;
let level = 1;
let bestScore = Number(localStorage.getItem(STORAGE_KEY)) || 0;
let playerX = 0;
let moveDirection = 0;
let isPlaying = false;
let isPaused = false;
let lastTime = 0;
let spawnTimer = 0;
let animationId = 0;
let fallingItems = [];

bestScoreElement.textContent = bestScore;

function getBoardWidth() {
    return board.clientWidth;
}

function getBoardHeight() {
    return board.clientHeight;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function setPlayerPosition(value) {
    const maxX = getBoardWidth() - player.offsetWidth;
    playerX = clamp(value, 0, maxX);
    player.style.left = `${playerX}px`;
    player.style.transform = "none";
}

function getPlayerRect() {
    return {
        left: playerX,
        right: playerX + player.offsetWidth,
        top: getBoardHeight() - PLAYER_BOTTOM - player.offsetHeight,
        bottom: getBoardHeight() - PLAYER_BOTTOM
    };
}

function updateScoreBoard() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    bestScoreElement.textContent = bestScore;
}

function updateLevel() {
    level = Math.floor(score / 80) + 1;
}

function clearItems() {
    fallingItems.forEach((item) => item.element.remove());
    fallingItems = [];
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    spawnTimer = 0;
    moveDirection = 0;
    clearItems();
    setPlayerPosition((getBoardWidth() - player.offsetWidth) / 2);
    updateScoreBoard();
}

function showOverlay(title, text, buttonText) {
    overlay.querySelector("h1").textContent = title;
    message.textContent = text;
    startButton.textContent = buttonText;
    overlay.classList.remove("hidden");
}

function hideOverlay() {
    overlay.classList.add("hidden");
}

function startGame() {
    resetGame();
    isPlaying = true;
    isPaused = false;
    lastTime = performance.now();
    pauseButton.textContent = "Tạm dừng";
    hideOverlay();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

function pauseGame() {
    if (!isPlaying || isPaused) {
        return;
    }

    isPaused = true;
    pauseButton.textContent = "Tiếp tục";
    showOverlay("Tạm dừng", "Nhấn tiếp tục hoặc phím Space để chơi tiếp.", "Chơi lại");
}

function resumeGame() {
    if (!isPlaying || !isPaused) {
        return;
    }

    isPaused = false;
    lastTime = performance.now();
    pauseButton.textContent = "Tạm dừng";
    hideOverlay();
    animationId = requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (!isPlaying) {
        return;
    }

    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function endGame() {
    isPlaying = false;
    isPaused = false;
    cancelAnimationFrame(animationId);

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(STORAGE_KEY, String(bestScore));
    }

    updateScoreBoard();
    showOverlay("Kết thúc", `Bạn đạt ${score} điểm ở cấp ${level}. Nhấn chơi lại để thử tiếp.`, "Chơi lại");
}

function chooseItemType() {
    const roll = Math.random();
    let total = 0;

    for (const [type, config] of Object.entries(itemTypes)) {
        total += config.chance;
        if (roll <= total) {
            return type;
        }
    }

    return "fruit";
}

function createFallingItem() {
    const type = chooseItemType();
    const config = itemTypes[type];
    const size = type === "bomb" ? 42 : 38;
    const x = getRandomNumber(0, getBoardWidth() - size);
    const baseSpeed = 160 + level * 20;
    const speed = getRandomNumber(baseSpeed, baseSpeed + 120);
    const element = document.createElement("div");

    element.className = `falling-item ${config.className}`;
    element.style.left = `${x}px`;
    element.style.top = `-${size}px`;
    board.appendChild(element);

    fallingItems.push({
        element,
        type,
        x,
        y: -size,
        size,
        speed
    });
}

function isOverlap(rectA, rectB) {
    return (
        rectA.left < rectB.right &&
        rectA.right > rectB.left &&
        rectA.top < rectB.bottom &&
        rectA.bottom > rectB.top
    );
}

function getItemRect(item) {
    return {
        left: item.x,
        right: item.x + item.size,
        top: item.y,
        bottom: item.y + item.size
    };
}

function handleGoodItem(type) {
    if (type === "fruit") {
        score += itemTypes.fruit.score;
    }

    if (type === "heart") {
        lives = Math.min(MAX_LIVES, lives + 1);
        score += 5;
    }
}

function handleBadItem(type) {
    lives -= itemTypes[type].damage;
}

function handleMissedGoodItem(type) {
    if (type === "fruit") {
        lives -= 1;
    }
}

function handleCollision(item) {
    if (item.type === "fruit" || item.type === "heart") {
        handleGoodItem(item.type);
    } else {
        handleBadItem(item.type);
    }

    updateLevel();
    updateScoreBoard();

    if (lives <= 0) {
        endGame();
    }
}

function removeItem(item) {
    item.element.remove();
}

function updateFallingItems(delta) {
    const playerRect = getPlayerRect();

    fallingItems = fallingItems.filter((item) => {
        item.y += item.speed * delta;
        item.element.style.top = `${item.y}px`;

        if (isOverlap(getItemRect(item), playerRect)) {
            removeItem(item);
            handleCollision(item);
            return false;
        }

        if (item.y > getBoardHeight()) {
            removeItem(item);
            handleMissedGoodItem(item.type);
            updateScoreBoard();

            if (lives <= 0) {
                endGame();
            }

            return false;
        }

        return true;
    });
}

function updatePlayer(delta) {
    if (moveDirection !== 0) {
        setPlayerPosition(playerX + moveDirection * PLAYER_SPEED * delta);
    }
}

function updateSpawner(delta) {
    spawnTimer -= delta;

    if (spawnTimer <= 0) {
        createFallingItem();
        spawnTimer = clamp(0.95 - level * 0.07, 0.28, 0.95);
    }
}

function gameLoop(currentTime) {
    if (!isPlaying || isPaused) {
        return;
    }

    const delta = Math.min((currentTime - lastTime) / 1000, 0.035);
    lastTime = currentTime;

    updatePlayer(delta);
    updateSpawner(delta);
    updateFallingItems(delta);

    if (isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function movePlayerToPointer(event) {
    const rect = board.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    setPlayerPosition(pointerX - player.offsetWidth / 2);
}

function setDirectionFromKey(key, direction) {
    const normalizedKey = key.toLowerCase();

    if (key === "ArrowLeft" || normalizedKey === "a") {
        moveDirection = direction;
    }

    if (key === "ArrowRight" || normalizedKey === "d") {
        moveDirection = direction;
    }
}

document.addEventListener("keydown", (event) => {
    setDirectionFromKey(event.key, event.key === "ArrowLeft" || event.key.toLowerCase() === "a" ? -1 : 1);

    if (event.key === " ") {
        event.preventDefault();
        togglePause();
    }
});

document.addEventListener("keyup", (event) => {
    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "a" ||
        event.key.toLowerCase() === "d"
    ) {
        moveDirection = 0;
    }
});

board.addEventListener("pointermove", (event) => {
    if (isPlaying && !isPaused) {
        movePlayerToPointer(event);
    }
});

leftButton.addEventListener("pointerdown", () => {
    moveDirection = -1;
});

rightButton.addEventListener("pointerdown", () => {
    moveDirection = 1;
});

document.addEventListener("pointerup", () => {
    moveDirection = 0;
});

startButton.addEventListener("click", () => {
    if (isPlaying && isPaused) {
        startGame();
        return;
    }

    startGame();
});

pauseButton.addEventListener("click", togglePause);

window.addEventListener("resize", () => {
    setPlayerPosition(playerX);
});

setPlayerPosition((getBoardWidth() - player.offsetWidth) / 2);
