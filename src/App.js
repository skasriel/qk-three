//import './App.scss'
import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
//import { FBXLoader } from 'three-fbx-loader';
//var FBXLoader = require('three-fbx-loader');
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


function App () {
  return null;
}

const cameraY=1;

var container, controls;
var camera, scene, renderer;
var light;
var lightX=1, lightY=1, lightZ=2;
let mainCharacter, mainCharacterMixer, mainCharacterActions;

var clock = new THREE.Clock();
const mixers = [];
var objects = [];

var raycaster;

var idleAction, walkAction, runAction;
let isWalking = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

setup();
render();
animate();

function setup() {
  basicSetup();
  floorSetup();
  lightSetup();
  skySetup();
  characterSetup();
  controlsSetup();
}

function controlsSetup() {
  console.log("Setting up controls...");
  controls = new PointerLockControls( camera, document.body );
  var rootObj = document.getElementById('root');
  console.log("Root = "+rootObj+" "+rootObj.innerHTML.toString());
  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );

  instructions.addEventListener( 'click', function () {
    controls.lock();
  }, false );

  controls.addEventListener( 'lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
  } );

  controls.addEventListener( 'unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
  } );
  scene.add( controls.getObject() );

  var onKeyDown = function ( event ) {
    console.log("Key down = "+event.keyCode);
    switch ( event.keyCode ) {
      case 38: // up
      case 87: // w
      moveForward = true;
      break;

      case 37: // left
      case 65: // a
      moveLeft = true;
      break;

      case 40: // down
      case 83: // s
      moveBackward = true;
      break;

      case 39: // right
      case 68: // d
      moveRight = true;
      break;

      case 32: // space
      if ( canJump === true ) velocity.y += 5;
      canJump = false;
      break;
    }
  };

  var onKeyUp = function ( event ) {
    switch ( event.keyCode ) {
      case 38: // up
      case 87: // w
      moveForward = false;
      break;

      case 37: // left
      case 65: // a
      moveLeft = false;
      break;

      case 40: // down
      case 83: // s
      moveBackward = false;
      break;

      case 39: // right
      case 68: // d
      moveRight = false;
      break;
    }
  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  /*controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.target.set( 0, 0, - 0.2 );
  controls.update();*/

  window.addEventListener( 'resize', onWindowResize, false );
  console.log("Controls setup complete");
}


function basicSetup() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 3, 20 );
  camera.position.set(0,cameraY,5);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  container.appendChild( renderer.domElement );
}

function floorSetup() {
  let ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 400, 400 ),
    new THREE.MeshBasicMaterial( { color: 0x6e6a62, depthWrite: false } )
  );
  ground.rotation.x = - Math.PI / 2;
  ground.renderOrder = 1;
  scene.add( ground );

  let grid = new THREE.GridHelper( 400, 80, 0x000000, 0x000000 );
  grid.material.opacity = 0.1;
  grid.material.depthWrite = false;
  grid.material.transparent = true;
  scene.add( grid );
}

function skySetup() {
  let sky = new Sky();
  sky.scale.setScalar( 450000 );
  scene.add( sky );

  // Add Sun Helper
  let sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 20000, 16, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } )
  );
  sunSphere.position.y = - 700000;
  sunSphere.visible = false;
  scene.add( sunSphere );

  var effectController = {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    luminance: 1,
    inclination: 0.49, // elevation / inclination
    azimuth: 0.25, // Facing front,
    sun: ! true
  };
  var distance = 400000;
  var uniforms = sky.material.uniforms;
  uniforms[ "turbidity" ].value = effectController.turbidity;
  uniforms[ "rayleigh" ].value = effectController.rayleigh;
  uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
  uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;
  uniforms[ "luminance" ].value = effectController.luminance;

  var theta = Math.PI * ( effectController.inclination - 0.5 );
  var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

  sunSphere.position.x = distance * Math.cos( phi );
  sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
  sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
  sunSphere.visible = effectController.sun;
  uniforms[ "sunPosition" ].value.copy( sunSphere.position );
}

