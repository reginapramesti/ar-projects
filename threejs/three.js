var scene, camera, renderer, clock, deltaTime, totalTime;
var arToolkitSource, arToolkitContext;
var markerRoot1, markerRoot2;
var mesh1;

var treeGroups = [];
var objGroups = [];
var treePositions = [];

initialize();
animate();
function initialize()
{
	scene = new THREE.Scene();
	let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
	scene.add( ambientLight );
				
	camera = new THREE.Camera();
	scene.add(camera);
	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );
	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////
	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});
	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}
	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
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
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
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
        const treeSize = 1/10;
        var treeGroup = new THREE.Group();

        treeObject.children[0].material = treeMaterials;
        treeGroup.add(treeObject);
        treeGroup.add(createOutline(treeObject.children[0].geometry, treeOutlineMaterial));

        treeGroup.scale.set(treeSize, treeSize, treeSize);
        treeGroup.rotation.y = Math.random() * Math.PI;
        treeGroups.push(treeGroup);
        // scene.add(treeGroup);
        markerRoot1.add(treeGroup);
    };

    var onObjectLoading = function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }

    var onObjectLoadError = function (error) {
        console.log('An error has happened');
    }

    var loadObject = function (path, scale, diffuseColor) {
        scale /= 10;
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
                // scene.add(objGroup);
                markerRoot1.add(objGroup);
                objGroups.push(objGroup);
            },
            onObjectLoading,
            onObjectLoadError
        )
    }

    // tree trunk: #a67344
    // tree leaves: #3b802f

    const range = 20 / 10;
    const spacing = 6 / 10;
    const noise = 2 / 10;
    var xPos = -range;
    var zPos = -range;

    while (xPos <= range) {
        zPos = -range;
        while (zPos <= range) {
            let treeIndex = Math.floor(Math.random() * 5 + 1);
            // console.log(treeIndex);
            loader.load(
                'TreesLowPoly/Tree' + treeIndex + '/tree.obj',
                onTreesLoaded,
                onObjectLoading,
                onObjectLoadError
            );
            var noiseX = Math.random() * noise * 2 - noise;
            var noiseZ = Math.random() * noise * 2 - noise;
            treePositions.push({ x: xPos + noiseX, z: zPos + noiseZ });
            zPos += spacing;
        }
        xPos += spacing;
    }

    loadObject('KangarooModel/Kangaroo.obj', 0.1, diffuseColor);

}
function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
}
function render()
{
    treeGroups.forEach((treeGroup, index) => {
        // treeGroup.rotation.y += 0.01;
        treeGroup.position.set(treePositions[index].x, 0, treePositions[index].z);
    });
    objGroups.forEach(objGroup => {
        // objGroup.rotation.y += 0.01;
        objGroup.rotation.y = -Math.PI / 2;
    })
	renderer.render( scene, camera );
}
function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}