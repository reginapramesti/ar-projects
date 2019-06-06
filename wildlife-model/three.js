var scene = new THREE.Scene();
scene.background = new THREE.Color('skyblue');
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
// var camera = new THREE.Camera();
scene.add(camera);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

controls = new THREE.OrbitControls(camera, renderer.domElement);

var worldScale = 2;
var alpha = 0;
var beta = 0;
var kangarooColour = new THREE.Color(0xcd6237);
var specularShininess = Math.pow(2, alpha * 10);
var specularColor = new THREE.Color(beta * 0.2, beta * 0.2, beta * 0.2);

const xCamOffset = 0;
const yCamOffset = -15;
const zCamOffset = -50;

var loader = new THREE.OBJLoader();
var outlineMaterial = new THREE.MeshLambertMaterial({
    color: 'black',
    side: THREE.BackSide
});
outlineMaterial.onBeforeCompile = (shader) => {
    const token = `#include <begin_vertex>`
    const customTransform = `
        vec3 transformed = position + objectNormal*0.02;
    `
    shader.vertexShader =
        shader.vertexShader.replace(token, customTransform)
};

var treeGroups = [];
var treeModels = [];
var objGroups = [];
var treePositions = [];

var createOutline = function (geometry, material) {
    const outlineScale = 1.03;
    var objOutline = new THREE.Mesh(geometry, material);
    objOutline.scale.set(outlineScale, outlineScale, outlineScale);
    return objOutline;
}

var treeOutlineMaterial = new THREE.MeshLambertMaterial({
    color: 'black',
    side: THREE.BackSide
});

var treeMaterials = [
    new THREE.MeshToonMaterial({
        color: new THREE.Color(0x3b802f),
        specular: specularColor,
        reflectivity: beta,
        shininess: specularShininess,
        side: THREE.FrontSide
    }),
    new THREE.MeshToonMaterial({
        color: new THREE.Color(0xa67344),
        specular: specularColor,
        reflectivity: beta,
        shininess: specularShininess,
        side: THREE.FrontSide
    })
];

var objectsLoaded = 0;
var kangarooModel;
var boneModel;

var onTreesLoaded = function (treeObject) {
    var treeGroup = new THREE.Group();

    treeObject.children[0].material = treeMaterials;
    // treeGroup.add(treeObject);
    // treeGroup.add(createOutline(treeObject.children[0].geometry, treeOutlineMaterial));
    treeModels.push(treeObject.children[0]); 
    objectsLoaded++;

    if (objectsLoaded == 7)
        populateForest();
};

var onObjectLoading = function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}

var onObjectLoadError = function (error) {
    console.log('An error has happened');
}

var loadObject = function (path, scale, kangarooColour, model) {
    loader.load(
        path,
        function (object) {

            object.children[0].material = new THREE.MeshToonMaterial({
                color: kangarooColour,
                specular: specularColor,
                reflectivity: beta,
                shininess: specularShininess,
                side: THREE.FrontSide
            });
            if (model == 0) {
                kangarooModel = object.children[0];
            } else if (model == 1) {
                boneModel = object.children[0];
            }
            // model = object.children[0];
            objectsLoaded++;
            // scene.add(objGroup);
            // objGroups.push(objGroup);

            if (objectsLoaded == 7)
                populateForest();
        },
        onObjectLoading,
        onObjectLoadError
    )
}

for (let treeIndex = 1; treeIndex <= 5; treeIndex++) {
    loader.load(
        'TreesLowPoly/Tree' + treeIndex + '/tree.obj',
        onTreesLoaded,
        onObjectLoading,
        onObjectLoadError
    );
}
loadObject('KangarooModel/Kangaroo.obj', 0.2 * worldScale, kangarooColour, 0);
loadObject('BoneModel/bone.obj', 0.00 * worldScale, 0xffffff, 1);

// tree trunk: #a67344
// tree leaves: #3b802f

// New version of populate forest, historical version
// var populateForest = function() {
//     // Right side - filled with wildlife
//     var noise = 2 * worldScale;
//     var spacing = 16 * worldScale;
//     const rangeX = 40 * worldScale;
//     const rangeZ = 40 * worldScale;
//     var xPos = -rangeX;
//     var zPos = -rangeZ;
//     var kangaCount = Math.floor(rangeX / 25 / worldScale);

