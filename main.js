// misc functions
function getRandomArbitrary(min, max, num) {
  let results = [];
  for (let i = 0; i < num; i++){
    results.push(Math.random() * (max - min) + min);
  }
  return results;
}

function addArray(a,b){
    return a.map((e,i) => e + b[i]);
}



// setup three js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const cameraDistance = 7; // distance from the camera to the origin on x z plane
let theta = 0; // angle of camera in standard position in the x z plane
camera.position.x = Math.cos(theta)*cameraDistance;
camera.position.z = Math.sin(theta)*cameraDistance;
camera.position.y = 1.2;
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);



// TEMP orbit controls
/*const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();*/



// add lighting
const pointLight = new THREE.PointLight(0xffffff); // star
pointLight.position.set(70, 50, -33);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x606060); // ambient
scene.add(ambientLight);



// TEMP helpers
/*const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);*/



// add space background
const skybox = new THREE.CubeTextureLoader(); // random space skybox texture generated thanks to https://tools.wwwtyro.net/space-3d/index.html
const spaceTexture = skybox.load([
  'media/skybox/right.png',
  'media/skybox/left.png',
  'media/skybox/top.png',
  'media/skybox/bottom.png',
  'media/skybox/front.png',
  'media/skybox/back.png',
]);
scene.background = spaceTexture;



// add geometries
let loadPlanet;
let loadRings;
const loader = new THREE.GLTFLoader();
loader.load('models/planet.glb', function(gltf) {
  loadPlanet = gltf;
  scene.add(gltf.scene);
}, undefined, function(error) {
  console.error(error);
});
loader.load('models/rings.glb', function(gltf) {
  loadRings = gltf;
  scene.add(gltf.scene);
}, undefined, function(error) {
  console.error(error);
});

// creating text
const primaryLinks = ['About Me', 'Projects', 'My Work'];
let numPrimaryLinks = primaryLinks.length;
let primaryLinksTheta = Math.PI/(1.5*numPrimaryLinks);
let primaryLinksDict = {}; // dictionary storing the 3d objects of the primary links
const primaryLinksGroup = new THREE.Group(); // create group of objects for the primary links

const ttfLoader = new THREE.TTFLoader();
const fontLoader = new THREE.FontLoader();
ttfLoader.load(
	// resource URL
	'fonts/AdventureSubtitles.ttf',
  // onload callback
  function(loaded){
    let font = fontLoader.parse(loaded);
    // do something with the font
		console.log(font);

    // for each link, load it in
    for (let i = 0; i < numPrimaryLinks; i++){
      let text = new THREE.TextGeometry(primaryLinks[i],{
        font: font,
        size: 0.3,
        height: 0.03,
        curveSegments: 12,
        bevelEnabled: false
      });
      primaryLinksDict[primaryLinks[i]] = new THREE.Mesh(
        text,
        new THREE.MeshPhysicalMaterial({  
          roughness: 0.1,  
          transmission: 0.7, // Add transparency
          thickness: 0.1,
          color: 0xf03030,
        })
      );
      // position each link around the planet
      primaryLinksDict[primaryLinks[i]].geometry.center();
      primaryLinksDict[primaryLinks[i]].position.x = Math.cos(primaryLinksTheta*i)*3.5;
      primaryLinksDict[primaryLinks[i]].position.z = -Math.sin(primaryLinksTheta*i)*3.5;
      primaryLinksDict[primaryLinks[i]].position.y = 0.5;
      
      primaryLinksDict[primaryLinks[i]].rotation.y = (Math.PI/2)+(primaryLinksTheta*i);
      primaryLinksGroup.add(primaryLinksDict[primaryLinks[i]]);
    }
    scene.add(primaryLinksGroup);
  }
);



// animation
let directions = [];
let currentDirection = 0;
let cameraPointX = 0;
let cameraPointY = 0;
let cameraPointZ = 0;
let baseTheta = theta;
function cameraOscillate(numDirections, severity){ // function that animates the camera oscillating between facing some number of randomly generated directions
  if (directions.length === 0){ // if this is the first time being run, generate the random directions
    for (let i = 0; i < numDirections; i++){
      directions.push(getRandomArbitrary(-severity, severity, 3));
    }
  }

  // calculate how close the camera is to the current direction
  let del = Math.abs(cameraPointX - directions[currentDirection][0]) + Math.abs((cameraPointY - directions[currentDirection][1])) + Math.abs((cameraPointZ - directions[currentDirection][2]));

  if (del < 0.1){ // if close enough begin going to the next direction
    if (currentDirection === directions.length-1){
      currentDirection = 0;
    }
    else{
      currentDirection += 1;
    }
  }
  else{ // otherwise go to the current direction
    let scale = 0.01;
    cameraPointX -= scale * (cameraPointX - directions[currentDirection][0]);
    cameraPointY -= scale * (cameraPointY - directions[currentDirection][1]);
    cameraPointZ -= scale * (cameraPointZ - directions[currentDirection][2]);
    camera.lookAt(cameraPointX, cameraPointY, cameraPointZ);
  }

  // rotate about the origin if basePos is updated
  if (Math.abs(theta-baseTheta) > 0.01){
    if (theta > baseTheta){
      theta -= 0.01;
      camera.position.x = Math.cos(theta)*cameraDistance;
      camera.position.z = Math.sin(theta)*cameraDistance;
    }
    else{
      theta += 0.01;
      camera.position.x = Math.cos(theta)*cameraDistance;
      camera.position.z = Math.sin(theta)*cameraDistance;
    }
  }
}

// listen for mousedown and key presses for navigating the menu

// events to handle mouse presses
document.body.onmousedown = function(event){ 
  let x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1; // mouse pos -1 to 1
  if (x > 0.5 ){
    // update camera oscillation vars to make camera move to the right
    directions = [];
    currentDirection = 0;
    baseTheta = baseTheta-primaryLinksTheta;
  }
  if (x < -0.5){
    // update camera oscillation vars to make camera move to the left
    directions = [];
    currentDirection = 0;
    baseTheta = baseTheta+primaryLinksTheta;
  }
};
document.body.onmouseup = function(){
};

// events to handle key presses
document.body.onkeydown = function(event){
  console.log(event)
  if (event.key == 'ArrowRight'){
    // update camera oscillation vars to make camera move to the right
    directions = [];
    currentDirection = 0;
    baseTheta = baseTheta-primaryLinksTheta;
  }
  if (event.key == 'ArrowLeft'){
    // update camera oscillation vars to make camera move to the left
    directions = [];
    currentDirection = 0;
    baseTheta = baseTheta+primaryLinksTheta;
  }
};

// main animation function
function animate() {
  // rotate the planet and rings
  if (loadPlanet){
    loadPlanet.scene.rotation.y += 0.003;
  }
  if (loadRings){
    loadRings.scene.rotation.y += 0.01;
  }

  // oscillate the camera
  cameraOscillate(5, 0.8);
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);