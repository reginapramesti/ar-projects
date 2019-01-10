// Followed the tutorial from https://www.learnthreejs.com/load-3d-model-using-three-js-obj-loader/

console.clear();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
 
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
 
camera.position.z = 30;

var pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 10);
scene.add(pointLight);

var backLight = new THREE.PointLight(0xffffff, 1, 100);
backLight.position.set(10, 5, 0);
scene.add(backLight);
// var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
// keyLight.position.set(-100, 0, 100);
 
// var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
// fillLight.position.set(100, 0, 100);
 
// var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
// backLight.position.set(100, 0, -100).normalize();
 
// scene.add(keyLight);
// scene.add(fillLight);
// scene.add(backLight);

var treeModel;
var objectLoaded = false;
const numLeaves = 6;

var mtlLoader = new THREE.MTLLoader();
mtlLoader.setTexturePath('GumTree/OBJ/');
mtlLoader.setPath('GumTree/OBJ/');
mtlLoader.load('GumtreeLowPoly.mtl', function (materials) {
 
    materials.preload();
 
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('GumTree/OBJ/');
    objLoader.load('GumtreeLowPoly.obj', function (object) {
 
        treeModel = object;

        // Set up the material of the meshes
        for (let i = 0; i < numLeaves; i++) {
            // Set the objects transparency to true, opacity to 1 initially
            treeModel.children[i].material.transparent = true;
            treeModel.children[i].material.opacity = 1;

            // No need for specular lighting
            treeModel.children[i].material.specular = {r: 0, g: 0, b: 0};
        }

        scene.add(treeModel);
        objectLoaded = true;
    });

});

const rotationSpeed = 0.01;
const maxRotationAngle = Math.PI / 2.5;
const opacitySpeed = 0.001;
const colChangeSpeed = 0.1;
const rgbNormalise = 255;
var currRotation = 0;
var currRGB = {r: 65, g: 117, b: 42};
var currOpacity = 1;

// Phase 1: Colour change from dark green to yellowish green
// Phase 2: Colour change from yellowish green to reddish brown
// Phase 3: Leaves slowly turn transparent
// Phase 4: Trunk of tree breaking and falling down
var phaseCount = 1;
 
var animate = function () {
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
    
    // Only start animating once the model has loaded
    if (objectLoaded) {
        if (currRotation <= maxRotationAngle && phaseCount == 4) {
            treeModel.children[7].rotation.z += rotationSpeed;
            currRotation += rotationSpeed;
        }

        for (let i = 0; i < numLeaves; i++) {
            if (phaseCount == 1 || phaseCount == 2) {
                treeModel.children[i].material.color.r = currRGB.r / rgbNormalise;
                treeModel.children[i].material.color.g = currRGB.g / rgbNormalise;
                treeModel.children[i].material.color.b = currRGB.b / rgbNormalise;

                if (phaseCount == 1) {
                    currRGB.r += colChangeSpeed;

                    if (currRGB.r >= 117) 
                        phaseCount += 1;
                }
                if (phaseCount == 2) {
                    currRGB.g -= colChangeSpeed;

                    if (currRGB.g <= 65)
                        phaseCount += 1;
                }

            } else if (phaseCount == 3) {
                treeModel.children[i].material.opacity = currOpacity;
                currOpacity -= opacitySpeed;

                if (currOpacity < 0) 
                    phaseCount += 1;
            }
            }
        }
};
 
animate();