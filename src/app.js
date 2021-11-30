import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'lil-gui'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import * as VerticalBlur from './VerticalBlurShader.hlsl.js';

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
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
	renderer = new THREE.WebGLRenderer({antialias : true});
	orbitControl = new OrbitControls(camera, renderer.domElement);

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );

	//Renderer settings
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	scene.fog = new THREE.Fog(0xff9999, 10, 20)
	scene.background = new THREE.Color(0xff9999);

	//ShaderPass
	composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));

	const colorShader = {
		uniforms: {
		  tDiffuse: { value: null },
		},
		vertexShader: VerticalBlur.vertexShader,
		fragmentShader: VerticalBlur.fragmentShader,
	};


	const colorPass = new ShaderPass(colorShader);
	colorPass.renderToScreen = true;
	composer.addPass(colorPass);
	//Lights
	createLights();
	//-------------Models
	createModels();
	//GUI
	buildGui();

	camera.position.z = -5;
	
}

function animate(time) {
	time *= 0.001;
	const deltaTime = time - lastTime;
	lastTime = time;
	orbitControl.update();

	composer.render(deltaTime);

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
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	//Direction light
	dirLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight1.position.y = 10;
	dirLight1.target.position.set(0, 0, 0);
	dirLight1.castShadow = true;
	dirLight1.shadow.mapSize.set(512, 512);
	scene.add( dirLight1 );

	// const ligthHelper = new THREE.DirectionalLightHelper(dirLight1);
	// scene.add(ligthHelper);

	// //Pointlight
	// const pointLight = new THREE.PointLight( 0x5555ff, 1, 20);
	// pointLight.position.set(2, 4, 2);
	// pointLight.castShadow = true;
	// pointLight.shadow.bias = 0.0001;
	// pointLight.shadow.mapSize.set(512, 512);
	// scene.add( pointLight );

	// const pointLightHelper = new THREE.CameraHelper(pointLight.shadow.camera);
	// scene.add(pointLightHelper);
	
	// //SpotLight
	// const spotLight = new THREE.SpotLight( 0x00ff00, 1, 20);
	// spotLight.position.set(4, 4, 0);
	// spotLight.target.position.set(0, 0, 2);
	// spotLight.castShadow = true;
	// spotLight.shadow.bias = 0.0001;
	// spotLight.shadow.mapSize.set(512, 512);

	// scene.add( spotLight );
	// scene.add(spotLight.target);

	// const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0.2);
	// scene.add(spotLightHelper);

	//GUI
	const folder1 = gui.addFolder("Directional Light");
	folder1.add(dirLight1, 'intensity', 0, 5, 0.1);




}
function createModels(){
	//plane
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 100, 100 ),
		new THREE.MeshPhongMaterial( { color: 0xAA9999, specular: 0x101010 } )
	);
	plane.rotation.x = - Math.PI / 2;
	plane.receiveShadow = true;

	scene.add( plane );

	//cube
	const cube = new THREE.Mesh(
		new THREE.BoxGeometry(0.4, 0.4, 0.4),
		new THREE.MeshPhongMaterial({color : 0x2288ff})
	);
	cube.castShadow = true;
	cube.position.y = 1;
	scene.add(cube);

	//sphere
	const sphere = new THREE.Mesh(
		new THREE.SphereGeometry(1),
		new THREE.MeshPhongMaterial({color : 0xff4455})
	)
	sphere.position.set(2, 1, 0);
	sphere.castShadow = true;
	scene.add(sphere);
	
	//sphere
	const torus = new THREE.Mesh(
		new THREE.TorusKnotGeometry(0.5, 0.2),
		new THREE.MeshPhongMaterial({color : 0x00CC33})
	)
	torus.position.set(1, 1, 2);
	torus.castShadow = true;
	scene.add(torus);
}

function buildGui(){
	const ligthfolder = gui.addFolder('light');

	ligthfolder.add(dirLight1, 'castShadow');
	ligthfolder.open();
	// gui.add(dirLight1.shadow., 'width', 10, 5000);
	// gui.add(dirLight1.shadow.camera, 'height', 10, 5000);
}
function makeXYZLightGUI(folder, vector3, onChangeFn) {

	folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'y', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
	folder.open();
  }