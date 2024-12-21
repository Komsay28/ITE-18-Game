// === IMPORTS ===
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// === SCENE, CAMERA, RENDERER, AND CONTROLS SETUP ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// === TEXTURE LOADER ===
const textureLoader = new THREE.TextureLoader();
const glassTexture = textureLoader.load('glass.avif');

// === SCOREBOARD SETUP ===
const scoreboard = document.getElementById('scoreboard');
let score = 0;

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
    this.gravity = -0.002;
    this.zAcceleration = zAcceleration;
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
    if (this.zAcceleration) this.velocity.z += 0.0003;
    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;
    this.applyGravity(ground);
  }

  // Apply gravity and collision check with the ground
  applyGravity(ground) {
    this.velocity.y += this.gravity;
    if (boxCollision({ box1: this, box2: ground })) {
      const friction = 0.5;
      this.velocity.y *= friction;
      this.velocity.y = -this.velocity.y; // Bounce effect
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

// === GROUND CREATION ===
const ground = new Box({
  width: 10,
  height: 0.05,
  depth: 100,
  color: '#38CFFF', // Ground color
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
};

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
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
const gameOverSound = new Howl({ src: ['Meow.mp3'] });
const gamePlaySound = new Howl({ src: ['8bitVersion.mp3'] });

// === GAME OVER LOGIC ===
let gameOver = false;

// === BUTTON LOGIC ===
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
  gameOverSound.stop();
  startGame();
});

const startButton = document.getElementById('startButton');
const startImage = document.getElementById('startImage');
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  startImage.style.display = 'none';
  
  startGame();
});
// === ANIMATION LOOP ===
function animate() {
  if (gameOver) {
    startButton.style.display = 'block';
    return;
  }
  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  cube.velocity.x = 0;

  if (keys.a.pressed) cube.velocity.x = -0.05;
  else if (keys.d.pressed) cube.velocity.x = 0.05;

  cube.update(ground);

  if (cube.position.y < -10) {
    console.log('Game Over');
    gameOver = true;
    gamePlaySound.stop();
    gameOverSound.play();
    document.getElementById('gameOverMessage').style.display = 'block';
    cancelAnimationFrame(animationId);
    return;
  }

  enemies.forEach((enemy) => {
    enemy.update(ground);
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
    if (spawnRate > 20) spawnRate -= 20;
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
