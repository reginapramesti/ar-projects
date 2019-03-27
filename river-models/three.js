var scene, camera, renderer, controls;
// var mesh;
var water;
var waterTexture;

var rcp26 = [{ "year": 2040, "rainfall": 0.29618677 }, { "year": 2050, "rainfall": -0.533272 }, { "year": 2060, "rainfall": 5.5060167 }, { "year": 2070, "rainfall": 4.2879033 }, { "year": 2080, "rainfall": -2.9401066 }, { "year": 2090, "rainfall": -3.163458 }];
var rcp45 = [{ "year": 2040, "rainfall": -2.0570714 }, { "year": 2050, "rainfall": -0.19496697 }, { "year": 2060, "rainfall": -1.9939846 }, { "year": 2070, "rainfall": -5.0153384 }, { "year": 2080, "rainfall": 0.22340815 }, { "year": 2090, "rainfall": 2.7102447 }];
var rcp60 = [{ "year": 2040, "rainfall": -1.3998901 }, { "year": 2050, "rainfall": -2.1936162 }, { "year": 2060, "rainfall": -2.1142256 }, { "year": 2070, "rainfall": 2.386432 }, { "year": 2080, "rainfall": 10.35757 }, { "year": 2090, "rainfall": 5.697372 }];
var rcp85 = [{ "year": 2040, "rainfall": 0.91791856 }, { "year": 2050, "rainfall": 1.6345977 }, { "year": 2060, "rainfall": 0.35585436 }, { "year": 2070, "rainfall": 2.4581237 }, { "year": 2080, "rainfall": 7.7386603 }, { "year": 2090, "rainfall": 5.343646 }];

var stoneMeshes = [];
var walls;

var createOutline = function (geometry, material) {
    const outlineScale = 1.03;
    var objOutline = new THREE.Mesh(geometry, material);
    objOutline.scale.set(outlineScale, outlineScale, outlineScale);
    return objOutline;
}
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

function createShapes() {

    var shapes = [];
    // Bottom to top

    // First pebble shape
    // Rotate -Math.PI / 15
    var shape = new THREE.Shape();
    shape.moveTo(-3, 3);
    shape.bezierCurveTo(-3, 3.5, -2.5, 4, -2, 4);
    shape.lineTo(2, 4);
    shape.bezierCurveTo(2.5, 4, 3, 3.5, 3, 3);
    shape.lineTo(3, -3);
    shape.bezierCurveTo(3, -3.5, 2.5, -4, 2, -4);
    shape.lineTo(-2, -4);
    shape.bezierCurveTo(-2.5, -4, -3, -3.5, -3, -3);
    shape.lineTo(-3, 3);
    shapes.push(shape);

    // Second pebble shape
    // Rotate Math.PI / 60
    shape = new THREE.Shape();
    shape.moveTo(-2, 3.5);
    shape.lineTo(2, 3.5);3
    shape.bezierCurveTo(2.25, 3.5, 2.75, 3, 3, 2.5);
    shape.lineTo(4, -2.5);
    shape.bezierCurveTo(4, -3, 3.5, -3.5, 3, -3.5);
    shape.lineTo(-2, -4);
    shape.bezierCurveTo(-3, -4, -3.25, -3, -3.25, -2.5);
    shape.lineTo(-3, 2.5);
    shape.bezierCurveTo(-2.85, 3, -2.5, 3.5, -2, 3.5);
    shapes.push(shape);

    // Third pebble shape
    // Rotate -Math.PI / 10
    shape = new THREE.Shape();
    shape.moveTo(-3.5, 2);
    shape.bezierCurveTo(-3.5, 2.5, -3, 3, -2.5, 3);
    shape.lineTo(4.5, 3);
    shape.bezierCurveTo(4.75, 3, 5.25, 2.67, 5, 2);
    shape.lineTo(3.5, -2);
    shape.bezierCurveTo(3.25, -2.67, 2.75, -3, 2.5, -3);
    shape.lineTo(-2.5, -3);
    shape.bezierCurveTo(-3, -3, -3.5, -2.5, -3.5, -2);
    shape.lineTo(-3.5, 2);
    shapes.push(shape);

    // Fourth pebble shape
    // Rotate -Math.PI / 18;
    shape = new THREE.Shape();
    shape.moveTo(-3, 2);
    shape.bezierCurveTo(-3, 2.75, -2.75, 3, -2, 3);
    shape.lineTo(2, 3);
    shape.bezierCurveTo(2.75, 3, 3, 2.75, 3, 2);
    shape.lineTo(3, -2);
    shape.bezierCurveTo(3, -2.75, 2.75, -3, 2, -3);
    shape.lineTo(-2, -3);
    shape.bezierCurveTo(-2.75, -3, -3, -2.75, -3, -2);
    shape.lineTo(-3, 2);
    shapes.push(shape);

    // Fifth pebble shape
    // Rotate 0
    shape = new THREE.Shape();
    shape.moveTo(-4, 2);
    shape.bezierCurveTo(-4.1, 2.8, -3.25, 3, -3, 3);
    shape.lineTo(3, 3);
    shape.bezierCurveTo(3.25, 3, 4.75, 3, 4.5, 2);
    shape.lineTo(3.5, -2);
    shape.bezierCurveTo(3.4, -2.4, 3, -3, 2.5, -3);
    shape.lineTo(-2, -3);
    shape.bezierCurveTo(-2.5, -3, -3.25, -3, -3.5, -2);
    shape.lineTo(-4, 2);
    shapes.push(shape);

    // Sixth pebble shape
    // Rotate 0
    shape = new THREE.Shape();
    shape.moveTo(-5, 2);
    shape.bezierCurveTo(-5.28125, 2.75, -5, 3, -2, 3);
    shape.lineTo(2, 3);
    shape.bezierCurveTo(2.5, 3, 3.5, 3, 4, 2);
    shape.lineTo(5, 0);
    shape.bezierCurveTo(6, -2, 6, -3, 2, -3);
    shape.lineTo(-2, -3);
    shape.bezierCurveTo(-3, -3, -3.40625, -2.25, -3.5, -2);
    shape.lineTo(-5, 2);
    shapes.push(shape);
    
    return shapes;
}

