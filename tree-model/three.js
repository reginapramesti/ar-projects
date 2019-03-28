var scene, camera, renderer, controls, stats;

var tree;

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

var cylinderCurvedSurfaceGeometry = function(radius, height, startAngle, endAngle, horizontalSegments, verticalSegments) {
    var width = radius * 2 * Math.PI;
    var plane = new THREE.PlaneGeometry(width, height, horizontalSegments, verticalSegments);
    var index = 0;

    for(var i=0; i<=verticalSegments; i++) {
        for(var j=0; j<=horizontalSegments; j++) {
            var angle = startAngle + (j/horizontalSegments)*(endAngle - startAngle);
            plane.vertices[index].z = radius * Math.cos(angle);
            plane.vertices[index].x = radius * Math.sin(angle);
            index++;
        }
    }

    return plane;
}

var bendPlaneGeometry = function(planeGeometry, centerBendZ) {
  var curve = new THREE.CubicBezierCurve3(
		planeGeometry.vertices[0],
		new THREE.Vector3(planeGeometry.parameters.width/2, 0, centerBendZ ),
		new THREE.Vector3(planeGeometry.parameters.width/2, 0, centerBendZ ),
		planeGeometry.vertices[(planeGeometry.vertices.length/2) - 1]
	);

	var planePoints = curve.getPoints(Math.abs(planeGeometry.vertices.length/2)-1);

	for(var edgeI = 1; edgeI < 3; edgeI++){
		for(var pointI = 0; pointI < planePoints.length; pointI++){
			planeGeometry.vertices[(edgeI === 2) ? planePoints.length + pointI : pointI].z = planePoints[pointI].z;
		}
	}

	planeGeometry.computeFaceNormals();
	planeGeometry.computeVertexNormals();

	return planeGeometry;
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
    
    stats = new Stats();
    document.body.appendChild( stats.dom );

    var treeObject = new THREE.Group();
    var treeGeometry = new THREE.CylinderGeometry( 2, 2, 10, 32 );
    var treeTexture = new THREE.TextureLoader().load("images/beechTexture.jpg");
    treeTexture.wrapS = treeTexture.wrapT = THREE.RepeatWrapping;
    treeTexture.repeat.set(2, 7);
    var material = new THREE.MeshToonMaterial( { map: treeTexture } );

    tree = new THREE.Mesh( treeGeometry, material );
    treeObject.add( tree );
    treeObject.add(createOutline(treeGeometry, outlineMaterial));
    scene.add(treeObject);

    mesh = new THREE.Mesh(
        cylinderCurvedSurfaceGeometry(2, 2, 0, Math.PI / 18, 25, 25),
        new THREE.MeshLambertMaterial({color:'white'})
    );

    scene.add(mesh);

    camera.position.z = 5;
}

function render() {

    renderer.render(scene, camera);
}

function update() {

}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
    stats.update();
}

initialise();
animate();