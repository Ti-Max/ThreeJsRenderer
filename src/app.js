import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'lil-gui'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import { BoxGeometry, CameraHelper, DirectionalLightHelper, Material, Mesh } from 'three';

let scene; 
let camera;
let renderer;
let orbitControl;
let composer;

let dirLight1;
let lightSphere;
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
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	scene.fog = new THREE.Fog(0xff9999, 50, 500)
	scene.background = new THREE.Color(0xff9999);
	//Lights
	createLights();
	//-------------Models
	createModels();
	//GUI
	buildGui();

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
	dirLight1.target.updateMatrixWorld();
	// update the light's shadow camera's projection matrix
	dirLight1.shadow.camera.updateProjectionMatrix();
	// and now update the camera helper we're using to show the light's shadow camera
}

function createLights(){
	//Ambient ligth
	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	scene.add(ambientLight);

	//Direction light
	dirLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight1.position.y = 10;
	dirLight1.target.position.set(0, 0, 0);
	dirLight1.castShadow = true;
	dirLight1.shadow.mapSize.set(512, 512);
	scene.add( dirLight1 );

	const lightHelper = new CameraHelper(dirLight1.shadow.camera);
	scene.add(lightHelper);
	//GUI
	const folder1 = gui.addFolder("Directional Light");
	folder1.add(dirLight1, 'intensity', 0, 5, 0.1);




}
function createModels(){

	const loader = new GLTFLoader();
	loader.load("./models/car3/scene.gltf", function ( gltf ) {
		gltf.scene.castShadow = true;
		scene.add( gltf.scene );
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} )

	const cube  = new Mesh(new BoxGeometry(1),new Material({color: 0x0000ff}));

	// scene.add(cube);
	//plane
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 1000, 1000 ),
		new THREE.MeshPhongMaterial( { color: 0xAA9999, specular: 0x101010 } )
	);
	plane.rotation.x = - Math.PI / 2;
	plane.receiveShadow = true;

	scene.add( plane );
}

function buildGui(){
	const ligthfolder = gui.addFolder('light');

	ligthfolder.add(dirLight1, 'castShadow');
	ligthfolder.open();
}
function makeXYZLightGUI(folder, vector3, onChangeFn) {

	folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'y', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
	folder.open();
  }