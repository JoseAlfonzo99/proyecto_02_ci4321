import * as THREE from 'three';
import createPlane from './plane';
import createTankBody from './tank';
import createObjective1 from './objective1';
import createObjective2 from './objective2';
import createObjective3 from './objective3';
import createOval from './ballon';
import { createAnimatedSprite} from './lifes';
import { createTextFromSpriteSheet } from './alphabet';
import { createTextSequence } from './sequence';
import { createLinearBullet, createGravityBullet } from './bullets';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const MAX_ROTATION_X = Math.PI / 2; 
const MIN_ROTATION_X = -Math.PI / 2;

const DAY_DURATION = 5 * 60 * 1000; // El día dura 5 minutos
let startTime = Date.now();

const balloonSound = new Audio('src/Audios/explosion.mp3');
const tankSound = new Audio('src/Audios/tanque.mp3');
tankSound.loop = true;
tankSound.volume = 0.2;
const cannonSound = new Audio('src/Audios/disparo.mp3');
cannonSound.volume = 0.3;

const bullets = [];

// Crear scena para la IU
const sceneUI = new THREE.Scene();
const cameraUI = new THREE.OrthographicCamera(
    window.innerWidth/-2, window.innerWidth/2,
    window.innerHeight/2, window.innerHeight/-2,
    1, 1000
) ;
cameraUI.position.z = 10;

// Crear la escena
const scene = new THREE.Scene();

// Cargar la imagen de fondo
const loader = new THREE.TextureLoader();
loader.load('src/texture/cielo.jpg', function(texture) {
    scene.background = texture;
});

// Crear el skybox
let skyboxMaterials = [];
let texture_ft = new THREE.TextureLoader().load("src/texture/frente.png");
let texture_bk = new THREE.TextureLoader().load("src/texture/atras.png");
let texture_up = new THREE.TextureLoader().load("src/texture/arriba.png");
let texture_dn = new THREE.TextureLoader().load("src/texture/abajo.png");
let texture_rt = new THREE.TextureLoader().load("src/texture/derecha.png");
let texture_lf = new THREE.TextureLoader().load("src/texture/izquierda.png");

skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: texture_lf }));
skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: texture_up }));
skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: texture_ft }));

for(let i = 0; i < skyboxMaterials.length; i++) {
	skyboxMaterials[i].side = THREE.BackSide;
}

let skyboxGeo = new THREE.BoxGeometry(1000, 500, 1000);
let skybox = new THREE.Mesh(skyboxGeo, skyboxMaterials);
skybox.position.y = 248;
scene.add(skybox);

// Creación de los distintos tipos de camaras

// Variables para las cámaras
let cameraMode = 'third'; // 'first', 'third' o 'orbit'
let activeCamera;

const firstPersonCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
const thirdPersonCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);

// Inicializa la cámara activa como la cámara de tercera persona
activeCamera = thirdPersonCamera;

// Actualiza la cámara de tercera persona
function updateThirdPersonCamera() {
    const distance = 200; // Distancia de la cámara al tanque
    const height = 50; // Altura de la cámara
    const offset = new THREE.Vector3(0, height, distance); // Desplazamiento desde el tanque

    // Calcula la posición de la cámara
    thirdPersonCamera.position.copy(tankBody.position).add(offset);
    thirdPersonCamera.lookAt(tankBody.position);
}

// Actualiza la cámara de primera persona
function updateFirstPersonCamera() {
    firstPersonCamera.position.copy(tankBody.position).add(new THREE.Vector3(0, 20, 0)); // Ajusta la altura
    firstPersonCamera.rotation.copy(tankBody.rotation); // Mantiene la misma rotación que el tanque
}

// Crear orbital
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);

// Crear el render
const canvas = document.getElementById('myCanvas')
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Añadir el plano
const plane = createPlane();
plane.receiveShadow = true;
scene.add(plane);

// Añadir el tanque
const {tankBody, turret, cannon, mountPoint} = createTankBody();
tankBody.position.set(0, 18, 450);
scene.add(tankBody);

// Añadir el objective1
const Objective1Body = createObjective1();
Objective1Body.position.set(121, 50, -70);
scene.add(Objective1Body);

// Añadir el objective1_2
const Objective1_2Body = createObjective1();
Objective1_2Body.position.set(121, 50, 100);
scene.add(Objective1_2Body);

// Añadir el objective1_3
const Objective1_3Body = createObjective1();
Objective1_3Body.position.set(121, 50, 270);
scene.add(Objective1_3Body);

// Añadir el objective2
const Objective2Body = createObjective2();
Objective2Body.position.set(-300, 0, -300);
scene.add(Objective2Body);

