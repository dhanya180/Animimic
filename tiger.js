import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initialize(callback) {
  const loader = new GLTFLoader().setPath('tiger/');
  loader.load('tiger.gltf', (gltf) => {
      const tigerModel = gltf.scene;
      tigerModel.scale.set(0.5, 0.5, 0.5);  // Adjust scale if necessary

      // Pass the loaded model to the callback
      callback(tigerModel);
  });
}
// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Scene setup
const scene = new THREE.Scene();

// Camera setup (closer position for zoom)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 5.5, 3); // Move camera closer to the model

// Orbit controls setup for zoom control
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4; // Minimum zoom distance
controls.maxDistance = 13; // Maximum zoom distance
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2;

// Ground setup
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// SpotLight setup
const spotLight = new THREE.SpotLight(0xffffff, 4000, 100, 0.22, 1);
spotLight.position.set(0, 15, 25);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// Variable to store the loaded model
let tigerModel;

// Load model and focus the camera on it
const loader = new GLTFLoader().setPath('tiger/');
loader.load('tiger.gltf', (gltf) => {
  console.log('loading model');
  const mesh = gltf.scene;

  // Save reference to the model for later use in animation
  tigerModel = mesh;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Position the model correctly and add to the scene
  mesh.position.set(0, 1.05, 0); // Adjust position based on the model's size
  scene.add(mesh);

  // Hide any progress indicators (if any)
  document.getElementById('progress-container').style.display = 'none';

  // Focus the camera on the model by setting controls target
  controls.target.set(0, 1.05, 0); // Focus on model's central position
  controls.update(); // Immediately apply changes to controls
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

// Variables for turning animation
let isTurning = false; // Track whether the dog is in the middle of a turn
let turnSpeed = 0.05; // Speed of the turning
let turnDirection = 1; // 1 for clockwise, -1 for counter-clockwise
let turnAmount = 0; // Keep track of how much we've turned

// Variables for jumping animation
let isJumping = false; // Track whether the dog is jumping
let jumpHeight = 0.3; // Maximum jump height
let jumpSpeed = 0.007; // Speed of the jump
let jumpDirection = 0; // Control the jump phase (0: down, 1: up)

// Audio setup
const listener = new THREE.AudioListener(); // Create an audio listener and attach it to the camera
camera.add(listener);

const sound = new THREE.Audio(listener); // Create the sound object using the listener
const audioLoader = new THREE.AudioLoader();
audioLoader.load('audio/roar.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(false); // Play only once
  sound.setVolume(1.0); // Set the volume
});

// Add event listeners for buttons
const jumpButton = document.getElementById('jump');
const turnLeftButton = document.getElementById('turnleft');
const turnRightButton = document.getElementById('turnright');
const playSoundButton = document.getElementById('playsound'); // Add play sound button reference

// Function to trigger a turn
function turn(direction) {
  if (!isTurning && !isJumping) {
    isTurning = true;
    turnDirection = direction; // 1 for clockwise, -1 for counter-clockwise
    turnAmount = 0; // Reset the turn amount for a new turn
  }
}

// Function to trigger a jump
function jump() {
  if (!isJumping && !isTurning) {
    isJumping = true; // Start the jump
    jumpDirection = 1; // Begin moving up
  }
}

// Event listener to play sound
playSoundButton.addEventListener('click', () => {
  if (!sound.isPlaying) {
    sound.play(); // Play the bark sound
  }
});

jumpButton.addEventListener('click', jump);
turnLeftButton.addEventListener('click', () => turn(-1)); // Counter-clockwise turn
turnRightButton.addEventListener('click', () => turn(1)); // Clockwise turn

// Get all buttons
const buttons = document.querySelectorAll('.ButtonLeft button, .ButtonRight button');

// Function to remove 'selected' class from all buttons
function clearSelectedButtons() {
  buttons.forEach(button => button.classList.remove('selected'));
}

// Add event listeners to buttons for selection
buttons.forEach(button => {
  button.addEventListener('click', () => {
    clearSelectedButtons(); // Clear 'selected' class from all buttons
    button.classList.add('selected'); // Add 'selected' class to the clicked button
  });
});


// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // If the tiger model is loaded and turning, animate the rotation
  if (tigerModel) {
    if (isTurning) {
      const rotationStep = turnSpeed * turnDirection; // Calculate the rotation for this frame
      tigerModel.rotation.y += rotationStep; // Rotate the model around the y-axis
      turnAmount += Math.abs(rotationStep); // Track the amount of rotation

      // End the turn after a full 360-degree turn (2 * Math.PI radians)
      if (turnAmount >= 2 * Math.PI) {
        isTurning = false; // Stop turning
        tigerModel.rotation.y = 0; // Reset to the original rotation if needed
      }
    }

    // If the tiger is jumping, animate the jump
    if (isJumping) {
      if (jumpDirection === 1) {
        // Moving up
        tigerModel.position.y += jumpSpeed;
        if (tigerModel.position.y >= 1.05 + jumpHeight) { // If reached the max height
          jumpDirection = 0; // Start moving down
        }
      } else {
        // Moving down
        tigerModel.position.y -= jumpSpeed;
        if (tigerModel.position.y <= 1.05) { // If back to original position
          tigerModel.position.y = 1.05; // Snap to original height
          isJumping = false; // End the jump
        }
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
