// Followed the tutorial from 
// https://www.learnthreejs.com/load-3d-model-using-three-js-obj-loader/
// https://medium.com/@PavelLaptev/three-js-for-beginers-32ce451aabda

var scene;
var camera;
var renderer;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    camera.position.z = 30;

    var pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 5, 10);
    scene.add(pointLight);

    var backLight = new THREE.PointLight(0xffffff, 1, 100);
    backLight.position.set(10, 5, 0);
    scene.add(backLight);
}

var treeModels = [];
var objectLoaded = false;
const numLeaves = 6;

function loadObject(pathToObj, mtlFilename, objFilename) {

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setTexturePath(pathToObj);
    mtlLoader.setPath(pathToObj);
    mtlLoader.load(mtlFilename, function (materials) {
 
        materials.preload();
    
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(pathToObj);
        objLoader.load(objFilename, function (object) {

            treeModel = {
                model: object, // the tree model
                currRotation: 0, // how much the trunk has rotated
                currRGB: {r: 65, g: 117, b: 42}, // the colour of the leaves at any given time
                currOpacity: 1, // the opacity of the leaves

                // Phase 1: Colour change from dark green to yellowish green
                // Phase 2: Colour change from yellowish green to reddish brown
                // Phase 3: Leaves slowly turn transparent
                // Phase 4: Trunk of tree breaking and falling down
                phaseCount: 1
            }

            // Loop that goes through each mesh that makes up the leaves of the tree
            // Set up the material of the leaves
            for (let i = 0; i < numLeaves; i++) {
                // Set the objects transparency to true, opacity to 1 initially
                treeModel.model.children[i].material.transparent = true;
                treeModel.model.children[i].material.opacity = 1;

                // No need for specular lighting
                treeModel.model.children[i].material.specular = {r: 0, g: 0, b: 0};
            }

            treeModels.push(treeModel);

            scene.add(object);
            objectLoaded = true;
        });

    });
}

const rotationSpeed = 0.01;
const maxRotationAngle = Math.PI / 2.5;
const opacitySpeed = 0.01;
const colChangeSpeed = 0.3;
const rgbNormalise = 255;

function updateTreeModel(treeObject) {
    switch (treeObject.phaseCount) {
        case 1:
            treeObject.currRGB.r += colChangeSpeed;

            if (treeObject.currRGB.r >= 117) 
                treeObject.phaseCount += 1;
            break;

        case 2:
            treeObject.currRGB.g -= colChangeSpeed;

            if (treeObject.currRGB.g <= 65)
                treeObject.phaseCount += 1;
            break;

        case 3:
            treeObject.currOpacity -= opacitySpeed;
            if (treeObject.currOpacity < 0) 
                treeObject.phaseCount += 1;
            break;
        
        case 4:
            treeObject.currRotation += rotationSpeed;
            if (treeObject.currRotation > maxRotationAngle) 
                treeObject.phaseCount += 1;
                
            break;
        
        default:
            break;
    }
}

function treeEventHandler(treeObject) {
    switch (treeObject.phaseCount) {
        case 1:
        case 2:
            for (let i = 0; i < numLeaves; i++) {
                treeObject.model.children[i].material.color.r = treeObject.currRGB.r / rgbNormalise;
                treeObject.model.children[i].material.color.g = treeObject.currRGB.g / rgbNormalise;
                treeObject.model.children[i].material.color.b = treeObject.currRGB.b / rgbNormalise;
            }
            break;
 
        case 3:
            for (let i = 0; i < numLeaves; i++) {
                treeObject.model.children[i].material.opacity = treeObject.currOpacity;
            }
            break;

        case 4:
            treeObject.model.children[7].rotation.z += rotationSpeed;
            break;

        default:
            break;
    }
}
 
var animate = function () {
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
    
    // Animate each tree in the array
    treeModels.map(treeEventHandler);
    treeModels.map(updateTreeModel);
};
 
init();
loadObject('GumTree/OBJ/', 'GumtreeLowPoly.mtl', 'GumtreeLowPoly.obj');
animate();