//     const treeSize = 10 * worldScale;

//     while (xPos <= rangeX) {
//         zPos = -rangeZ;
//         while(zPos <= rangeZ) {
//             let treeIndex = Math.floor(Math.random() * 5 + 1);
//             let treeMesh = treeModels[treeIndex - 1].clone();
//             let treeObject = new THREE.Group();
//             treeObject.add(treeMesh);
//             treeObject.add(createOutline(treeMesh.geometry, treeOutlineMaterial));
//             treeObject.scale.set(treeSize, treeSize, treeSize);
//             treeObject.rotation.y = Math.random() * Math.PI;
//             var noiseX = Math.random() * noise * 2 - noise;
//             var noiseZ = Math.random() * noise * 2 - noise;
//             treeObject.position.set(xCamOffset + xPos + noiseX, yCamOffset, zCamOffset + zPos + noiseZ);
//             scene.add(treeObject);
//             treeGroups.push(treeObject);

//             zPos += spacing;
//         }
//         xPos += spacing;

//         for (let k = 0; k < kangaCount; k++) {
//             const kangaScale = 0.2 * worldScale;
//             // Math.floor(Math.random() * (max - min + 1)) + min;
//             let kangarooXPos = Math.floor(Math.random() * (rangeX / 2 + rangeX / 2 + 1)) - rangeX / 2;
//             let kangarooZPos = Math.floor(Math.random() * (rangeZ / 2 + rangeZ / 2 + 1)) - rangeZ / 2;
//             let kangaroo = kangarooModel.clone();
//             let kangarooObject = new THREE.Group();
//             kangarooObject.add(kangaroo);
//             kangarooObject.add(createOutline(kangaroo.geometry, outlineMaterial));
//             kangarooObject.rotation.y = Math.random() * 2 * Math.PI;
//             kangarooObject.scale.set(kangaScale, kangaScale, kangaScale);
//             kangarooObject.position.set(xCamOffset + kangarooXPos, yCamOffset, zCamOffset + kangarooZPos);
//             scene.add(kangarooObject);
//         }
//     }
// }

// New version of populate forest, recent version
var populateForest = function() {
    // Right side - filled with wildlife
    var noise = 2 * worldScale;
    var spacing = 40 * worldScale;
    const rangeX = 40 * worldScale;
    const rangeZ = 40 * worldScale;
    var xPos = -rangeX;
    var zPos = -rangeZ;
    var boneCount = Math.floor(rangeX / 20 / worldScale);

    const treeSize = 10 * worldScale;

    while (xPos <= rangeX) {
        zPos = -rangeZ;
        while(zPos <= rangeZ) {
            let treeIndex = Math.floor(Math.random() * 5 + 1);
            let treeMesh = treeModels[treeIndex - 1].clone();
            let treeObject = new THREE.Group();
            treeObject.add(treeMesh);
            treeObject.add(createOutline(treeMesh.geometry, treeOutlineMaterial));
            treeObject.scale.set(treeSize, treeSize, treeSize);
            treeObject.rotation.y = Math.random() * Math.PI;
            var noiseX = Math.random() * noise * 2 - noise;
            var noiseZ = Math.random() * noise * 2 - noise;
            treeObject.position.set(xCamOffset + xPos + noiseX, yCamOffset, zCamOffset + zPos + noiseZ);
            scene.add(treeObject);
            treeGroups.push(treeObject);

            zPos += spacing;
        }
        xPos += spacing;

        for (let k = 0; k < boneCount; k++) {
            const boneScale = 0.008 * worldScale;
            // Math.floor(Math.random() * (max - min + 1)) + min;
            let boneXPos = Math.floor(Math.random() * (rangeX / 2 + rangeX / 2 + 1)) - rangeX / 2;
            let boneZPos = Math.floor(Math.random() * (rangeZ / 2 + rangeZ / 2 + 1)) - rangeZ / 2;
            let bone = boneModel.clone();
            let boneObject = new THREE.Group();
            boneObject.add(bone);
            boneObject.add(createOutline(bone.geometry, outlineMaterial));
            boneObject.rotation.y = Math.random() * 2 * Math.PI;
            boneObject.scale.set(boneScale, boneScale, boneScale);
            boneObject.position.set(xCamOffset + boneXPos, yCamOffset, zCamOffset + boneZPos);
            scene.add(boneObject);
        }
    }
}

