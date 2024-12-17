import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Scoreboard setup
const scoreboard = document.getElementById('scoreboard');
let score = 0;

// Box Class for creating 3D cubes (cube, ground, enemies)
class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#00ff00', // Default green
    velocity = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
    zAcceleration = false,
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    );

    // Assign geometry properties
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.position.set(position.x, position.y, position.z);

    // Initialize the sides of the box
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

  // Update the bounding sides of the box based on its position
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

// Check collision between two boxes
function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;

  return xCollision && yCollision && zCollision;
}

// Create ground box
const ground = new Box({
  width: 10,
  height: 0.05,
  depth: 100,
  color: '#0369a1', // Ground color
  position: {
    x: 0,
    y: -2, // Position the ground slightly lower than the cube
    z: 0,
  },
});
ground.receiveShadow = true;
scene.add(ground);

// Create the cube box
const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0,
  },
});
cube.position.set(0, ground.position.y + ground.height / 2 + 1, 0);
cube.castShadow = true;
scene.add(cube);

// Create light source
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 3;
light.position.z = 1;
light.castShadow = true;
scene.add(light);

// Ambient light for softer illumination
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

camera.position.set(0, 2, 4); // Camera is placed closer (adjust as needed)
camera.lookAt(cube.position); // Camera looks directly at the cube

// Movement controls (only A and D keys for left and right movement)
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

// Array for enemies
const enemies = [];
let frames = 0;
let spawnRate = 200;

// Function to update the score
function updateScore() {
  // Increment the score for each enemy that has passed the cube
  enemies.forEach((enemy) => {
    if (enemy.position.z > cube.position.z) {
      // If the enemy's z position is greater than the cube, it has passed
      score++;
      // Update the scoreboard display
      scoreboard.textContent = `Score: ${score}`;
      // Remove the enemy from the scene after it has passed
      scene.remove(enemy);
      // Remove the enemy from the enemies array
      const index = enemies.indexOf(enemy);
      if (index > -1) {
        enemies.splice(index, 1);
      }
    }
  });
}

// Function to start the game
function startGame() {
  gameOver = false;
  frames = 0;
  spawnRate = 200;

  //reset the score
  score = 0;
  scoreboard.textContent = `Score: ${score}`; //update the displayed score
  // Clear enemies and reset cube
  enemies.forEach((enemy) => {
    scene.remove(enemy); // Remove each enemy from the scene
  });
  enemies.length = 0; // Clear the enemies array

  cube.position.set(0, ground.position.y + ground.height / 2 + 0.5, ground.position.z + ground.depth / 2);
  cube.velocity = { x: 0, y: -0.01, z: 0 };

  // Hide the game over message and button
  document.getElementById('gameOverMessage').style.display = 'none';

  animate();
}

// Add logic to handle game over
let gameOver = false;
let restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
  startGame();  // Start a new game when the restart button is clicked
});

// Animation loop
function animate() {
  if (gameOver) return;

  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // Reset cube's velocity to prevent continuous movement
  cube.velocity.x = 0;

  // Control cube movement (only left and right with A and D keys)
  if (keys.a.pressed) cube.velocity.x = -0.05;
  else if (keys.d.pressed) cube.velocity.x = 0.05;

  // Update the cube's position based on velocity
  cube.update(ground);

  // End game if the cube falls off the ground
  if (cube.position.y < -10) {
    console.log('Game Over');
    gameOver = true;
    document.getElementById('gameOverMessage').style.display = 'block'; // Show restart button
    cancelAnimationFrame(animationId); // Stop the animation
    return; // Stop further execution
  }

  // Update enemies and check for collisions with the cube
  enemies.forEach((enemy) => {
    enemy.update(ground);
    if (boxCollision({ box1: cube, box2: enemy })) {
      console.log('Game Over: Collision with enemy');
      gameOver = true;
      document.getElementById('gameOverMessage').style.display = 'block'; // Show restart button
      cancelAnimationFrame(animationId); // Stop the animation
      return; // Stop further execution
    }
  });

  // Update the score by checking for passed enemies
  updateScore();

  // Spawn enemies at a defined rate
  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 20; // Increase spawn speed over time

    const enemy = new Box({
      width: 1,
      height: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 10, // Random position along x-axis
        y: 0, // Start at ground level
        z: -20, // Spawn in front of the camera
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.005, // Move slowly towards the camera
      },
      color: 'red', // Enemy color
      zAcceleration: true,
    });
    enemy.castShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
  }

  // Make the camera follow the cube
  const cameraOffset = new THREE.Vector3(0, 5 , 10); // Offset above and behind the cube
  camera.position.copy(cube.position.clone().add(cameraOffset));
  camera.lookAt(cube.position); // Ensure the camera always looks at the cube

  frames++;
}

// Start the game
startGame();