function lightSetup() {
  var light = new THREE.AmbientLight( 0xffffff, 3 ); // soft white light
  scene.add( light );

  // adds ambient light
  //var ambient_light = new THREE.AmbientLight("rgb(54%, 0%, 0%)"); // soft white light
  //scene.add( ambient_light );

  //spotlight
  var spotLight = new THREE.SpotLight( "rgb(54%, 0%, 0%)" );
  spotLight.position.set( 100, 100, 100 );
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;
  scene.add( spotLight );

  /*var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  var helper = new THREE.HemisphereLightHelper( light, 5 );
  scene.add( helper );*/

  /*light = new THREE.PointLight( 0xffffff, 20, 100 );
  light.position.set(lightX, lightY, lightZ);
  var sphere = new THREE.SphereBufferGeometry( 0.1);
  light.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
  scene.add(light);*/

  /*
  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );
        */
}

function characterSetup() {
    // load the 3D Model from GLTF file
    /*var paths = [
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
    var url = paths[objNum][1];*/

    //let url = '/models/qk-HipHopDancing/HipHopDancing.fbx';
    //let url = '/models/stitch/scene.gltf' ;
    //let url = '/models/knight_runnig/scene.gltf';
    // let url = '/models/DamagedHelmet/glTF/DamagedHelmet.gltf';
    // let url = '/models/Suzanne/glTF/Suzanne.gltf';
    let url = 'models/Soldier.glb';
    let loader;
    if (url.endsWith('.fbx'))
      loader = new FBXLoader();
    else if (url.endsWith('.gltf') || url.endsWith('.glb'))
      loader = new GLTFLoader();
    else
      console.log("Wrong url - unrecognized format: "+url);

    if (url.indexOf('Soldier.glb')>=0) {
        loader.load(url, function (gltf) {
          mainCharacter = gltf.scene;
          scene.add(mainCharacter);

          mainCharacter.traverse(function (object) {
            if ( object.isMesh ) object.castShadow = true;
          });

          //skeleton = new THREE.SkeletonHelper( model );
          //skeleton.visible = false;
          //scene.add( skeleton );
          //
          //createPanel();
          //
          var animations = gltf.animations;
          mainCharacterMixer = new THREE.AnimationMixer( mainCharacter );
          //mixers.push(mixer);
          idleAction = mainCharacterMixer.clipAction(animations[0]);
          walkAction = mainCharacterMixer.clipAction(animations[3]);
          runAction = mainCharacterMixer.clipAction(animations[1]);
          mainCharacterActions = [ idleAction, walkAction, runAction ];
          activateAllActions();

          /*
          // load additional animations for the soldier... doesn't work yet.
          url = '/models/Soldier-Shoot2.glb';
          loader = new GLTFLoader();
          loader.load(url, function (gltf) {
            var animations = gltf.animations;
            var animation = animations[0];
            let action = mainCharacterMixer.clipAction(animation);
            console.log("Animation = "+animation);
            //mainCharacterActions.push(action);
            runAction = action;
            action.play();
          }, null, function(error) {
            console.log("Error downloading "+url+": "+error);
          });*/



          animate();
        }, function (xhr) {
          console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        }, function (error) {
          console.log( "Error downloading "+url+": "+error);
        });
    } else {
      loader.load(url, function (object3d) {
        console.log("Success loading "+url+" "+object3d);
        if (object3d && object3d.scene) {
          if (object3d.scene.children && object3d.scene.children.length>0) {
            mainCharacter = object3d.scene.children[0];
          } else {
            mainCharacter = object3d.scence;
          }
        } else {
          mainCharacter = object3d;
        }
        mainCharacter.rotation.y = 0; //Math.PI;

        scene.add(mainCharacter);

        /* shadow
  					var texture = new THREE.TextureLoader().load( 'models/gltf/ferrari_ao.png' );
  					var shadow = new THREE.Mesh(
  						new THREE.PlaneBufferGeometry( 0.655 * 4, 1.3 * 4 ),
  						new THREE.MeshBasicMaterial( {
  							map: texture, opacity: 0.7, transparent: true
  						} )
  					);
  					shadow.rotation.x = - Math.PI / 2;
  					shadow.renderOrder = 2;
  					carModel.add( shadow );
          */

        if (object3d.animations && object3d.animations.length>0) {
          const animation = object3d.animations[0];
          const mixer = new THREE.AnimationMixer(mainCharacter);
          mixers.push(mixer);
          const action = mixer.clipAction(animation);
          action.play();
        }
        render();
      }, function (xhr) {
        console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      }, function (error) {
      console.log( "Error downloading "+url+": "+error);
      });
    }
}