// New version of populateForest
// var populateForest = function() {
//     // Right side - filled with wildlife
//     var noise = 2 * worldScale;
//     var spacing = 16 * worldScale;
//     const rangeX = 80 * worldScale;
//     const rangeZ = 40 * worldScale;
//     var xPos = -rangeX;
//     var zPos = -rangeZ;
//     var kangaCount = Math.floor(rangeX / 25 / worldScale);
//     var boneCount = Math.floor(rangeX / 25 / worldScale);

//     const treeSize = 10 * worldScale;

//     while (xPos <= -spacing) {
//         zPos = -rangeZ;
//         while(zPos <= rangeZ) {
//             let treeIndex = Math.floor(Math.random() * 5 + 1);
//             let treeMesh = treeModels[treeIndex - 1].clone();
//             let treeObject = new THREE.Group();
//             treeObject.add(treeMesh);
//             treeObject.add(createOutline(treeMesh.geometry, treeOutlineMaterial));
//             treeObject.scale.set(treeSize, treeSize, treeSize);
//             treeObject.rotation.y = Math.random() * Math.PI;
//             var noiseX = Math.random() * noise * 2 - noise;
//             var noiseZ = Math.random() * noise * 2 - noise;
//             treeObject.position.set(xPos + noiseX, 0, zPos + noiseZ);
//             scene.add(treeObject);
//             treeGroups.push(treeObject);

//             zPos += spacing;
//         }
//         xPos += spacing;

//         for (let k = 0; k < kangaCount; k++) {
//             const kangaScale = 0.2 * worldScale;
//             // Math.floor(Math.random() * (max - min + 1)) + min;
//             let kangarooXPos = Math.floor(Math.random() * (-spacing + rangeX + 1)) - rangeX;
//             let kangarooZPos = Math.floor(Math.random() * (rangeZ + rangeZ + 1)) - rangeZ;
//             let kangaroo = kangarooModel.clone();
//             let kangarooObject = new THREE.Group();
//             kangarooObject.add(kangaroo);
//             kangarooObject.add(createOutline(kangaroo.geometry, outlineMaterial));
//             kangarooObject.rotation.y = Math.random() * 2 * Math.PI;
//             kangarooObject.scale.set(kangaScale, kangaScale, kangaScale);
//             kangarooObject.position.set(kangarooXPos, 0, kangarooZPos);
//             scene.add(kangarooObject);
//         }
//     }

//     xPos = spacing;
//     spacing *= 3;
//     noise *= 5;

//     while (xPos <= rangeX) {
//         zPos = -rangeZ;
//         while(zPos <= rangeZ) {
//             let treeIndex = Math.floor(Math.random() * 5 + 1);
//             let treeMesh = treeModels[treeIndex - 1].clone();
//             let treeObject = new THREE.Group();
//             treeObject.add(treeMesh);
//             treeObject.add(createOutline(treeMesh.geometry, treeOutlineMaterial));
//             treeObject.scale.set(treeSize, treeSize, treeSize);
//             treeObject.rotation.y = Math.random() * Math.PI;
//             var noiseX = Math.random() * noise * 2 - noise;
//             var noiseZ = Math.random() * noise * 2 - noise;
//             treeObject.position.set(xPos + noiseX, 0, zPos + noiseZ);
//             scene.add(treeObject);
//             treeGroups.push(treeObject);

//             zPos += spacing;
//         }
//         xPos += spacing;

//         for (let b = 0; b < boneCount; b++) {
//             const boneScale = 0.008 * worldScale;
//             let boneXPos = Math.floor(Math.random() * (rangeX + 1));
//             let boneZPos = Math.floor(Math.random() * (rangeZ + rangeZ + 1)) - rangeZ;
//             let bone = boneModel.clone();
//             let boneObject = new THREE.Group();
//             boneObject.add(bone);
//             boneObject.add(createOutline(bone.geometry, outlineMaterial));
//             boneObject.rotation.y = Math.random() * 2 * Math.PI;
//             boneObject.scale.set(boneScale, boneScale, boneScale);
//             boneObject.position.set(boneXPos, 0, boneZPos);
//             scene.add(boneObject);
//         }
//     }
// }

