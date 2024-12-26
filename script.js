// === IMPORTS ===
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Howl } from 'howler';

// === SCENE, CAMERA, RENDERER, AND CONTROLS SETUP ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

//Lighting
const moonlight = new THREE.AmbientLight( 0x5F82FF, 0.2 ); // soft blue light
scene.add( moonlight );

const directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 3.0 ); //Gray light
scene.add( directionalLight );

// === TEXTURE LOADER ===
const textureLoader = new THREE.TextureLoader();
const glassTexture = textureLoader.load('/texture/glass.avif');

// === SCOREBOARD SETUP ===
const scoreboard = document.getElementById('scoreboard');
let score = 0;
const scoreThreshold1 = 50;  //Red
const scoreThreshold2 = 150; //Orange
const scoreThreshold3 = 250; //Yellow
const scoreThreshold4 = 400; //Green


// === BOX CLASS ===
// Used for creating cubes, enemies, and the ground
class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#ffffff',
    velocity = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
    zAcceleration = false,
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ map: glassTexture, color })
    );

    this.width = width;
    this.height = height;
    this.depth = depth;
    this.position.set(position.x, position.y, position.z);

    // Initialize sides
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;

    // Velocity and gravity initialization
    this.velocity = velocity;
    this.gravity = -0.002;  // Gravity value
    this.zAcceleration = zAcceleration;  // If true, enables acceleration in the Z-axis
  }

  // Update the bounding sides of the box
  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  // Update box movement and gravity effect
  update(ground) {
    this.updateSides();
    
    if(score >= scoreThreshold1 && score < scoreThreshold2){
      directionalLight.color.set(currentColor); //Change to red
    }
    else if(score >= scoreThreshold2 && score < scoreThreshold3){
      directionalLight.color.set(0xFF8A00); //Change to orange
    }
    else if(score >= scoreThreshold3 && score < scoreThreshold4){
      directionalLight.color.set(0xffff00); //Change to yellow
    }
    else if(score >= scoreThreshold4){
      directionalLight.color.set(0x37FF2C); //Change to green
    }
    else {
      directionalLight.color.set(0xaaaaaa); // Revert to initial color
    }
    
   
    // Apply z-axis acceleration if enabled
    if (this.zAcceleration) {
      this.velocity.z += 0.004; // You can change this value to control the acceleration
    }

    // Apply velocity to position
    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;

    // Apply gravity only for enemies or other objects that need it
    if (this !== cube) { // Skip gravity for the player cube
      this.applyGravity(ground);
    }

    // Apply gravity for the player cube only when it's not colliding with the ground
    if (this === cube && !boxCollision({ box1: this, box2: ground })) {
      this.velocity.y += this.gravity;
      this.position.y += this.velocity.y;
    }
  }

  // Apply gravity and collision check with the ground
  applyGravity(ground) {
    this.velocity.y += this.gravity;
    if (boxCollision({ box1: this, box2: ground }) && this.velocity.y < 0) {
      const friction = 0.5;
      this.velocity.y *= friction;
      this.velocity.y = -this.velocity.y; // Bounce effect
      this.position.y = ground.position.y + ground.height / 2 + this.height / 2; // Prevent falling below the ground
    } else {
      this.position.y += this.velocity.y;
    }
  }
}

// === COLLISION CHECK FUNCTION ===
function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;

  return xCollision && yCollision && zCollision;
}
//Colors
let groundColor = new THREE.Color(0x38CFFF); // OG ground color
let currentColor = new THREE.Color(0xff0000); // color change
// === GROUND CREATION ===
const ground = new Box({
  width: 10,
  height: 0.05,
  depth: 100,
  color: groundColor, // Ground color
  transparent: true,
  opacity: 0.5,
  position: {
    x: 0,
    y: -2,
    z: 0,
  },
});
ground.receiveShadow = true;
scene.add(ground);

// === PLAYER CUBE CREATION ===
const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: 0,
    z: 0,
  },
});
cube.position.set(0, ground.position.y + ground.height / 2 + 0.5, ground.position.z - 30);
cube.castShadow = true;
scene.add(cube);

// === LIGHT SETUP ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 3;
light.position.z = 1;
light.castShadow = true;
scene.add(light);

