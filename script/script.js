let pauseMenu = document.getElementById("pauseMenu");
let move_speed = 3;
let gravity = 0.5;
let highScore = localStorage.getItem("highScore") || 0;
let bird = document.querySelector(".bird");
let img = document.getElementById("bird-1");
let jumpSound = new Audio("/sounds/Jump-sound.mp3");
let scoreSound = new Audio("/sounds/Score-point.mp3");
let crashSound = new Audio("/sounds/oof-sound.mp3");

let high_score_val = document.querySelector(".high_score_val");
if (high_score_val) {
  high_score_val.innerHTML = highScore;
}

let score_val = document.querySelector(".score_val");
let message = document.querySelector(".message");
let score_title = document.querySelector(".score_title");

let game_state = "Start";
let bird_dy = 0;
let pipe_separation = 0;
let pipe_gap = 35;

img.style.display = "none";
message.classList.add("messageStyle");

function startGame() {
  document.getElementById("startMenu").style.display = "none";
  initGame();
}

function showCharacterMenu() {
  document.getElementById("startMenu").style.display = "none";
  document.getElementById("charMenu").style.display = "block";
}

function hideCharacterMenu() {
  document.getElementById("charMenu").style.display = "none";
  document.getElementById("startMenu").style.display = "block";
}

function selectChar(imgName) {
  const birdImg = document.querySelector(".bird");
  birdImg.src = "/images/" + imgName;
  document.getElementById("menuBird").src = "/images/" + imgName;

  localStorage.setItem("selectedChar", imgName);
  hideCharacterMenu();
}

function initGame() {
  document.querySelectorAll(".pipe_sprite").forEach((el) => el.remove());
  img.style.display = "block";
  bird.style.top = "300px";
  bird_dy = 0;
  pipe_separation = 0;
  game_state = "Play";
  message.innerHTML = "";
  score_title.innerHTML = "Score : ";
  score_val.innerHTML = "0";
  message.classList.remove("messageStyle");

  requestAnimationFrame(move);
  requestAnimationFrame(apply_gravity);
  requestAnimationFrame(create_pipe);
}

window.onload = () => {
  let savedChar = localStorage.getItem("selectedChar");
  if (savedChar) {
    selectChar(savedChar);
  }
};

document.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && game_state != "Play") {
    document.querySelectorAll(".pipe_sprite").forEach((el) => el.remove());
    img.style.display = "block";
    bird.style.top = "300px";
    bird_dy = 0;
    pipe_separation = 0;
    game_state = "Play";
    message.innerHTML = "";
    score_title.innerHTML = "Score : ";
    score_val.innerHTML = "0";
    message.classList.remove("messageStyle");

    requestAnimationFrame(move);
    requestAnimationFrame(apply_gravity);
    requestAnimationFrame(create_pipe);
  }

  if ((e.key == "ArrowUp" || e.key == " ") && game_state == "Play") {
    bird_dy = -7.6;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }

  if (e.key == "Escape") {
    if (game_state == "Play") {
      game_state = "Paused";
      pauseMenu.style.display = "block";
    } else if (game_state == "Paused") {
      game_state = "Play";
      pauseMenu.style.display = "none";

      requestAnimationFrame(move);
      requestAnimationFrame(apply_gravity);
      requestAnimationFrame(create_pipe);
    }
  }
});

function move() {
  if (game_state !== "Play") return;
  if (game_state == "Play") {
    let pipe_sprites = document.querySelectorAll(".pipe_sprite");
    pipe_sprites.forEach((element) => {
      let pipe_props = element.getBoundingClientRect();
      let bird_props = bird.getBoundingClientRect();

      if (pipe_props.right <= 0) {
        element.remove();
      } else {
        // Kollisjonssjekk
        if (
          bird_props.left + 20 < pipe_props.left + pipe_props.width &&
          bird_props.left + bird_props.width - 20 > pipe_props.left &&
          bird_props.top + 20 < pipe_props.top + pipe_props.height &&
          bird_props.top + bird_props.height - 20 > pipe_props.top
        ) {
          gameOver();
        } else {
          // Poengsjekk
          if (
            pipe_props.right < bird_props.left &&
            element.dataset.passed !== "true" &&
            element.increase_score == "1"
          ) {
            score_val.innerHTML = +score_val.innerHTML + 1;
            element.increase_score = "0";
            element.dataset.passed = "true";

            scoreSound.currentTime = 0;
            scoreSound.play();
          }
          element.style.left = pipe_props.left - move_speed + "px";
        }
      }
    });
  }
  requestAnimationFrame(move);
}

function apply_gravity() {
  if (game_state !== "Play") return;
  if (game_state == "Play") {
    bird_dy += gravity;
    let current_top = parseFloat(bird.style.top);
    if (isNaN(current_top)) current_top = 300;

    let new_top = current_top + bird_dy;
    bird.style.top = new_top + "px";
    let bird_props = bird.getBoundingClientRect();
    let bg_props = document
      .querySelector(".background")
      .getBoundingClientRect();

    if (bird_props.bottom >= bg_props.bottom - 20) {
      gameOver();
      return;
    }
    let rotation = Math.min(Math.max(bird_dy * 4, -20), 45);
    bird.style.transform = `rotate(${rotation}deg)`;
  }
  requestAnimationFrame(apply_gravity);
}

function create_pipe() {
  if (game_state !== "Play") return;
  if (game_state == "Play") {
    if (pipe_separation > 130) {
      pipe_separation = 0;
      let pipe_posi = Math.floor(Math.random() * 43) + 8;

      let pipe_inv = document.createElement("div");
      pipe_inv.className = "pipe_sprite";
      pipe_inv.style.top = pipe_posi - 70 + "vh";
      pipe_inv.style.left = "100vw";
      pipe_inv.increase_score = "0";
      document.body.appendChild(pipe_inv);

      let pipe = document.createElement("div");
      pipe.className = "pipe_sprite";
      pipe.style.top = pipe_posi + pipe_gap + "vh";
      pipe.style.left = "100vw";
      pipe.increase_score = "1";
      document.body.appendChild(pipe);
    }
    pipe_separation++;
  }
  requestAnimationFrame(create_pipe);
}

requestAnimationFrame(move);
requestAnimationFrame(apply_gravity);
requestAnimationFrame(create_pipe);

function gameOver() {
  if (game_state == "End") return;
  game_state = "End";
  crashSound.play();

  let currentScore = parseInt(score_val.innerHTML);
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem("highScore", highScore);
    high_score_val.innerHTML = highScore;
  }
  message.innerHTML =
    "<span style='color: red;'>Game Over</span><br>Press ENTER to Restart";
  message.classList.add("messageStyle");
  img.style.display = "none";
}