// Old version
// var populateForest = function() {
//     var spacing = 8 * worldScale; 
//     var spacingDelta = 0.05 * worldScale;
//     var noise = 2 * worldScale;
//     const rangeX = 50 * worldScale;
//     const rangeZ = 20 * worldScale;
//     var xPos = -rangeX;
//     var zPos = -rangeZ;
//     var kangaCount = Math.floor(rangeX / 3 / worldScale);
//     var boneCount = 0;

//     const treeSize = 10 * worldScale;
    
//     while (xPos <= rangeX) {
//         zPos = -rangeZ;
//         while (zPos <= rangeZ) {
//             let treeIndex = Math.floor(Math.random() * 5 + 1);
//             let treeMesh = treeModels[treeIndex - 1].clone();
//             let treeObject = new THREE.Group();
//             treeObject.add(treeMesh);
//             treeObject.add(createOutline(treeMesh.geometry, treeOutlineMaterial));
//             treeObject.scale.set(treeSize, treeSize, treeSize);
//             treeObject.rotation.y = Math.random() * Math.PI;
//             var noiseX = Math.random() * noise * 2 - noise;
//             var noiseZ = Math.random() * noise * 2 - noise;
//             treeObject.position.set(xPos + noiseX, 0, zPos + noiseZ);
//             scene.add(treeObject);
//             treeGroups.push(treeObject);
//             // treePositions.push({ x: xPos + noiseX, z: zPos + noiseZ });
    
//             spacing += spacingDelta;
//             zPos += spacing;
//         }
//         spacingDelta += spacingDelta;
//         noise += spacingDelta;
//         xPos += spacing;
    
//         for (let k = 0; k < kangaCount; k++) {
//             const kangaScale = 0.2 * worldScale;
//             let kangarooXPos = xPos + Math.random() * noise * 6 - noise;
//             let kangarooZPos = Math.random() * rangeZ * 2 - rangeZ;
//             let kangaroo = kangarooModel.clone();
//             let kangarooObject = new THREE.Group();
//             kangarooObject.add(kangaroo);
//             kangarooObject.add(createOutline(kangaroo.geometry, outlineMaterial));
//             kangarooObject.rotation.y = Math.random() * 2 * Math.PI;
//             kangarooObject.scale.set(kangaScale, kangaScale, kangaScale);
//             kangarooObject.position.set(kangarooXPos, 0, kangarooZPos);
//             scene.add(kangarooObject);
//         }
//         for (let b = 0; b < boneCount; b++) {
//             const boneScale = 0.008 * worldScale;
//             let boneXPos = xPos + Math.random() * noise * 6 - noise;
//             let boneZPos = Math.random() * rangeZ * 2 - rangeZ;
//             let bone = boneModel.clone();
//             let boneObject = new THREE.Group();
//             boneObject.add(bone);
//             boneObject.add(createOutline(bone.geometry, outlineMaterial));
//             boneObject.rotation.y = Math.random() * 2 * Math.PI;
//             boneObject.scale.set(boneScale, boneScale, boneScale);
//             boneObject.position.set(boneXPos, 0, boneZPos);
//             scene.add(boneObject);
//         }
    
//         kangaCount -= 2 * worldScale;
//         boneCount += 0.5 * worldScale;
//     }
// }



// Lighting
scene.add(new THREE.AmbientLight(0x222222));

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// camera.position = {x: 0, y: 0, z: 0};
camera.position.z = 1;


function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
}

function render() {
    treeGroups.forEach((treeGroup, index) => {
        // treeGroup.rotation.y += 0.01;
        // treeGroup.position.set(treePositions[index].x, 0, treePositions[index].z);
    });
    objGroups.forEach(objGroup => {
        // objGroup.rotation.y += 0.01;
        // objGroup.rotation.y = -Math.PI / 2;
    })
    renderer.render(scene, camera);
}

animate();