// Inspired by https://discourse.threejs.org/t/round-edged-box/1402
function createRoundedPebblesGeometry( shape, depth, radius0, smoothness ) {
    let eps = 0.00001;
    let radius = radius0 - eps;
    let geometry = new THREE.ExtrudeGeometry( shape, {
      amount: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness
    });
    
    return geometry;
  }

function initialise() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('lightgrey');

    // Lighting
    scene.add(new THREE.AmbientLight(0x222222));

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    // renderer = new THREE.WebGLRenderer({
    //     antialias: true,
    //     alpha: true
    // });
    // renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.domElement.style.position = 'absolute';
    // renderer.domElement.style.top = '0px';
    // renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.maxPolarAngle = Math.PI * 0.5;
    // controls.minDistance = 1000;
    // controls.maxDistance = 5000;

    var length = 10, width = 8;

    // Generic rectangle shape.
    var shape = new THREE.Shape();
    // centre at the origin
    shape.moveTo(-length / 2, -width / 2);
    shape.lineTo(-length / 2, width / 2);
    shape.lineTo(length / 2, width / 2);
    shape.lineTo(length / 2, -width / 2);
    shape.lineTo(-length / 2, -width / 2);



    const dataScaleFactor = 3;
    const zOffset = 2065; // so they will be positioned at 25, 15, 5, -5, -15, -25
    const yOffset = 2;
    const pebbleSpacing = 1.2;
    const pebblePadding = 5;
    const pebbleRotations = [-Math.PI / 15, Math.PI / 60, -Math.PI / 10, -Math.PI / 18, 0, 0];
    const baseLevel = 15;
    const riverWidth = 60 * pebbleSpacing + pebblePadding;
    var stoneMaterials = new THREE.MeshToonMaterial({ color: 0x786f74 });
    var shapes = createShapes();
    const stoneScale = 0.7;
    const pebbleDepth = 8;
    const bevelRadius = pebbleDepth / 2 + 0.1;
    const rotationNoise = 0;//Math.PI / 3;

    rcp60.forEach((rainfallValue, index) => {

        let pebbleCount = Math.ceil((baseLevel + rainfallValue.rainfall * dataScaleFactor) / pebbleDepth);
        // let extrudeSettings = {
        //     steps: 2,
        //     depth: pebbleDepth,
        //     bevelEnabled: true,
        //     bevelSegments: 2,
        //     steps: 1,
        //     bevelSize: 2,
        //     bevelThickness: 2
        // };

        // let geometry = new THREE.ExtrudeBufferGeometry(shapes[index], extrudeSettings);

        for (let pebbleIx = 0; pebbleIx < pebbleCount; pebbleIx++) {
            let geometry = createRoundedPebblesGeometry(shapes[index], pebbleDepth, bevelRadius, 4);
            
            // Inspired by https://stackoverflow.com/questions/51509292/threejs-hemisphere
            for (var i = 0; i < geometry.vertices.length; i++) {
                var vertex = geometry.vertices[i];
                if (vertex.z > 0) {
                    vertex.z = 0;
                }
            }
              
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
            geometry.verticesNeedUpdate = true;
    
            let mesh = new THREE.Mesh(geometry, stoneMaterials);
            
            let stoneObject = new THREE.Group();
            stoneObject.add(mesh);
            stoneObject.add(createOutline(geometry, outlineMaterial));
            stoneObject.scale.set(stoneScale, stoneScale, stoneScale);
    
            stoneObject.position.z += (zOffset - rainfallValue.year) * pebbleSpacing;
            stoneObject.position.y = yOffset + ((pebbleDepth / 2 - 1) * pebbleIx);
            stoneObject.rotation.x = -Math.PI / 2;
            stoneObject.rotation.z = pebbleRotations[index] + (Math.random() * rotationNoise * 2 - rotationNoise); // rotation along the y axis when upright
    
            stoneMeshes.push(stoneObject);
            scene.add(stoneObject);
        }
    });

    const wallLength = 600;
    const wallHeight = baseLevel;
    const wallDepth = 3;
    const yRepeat = 0.5;
    var wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallDepth);
    var wallTextureXY = THREE.ImageUtils.loadTexture("images/brickWall.jpg");
    var wallTextureXZ = THREE.ImageUtils.loadTexture("images/brickWall.jpg");
    var wallTextureYZ = THREE.ImageUtils.loadTexture("images/brickWall.jpg");
    wallTextureXY.wrapS = wallTextureXY.wrapT = THREE.RepeatWrapping;
    wallTextureXZ.wrapS = wallTextureXZ.wrapT = THREE.RepeatWrapping;
    wallTextureYZ.wrapS = wallTextureYZ.wrapT = THREE.RepeatWrapping;
    wallTextureXY.repeat.set(25, yRepeat);
    wallTextureXZ.repeat.set(25, yRepeat * (wallDepth / wallHeight));
    wallTextureYZ.repeat.set(yRepeat * (wallDepth / wallHeight), yRepeat);

    var wallMaterials = [
        new THREE.MeshToonMaterial({map: wallTextureYZ}), // left
        new THREE.MeshToonMaterial({map: wallTextureYZ}), // right
        new THREE.MeshToonMaterial({map: wallTextureXZ}), // top
        new THREE.MeshToonMaterial({map: wallTextureXZ}), // bottom
        new THREE.MeshToonMaterial({map: wallTextureXY}), // front
        new THREE.MeshToonMaterial({map: wallTextureXY}), // back

    ]
    // var wallMaterial = new THREE.MeshToonMaterial({map: wallTexture});
    
    const zPosition = (riverWidth / 2) + (wallDepth / 2); 

    var wallBackObject = new THREE.Group();
    var wallBack = new THREE.Mesh(wallGeometry, wallMaterials);
    wallBackObject.add(wallBack);
    wallBackObject.add(createOutline(wallGeometry, outlineMaterial));

    wallBackObject.position.y += wallHeight / 2;
    wallBackObject.position.z -= zPosition;
    scene.add(wallBackObject);

    var wallFrontObject = new THREE.Group();
    var wallFront = new THREE.Mesh(wallGeometry, wallMaterials);
    wallFrontObject.add(wallFront);
    wallFrontObject.add(createOutline(wallGeometry, outlineMaterial));

    wallFrontObject.position.y += wallHeight / 2;
    wallFrontObject.position.z += zPosition;
    scene.add(wallFrontObject);

    var waterGeometry = new THREE.PlaneBufferGeometry(600, riverWidth);
    waterTexture = new THREE.TextureLoader().load('images/watertiles.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 0.5);
    });
    
    water = new THREE.Mesh(waterGeometry, new THREE.MeshToonMaterial({
        map: waterTexture
    }))
    // water = new THREE.Water(
    //     waterGeometry,
    //     {
    //         textureWidth: 852,
    //         textureHeight: 480,
    //         waterNormals: waterTexture,
    //         alpha: 1.0,
    //         sunDirection: directionalLight.position.clone().normalize(),
    //         sunColor: 0xffffff,
    //         waterColor: 0x001e0f,
    //         distortionScale: 3.7,
    //         fog: scene.fog !== undefined
    //     }
    // );
    water.rotation.x = - Math.PI / 2;
    scene.add(water);

    camera.position.z = 50;
}

function render() {
    waterTexture.offset.x -= 0.0005;
    renderer.render(scene, camera);
}

function update() {

}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

initialise();
animate();