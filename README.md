# Sidestep3D: FreeToPlay

Sidestep3D is a dynamic 3D browser game where players must navigate obstacles, avoid enemies, and achieve the highest score possible. Built with Three.js and Howler.js, the game features engaging visuals, smooth animations, and immersive sound effects. This document serves as a guide to understanding the structure, functionality, and purpose of the project.

---

## Features
- **Player Movement**: Control the cube using the `A/D` or `Arrow Left/Arrow Right` keys to sidestep obstacles.
- **Enemy Generation**: Enemies spawn dynamically with increasing difficulty as the game progresses.
- **Score System**: Gain points as you outpace enemies, with a real-time scoreboard.
- **Collision Detection**: Detect collisions between the player, ground, and enemies to determine game over.
- **Sound Effects**: Background music and game-over sounds enhance the gaming experience.
- **Responsive Design**: Adapts to different screen sizes and maintains performance across devices.

---

## File Structure
- **index.html**: Contains the game’s HTML structure, including buttons, scoreboard, and game messages.
- **style.css**: Defines the visual layout and styling for the game interface.
- **script.js**: Implements the game logic, physics, rendering, and controls.

---

## Setup
### Prerequisites
- A modern browser (e.g., Chrome, Firefox) that supports WebGL and ES6 modules.
- Internet connection to fetch dependencies from CDNs.

### Steps to Run
1. Download or clone the repository.
2. Ensure the following assets are available in the same directory:
   - `glass.avif`: Texture for objects.
   - `TestBackground.png`: Background image.
   - `Meow.mp3`: Game-over sound.
   - `8bitVersion.mp3`: Background music.
   - `Sidestep3D.png`: Start screen logo.
3. Open `index.html` in your browser.
4. Click the **Start Game** button to begin playing.

---

## Gameplay Instructions
1. **Start the Game**:
   - Press the **Start Game** button on the main screen.
2. **Controls**:
   - Move Left: `A` or `Arrow Left`
   - Move Right: `D` or `Arrow Right`
3. **Objective**:
   - Avoid enemies and increase your score by outpacing them.
4. **Game Over**:
   - The game ends if your cube falls off the platform or collides with an enemy.
   - Press the **Restart** button to try again.

---

## Key Components
### 1. **Scene, Camera, and Renderer**
- Sets up the 3D environment, with a perspective camera and WebGL renderer.

### 2. **Player Cube**
- A controllable box that moves left and right to avoid obstacles.

### 3. **Enemies**
- Automatically spawn and move towards the player with increasing speed over time.

### 4. **Ground**
- A static platform on which the player and enemies interact.

### 5. **Collision Detection**
- Ensures realistic interactions between the player, enemies, and ground.

### 6. **Sound Effects**
- Integrated with Howler.js for background music and sound cues.

---

## Technical Highlights
1. **Three.js**:
   - Manages 3D rendering and object creation.
2. **Howler.js**:
   - Provides sound playback and control.
3. **Dynamic Difficulty**:
   - Enemy spawn rate decreases as the game progresses, increasing the challenge.
4. **Responsive Camera**:
   - Tracks the player’s movement, maintaining an optimal view of the action.

---

## Future Improvements
- Add more enemy types with varied behaviors.
- Introduce power-ups and bonuses.
- Save high scores locally or in the cloud.
- Implement touch controls for mobile devices.

---

## Credits
- **Game Development**: [Your Name/Team]
- **Libraries Used**:
  - [Three.js](https://threejs.org/): 3D Rendering.
  - [Howler.js](https://howlerjs.com/): Sound Management.
- **Assets**:
  - Textures, sounds, and background images are placeholders and can be replaced with custom designs.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

Enjoy playing Sidestep3D and aim for the highest score!

