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

const cameraDistance = 6; // distance from the camera to the origin on x z plane
const theta = Math.PI/2; // angle of camera in standard position in the x z plane
camera.position.x = Math.cos(theta)*cameraDistance;
camera.position.z = Math.sin(theta)*cameraDistance;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera);



// TEMP orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();



// add lighting
const pointLight = new THREE.PointLight(0xffffff); // star
pointLight.position.set(70, 50, -33);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x606060); // ambient
scene.add(ambientLight);



// TEMP helpers
/*const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper)*/



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
    const text = new THREE.TextGeometry('PLACEHOLDER',{
      font: font,
      size: 30,
      height: 3,
      curveSegments: 12,
      bevelEnabled: false
    });
    const textMesh = new THREE.Mesh(
      text,
      new THREE.MeshPhysicalMaterial({  
        roughness: 0.1,  
        transmission: 0.7, // Add transparency
        thickness: 0.1,
        color: 0xf03030,
      })
    );
    textMesh.geometry.center();
    textMesh.scale.x = 0.01; 
    textMesh.scale.y = 0.01; 
    textMesh.scale.z = 0.01;

    textMesh.position.z = 3.5;
    textMesh.position.y = 0.5;
    textMesh.rotation.x = -Math.PI/15;
    scene.add(textMesh)
  }
);


// animation
let directions = [];
let currentDirection = 0;
function cameraOscillate(numDirections, severity){ // function that animates the camera oscillating between facing some number of randomly generated directions
  if (directions.length === 0){ // if this is the first time being run, generate the random directions
    for (let i = 0; i < numDirections; i++){
      directions.push(addArray([camera.rotation.x, camera.rotation.y, camera.rotation.z], getRandomArbitrary(-severity, severity, 3)));
    }
  }

  // calculate how close the camera is to the current direction
  let del = Math.abs(camera.rotation.x - directions[currentDirection][0]) + Math.abs((camera.rotation.y - directions[currentDirection][1])) + Math.abs((camera.rotation.z - directions[currentDirection][2]));

  if (del < 0.1){ // if close enough begin going to the next direction
    if (currentDirection === directions.length-1){
      currentDirection = 0;
    }
    else{
      currentDirection += 1;
    }
  }
  else{ // otherwise go to the current direction
    let scale = 5000*Math.abs(camera.rotation.x - directions[currentDirection][0]);
    camera.rotation.x -= (camera.rotation.x - directions[currentDirection][0])/scale;
    camera.rotation.y -= (camera.rotation.y - directions[currentDirection][1])/scale;
    camera.rotation.z -= (camera.rotation.z - directions[currentDirection][2])/scale;
  }
}

function animate() {
  // rotate the planet and rings
  if (loadPlanet){
    loadPlanet.scene.rotation.y += 0.003;
  }
  if (loadRings){
    loadRings.scene.rotation.y += 0.01;
  }

  // oscillate the camera
  cameraOscillate(5, 0.1);
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);