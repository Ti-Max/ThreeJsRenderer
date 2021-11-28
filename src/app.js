import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'dat.gui'
import { degToRad } from 'three/src/math/MathUtils';

let scene; 
let camera;
let renderer;
let orbitControl;


init();
animate();

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({antialias : true});
	orbitControl = new OrbitControls(camera, renderer.domElement);

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );

	//Renderer settings
	renderer.shadowMap.enabled = true;
	console.log(renderer.capabilities.maxTextureSize);

	//Lights
	const dirLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight1.position.set( 1, 3, 1 );
	dirLight1.castShadow = true;
	scene.add( dirLight1 );
	const ligthGeometry = new THREE.SphereGeometry(0.2);
	const lightMaterial = new THREE.MeshBasicMaterial({color : 0xFFFFFF});
	const lightSphere = new THREE.Mesh(ligthGeometry, lightMaterial);
	lightSphere.position.set( 1, 3, 1 );
	scene.add(lightSphere);

	//-------------Models
	//plane
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 8, 8 ),
		new THREE.MeshPhongMaterial( { color: 0xBB9999, specular: 0x101010 } )
	);
	plane.rotation.x = - Math.PI / 2;
	plane.receiveShadow = true;
	plane.castShadow = true;

	scene.add( plane );

	//cone
	const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
	const material = new THREE.MeshPhongMaterial({color : 0x2288ff});
	const model = new THREE.Mesh(geometry, material);
	model.castShadow = true;
	plane.receiveShadow = true;

	model.position.y = 1;
	scene.add(model);
	//-----------
	//GUI
	const gui = new GUI();

	camera.position.z = -5;
	const cameraHelper = new THREE.CameraHelper(dirLight1.shadow.camera);
	scene.add(cameraHelper);
	
}

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	orbitControl.update();
}



function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}