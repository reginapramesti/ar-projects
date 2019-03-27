var scene = new THREE.Scene();
scene.background = new THREE.Color('skyblue');
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
// var camera = new THREE.Camera();
scene.add(camera);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

controls = new THREE.OrbitControls(camera, renderer.domElement);

var alpha = 0;
var beta = 0;
var diffuseColor = new THREE.Color(0xcd6237);
var specularShininess = Math.pow(2, alpha * 10);
var specularColor = new THREE.Color(beta * 0.2, beta * 0.2, beta * 0.2);

var geometry;

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
var objGroups = [];

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

var createOutline = function (geometry, material) {
    const outlineScale = 1.03;
    var objOutline = new THREE.Mesh(geometry, material);
    objOutline.scale.set(outlineScale, outlineScale, outlineScale);
    return objOutline;
}

var onTreesLoaded = function (treeObject) {
    wait = false;

    const treeSize = 5;
    var treeGroup = new THREE.Group();

    treeObject.children[0].material = treeMaterials;
    treeGroup.add(treeObject);
    treeGroup.add(createOutline(treeObject.children[0].geometry, treeOutlineMaterial));

    treeGroup.scale.set(treeSize, treeSize, treeSize);
    treeGroup.rotation.y = Math.random() * Math.PI;
    treeGroups.push(treeGroup);
    scene.add(treeGroup);

};

var onObjectLoading = function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}

var onObjectLoadError = function (error) {
    console.log('An error has happened');
}

var loadObject = function (path, scale, diffuseColor) {
    loader.load(
        path,
        function (object) {
            var objGroup = new THREE.Group();

            object.children[0].material = new THREE.MeshToonMaterial({
                color: diffuseColor,
                specular: specularColor,
                reflectivity: beta,
                shininess: specularShininess,
                side: THREE.FrontSide
            });
            objGroup.add(object);
            objGroup.add(createOutline(object.children[0].geometry, outlineMaterial));
            objGroup.scale.set(scale, scale, scale);
            scene.add(objGroup);
            objGroups.push(objGroup);
        },
        onObjectLoading,
        onObjectLoadError
    )
}

// tree trunk: #a67344
// tree leaves: #3b802f

var spacing = 6; 
var spacingDelta = 0.0005;
var noise = 2;
const rangeX = 200;
const rangeZ = 80;
var xPos = -rangeX;
var zPos = -rangeZ;
var treePositions = [];

while (xPos <= rangeX) {
    zPos = -rangeZ;
    while (zPos <= rangeZ) {
        let treeIndex = Math.floor(Math.random() * 5 + 1);
        console.log(treeIndex);
        loader.load(
            'TreesLowPoly/Tree' + treeIndex + '/tree.obj',
            onTreesLoaded,
            onObjectLoading,
            onObjectLoadError
        );
        var noiseX = Math.random() * noise * 2 - noise;
        var noiseZ = Math.random() * noise * 2 - noise;
        treePositions.push({ x: xPos + noiseX, z: zPos + noiseZ });

        spacing += spacingDelta;
        zPos += spacing;
    }
    spacingDelta += spacingDelta;
    noise += spacingDelta;
    xPos += spacing;
}

loadObject('KangarooModel/Kangaroo.obj', 0.1, diffuseColor);

// Lighting
scene.add(new THREE.AmbientLight(0x222222));

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

camera.position.z = 20;
camera.position.y = 2;

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
        treeGroup.position.set(treePositions[index].x, 0, treePositions[index].z);
    });
    objGroups.forEach(objGroup => {
        // objGroup.rotation.y += 0.01;
        objGroup.rotation.y = -Math.PI / 2;
    })
    renderer.render(scene, camera);
}

animate();