import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'lil-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as Environment from './environmentMaps.js';
let scene; 
let camera;
let renderer;
let orbitControl;

let dirLight1;
const gui = new GUI();
let lastTime = 0;

const models = {
	car1 : 'car3/scene.gltf',
	car2 : 'car4/scene.gltf',
	car3 : 'old_rusty_car/scene.gltf'
}
const loadedModels = new Map();
const selectedModel = {
	model : models.car1
}
init();
animate();


function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );
	renderer = new THREE.WebGLRenderer({antialias : true});
	orbitControl = new OrbitControls(camera, renderer.domElement);

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );

	//Renderer settings
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;


	//Lights
	createLights();
	//-------------Models
	//GUI
	buildGui();
	loadModel('car3/scene.gltf');
	// Creates Environment maps and gui for them
	Environment.init(scene, renderer, gui);

	camera.position.set(0, 30, -30);
	
}

function animate(time) {
	time *= 0.001;
	const deltaTime = time - lastTime;
	lastTime = time;
	orbitControl.update();

	renderer.render(scene, camera);

	requestAnimationFrame( animate );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	// and now update the camera helper we're using to show the light's shadow camera
}

function createLights(){
	//Ambient ligth
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
	scene.add(ambientLight);

	//Direction light
	dirLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight1.position.y = 10;
	dirLight1.target.position.set(0, 0, 0);
	scene.add( dirLight1 );

	//GUI
	const folder1 = gui.addFolder("Directional Light");
	folder1.add(dirLight1, 'intensity', 0, 5, 0.1);
}

function loadModel(path){

	const loader = new GLTFLoader();
	let model;
	loader.load("./models/" + path, function ( gltf ) {

		scene.add( gltf.scene );
		const box = new THREE.Box3().setFromObject( gltf.scene);
 
		const boxSize = box.getSize(new THREE.Vector3()).length();
		const boxCenter = box.getCenter(new THREE.Vector3());
	 
		// set the camera to frame the box
		frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
	 
		// update the Trackball controls to handle the new size
		orbitControl.maxDistance = boxSize * 10;
		orbitControl.target.copy(boxCenter);
		orbitControl.update();
		model = gltf.scene;
	}, undefined, function ( error ) {
	
		console.error( error );
		return 0;
	} )
	return model;
}
function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
	const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
   
	const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();
   
	camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
   

	camera.near = boxSize / 100;
	camera.far = boxSize * 100;
   
	camera.updateProjectionMatrix();
   
	camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }
  
function buildGui(){
	
	const modelsFolder = gui.addFolder('models');
	modelsFolder.add(selectedModel, 'mdoel',
	{Car1 : models.car1, Car2: models.car2})
	.onChange(function(value){
			loadModel(value);
	});

	console.log();
}