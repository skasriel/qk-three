import React from 'react'
import './App.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm//utils/RoughnessMipmapper.js';

function App () {
  return null;

  return (
    <div className='App'>
    Three.js test
    </div>
  )
}


var container, controls;
var camera, scene, renderer;
var light;
var lightX=1, lightY=1, lightZ=2;
var mainObject;
var clock = new THREE.Clock();

drawModel();
render();

function randomInt(min, max) {
  return Math.floor(Math.random()*(max-min) + min);
}

function drawModel() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
  camera.position.set(0,0,5);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // add light
  light = new THREE.PointLight( 0xffffff, 20, 100 );
  light.position.set(lightX, lightY, lightZ);
  var sphere = new THREE.SphereBufferGeometry( 0.1);
  light.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
  scene.add(light);

  // Create the background from an HDR image
  /*var path = '/textures/';
  var urls = ['10-Shiodome_Stairs_3k.hdr','Playa_Sunrise_Env.hdr', '14-Hamarikyu_Bridge_B_3k.hdr',
    'Serpentine_Valley_3k.hdr', 'Brooklyn_Bridge_Planks_2k.hdr', 'Tropical_Beach_3k.hdr',
    'LA_Downtown_Afternoon_Fishing_3k.hdr', 'WinterForest_Ref.hdr',
    'Mono_Lake_C_Ref.hdr', 'royal_esplanade_1k.hdr'];
  var url = urls[randomInt(0, urls.length)];
  new RGBELoader()
  .setDataType( THREE.UnsignedByteType )
  .setPath(path)
  .load(url, function (texture) {
    var envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.background = envMap;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();
    render();
  });*/

  // load the 3D Model from GLTF file
  var paths = [
                ['/models/DamagedHelmet/glTF/', 'DamagedHelmet.gltf'],
                ['/models/Duck/glTF/', 'Duck.gltf'],
                ['/models/CesiumMan/glTF/', 'CesiumMan.gltf'],
                ['/models/FlightHelmet/glTF/', 'FlightHelmet.gltf'],
                ['/models/Fox/glTF/', 'Fox.gltf'],
                ['/models/MetalRoughSpheres/glTF/', 'MetalRoughSpheres.gltf'],
                ['/models/Suzanne/glTF/', 'Suzanne.gltf'],
              ];
  var objNum = 0; //randomInt(0, paths.length);
  var path = paths[objNum][0];
  var url = paths[objNum][1];

  var loader = new GLTFLoader().setPath(path);
  loader.load(url, function (gltf) {
    mainObject = gltf.scene;
    scene.add(mainObject);
    render();
  }, function (xhr) {
    console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  }, function (error) {
    console.log( "Error downloading "+url+": "+error);
  });

  container.appendChild( renderer.domElement );

  var pmremGenerator = new THREE.PMREMGenerator( renderer );
  pmremGenerator.compileEquirectangularShader();

  controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.target.set( 0, 0, - 0.2 );
  controls.update();

  window.addEventListener( 'resize', onWindowResize, false );
  console.log("Setup complete");
  var animate = function () {
    requestAnimationFrame( animate );

    var time = Date.now() * 0.0005;
		var delta = clock.getDelta();

    if (mainObject) mainObject.rotation.y -= 0.5 * delta;

		light.position.x = lightX + Math.sin( time * 0.7 ) * 2;
		light.position.y = lightY + Math.cos( time * 0.5 ) * 1;
		light.position.z = lightZ + Math.cos( time * 0.3 ) * .5;

    renderer.render( scene, camera );
  };
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

//

function render() {
  console.log("Rendering");
  renderer.render( scene, camera );
}

function drawCube() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  var geometry = new THREE.BoxGeometry();
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  camera.position.set( 0, 0, 5 );
  camera.lookAt( 0, 0, 0 );

  document.body.appendChild( renderer.domElement );

  var animate = function () {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
  };
  animate();
}

function drawLines() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  //create a blue arrow
  var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  var points = [];
  points.push( new THREE.Vector3( - 10, 0, 0 ) );
  points.push( new THREE.Vector3( 0, 10, 0 ) );
  points.push( new THREE.Vector3( 10, 0, 0 ) );
  var geometry = new THREE.BufferGeometry().setFromPoints( points );
  var line = new THREE.Line( geometry, material );
  scene.add( line );

  camera.position.set( 0, 0, 20 );
  camera.lookAt( 0, 0, 0 );

  document.body.appendChild( renderer.domElement );
  renderer.render( scene, camera );
}

//drawLines();

// load 3D object
/*var loader = new GLTFLoader();
loader.load( '/DamagedHelmet/glTF/DamagedHelmet.gltf', function ( gltf ) {
scene.add( gltf.scene );
}, function ( xhr ) {
console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
}, function ( error ) {
console.log( "Error: "+error );
});*/





export default App
