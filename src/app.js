import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'lil-gui'
//import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'
import {DebugEnvironment} from 'three/examples/jsm/environments/DebugEnvironment.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { CatmullRomCurve3 } from 'three';
//import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
let scene; 
let camera;
let renderer;
let orbitControl;
let composer;

let dirLight1;
let lightSphere;
const gui = new GUI();
let lastTime = 0;


//environment maps
const environmentMaps = {
	None: 'None',
	Default: 'DefaultSkyBox',
	Room: 'Generated Room',
	Store: 'royal_esplanade_1k.hdr',
	Venice: 'venice_sunset_1k.hdr'
};
let settings = {
	environmentMap : environmentMaps.Default
};
const loadedTextures = new Map();
let pmremGenerator;
init();
animate();


function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );
	renderer = new THREE.WebGLRenderer({antialias : true});
	orbitControl = new OrbitControls(camera, renderer.domElement);
	pmremGenerator = new THREE.PMREMGenerator( renderer );

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

	initSky();
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

	//plane
	// const plane = new THREE.Mesh(
	// 	new THREE.PlaneGeometry( 1000, 1000 ),
	// 	new THREE.MeshPhongMaterial( { color: 0xAA9999, specular: 0x101010 } )
	// );
	// plane.rotation.x = - Math.PI / 2;
	// plane.receiveShadow = true;

	// scene.add( plane );
}

function buildGui(){
	const ligthfolder = gui.addFolder('light');
	ligthfolder.add(dirLight1, 'castShadow');
	ligthfolder.open();

	//Environment map selector
	const environmentMapsFolder = gui.addFolder('Environment map');
	environmentMapsFolder.add(settings, 'environmentMaps',
	 {None : environmentMaps.None, Default: environmentMaps.Default, GeneratedRoom : environmentMaps.Room, Store: environmentMaps.Store, Venice : environmentMaps.Venice})
	 .onChange(environmentMapOnChange);
	console.log();
}
function initSky() {
	const sky = new Sky();
	sky.scale.setScalar( 10000 );
	
	sky.material.uniforms[ 'turbidity' ].value = 10;
	sky.material.uniforms[ 'rayleigh' ].value = 2;
	sky.material.uniforms[ 'mieCoefficient' ].value = 0.005;
	sky.material.uniforms[ 'mieDirectionalG' ].value = 0.8;

	const parameters = {
		elevation: 1,
		azimuth: -90
	};

	const pmremGenerator = new THREE.PMREMGenerator( renderer );

	function updateSun() {

		const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
		const theta = THREE.MathUtils.degToRad( parameters.azimuth );
		const sun = new THREE.Vector3();
		sun.setFromSphericalCoords( 1, phi, theta );

		sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
		if(settings.environmentMap === environmentMaps.Default){
			console.log(settings.environmentMap);
			const texture = pmremGenerator.fromScene( sky ).texture;
			scene.environment = texture;
			scene.background = texture;
			loadedTextures.set('DefaultSkyBox', texture);
		}

	}
	const folderSky = gui.addFolder( 'Sky' );
	folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
	folderSky.open();
	updateSun();
}

function environmentMapOnChange(value){
	//cheking if we already have that texture
	settings.environmentMap = value;
	if(value === environmentMaps.None)
		scene.environment = 0, scene.background = 0;
	else if (value === environmentMaps.Default)
		scene.environment = loadedTextures.get('DefaultSkyBox'), scene.background = loadedTextures.get('DefaultSkyBox');
	else if (value === environmentMaps.Room){
		if(loadedTextures.has(value))
			scene.environment = loadedTextures.get(value), console.log('already loaded ' + value)
			,scene.background = loadedTextures.get(value);
		else{
			console.log('loading ' + value);
			const texture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
			scene.environment = texture;
			scene.background = texture;
			loadedTextures.set(value, texture)
		}
	}
	else{
		if(loadedTextures.has(value))
			scene.environment = loadedTextures.get(value), console.log('already loaded ' + value), scene.background = loadedTextures.get(value);
		else{
			console.log('loading ' + value);
			new RGBELoader().load('textures/' + value, function(texture) {
				
				texture.mapping = THREE.EquirectangularReflectionMapping;

				scene.environment = texture;
				scene.background = texture;

				loadedTextures.set(value, texture);
			})
		}
	}
}