// Añadir el objective3
const Objective3Body = createObjective3();
Objective3Body.position.set(-121, 50, 100);
scene.add(Objective3Body);

// Añadir el objective3_2
const Objective3_2Body = createObjective3();
Objective3_2Body.position.set(-121, 50, 270);
scene.add(Objective3_2Body);

// Añadir blanco 1
const ballon_1 = createOval()
ballon_1.position.set(0, 80, 0);
ballon_1.castShadow = true;
ballon_1.box = new THREE.Box3().setFromObject(ballon_1);
scene.add(ballon_1);

// Añadir blanco 2
const ballon_2 = createOval()
ballon_2.position.set(110, 180, -50);
ballon_2.castShadow = true;
ballon_2.box = new THREE.Box3().setFromObject(ballon_2);
scene.add(ballon_2);

// Añadir blanco 3
const ballon_3 = createOval()
ballon_3.position.set(-310, 180, -150);
ballon_3.castShadow = true;
ballon_3.box = new THREE.Box3().setFromObject(ballon_3);
scene.add(ballon_3);

// Añadir blanco
const ballon_4 = createOval()
ballon_4.position.set(410, 380, -200);
ballon_4.castShadow = true;
ballon_4.box = new THREE.Box3().setFromObject(ballon_4);
scene.add(ballon_4);

// Añadir blanco
const ballon_5 = createOval()
ballon_5.position.set(-310, 380, 250);
ballon_5.castShadow = true;
ballon_5.box = new THREE.Box3().setFromObject(ballon_5);
scene.add(ballon_5);

// Arreglo de globlos
const balloons = [];

// Añadir globos
balloons.push(ballon_1);
balloons.push(ballon_2);
balloons.push(ballon_3);
balloons.push(ballon_4);
balloons.push(ballon_5);

// Añadir luz ambiental
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Añadir luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-350, 300, -50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 10;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.left = -600;
directionalLight.shadow.camera.right = 600;
directionalLight.shadow.camera.top = 600;
directionalLight.shadow.camera.bottom = -600;
scene.add(directionalLight);

// Posición de la cámara
camera.position.set(0, 300, 1000);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Configurar los controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Variables de energía y proyectiles
let energy = 100; // Energía inicial del tanque 
let projectilesLeft = 20; // Número inicial de proyectiles

function updateEnergyBar() { 
    const energyBar = document.getElementById('energy-bar'); 
    energyBar.style.width = `${energy}%`; 
}

// Llamar a esta función cada vez que la energía cambie 
function decreaseEnergy(amount) { 
    energy = Math.max(0, energy - amount); 
    updateEnergyBar(); 
}

function updateProjectileCounter() {
    const counter = document.getElementById('projectile-counter');
    counter.innerText = `Proyectiles: ${projectilesLeft}`; 
} 

// Crea el sprite de las vidas (forma de fuego azul)
const lifeSprint = createAnimatedSprite(sceneUI, 8, 2, window.innerWidth/2 - 70, window.innerHeight/2 - 50, 0);
const lifeSprint2 = createAnimatedSprite(sceneUI, 8, 2, window.innerWidth/2 - 110, window.innerHeight/2 - 50, 0);
const lifeSprint3 = createAnimatedSprite(sceneUI, 8, 2, window.innerWidth/2 - 150, window.innerHeight/2 - 50, 0);

// Crea el sprite con la palabra "lifes" para indicar las vidas
createTextFromSpriteSheet(
    sceneUI, 
    'lifes:3', 
    8, 5, 
    window.innerWidth/2 - 170, window.innerHeight/2 - 80, 0, 
    20, 20,
    'src/Atlas/alpha_2.png',
    'abcdefghijklmnopqrstuvwxyz0123456789$:?!'
);

// Crear los sprite para la secuencia de inicio
const sequences = [
    {text: '  welcome to', duration: 2000},
    {text: 'tankmageddon', duration: 3000},
    {text: '       start', duration: 2000}
]

createTextSequence(
    sceneUI,
    sequences,
    8, 5,
    window.innerWidth/2 - 1400, window.innerHeight/2 - 250, 0,
    80, 80,
    'src/Atlas/alpha_2.png',
    'abcdefghijklmnopqrstuvwxyz'

)

// Cargar el sprite de proyectiles
const projectileSprite = loader.load('src/texture/balas.dds');

const spriteMaterial = new THREE.SpriteMaterial({ map: projectileSprite });
const projectileSpriteMesh = new THREE.Sprite(spriteMaterial);
projectileSpriteMesh.position.set(50, 50, 0); // Posición del sprite en la interfaz
projectileSpriteMesh.scale.set(50, 50, 1); // Tamaño del sprite

