var scene = new THREE.Scene();
scene.background = new THREE.Color(0x555555);
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var alpha = 0;
var beta = 0;
var diffuseColor = new THREE.Color(0xcd6237);
var specularShininess = Math.pow(2, alpha * 10);
var specularColor = new THREE.Color(beta * 0.2, beta * 0.2, beta * 0.2);

var geometry;

var loader = new THREE.OBJLoader();
// var geometry = new THREE.TorusKnotBufferGeometry(1, 0.3);
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
        shader.vertexShader.replace(token,customTransform)
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

var createOutline = function(geometry, material) {
    const outlineScale = 1.03;
    var objOutline = new THREE.Mesh(geometry, material);
    objOutline.scale.set(outlineScale, outlineScale, outlineScale);
    return objOutline;
}

var onTreesLoaded = function(treeObject) {
    const treeSize = 3;
    var treeGroup = new THREE.Group();

    treeObject.children[0].material = treeMaterials;
    treeGroup.add(treeObject);
    treeGroup.add(createOutline(treeObject.children[0].geometry, treeOutlineMaterial));
    
    treeGroup.scale.set(treeSize, treeSize, treeSize);
    treeGroups.push(treeGroup);
    scene.add(treeGroup);
};

var onObjectLoading = function(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}

var onObjectLoadError = function(error) {
    console.log('An error has happened');
}

var loadObject = function(path, scale, diffuseColor) {
    loader.load(
        path,
        function(object) {
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
loader.load(
    'TreesLowPoly/Tree1/tree.obj',
    onTreesLoaded,
    onObjectLoading,
    onObjectLoadError
);

loadObject('KangarooModel/Kangaroo.obj', 0.1, diffuseColor);

// Lighting
scene.add(new THREE.AmbientLight(0x222222));

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

camera.position.z = 5;
camera.position.y = 2;

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    treeGroups.forEach(treeGroup => {
        treeGroup.rotation.y += 0.01;
    });
    objGroups.forEach(objGroup => {
        objGroup.rotation.y += 0.01;
    })
    // if (treeGroups.length > 0) {
    //     treeGroups[].rotation.y += 0.01;
    // }
    renderer.render(scene, camera);
}

animate();