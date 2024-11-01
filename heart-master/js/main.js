import * as THREE from '../build/three.module.js';

import { DDSLoader } from './DDSLoader.js';
import { MTLLoader } from './MTLLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { TrackballControls } from './TrackballControls.js';
	
const BASE_URL = 'https://mattschroyer.github.io/heart/models/';

const appContainer = document.getElementById("heart-app");

let camera, scene, renderer;
let controls;
let raycaster;
let mouse;
let heartPart;
let heartIsOpen = false;

// set up the canvas on which to draw the locator line
// MUST NOT be below init() and animate()
var lineCanvas = document.createElement( 'canvas' );
lineCanvas.id = "dotsCanvas";
lineCanvas.width = window.innerWidth;
lineCanvas.height = window.innerHeight;
lineCanvas.style.position = "absolute";
lineCanvas.style.zIndex = "101";
lineCanvas.style.display = "inline";
appContainer.appendChild(lineCanvas);

// creating pin vectors
const allMyPins = [
	new THREE.Vector3(-4.044027262032927, 4.219614694564475, -1.2308631918325883),
	new THREE.Vector3(-3.4000000000000004, 7.600000000000003, 2.5999999999999996),
	new THREE.Vector3(-4.200000000000001, 0.7999999999999987, 3.4000000000000004),
	new THREE.Vector3(-5.000000000000002, 3.1999999999999993, 1.3999999999999995),
	new THREE.Vector3(1.0000000000000004, 2.3999999999999986, 6.000000000000002),
	new THREE.Vector3(-2.1999999999999993, 6.000000000000002, -4.800000000000003)
];

init();
animate();

function init() {
	
	// camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.x= -42.54404597864378; camera.position.y= 4.095160583665006; camera.position.z= -1.2896749071128895;
	
	// scene
	scene = new THREE.Scene();
	let ambient = new THREE.AmbientLight( 0x444444 );
	scene.add(ambient);
	let directionalLight1 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
	directionalLight1.position.set( 0, 0, 1 ).normalize();
	let directionalLight2 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
	directionalLight2.position.set( 0, 0, -1 ).normalize();
	let directionalLight3 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
	directionalLight3.position.set( 1, 0, 0).normalize();
	let directionalLight4 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
	directionalLight4.position.set( -1, 0, 0 ).normalize();
	let directionalLight5 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
	directionalLight5.position.set( 0, 1, 0 ).normalize();
	let directionalLight6 = new THREE.DirectionalLight( 0xffeedd, 0.7 );
	directionalLight6.position.set( 0, -1, 0 ).normalize();
	scene.add( directionalLight1 );
	scene.add( directionalLight2 );
	scene.add( directionalLight3 );
	scene.add( directionalLight4 );			
	scene.add( directionalLight5 );
	scene.add( directionalLight6 );
	
	// models
	const onProgress = function (xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	const onError = function () { };
	
	const manager = new THREE.LoadingManager();
	manager.addHandler( /\.dds$/i, new DDSLoader() );

	new MTLLoader(manager)
		.setPath(BASE_URL)
		.load( 'openheartLD1.mtl', function (materials) {
			materials.preload();
			new OBJLoader(manager)
				.setMaterials(materials)
				.setPath(BASE_URL)
				.load( 'openheartLD1.obj', function (object) {
					object.position.x = 32;
					object.position.y = -3;
					object.position.z = 3;
					object.rotation.x = -1.6;
					object.name = 'openHeart';
					scene.add(object);
				}, onProgress, onError );
	});

	new MTLLoader(manager)
		.setPath(BASE_URL)
		.load( 'heartpartLD1.mtl', function (materials) {
			materials.preload();
			new OBJLoader(manager)
				.setMaterials(materials)
				.setPath(BASE_URL)
				.load( 'heartpartLD1.obj', function (object) {
					object.position.x= -7.600000000000003; object.position.y= -9.399999999999999; object.position.z= 24.199999999999946;
					object.rotation.x= -1.6000000000000008; object.rotation.y= 0.44999999999999996; object.rotation.z= 0.05000000000000002;
					object.scale.x= 3.949999999999994; object.scale.y= 3.949999999999994; object.scale.z= 3.949999999999994;
					object.name = 'heartPart';
					scene.add(object);
				}, onProgress, onError );
	});

	heartPart = scene.getObjectByName('heartPart', true);
	heartIsOpen = false;

	camera.position.z = 5;
	
	// renderer three.js in canvas
	var threeCanvas = document.getElementById('threeCanvas');
	renderer = new THREE.WebGLRenderer({canvas: threeCanvas});
	threeCanvas.width  = window.innerWidth;
	threeCanvas.height = window.innerHeight;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	// window resize
	window.addEventListener( 'resize', onWindowResize, false );

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	document.getElementById("move_heart_btn").addEventListener("click", movePart);
	document.getElementById("hide_dots_btn").addEventListener("click", hideDots);
	createControls(camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.handleResize();
	animate();
}

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	TWEEN.update();
	if (document.getElementById("dotsCanvas").style.display == "inline") {
		checkDots();
	}
	render();
}

function render() {
	renderer.render( scene, camera );
}

function checkDots() {
	var vector = new THREE.Vector3();
	var openHeart = scene.getObjectByName('openHeart', true);
	var origin;
	var i;
	var canvas = document.getElementById("dotsCanvas");
	canvas.width = canvas.width;
	vector.set(camera.position.x, camera.position.y, camera.position.z);
	if (openHeart) {
		for (i in allMyPins) {
			origin = allMyPins[i].clone();
			// turns vector into a directional vector pointing from origin to camera
			vector.sub(origin).normalize();
			raycaster.set( origin, vector );
			var intersects = raycaster.intersectObject( openHeart, true );
			if (intersects.length > 0) {
				//console.log("marker invisible!");
			}
			else {
				createDots(origin, i);
			}
			vector.set(camera.position.x, camera.position.y, camera.position.z);
		}
	}
}

function createDots( myVector, i ) {
	var vector = myVector.clone();
	vector.project( camera );
	var canvas = document.getElementById("dotsCanvas");
	vector.x = Math.round( (   vector.x + 1 ) * window.innerWidth  / 2 );
	vector.y = Math.round( ( - vector.y + 1 ) * window.innerHeight / 2 );
	vector.z = 0;
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.arc(vector.x,vector.y,15,0,2*Math.PI);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
	// now add the number to the dot
	i++;
	var text = i;
	var font = "bold " + 16 + "px monospace";
	ctx.font = font;
	var width = ctx.measureText(text).width;
	var height = ctx.measureText("w").width;
	ctx.fillStyle = "white";
	ctx.fillText(text, vector.x - (width/2), vector.y + (height/2));
}

function hideDots() {
	var allDots = document.getElementById("dotsCanvas");
	if (allDots.style.display === "inline") {
		allDots.style.display = "none";
	}
	else {
		allDots.style.display = "inline";
	}
}

function movePart() {
	heartPart = scene.getObjectByName('heartPart', true);

	const openZ = Math.PI / 2;
	const closedZ = 0.05;
	
	const rotateCoords = {
		z: heartIsOpen ? openZ : closedZ,
	};

	const tween1 = new TWEEN.Tween(rotateCoords);
	tween1
		.to({z: heartIsOpen ? closedZ : openZ}, 1000)
		.onUpdate(() => {
			heartPart.rotation.z = rotateCoords.z;
		})
		.onComplete(() => heartIsOpen = !heartIsOpen)
		.start();
}

function createControls(camera) {

	controls = new TrackballControls(camera, appContainer);

	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

	controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}
