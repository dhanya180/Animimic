/*
let currentModel;  // Track the currently visible model

// Function to hide the current model if one is present
function hideCurrentModel() {
    if (currentModel) {
        scene.remove(currentModel);  // Remove current model from scene
        currentModel = null;  // Reset currentModel
    }
}

// Function to dynamically load and execute the respective module
function loadAnimalScript(animal) {
    let scriptPath;
    
    switch (animal) {
        case 'dog':
            scriptPath = './dog.js';
            break;
        case 'cat':
            scriptPath = './cat.js';
            break;
        case 'tiger':
            scriptPath = './tiger.js';
            break;
        default:
            console.error('Unknown animal:', animal);
            return;
    }

    // Hide the current model immediately before loading a new one
    hideCurrentModel();

    // Dynamically import the script based on the selected animal
    import(scriptPath)
        .then((module) => {
            // The module has been successfully loaded
            console.log(`${animal} script loaded successfully`, module);
            
            // Assuming each module has an `initialize()` function, call it
            if (module.initialize) {
                currentModel = module.initialize();  // Call the initialization function and assign the model
                scene.add(currentModel);  // Add the loaded model to the scene
            }
        })
        .catch((err) => {
            console.error(`Error loading ${animal} script`, err);
        });
}

// Event listeners for buttons
document.getElementById('dog').addEventListener('click', () => loadAnimalScript('dog'));
document.getElementById('cat').addEventListener('click', () => loadAnimalScript('cat'));
document.getElementById('tiger').addEventListener('click', () => loadAnimalScript('tiger'));

// Basic Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add light to the scene
const light = new THREE.AmbientLight(0x404040);  // Soft white light
scene.add(light);

// Camera position
camera.position.z = 5;

// Animation loop for rendering the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
*/

let currentModel;  // Track the currently visible model

// Basic Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add light to the scene
const light = new THREE.AmbientLight(0x404040);  // Soft white light
scene.add(light);

// Camera position
camera.position.z = 5;

// Animation loop for rendering the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();  // Start the animation loop

// Function to hide the current model if one is present
function hideCurrentModel() {
    if (currentModel) {
        console.log('Hiding current model:', currentModel);
        scene.remove(currentModel);  // Remove current model from scene
        currentModel.geometry.dispose();  // Dispose of geometry to free memory
        currentModel.material.dispose();  // Dispose of material to free memory
        renderer.renderLists.dispose();   // Clean up WebGL rendering cache
        currentModel = null;  // Reset currentModel
        console.log('Current model hidden successfully.');
    }
}

// Function to dynamically load and execute the respective module
function loadAnimalScript(animal) {
    let scriptPath;
    
    switch (animal) {
        case 'dog':
            scriptPath = './scripts/dog.js';  // Adjust path as needed
            break;
        case 'cat':
            scriptPath = './scripts/cat.js';  // Adjust path as needed
            break;
        case 'tiger':
            scriptPath = './scripts/tiger.js';  // Adjust path as needed
            break;
        default:
            console.error('Unknown animal:', animal);
            return;
    }

    // Hide the current model immediately before loading a new one
    hideCurrentModel();

    // Dynamically import the script based on the selected animal
    import(scriptPath)
        .then((module) => {
            console.log(`${animal} script loaded successfully`, module);
            
            // Assuming each module has an `initialize()` function, call it
            if (module.initialize) {
                currentModel = module.initialize();  // Call the initialization function and assign the model
                scene.add(currentModel);  // Add the loaded model to the scene
                renderer.render(scene, camera);  // Render the scene after adding the new model
            }
        })
        .catch((err) => {
            console.error(`Error loading ${animal} script`, err);
        });
}

// Add event listeners for animal buttons using a loop
const animals = ['dog', 'cat', 'tiger'];

animals.forEach(animal => {
    document.getElementById(animal).addEventListener('click', () => loadAnimalScript(animal));
});
