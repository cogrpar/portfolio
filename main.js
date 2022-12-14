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

function loadInfo(infoFile) { // function that loads info from a json file into the info overlay
  fetch(infoFile).then((response) => {
    response.text().then((data) => {
      let info = JSON.parse(data);
      document.getElementById('content').innerHTML = '';
      if (info.img){ // include the image if a link is provided in the json file
        document.getElementById('content').innerHTML = '<img src="' + info.img + '"><br><br>';
      }
      document.getElementById('content').innerHTML += info.text; // add the text
      console.log(document.getElementById('content'));
    })
  });
}

const startLoad = Date.now();
let viewingOverlay = false;



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

const ambientLight = new THREE.AmbientLight(0x808080); // ambient
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
let loading = true;

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
projectLinks.links = [' Quantum \nComputing', 'Machine\nLearning', 'Theorem\nProving', 'More'];
projectLinks.num = projectLinks.links.length;
projectLinks.theta = Math.PI / (projectLinks.num);
projectLinks.dict = {};
projectLinks.group = new THREE.Group();

const quantumProjects = {};
quantumProjects.links = ['Qonic', '  Quantum  \nHoare Logic', 'QCPUWare', 'Breakthrough\nJr Challenge'];
quantumProjects.num = quantumProjects.links.length;
quantumProjects.theta = Math.PI / (quantumProjects.num);
quantumProjects.dict = {};
quantumProjects.group = new THREE.Group();

const aiProjects = {};
aiProjects.links = [' Hill Climb \nRacing AI', ' Custom Java \nNeural Network', '     Distributed\n Network Training'];
aiProjects.num = aiProjects.links.length;
aiProjects.theta = Math.PI / (aiProjects.num);
aiProjects.dict = {};
aiProjects.group = new THREE.Group();

const tpProjects = {};
tpProjects.links = ['Lean4 Turing\n  Machine  ', 'Lean4 Axiomatic\n    System    ', '  Quantum  \nHoare Logic'];
tpProjects.num = tpProjects.links.length;
tpProjects.theta = Math.PI / (tpProjects.num);
tpProjects.dict = {};
tpProjects.group = new THREE.Group();

const moreProjects = {};
moreProjects.links = ['Robotics', '  AP Physics  \nLabs Portfolio'];
moreProjects.num = moreProjects.links.length;
moreProjects.theta = Math.PI / (moreProjects.num);
moreProjects.dict = {};
moreProjects.group = new THREE.Group();