// === AMBIENT LIGHT ===
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// === CAMERA SETUP ===
camera.position.set(0, 2, 4); 
camera.lookAt(cube.position);

// === MOVEMENT CONTROLS (A AND D KEYS) ===
const keys = {
  a: { pressed: false },
  d: { pressed: false },
  arrowRight: { pressed: false },
  arrowLeft: { pressed: false },  
};

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
    case 'ArrowRight':
      keys.arrowRight.pressed = true;
      break;
    case 'ArrowLeft':
      keys.arrowLeft.pressed = true;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
    case 'ArrowRight':
      keys.arrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.arrowLeft.pressed = false;
      break;
  }
});

// === ENEMIES ARRAY AND SPAWN RATE ===
const enemies = [];
let frames = 0;
let spawnRate = 200;

// === SCORE UPDATE FUNCTION ===
function updateScore() {
  enemies.forEach((enemy) => {
    if (enemy.position.z > cube.position.z) {
      score++;
      scoreboard.textContent = `Score: ${score}`;
      scene.remove(enemy);
      enemies.splice(enemies.indexOf(enemy), 1);
    }
  });
}

// === GAME STATE FUNCTIONS ===
function startGame() {
  gameOver = false;
  frames = 0;
  spawnRate = 200;

  // Start the music when the game begins
  gamePlaySound.play();

  score = 0;
  scoreboard.textContent = `Score: ${score}`;

  enemies.forEach((enemy) => {
    scene.remove(enemy);
  });
  enemies.length = 0;

  cube.position.set(0, ground.position.y + ground.height / 2 + 0.5, ground.position.z + ground.depth / 2);
  cube.velocity = { x: 0, y: 0, z: 0 };

  document.getElementById('gameOverMessage').style.display = 'none';
  animate();
}

// === SOUNDS SETUP ===
const gameOverSound = new Howl({ src: ['/texture/cat.mp3'] });
const gamePlaySound = new Howl({ src: ['/texture/8bitVersion.mp3'], loop: true });

// === GAME OVER LOGIC ===
let gameOver = false;

// === BUTTON LOGIC ===
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
  gameOverSound.stop();
  startGame();
  gamePlaySound.play();
});

const startButton = document.getElementById('startButton');
const startImage = document.getElementById('startImage');
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  startImage.style.display = 'none';
  
  startGame();
});

// === COLLISION CHECK FOR GAME OVER ===
function checkGameOver() {
  if (cube.position.y < -10 || enemies.some((enemy) => boxCollision({ box1: cube, box2: enemy}))) {
    console.log('Game Over');
    gameOver = true;
    gamePlaySound.stop();  // Stop music when the game is over
    gameOverSound.play();
    document.getElementById('gameOverMessage').style.display = 'block';
    return true;
  }
  return false;
}

// === ANIMATION LOOP ===
function animate() {
  if (gameOver) {
    startButton.style.display = 'block';
    return;
  }
  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  cube.velocity.x = 0;

  if (keys.a.pressed || keys.arrowLeft.pressed) cube.velocity.x = -0.1;
  else if (keys.d.pressed || keys.arrowRight.pressed) cube.velocity.x = 0.1;

  cube.update(ground);

  if (checkGameOver()) {
    cancelAnimationFrame(animationId);
    return;
  }

  enemies.forEach((enemy) => {
    enemy.update(ground, score);
    if (boxCollision({ box1: cube, box2: enemy })) {
      console.log('Game Over: Collision with enemy');
      gameOver = true;
      gamePlaySound.stop();
      gameOverSound.play();
      document.getElementById('gameOverMessage').style.display = 'block';
      cancelAnimationFrame(animationId);
      return;
    }
  });

  updateScore();
  

  if (frames % spawnRate === 0) {
    if (spawnRate > 10) spawnRate -= 10;
    const enemy = new Box({
      width: 0.5,
      height: 2.1,
      depth: 0.1,
      position: {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: -20,
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.01,
      },
      color: 'red',
      zAcceleration: true,
    });
    enemy.castShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
  }

  const cameraOffset = new THREE.Vector3(0, 5 , 10);
  camera.position.copy(cube.position.clone().add(cameraOffset));
  camera.lookAt(cube.position);

  frames++;
}