// Añadir el sprite a la escena
scene.add(projectileSpriteMesh);

// Actualizar el sprite cuando cambia el número de proyectiles
function updateProjectileSprite() {
    // Lógica para actualizar el sprite según el número de proyectiles restantes
    // Aquí podrías cambiar la posición o la visibilidad del sprite, por ejemplo
    projectileSpriteMesh.visible = (projectilesLeft > 0);
}

// Llamar a esta función cada vez que el número de proyectiles cambie
function shootBullet(type) {
    if (projectilesLeft > 0) {
        let bullet;
        if (type === 'linear') {
            bullet = createLinearBullet(mountPoint);
        } else if (type === 'gravity') {
            bullet = createGravityBullet(mountPoint);
        }
        bullets.push(bullet);
        scene.add(bullet);

        projectilesLeft--;
        updateProjectileCounter();
        updateProjectileSprite();
        // Disminuir energía al disparar
        decreaseEnergy(5); 
    }
}

// Inicializar las barras y el contador al cargar la página 
document.addEventListener('DOMContentLoaded', (event) => { 
    updateEnergyBar(); updateProjectileCounter(); 
});

// Función para detectar colisiones
function checkCollisionAABB(box1, box2) {
    // Verificar colisión en el eje X
    const collisionX = box1.max.x >= box2.min.x && box2.max.x >= box1.min.x;
    // Verificar colisión en el eje Y
    const collisionY = box1.max.y >= box2.min.y && box2.max.y >= box1.min.y;
    // Verificar colisión en el eje Z
    const collisionZ = box1.max.z >= box2.min.z && box2.max.z >= box1.min.z;

    return collisionX && collisionY && collisionZ;
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.box = new THREE.Box3().setFromObject(bullet);

        if (bullet.type === 'linear') {
            bullet.position.add(bullet.velocity.clone());
        } else if (bullet.type === 'gravity') {
            bullet.position.add(bullet.velocity.clone().multiplyScalar(0.1));
            bullet.velocity.add(bullet.gravity.clone().multiplyScalar(0.1));
            const direction = bullet.velocity.clone().normalize();
            const up = new THREE.Vector3(0, 0, -1);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
            bullet.quaternion.copy(quaternion);
        }

        // Comprobar colisiones con globos
        for (let j = balloons.length - 1; j >= 0; j--) {
            const balloon = balloons[j];
            balloon.box.setFromObject(balloon);
            if (checkCollisionAABB(bullet.box, balloon.box)) {
                // Manejar la colisión
				balloonSound.currentTime = 0;
				balloonSound.play();
                scene.remove (bullet);
                bullets.splice(i, 1);
                scene.remove(balloon);
                balloons.splice(j, 1);
            }
        }

        // Eliminar la bala si está demasiado lejos
        if (bullet.position.length() > 1000) {
            scene.remove(bullet);
            bullets.splice(i, 1); 
        }
    }
}

// Captura de eventos del teclado
const keyStates = {};
document.addEventListener('keydown', (event) => { keyStates[event.code] = true; });
document.addEventListener('keyup', (event) => { keyStates[event.code] = false; });

document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyQ') {
		cannonSound.currentTime = 0;
		cannonSound.play();
        shootBullet('linear');
    } else if (event.code === 'KeyE') {
		cannonSound.currentTime = 0;
		cannonSound.play();
        shootBullet('gravity');
    }
});

// Captura eventos delteclado para cambiar de camara
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyC') { // Cambiar entre cámaras al presionar 'C'
        if (cameraMode === 'first') {
            cameraMode = 'third';
        } else if (cameraMode === 'third') {
            cameraMode = 'orbit';
        } else {
            cameraMode = 'first';
        }
    }
});

// Crear un objeto que represente la luz 
const sunGeometry = new THREE.SphereGeometry(5, 32, 32); 
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); 
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

// Se carga el modelo 3D en formato FBX
const fbxLoader = new FBXLoader();

fbxLoader.load(
    'src/Modelos/T 90.fbx',
    (object) => {
        scene.add(object);
        object.position.set(0, 12, -300);
        object.scale.set(0.15, 0.15, 0.15);

        object.traverse((child) => {
            if (child.isMesh) {
                const textureLoader = new THREE.TextureLoader();
                const texture = textureLoader.load('src/Modelos/T 90D.png');
                child.material.map = texture;
                child.material.needsUpdate = true;
                child.castShadow = true;

            }
        });
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% cargado'); // Progreso de carga
    },
    (error) => {
        console.error('Error al cargar el modelo:', error); // Manejo de errores
    }
);

