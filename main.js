// misc functions
function getRandomArbitrary(min, max, num) {
  let results = [];
  for (let i = 0; i < num; i++) {
    results.push(Math.random() * (max - min) + min);
  }
  return results;
}

function addArray(a, b) {
  return a.map((e, i) => e + b[i]);
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
camera.position.x = Math.cos(theta) * cameraDistance;
camera.position.z = Math.sin(theta) * cameraDistance;
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
const primaryLinks = {};
primaryLinks.links = ['About Me', 'Projects', 'My Work'];
primaryLinks.num = primaryLinks.links.length;
primaryLinks.theta = Math.PI / (1.5 * primaryLinks.num);
primaryLinks.dict = {}; // dictionary storing the 3d objects of the primary links
primaryLinks.group = new THREE.Group(); // create group of objects for the primary links

const projectLinks = {};
projectLinks.links = ['Quantum\nComputing', 'Machine\nLearning', 'Theorem\nProving', 'More'];
projectLinks.num = projectLinks.links.length;
projectLinks.theta = Math.PI / (projectLinks.num);
projectLinks.dict = {};
projectLinks.group = new THREE.Group();

const quantumProjects = {};
quantumProjects.links = ['Qonic', 'Quantum\nHoare Logic', 'QCPUWare', 'Breakthrough\nJr Challenge'];
quantumProjects.num = quantumProjects.links.length;
quantumProjects.theta = Math.PI / (quantumProjects.num);
quantumProjects.dict = {};
quantumProjects.group = new THREE.Group();

const aiProjects = {};
aiProjects.links = ['Hill Climb\nRacing AI', 'Custom Java\nNeural Network'];
aiProjects.num = aiProjects.links.length;
aiProjects.theta = Math.PI / (aiProjects.num);
aiProjects.dict = {};
aiProjects.group = new THREE.Group();

const tpProjects = {};
tpProjects.links = ['Lean4 Turing\nMachine', 'Lean4 Axiomatic\nSystem', 'Quantum\nHoare Logic'];
tpProjects.num = tpProjects.links.length;
tpProjects.theta = Math.PI / (tpProjects.num);
tpProjects.dict = {};
tpProjects.group = new THREE.Group();

const moreProjects = {};
moreProjects.links = ['Robotics', 'AP Physics\nLabs Portfolio'];
moreProjects.num = moreProjects.links.length;
moreProjects.theta = Math.PI / (moreProjects.num);
moreProjects.dict = {};
moreProjects.group = new THREE.Group();

const workLinks = {};
workLinks.links = ['SVVSD AI\nLeadership', 'SVVSD SAR'];
workLinks.num = workLinks.links.length;
workLinks.theta = Math.PI / (workLinks.num);
workLinks.dict = {};
workLinks.group = new THREE.Group();

let currentMenu = primaryLinks; // this variable keeps track of the currently loaded menu
let previousMenu; // this variable stores the previous menu so it can be un-loaded
const ttfLoader = new THREE.TTFLoader();
const fontLoader = new THREE.FontLoader();

function loadMenu(newMenu, visible = false) { // function to transition from the current menu to a new menu
  if (newMenu.group.children.length == 0) {
    ttfLoader.load(
      // resource URL
      'fonts/AdventureSubtitles.ttf',
      // onload callback
      function(loaded) {
        let font = fontLoader.parse(loaded);
        // do something with the font
        console.log(font);

        // for each link, load it in
        for (let i = 0; i < newMenu.num; i++) {
          let text = new THREE.TextGeometry(newMenu.links[i], {
            font: font,
            size: 0.3,
            height: 0.03,
            curveSegments: 12,
            bevelEnabled: false
          });
          newMenu.dict[newMenu.links[i]] = new THREE.Mesh(
            text,
            new THREE.MeshPhysicalMaterial({
              roughness: 0.1,
              transmission: 0.7, // Add transparency
              thickness: 0.1,
              color: 0xf03030,
            })
          );
          // position each link around the planet
          newMenu.dict[newMenu.links[i]].geometry.center();
          newMenu.dict[newMenu.links[i]].position.x = Math.cos(newMenu.theta * i) * 3.5;
          newMenu.dict[newMenu.links[i]].position.z = -Math.sin(newMenu.theta * i) * 3.5;
          newMenu.dict[newMenu.links[i]].position.y = 0.6;

          newMenu.dict[newMenu.links[i]].rotation.y = (Math.PI / 2) + (newMenu.theta * i);
          if (!visible) {
            newMenu.dict[newMenu.links[i]].visible = false;
          }

          newMenu.group.add(newMenu.dict[newMenu.links[i]]);
        }
        scene.add(newMenu.group);
      }
    );
  }
}
loadMenu(currentMenu, true);
loadMenu(projectLinks);
loadMenu(quantumProjects);
loadMenu(aiProjects);
loadMenu(tpProjects);
loadMenu(moreProjects);
loadMenu(workLinks);
let transitioning = false;



// animation
let directions = [];
let currentDirection = 0;
let cameraPointX = 0;
let cameraPointY = 0;
let cameraPointZ = 0;
let baseTheta = theta;
function cameraOscillate(numDirections, severity) { // function that animates the camera oscillating between facing some number of randomly generated directions
  if (directions.length === 0) { // if this is the first time being run, generate the random directions
    for (let i = 0; i < numDirections; i++) {
      directions.push(getRandomArbitrary(-severity, severity, 3));
    }
  }

  // calculate how close the camera is to the current direction
  let del = Math.abs(cameraPointX - directions[currentDirection][0]) + Math.abs((cameraPointY - directions[currentDirection][1])) + Math.abs((cameraPointZ - directions[currentDirection][2]));

  if (del < 0.1) { // if close enough begin going to the next direction
    if (currentDirection === directions.length - 1) {
      currentDirection = 0;
    }
    else {
      currentDirection += 1;
    }
  }
  else { // otherwise go to the current direction
    let scale = 0.01;
    cameraPointX -= scale * (cameraPointX - directions[currentDirection][0]);
    cameraPointY -= scale * (cameraPointY - directions[currentDirection][1]);
    cameraPointZ -= scale * (cameraPointZ - directions[currentDirection][2]);
    camera.lookAt(cameraPointX, cameraPointY, cameraPointZ);
  }

  // rotate about the origin if basePos is updated
  if (Math.abs(theta - baseTheta) > 0.01) {
    if (theta > baseTheta) {
      theta -= 0.01;
      camera.position.x = Math.cos(theta) * cameraDistance;
      camera.position.z = Math.sin(theta) * cameraDistance;
    }
    else {
      theta += 0.01;
      camera.position.x = Math.cos(theta) * cameraDistance;
      camera.position.z = Math.sin(theta) * cameraDistance;
    }
  }
}

// listen for mousedown and key presses for navigating the menu

// events to handle mouse presses
var mouseDown = 0;
var raycaster = new THREE.Raycaster(); // raycaster object to detect objects intersected by the ray sent out by the mouse
var mouseVector = new THREE.Vector3(); // vector to store the mouse position
document.body.onmousedown = function(event) {
  mouseDown = 1;
  let x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1; // mouse pos -1 to 1
  if (x > 0.5) {
    if (-currentMenu.theta * currentMenu.num - (baseTheta - currentMenu.theta) < -0.1) { // don't update if this is the rightmost option
      // update camera oscillation vars to make camera move to the right
      directions = [];
      currentDirection = 0;
      baseTheta = baseTheta - currentMenu.theta;
    }
  }
  if (x < -0.5) {
    if (baseTheta + currentMenu.theta < 0.1) { // don't update if this is the leftmost option
      // update camera oscillation vars to make camera move to the left
      directions = [];
      currentDirection = 0;
      baseTheta = baseTheta + currentMenu.theta;
    }
  }
};
document.body.onmouseup = function() {
  mouseDown = 0;
}
document.body.onmousemove = function(event) { // dont trigger the mouse down if the mouse is moving
  mouseDown = 0;
  mouseVector.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouseVector.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;
}
document.addEventListener('touchstart', function() {
  mouseDown = 1;
});
document.addEventListener('touchend', function() {
  mouseDown = 0;
});

// events to handle key presses
document.body.onkeydown = function(event) {
  console.log(event)
  if (event.key == 'ArrowRight') {
    if (-currentMenu.theta * currentMenu.num - (baseTheta - currentMenu.theta) < -0.1) { // don't update if this is the rightmost option
      // update camera oscillation vars to make camera move to the right
      directions = [];
      currentDirection = 0;
      baseTheta = baseTheta - currentMenu.theta;
    }
  }
  if (event.key == 'ArrowLeft') {
    if (baseTheta + currentMenu.theta < 0.1) { // don't update if this is the leftmost option
      // update camera oscillation vars to make camera move to the left
      directions = [];
      currentDirection = 0;
      baseTheta = baseTheta + currentMenu.theta;
    }
  }
};

function transitionMenu() {
  if (currentMenu.group.children.length == currentMenu.num) {
    directions = [];
    currentDirection = 0;
    baseTheta = theta - 2 * Math.PI;
    transitioning = true;
  }
}

// main animation function
function animate() {
  // rotate the planet and rings
  if (loadPlanet) {
    loadPlanet.scene.rotation.y += 0.003;
  }
  if (loadRings) {
    loadRings.scene.rotation.y += 0.01;
  }

  // oscillate the camera
  cameraOscillate(5, 0.8);

  // check to see if a link has been selected
  raycaster.setFromCamera(mouseVector, camera); // send a ray from the camera to the mouse vector
  var intersects = raycaster.intersectObjects(currentMenu.group.children); // detect object intersecting the ray
  currentMenu.group.children.forEach(function(cube) { // reset color of each object
    cube.material.color.setHex(0xf03030);
  });
  if (intersects.length > 0) { // if there are objects that were intersected
    var intersection = intersects[0];
    var obj = intersection.object;

    if (mouseDown == 1) {
      obj.material.color.setHex(0xffd900);
      if (currentMenu == primaryLinks){
        if (obj == primaryLinks.group.children[0]){
          
        }
        else if (obj == primaryLinks.group.children[1]){
          previousMenu = currentMenu;
          currentMenu = projectLinks;
          transitionMenu();
        }
        else if (obj == primaryLinks.group.children[2]){
          previousMenu = currentMenu;
          currentMenu = workLinks;
          transitionMenu();
        }
      }
      else if (currentMenu == projectLinks){
        if (obj == projectLinks.group.children[0]){
          previousMenu = currentMenu;
          currentMenu = quantumProjects;
          transitionMenu();
        }
        else if (obj == projectLinks.group.children[1]){
          previousMenu = currentMenu;
          currentMenu = aiProjects;
          transitionMenu();
        }
        else if (obj == projectLinks.group.children[2]){
          previousMenu = currentMenu;
          currentMenu = tpProjects;
          transitionMenu();
        }
        else if (obj == projectLinks.group.children[3]){
          previousMenu = currentMenu;
          currentMenu = moreProjects;
          transitionMenu();
        }
      }
    }
    else {
      obj.material.color.setHex(0xff4400);
    }
  }

  // check to see if the menu is being transitioned
  if (transitioning) {
    for (let i = 0; i < currentMenu.num; i++) {
      if (Math.abs(Math.abs(theta) - currentMenu.theta * i - Math.PI) < 0.1) {
        currentMenu.group.children[i].visible = true;
      }
    }
    for (let i = 0; i < previousMenu.num; i++) {
      if (Math.abs(Math.abs(theta) - previousMenu.theta * i - Math.PI) < 0.1) {
        previousMenu.group.children[i].visible = false;
      }
    }
    if (Math.abs(theta) > 1.99 * Math.PI) {
      transitioning = false;
      baseTheta = 0;
      theta = 0;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);