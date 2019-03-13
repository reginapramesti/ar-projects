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
var cartoonObject;
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
}
const scale = 1.03;

var treeGroups = [];

var loader = new THREE.OBJLoader();

// tree trunk: #a67344
// tree leaves: #3b802f
loader.load(
    'TreesLowPoly/trees.obj',
    function(object) {
        object.children.forEach(child => {
            var treeGroup = new THREE.Group();
            // Material for the tree trunk
            child.material[0] = new THREE.MeshToonMaterial({
                color: new THREE.Color(0xa67344),
                specular: specularColor,
                reflectivity: beta,
                shininess: specularShininess,
                side: THREE.FrontSide
            });
            // Material for the tree leaves
            child.material[1] = new THREE.MeshToonMaterial({
                color: new THREE.Color(0x3b802f),
                specular: specularColor,
                reflectivity: beta,
                shininess: specularShininess,
                side: THREE.FrontSide
            });
            treeGroup.add(child);
            
            var treeOutline = new THREE.Mesh(child.geometry, outlineMaterial);
            treeOutline.scale.set(scale, scale, scale);
            treeGroup.add(treeOutline);
            // treeGroup.position.set(0, 0, 0);
            treeGroups.push(treeGroup);
            console.log(child.geometry);
        });
        treeGroups.forEach(treeGroup => {
            scene.add(treeGroup);
        })
        // console.log(treeGroups[0]);
        // scene.add(treeGroups[0]);
    }
)

loader.load(
    'KangarooModel/Kangaroo.obj',
    function(object) {
        const scaleToView = 0.15;
        object.scale.set(0.01, 0.01, 0.01);
        object.rotation.x = -Math.PI / 2;
        object.rotation.z = Math.PI / 2;
        // scene.add(object);
        geometry = object.children[0].geometry;

        var objectMaterial = new THREE.MeshToonMaterial({
            color: diffuseColor,
            specular: specularColor,
            reflectivity: beta,
            shininess: specularShininess,
            side: THREE.FrontSide
        });

        var object = new THREE.Mesh(geometry, objectMaterial);
        var objectOutline = new THREE.Mesh(geometry, outlineMaterial);
        objectOutline.scale.set(scale, scale, scale);
        
        cartoonObject = new THREE.Group();
        cartoonObject.add(object);
        cartoonObject.add(objectOutline);
        
        // cartoonObject.rotation.x = -Math.PI / 2;
        cartoonObject.rotation.y = Math.PI / 2;
        cartoonObject.scale.set(scaleToView, scaleToView, scaleToView);
        
        // scene.add(cartoonObject);
        
    },
    function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error) {
        console.log('An error has happened');
    }
);

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
}

function render() {
    if (cartoonObject) {
        // cartoonObject.rotation.x += 0.01;
        cartoonObject.rotation.y += 0.01;
    }
    if (treeGroups.length > 0) {
        treeGroups[0].rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}

animate();