function animate() {
    requestAnimationFrame(animate);

    // Calcular el tiempo transcurrido desde el inicio
    const elapsedTime = Date.now() - startTime;
    const normalizedTime = (elapsedTime % DAY_DURATION) / DAY_DURATION;

    // Calcular la posición y el color de la luz direccional
    const sunPosition = new THREE.Vector3(
        Math.cos(normalizedTime * Math.PI * 2) * 500,
        Math.sin(normalizedTime * Math.PI * 2) * 500,
        300
    );

    directionalLight.position.copy(sunPosition);
    sunMesh.position.copy(sunPosition);

    // Cambiar el color de la luz según el tiempo del día
    const color = new THREE.Color();
    color.setHSL(normalizedTime, 0.5, 0.5);
    directionalLight.color.copy(color);
    ambientLight.intensity = 0.3 + (0.7 * Math.abs(Math.cos(normalizedTime * Math.PI)));


    // Movimiento del tanque
    let isMoving = false;
    let moveTank = true;
    const tankBox = new THREE.Box3().setFromObject(tankBody); // Actualizar bounding box del tanque
    if (keyStates['ArrowUp']) {
        tankBody.translateZ(-1);
        isMoving = true;
        tankBox.setFromObject(tankBody); // Actualizar bounding box después del movimiento
        [Objective1Body, Objective1_2Body, Objective1_3Body, Objective2Body, Objective3Body, Objective3_2Body].forEach(object => {
            const objectBox = new THREE.Box3().setFromObject(object); // Actualizar bounding box del objetivo
            if (tankBox.intersectsBox(objectBox)) {
                moveTank = false;
            }
        });
        if (!moveTank) {
            tankBody.translateZ(1); // Deshacer el movimiento si hay colisión
        }
    }
    if (keyStates['ArrowDown']) {
        tankBody.translateZ(1);
        isMoving = true;
        tankBox.setFromObject(tankBody); // Actualizar bounding box después del movimiento
        [Objective1Body, Objective1_2Body, Objective1_3Body, Objective2Body, Objective3Body, Objective3_2Body].forEach(object => {
            const objectBox = new THREE.Box3().setFromObject(object); // Actualizar bounding box del objetivo
            if (tankBox.intersectsBox(objectBox)) {
                moveTank = false;
            }
        });
        if (!moveTank) {
            tankBody.translateZ(-1); // Deshacer el movimiento si hay colisión
        }
    }
    if (keyStates['ArrowLeft']) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.03);
        tankBody.applyQuaternion(quaternion);
    }
    if (keyStates['ArrowRight']) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.03);
        tankBody.applyQuaternion(quaternion);
    }

    // Reproducir o detener el sonido
    if (isMoving) {
        if (tankSound.paused) {
            tankSound.play();
        }
    } else {
        if (!tankSound.paused) {
            tankSound.pause(); 
            tankSound.currentTime = 0;
        }
    }

    // Rotar la torreta
    if (keyStates['KeyA']) { // Tecla A para rotar a la izquierda
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.01);
        turret.quaternion.multiplyQuaternions(quaternion, turret.quaternion);
    }
    if (keyStates['KeyD']) { // Tecla D para rotar a la derecha
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.01);
        turret.quaternion.multiplyQuaternions(quaternion, turret.quaternion);
    }

	// Rotar y limitar la rotación del cañón
	if (keyStates['KeyW']) { // Tecla W para mover el cañón hacia arriba
		if (cannon.rotation.x + 0.01 <= MAX_ROTATION_X) {
			cannon.rotation.x += 0.01;
		}
	}
	if (keyStates['KeyS']) { // Tecla S para mover el cañón hacia abajo
		if (cannon.rotation.x - 0.01 >= MIN_ROTATION_X) {
			cannon.rotation.x -= 0.01;
		}
	}

	updateBullets();
    lifeSprint();
    lifeSprint2();
    lifeSprint3();
    controls.update();

    renderer.autoClear = true;

    // Actualiza la posición de la cámara según el modo
    if (cameraMode === 'first') {
        updateFirstPersonCamera();
        activeCamera = firstPersonCamera;
    } else if (cameraMode === 'third') {
        updateThirdPersonCamera();
        activeCamera = thirdPersonCamera;
    } else {
        activeCamera = camera;
    }
    // Renderiza la escena con la cámara activa
    renderer.render(scene, activeCamera);

    renderer.autoClear = false;
    renderer.render(sceneUI, cameraUI);
    
    
}
animate();