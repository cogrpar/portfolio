// setup three js scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 15

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
const loader = new THREE.GLTFLoader();
loader.load('models/planet.glb', function(gltf) {
  scene.add(gltf.scene);
}, undefined, function(error) {
  console.error(error);
});
loader.load('models/rings.glb', function(gltf) {
  scene.add(gltf.scene);
}, undefined, function(error) {
  console.error(error);
});



// animation loop
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);