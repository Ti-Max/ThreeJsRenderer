import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';



let pmremGenerator;
let scene;
let gui;
const environmentMaps = {
	None: 'None',
	Default: 'DefaultSkyBox',
	Room: 'Generated Room',
	Store: 'royal_esplanade_1k.hdr',
	Venice: 'venice_sunset_1k.hdr'
};
let settings = {
	environmentMap : environmentMaps.Default,
	showBackground : true,
	backgroundColor : new THREE.Color(0x3344AA)
};
const loadedTextures = new Map();
function init(sceneRef, rendererRef, guiRef){
	pmremGenerator = new THREE.PMREMGenerator( rendererRef );
	scene = sceneRef;
	gui = guiRef;
	initSky();
	addEnvironmentMapsGui(gui);
}
function addEnvironmentMapsGui(gui){																												
	//Environment map selector
	const environmentMapsFolder = gui.addFolder('Environment map');
	environmentMapsFolder.add(settings, 'environmentMaps',
	 {None : environmentMaps.None, Default: environmentMaps.Default, GeneratedRoom : environmentMaps.Room, Store: environmentMaps.Store, Venice : environmentMaps.Venice})
	 .onChange(function (value){
		//cheking if we already have that texture
		settings.environmentMap = value;
		if(value === environmentMaps.None)
			setEnvironment(scene, settings.backgroundColor);
		else if (value === environmentMaps.Default)
			setEnvironment(scene, loadedTextures.get('DefaultSkyBox'));
		else if (value === environmentMaps.Room){
			if(loadedTextures.has(value))
				setEnvironment(scene, loadedTextures.get(value)), console.log('Texture already loaded: ' + value);
			else{
				console.log('loading ' + value);
				const texture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
				setEnvironment(scene, texture)
				loadedTextures.set(value, texture)
			}
		}
		else{
			if(loadedTextures.has(value))
				setEnvironment(scene, loadedTextures.get(value)),  console.log('Texture already loaded: ' + value);
			else{
				console.log('loading ' + value);
				new RGBELoader().load('textures/' + value, function(texture) {
					
					texture.mapping = THREE.EquirectangularReflectionMapping;

					setEnvironment(scene, texture);


					loadedTextures.set(value, texture);
				})
			}
		}
	 });
	 //Check box: Show background
	environmentMapsFolder.add(settings, 'showBackground')
	 .onChange(function (value){
		if(value === true && settings.environmentMap !== environmentMaps.None){
			scene.background = loadedTextures.get(settings.environmentMap);
		}
		else{
			scene.background = settings.backgroundColor;
		}
	 });
	 environmentMapsFolder.addColor(settings, 'backgroundColor')
	 .onChange(function(value){
		 if(scene.showBackground === false)
		 	scene.backgroundColor = value;
	 });
}

function setEnvironment(scene, environmentMap){
	scene.environment = environmentMap;
	if(settings.showBackground === true )
		scene.background = environmentMap
	else
		scene.background = settings.backgroundColor;
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
export {init, addEnvironmentMapsGui};