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
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;


	//Lights
	createLights();
	//-------------Models
	createModels();
	//GUI
	buildGui();

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
	dirLight1.castShadow = true;
	dirLight1.shadow.mapSize.set(512, 512);
	scene.add( dirLight1 );

	//GUI
	const folder1 = gui.addFolder("Directional Light");
	folder1.add(dirLight1, 'intensity', 0, 5, 0.1);
}
function createModels(){

	const loader = new GLTFLoader();
	loader.load("./models/car3/scene.gltf", function ( gltf ) {
		// gltf.scene.traverse( function( node ) {

		// 	if ( node.isMesh ) { node.castShadow = true; node.receiveShadow = true; }
	
		// } );
		scene.add( gltf.scene );
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} )
}

function buildGui(){
	const ligthfolder = gui.addFolder('light');
	ligthfolder.add(dirLight1, 'castShadow');
	ligthfolder.open();
	
	console.log();
}