const workLinks = {};
workLinks.links = [' SVVSD AI \nLeadership', 'SVVSD SAR'];
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
            size: 0.24,
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

          // add a detection box behind this text
          const detectionBoxGeometry = new THREE.BoxGeometry(2.4, 0.8, 0.03);
          const detectionBoxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
          const detectionBox = new THREE.Mesh(detectionBoxGeometry, detectionBoxMaterial);
          detectionBox.geometry.center();
          detectionBox.position.x = Math.cos(newMenu.theta * i) * 3.4;
          detectionBox.position.z = -Math.sin(newMenu.theta * i) * 3.4;
          detectionBox.position.y = 0.6;
          detectionBox.rotation.y = (Math.PI / 2) + (newMenu.theta * i);

          detectionBox.visible = false; // make the detection box invisible

          newMenu.group.add(newMenu.dict[newMenu.links[i]]);
          newMenu.group.add(detectionBox);
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
var mouseVector = new THREE.Vector3([renderer.domElement.clientWidth, renderer.domElement.clientHeight, 0]); // vector to store the mouse position
document.body.onmousedown = function(event) {
  mouseDown = 1;
  let x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1; // mouse pos -1 to 1
  if (!viewingOverlay && !transitioning) {
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
if ("ontouchstart" in document.documentElement) {
  document.addEventListener('touchstart', function() {
    mouseDown = 1;
  });
  document.addEventListener('touchend', function() {
    mouseDown = 0;
  });
  document.addEventListener('touchcancel', function() {
    mouseDown = 0;
  });
}

// back button event listener
document.getElementById('backButton').addEventListener('click', function() {
  if (!transitioning && !viewingOverlay) {
    if (currentMenu == projectLinks || currentMenu == workLinks) {
      previousMenu = currentMenu;
      currentMenu = primaryLinks;
      transitionMenu();
    }
    else if (currentMenu == quantumProjects || currentMenu == aiProjects || currentMenu == tpProjects || currentMenu == moreProjects) {
      previousMenu = currentMenu;
      currentMenu = projectLinks;
      transitionMenu();
    }
  }
});
// info overlay x button
document.getElementsByName('overlayButton')[0].addEventListener('click', function() {
  document.getElementById('infoOverlay').style.animation = 'slideOut 2s forwards';
  viewingOverlay = false;
});

// events to handle key presses
document.body.onkeydown = function(event) {
  if (!viewingOverlay && !transitioning) {
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
  }
};

function transitionMenu() {
  if (currentMenu.group.children.length == currentMenu.num*2) {
    directions = [];
    currentDirection = 0;
    baseTheta = theta - 2 * Math.PI;
    transitioning = true;
  }
}

let cooldown = 0; // a cooldown counter that updates each frame

// main animation function
function animate() {
  cooldown++;
  
  // check to see if the geometries are done loading
  if (loading) {
    if (currentMenu.group.children.length == currentMenu.num*2 &&
      projectLinks.group.children.length == projectLinks.num*2 &&
      quantumProjects.group.children.length == quantumProjects.num*2 &&
      aiProjects.group.children.length == aiProjects.num*2 &&
      tpProjects.group.children.length == tpProjects.num*2 &&
      moreProjects.group.children.length == moreProjects.num*2 &&
      workLinks.group.children.length == workLinks.num*2 &&
      loadPlanet && loadRings) {
      // if all geometries are loaded, make the loading screen go away
      loading = false;
      const endLoad = Date.now();
      const loadTime = endLoad - startLoad;
      document.getElementById('loading').style.animationDuration = loadTime / 0.75 + 2000 + 'ms';
      document.getElementById('backButton').style.animationDelay = 2 + Math.max(13, loadTime / 1000) + 's';
    }
  }

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
  currentMenu.group.children.forEach(function(obj) { // reset color of each object
    obj.material.color.setHex(0xf03030);
  });
  if (intersects.length > 0 && !viewingOverlay && !transitioning) { // if there are objects that were intersected
    var intersection = intersects[0];
    for (var i = 1; i < currentMenu.num * 2; i += 2){
      if (intersection.object == currentMenu.group.children[i]){
        intersection.object = currentMenu.group.children[i-1]; // if a detection box was intersected, set the intersection to the corresponding text
        break;
      }
    }
    var obj = intersection.object;

    if (mouseDown == 1 && cooldown > 10) {
      cooldown = 0;
      obj.material.color.setHex(0xffd900);
      if (currentMenu == primaryLinks) {
        if (obj == primaryLinks.group.children[0]) {
          // about me
          loadInfo('./info/aboutme.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == primaryLinks.group.children[1*2]) {
          previousMenu = currentMenu;
          currentMenu = projectLinks;
          transitionMenu();
        }
        else if (obj == primaryLinks.group.children[2*2]) {
          previousMenu = currentMenu;
          currentMenu = workLinks;
          transitionMenu();
        }
      }
      else if (currentMenu == projectLinks) {
        if (obj == projectLinks.group.children[0*2]) {
          previousMenu = currentMenu;
          currentMenu = quantumProjects;
          transitionMenu();
        }
        else if (obj == projectLinks.group.children[1*2]) {
          previousMenu = currentMenu;
          currentMenu = aiProjects;
          transitionMenu();
        }
        else if (obj == projectLinks.group.children[2*2]) {
          previousMenu = currentMenu;
          currentMenu = tpProjects;
          transitionMenu();
        }
        else if (obj == projectLinks.group.children[3*2]) {
          previousMenu = currentMenu;
          currentMenu = moreProjects;
          transitionMenu();
        }
      }
      else if (currentMenu == quantumProjects) {
        if (obj == quantumProjects.group.children[0*2]) {
          // qonic
          loadInfo('./info/qonic.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == quantumProjects.group.children[1*2]) {
          // qhore logic
          loadInfo('./info/qhl.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == quantumProjects.group.children[2*2]) {
          // qcpuware
          loadInfo('./info/qcpuware.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == quantumProjects.group.children[3*2]) {
          // breakthrough jr challenge vid
          loadInfo('./info/breakthroughchallenge.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
      }
      else if (currentMenu == aiProjects) {
        if (obj == aiProjects.group.children[0*2]) {
          // hill climb ai
          loadInfo('./info/hillclimb.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == aiProjects.group.children[1*2]) {
          // java NN framework
          loadInfo('./info/javaneuralnet.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == aiProjects.group.children[2*2]) {
          // distributed training
          loadInfo('./info/distributedTraining.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
      }
      else if (currentMenu == tpProjects) {
        if (obj == tpProjects.group.children[0*2]) {
          // lean4 tm
          loadInfo('./info/lean4tm.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == tpProjects.group.children[1*2]) {
          // lean4 axiomatic system
          loadInfo('./info/lean4axiomaticsys.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == tpProjects.group.children[2*2]) {
          // qhore logic
          loadInfo('./info/qhl.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
      }
      else if (currentMenu == moreProjects) {
        if (obj == moreProjects.group.children[0*2]) {
          // robotics
          loadInfo('./info/robotics.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == moreProjects.group.children[1*2]) {
          // ap physics portfolio
          loadInfo('./info/physicslabs.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
      }
      else if (currentMenu == workLinks) {
        if (obj == workLinks.group.children[0*2]) {
          // ai leadership
          loadInfo('./info/aileadership.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
        else if (obj == workLinks.group.children[1*2]) {
          // sar
          loadInfo('./info/sar.json');
          document.getElementById('infoOverlay').style.animation = 'slideIn 2s forwards';
          viewingOverlay = true;
        }
      }
    }
    else {
      obj.material.color.setHex(0xff9000);
    }
  }

  // check to see if the menu is being transitioned
  if (transitioning) {
    for (let i = 0; i < currentMenu.num*2; i += 2) {
      if (Math.abs(Math.abs(theta) - currentMenu.theta * (i/2) - Math.PI) < 0.1) {
        currentMenu.group.children[i].visible = true;
      }
    }
    for (let i = 0; i < previousMenu.num*2; i += 2) {
      if (Math.abs(Math.abs(theta) - previousMenu.theta * (i/2) - Math.PI) < 0.1) {
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