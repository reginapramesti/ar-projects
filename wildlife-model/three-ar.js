var scene, camera, renderer, clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var markerRoot1, markerRoot2;

var treeGroups = [];
var objGroups = [];
var treePositions = [];

initialise();
animate();
function initialise() {
    scene = new THREE.Scene();
    let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);

    camera = new THREE.Camera();
    scene.add(camera);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild(renderer.domElement);
    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    ////////////////////////////////////////////////////////////
    // setup arToolkitSource
    ////////////////////////////////////////////////////////////
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });
    function onResize() {
        arToolkitSource.onResize()
        arToolkitSource.copySizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
        }
    }
    arToolkitSource.init(function onReady() {
        onResize()
    });

    // handle resize event
    window.addEventListener('resize', function () {
        onResize()
    });

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////	
    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono'
    });

    // copy projection matrix to camera when initialization complete
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });
    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////
    // build markerControls
    markerRoot1 = new THREE.Group();
    scene.add(markerRoot1);
    let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'pattern', patternUrl: "data/hiro.patt",
    })

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
    // New version of populate forest, recent version
    var populateForest = function () {
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
            while (zPos <= rangeZ) {
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
                markerRoot1.add(treeObject);
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
                markerRoot1.add(boneObject);
            }
        }
    };
}
function update() {
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false)
        arToolkitContext.update(arToolkitSource.domElement);
}

function render() {
    renderer.render(scene, camera);
}
function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}