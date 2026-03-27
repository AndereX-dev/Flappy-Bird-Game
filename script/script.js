let move_speed = 3,
  gravity = 0.5;
let bird = document.querySelector(".bird");
let img = document.getElementById("bird-1");
let jumpSound = new Audio("/sounds/Jump-sound.mp3");
let scoreSound = new Audio("/sounds/Score-point.mp3");
let crashSound = new Audio("/sounds/oof-sound.mp3");

let high_score_val = document.querySelector(".high_score_val");
let highScore = localStorage.getItem("highScore") || 0;

let bird_props = bird.getBoundingClientRect();

let background = document.querySelector(".background").getBoundingClientRect();
let score_val = document.querySelector(".score_val");
let message = document.querySelector(".message");
let score_title = document.querySelector(".score_title");

let game_state = "Start";
let bird_dy = 0;
img.style.display = "none";
message.classList.add("messageStyle");

document.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && game_state != "Play") {
    document.querySelectorAll(".pipe_sprite").forEach((el) => {
      el.remove();
    });
    img.style.display = "block";
    bird.style.top = "40vh";
    bird_dy = 0;
    game_state = "Play";
    message.innerHTML = "";
    score_title.innerHTML = "Score : ";
    score_val.innerHTML = "0";
    document.querySelector(".score").style.display = "block";
    play();
  }

  if ((e.key == "ArrowUp" || e.key == " ") && game_state == "Play") {
    bird_dy = -7.6;
    img.src = "/images/Doge-bird.png";
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

function play() {
  function move() {
    if (game_state != "Play") return;

    let pipe_sprites = document.querySelectorAll(".pipe_sprite");
    pipe_sprites.forEach((element) => {
      let pipe_sprite_props = element.getBoundingClientRect();
      bird_props = bird.getBoundingClientRect();

      if (pipe_sprite_props.right <= 0) {
        element.remove();
      } else {
        if (
          bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
          bird_props.left + bird_props.width > pipe_sprite_props.left &&
          bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
          bird_props.top + bird_props.height > pipe_sprite_props.top
        ) {
          gameOver();
          return;
        } else {
          if (
            pipe_sprite_props.right < bird_props.left &&
            pipe_sprite_props.right + move_speed >= bird_props.left &&
            element.increase_score == "1"
          ) {
            score_val.innerHTML = +score_val.innerHTML + 1;

            scoreSound.currentTime = 0;
            scoreSound.play();
          }
          element.style.left = pipe_sprite_props.left - move_speed + "px";
        }
      }
    });
    requestAnimationFrame(move);
  }
  requestAnimationFrame(move);

  function apply_gravity() {
    if (game_state != "Play") return;

    bird_dy += gravity;
    bird_props = bird.getBoundingClientRect();

    if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
      gameOver();
      return;
    }
    bird.style.top = bird_props.top + bird_dy + "px";
    if (bird_dy < 0) {
      bird.style.transform = "rotate(-20deg)";
    } else if (bird_dy > 5) {
      bird.style.transform = "rotate(45deg)";
    } else {
      bird.style.transform = "rotate(0deg)";
    }
    requestAnimationFrame(apply_gravity);
  }
  requestAnimationFrame(apply_gravity);

  let pipe_separation = 0;
  let pipe_gap = 35;

  function create_pipe() {
    if (game_state != "Play") return;

    if (pipe_separation > 115) {
      pipe_separation = 0;
      let pipe_posi = Math.floor(Math.random() * 43) + 8;

      let pipe_inv = document.createElement("div");
      pipe_inv.className = "pipe_sprite";
      pipe_inv.style.top = pipe_posi - 70 + "vh";
      pipe_inv.style.left = "100vw";
      document.body.appendChild(pipe_inv);

      let pipe = document.createElement("div");
      pipe.className = "pipe_sprite";
      pipe.style.top = pipe_posi + pipe_gap + "vh";
      pipe.style.left = "100vw";
      pipe.increase_score = "1";
      document.body.appendChild(pipe);
    }
    pipe_separation++;
    requestAnimationFrame(create_pipe);
  }
  requestAnimationFrame(create_pipe);
}

function gameOver() {
  game_state = "End";

  crashSound.play();

  let currentScore = parseInt(score_val.innerHTML);
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem("highScore", highScore);
    high_score_val.innerHTML = highScore;
  }
  message.innerHTML =
    "Game Over".fontcolor("red") + "<br>Press ENTER to Restart";
  message.classList.add("messageStyle");
  img.style.display = "none";
}