function activateAllActions() {
  setWeight( idleAction, 1.0);
  setWeight( walkAction, 0.0);
  setWeight( runAction, 0.0);
  mainCharacterActions.forEach( function ( action ) {
    action.play();
  } );
}
function prepareCrossFade( startAction, endAction, duration ) {
  // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
  // else wait until the current action has finished its current loop
  if ( startAction === idleAction ) {
    executeCrossFade( startAction, endAction, duration );
  } else {
    synchronizeCrossFade( startAction, endAction, duration );
  }
}
function synchronizeCrossFade( startAction, endAction, duration ) {
  mainCharacterMixer.addEventListener( 'loop', onLoopFinished );
  function onLoopFinished( event ) {
    if ( event.action === startAction ) {
      mainCharacterMixer.removeEventListener( 'loop', onLoopFinished );
      executeCrossFade( startAction, endAction, duration );
    }
  }
}
function executeCrossFade( startAction, endAction, duration ) {
  // Not only the start action, but also the end action must get a weight of 1 before fading
  // (concerning the start action this is already guaranteed in this place)
  setWeight( endAction, 1 );
  endAction.time = 0;
  // Crossfade with warping - you can also try without warping by setting the third parameter to false
  startAction.crossFadeTo( endAction, duration, true );
}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))
function setWeight( action, weight ) {
  action.enabled = true;
  action.setEffectiveTimeScale( 1 );
  action.setEffectiveWeight( weight );
}
function animate() {
  requestAnimationFrame(animate);

  var time = Date.now() * 0.0005;
  var delta = clock.getDelta();

  // run model animations
  for ( const mixer of mixers ) {
    mixer.update( delta );
  }

  // animate main character
  if (mainCharacterMixer) {
    mainCharacterMixer.update( delta );
  }


  if (controls.isLocked === true ) {
    let onObject = true;
    /*raycaster.ray.origin.copy( controls.getObject().position );
    raycaster.ray.origin.y -= 10;
    var intersections = raycaster.intersectObjects( objects );
    var onObject = intersections.length > 0;*/

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * delta; // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 100.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 100.0 * delta;

    if (moveForward || moveBackward || moveLeft || moveRight) {
      if (! isWalking) {
        prepareCrossFade(idleAction, runAction, 0.5);
        isWalking = true;
      }
    } else if (isWalking) {
      console.log("Preparing to stop");
      prepareCrossFade(runAction, idleAction, 1.0);
      isWalking = false;
    }
    if (moveLeft)
      mainCharacter.rotation.y = Math.PI/2; //- Math.PI / .7;
    else if (moveRight)
      mainCharacter.rotation.y = -Math.PI/2; // Math.PI * .7;
    else if (moveBackward)
      mainCharacter.rotation.y = -Math.PI;
    else if (mainCharacter && mainCharacter.rotation)  {
      mainCharacter.rotation.y = 0; //Math.PI;
    }

    if ( mainCharacter.position.y === 0) {// controls.getObject().position.y == 0 /*onObject === true*/ ) {
      velocity.y = Math.max( 0, velocity.y );
      canJump = true;
    }

    if (velocity.x>0 & velocity.x<0.01) velocity.x=0;
    if (velocity.y>0 & velocity.y<0.01) velocity.y=0;
    if (velocity.z>0 & velocity.z<0.01) velocity.z=0;
    if (velocity.x<0 & velocity.x>-0.01) velocity.x=0;
    if (velocity.y<0 & velocity.y>-0.01) velocity.y=0;
    if (velocity.z<0 & velocity.z>-0.01) velocity.z=0;

    controls.moveRight( - velocity.x * delta );
    mainCharacter.position.x +=  - velocity.x * delta;
    controls.moveForward( - velocity.z * delta );
    mainCharacter.position.z -= - velocity.z * delta;

    controls.getObject().position.y += ( velocity.y * delta );
    mainCharacter.position.y += ( velocity.y * delta );
    if ( mainCharacter.position.y < 0) {
      velocity.y = 0;
      mainCharacter.position.y = 0;
      controls.getObject().position.y = cameraY;
      canJump = true;
    }
  }

  render();
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

function render() {
  renderer.render( scene, camera );
}



function randomInt(min, max) {
  return Math.floor(Math.random()*(max-min) + min);
}


export default App
