
if (!Detector.webgl) Detector.addGetWebGLMessage();
var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;
var rollOverMesh, rollOverMaterial, rollOverMeshAllowed, rollOverMaterialAllowed;
var xInitialVoxel, yInitialVoxel, zInitialVoxel;
var cubeGeo, cubeMaterial, partGeo, partHorGeo;
var objects = [];
var voxelsCoordinates = [];
var posAllowed;
var btnDiseñarEstructura, btnEscogerColores;
var btnDiseñarEstructuraSelected = true, btnEscogerColoresSelected = false;
var hooverOverColor = new THREE.Color(0xffff66);
var selectedColor = new THREE.Color(0x66ff66);
var deselectedColor = new THREE.Color(0xffffff);
var redColor = new THREE.Color(0xF96D4E);
var purpleColor = new THREE.Color(0xF669F2);
var yellowColor = new THREE.Color(0xE8F044);
var blueColor = new THREE.Color(0x4E89F9);
var groupColorMenu;
var trackballControls;
var orbitControls;
var texture1;
var clock = new THREE.Clock();

const partWidth = 8;
var cubeSize = { x: 100, y: 100, z: 100 };
var partSizeVer = { x: cubeSize.x / partWidth, y: cubeSize.y - (cubeSize.y / partWidth), z: cubeSize.z };
var partSizeHor = { x: cubeSize.x - (cubeSize.x / partWidth), y: cubeSize.y / partWidth, z: cubeSize.z };
var selectedPart;
// Get the DOM element to attach to.
var container;
var rect, topY, leftX;



var DESCENDER_ADJUST = 1.28;
function startDFEditor() {
    container = document.querySelector('#editorContainer');
    rect = container.getBoundingClientRect();
    topY = Number(rect.top);
    leftX = Number(rect.left);
    // topY = Number(rect.top);
    // leftX = Number(rect.left);
    init();
    onWindowResize();
    // render();

}



function buildMenu(message, x, y, z, selected, parameters) {

    //Create canvas.
    if (parameters === undefined) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;
    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
    var fillColor = parameters.hasOwnProperty("fillColor") ?
        parameters["fillColor"] : undefined;
    var textColor = parameters.hasOwnProperty("textColor") ?
        parameters["textColor"] : { r: 0, g: 0, b: 255, a: 1.0 };
    var radius = parameters.hasOwnProperty("radius") ?
        parameters["radius"] : 15;
    var vAlign = parameters.hasOwnProperty("vAlign") ?
        parameters["vAlign"] : "center";
    var hAlign = parameters.hasOwnProperty("hAlign") ?
        parameters["hAlign"] : "center";

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = 128;
    canvas.height = 32;
    context.font = fontsize + "px " + fontface;
    context.textBaseline = "alphabetic";
    context.textAlign = "left";
    context.fillStyle = "transparent";
    context.fillRect(4, 4, canvas.width, canvas.height);

    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    // find the center of the canvas and the half of the font width and height
    // we do it this way because the sprite's position is the CENTER of the sprite
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var tx = textWidth / 2.0;
    var ty = fontsize / 2.0;

    // then adjust for the justification
    if (vAlign === "bottom")
        ty = 0;
    else if (vAlign === "top")
        ty = fontsize;
    if (hAlign === "left")
        tx = 0;
    else if (hAlign === "right")
        tx = textWidth;

    roundRect(context, cx - tx, cy + ty + 0.28 * fontsize,
        textWidth, fontsize * DESCENDER_ADJUST, radius, borderThickness, borderColor, fillColor);
    context.fillStyle = getCanvasColor(textColor);
    context.fillText(message, cx - tx, cy + ty);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture });

    // var material = new THREE.SpriteMaterial();
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(200, 60, 1);
    sprite.position.set(x, y, z);

    if (selected) {
        sprite.material.color.set(selectedColor);
        sprite.userData = { selected: true }
    } else {
        sprite.userData = { selected: false }
    }

    objects.push(sprite);
    return sprite;
}

/**
     *  function for drawing rounded rectangles
     */
function roundRect(ctx, x, y, w, h, r, borderThickness, borderColor, fillColor) {
    // no point in drawing it if it isn't going to be rendered
    if (fillColor === undefined && borderColor === undefined)
        return;
    x -= borderThickness + r;
    y += borderThickness + r;
    w += borderThickness * 2 + r * 2;
    h += borderThickness * 2 + r * 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y - r);
    ctx.lineTo(x + w, y - h + r);
    ctx.quadraticCurveTo(x + w, y - h, x + w - r, y - h);
    ctx.lineTo(x + r, y - h);
    ctx.quadraticCurveTo(x, y - h, x, y - h + r);
    ctx.lineTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.lineWidth = borderThickness;
    // background color
    // border color
    // if the fill color is defined, then fill it
    if (fillColor !== undefined) {
        ctx.fillStyle = getCanvasColor(fillColor);
        ctx.fill();
    }
    if (borderThickness > 0 && borderColor !== undefined) {
        ctx.strokeStyle = getCanvasColor(borderColor);
        ctx.stroke();
    }
}

/**
 * convenience for converting JSON color to rgba that canvas wants
 * Be nice to handle different forms (e.g. no alpha, CSS style, etc.)
 */
function getCanvasColor(color) {
    return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
}

function init() {
    // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 10000);

    orbitControls = new THREE.OrbitControls(camera);
    orbitControls.userZoom = false;
    orbitControls.userRotate = true;
    orbitControls.userPan = true;
    orbitControls.userRotateSpeed = 3.0;
    orbitControls.userZoomSpeed = 3.0;
    orbitControls.userPanSpeed = 3.0;
    orbitControls.minDistance = 600;
    orbitControls.maxDistance = 2000;
    orbitControls.minPolarAngle = 1; // radians
    orbitControls.maxPolarAngle = 1.55; // radians

    camera.position.set(400, 600, 1200);
    camera.lookAt(0, 0, 0);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // roll-over helpers
    var rollOverGeo = new THREE.BoxBufferGeometry(cubeSize.x, cubeSize.y, cubeSize.z);
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    rollOverMesh.name = "rollOver";
    objects.push(rollOverMesh);
    scene.add(rollOverMesh);

    // var rollOverGeoAllowed = new THREE.BoxBufferGeometry(cubeSize.x, cubeSize.y, cubeSize.z);
    // rollOverMateriaAllowed = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    // rollOverMeshAllowed = new THREE.Mesh(rollOverGeoAllowed, rollOverMeshAllowed)
    // scene.add(rollOverMeshAllowed);

    // cubes
    cubeGeo = new THREE.BoxBufferGeometry(cubeSize.x, cubeSize.y, cubeSize.z);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new THREE.TextureLoader().load('./3d-editor/textures/square-outline-textured.png') });

    // grid
    var gridHelper = new THREE.GridHelper(1000, 10);
    scene.add(gridHelper);

    //line of vision...
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);
    objects.push(plane);

    // default cube
    var defaultVoxel = new THREE.Mesh(cubeGeo, cubeMaterial);

    // defaultVoxel.position;
    xInitialVoxel = cubeSize.x / 2;
    yInitialVoxel = cubeSize.y / 2;
    zInitialVoxel = 250;
    defaultVoxel.position.x = xInitialVoxel;
    defaultVoxel.position.y = yInitialVoxel;
    defaultVoxel.position.z = zInitialVoxel;

    //Parts
    partGeo = new THREE.BoxBufferGeometry(partSizeVer.x, partSizeVer.y, partSizeVer.z);

    // partMaterial = new THREE.MeshLambertMaterial({
    //     color:
    //         0xF96DEE
    // });

    // var verticalPartMesh = new THREE.Mesh(partGeo, partMaterial);

    var yellowTexture = new THREE.TextureLoader().load("./3d-editor/textures/yellow.png");
    var mtrlyellowTexture = new THREE.MeshLambertMaterial({ map: yellowTexture });
    var yellowMesh = new THREE.Mesh(partGeo, mtrlyellowTexture);
    yellowMesh.position.x = xInitialVoxel + (cubeSize.x / 2);
    yellowMesh.position.y = yInitialVoxel;
    yellowMesh.position.z = zInitialVoxel;
    yellowMesh.userData = { type: "part" };
    voxelsCoordinates.push(yellowMesh.position);
    objects.push(yellowMesh);
    scene.add(yellowMesh);

    //azul

    // partMaterial2 = new THREE.MeshLambertMaterial({
    //     color:
    //         0x4EF9EE
    // });

    var blueTexture = new THREE.TextureLoader().load("3d-editor/textures/azul_claro.png");
    var mtrlblueTexture = new THREE.MeshLambertMaterial({ map: blueTexture });
    var meshLeftblueTexture = new THREE.Mesh(partGeo, mtrlblueTexture);

    // var verticalPartMesh2 = new THREE.Mesh(partGeo, meshblueTexture);
    meshLeftblueTexture.position.x = xInitialVoxel - (cubeSize.x / 2);
    meshLeftblueTexture.position.y = yInitialVoxel;
    meshLeftblueTexture.position.z = zInitialVoxel;
    meshLeftblueTexture.userData = { type: "part" };
    voxelsCoordinates.push(meshLeftblueTexture.position);
    objects.push(meshLeftblueTexture);
    scene.add(meshLeftblueTexture);

    //TOP HORIZONTAL INITIAL GEOMETRY.
    partHorTopGeo = new THREE.BoxBufferGeometry(partSizeHor.x, partSizeHor.y, partSizeHor.z);
    var redTexture = new THREE.TextureLoader().load("3d-editor/textures/red.png");
    var mtrlredTexture = new THREE.MeshLambertMaterial({ map: redTexture });
    var horizontalTopPartMesh = new THREE.Mesh(partHorTopGeo, mtrlredTexture);
    horizontalTopPartMesh.position.x = xInitialVoxel;
    horizontalTopPartMesh.position.y = yInitialVoxel + (cubeSize.x / 2);
    horizontalTopPartMesh.position.z = zInitialVoxel;
    horizontalTopPartMesh.userData = { type: "part" };
    voxelsCoordinates.push(horizontalTopPartMesh.position);
    objects.push(horizontalTopPartMesh);
    scene.add(horizontalTopPartMesh);

    //BOTTOM HORIZONTAL INITIAL GEOMETRY
    partHorBottomGeo = new THREE.BoxBufferGeometry(partSizeHor.x, partSizeHor.y, partSizeHor.z);
    var whiteTexture = new THREE.TextureLoader().load("3d-editor/textures/white.png");
    var mtrlWhiteTexture = new THREE.MeshLambertMaterial({ map: whiteTexture });
    var meshBottomWhiteTexture = new THREE.Mesh(partHorBottomGeo, mtrlWhiteTexture);
    meshBottomWhiteTexture.position.x = xInitialVoxel;
    meshBottomWhiteTexture.position.y = yInitialVoxel - (cubeSize.x / 2);
    meshBottomWhiteTexture.position.z = zInitialVoxel;
    meshBottomWhiteTexture.userData = { type: "part" }
    voxelsCoordinates.push(meshBottomWhiteTexture.position);
    objects.push(meshBottomWhiteTexture);
    scene.add(meshBottomWhiteTexture);

    //axes
    var axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);

    // lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(container.clientWidth, container.clientHeight);
    // console.log(container.clientWidth + "-" + container.clientHeight )

    // document.body.appendChild(renderer.domElement);
    renderer.domElement.width = container.clientWidth;
    renderer.domElement.height = container.clientHeight;
    container.appendChild(renderer.domElement);

    container.addEventListener('mousemove', onDocumentMouseMove, false);
    container.addEventListener('mousedown', onDocumentMouseDown, false);
    container.addEventListener('keydown', onDocumentKeyDown, false);
    container.addEventListener('keyup', onDocumentKeyUp, false);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('scroll', onWindowScroll, false);

    btnDiseñarEstructura = buildMenu("Diseñar estructura", -200, -160, 500, true, { fontsize: 14, borderThickness: 2, borderColor: { r: 0, g: 0, b: 0, a: 1.0 }, backgroundColor: { r: 255, g: 100, b: 100, a: 1 }, fillColor: { r: 255, g: 255, b: 255, a: 1 } });
    btnDiseñarEstructura.userData = { selected: true, type: "menu" };
    btnDiseñarEstructura.name = "btnDiseñarEstructura";

    btnEscogerColores = buildMenu("Escoger colores", -200, -250, 500, false, { fontsize: 14, borderThickness: 2, borderColor: { r: 0, g: 0, b: 0, a: 1.0 }, backgroundColor: { r: 160, g: 244, b: 65, a: 1 }, fillColor: { r: 255, g: 255, b: 255, a: 1 } });
    btnEscogerColores.userData = { selected: false, type: "menu" };
    btnEscogerColores.name = "btnEscogerColores";

    scene.add(btnDiseñarEstructura);
    scene.add(btnEscogerColores);

    buildColorChooserMenu();

    render();
}

function createMesh(geometry) {
    // assign two materials
    var meshMaterial = new THREE.MeshNormalMaterial();
    meshMaterial.side = THREE.DoubleSide;
    var wireframeMaterial = new THREE.MeshBasicMaterial();
    wireFrameMaterial.wireframe = true;
    // create a multimaterial
    var mesh = THREE.SceneUtils.createMultiMaterialObject(
        geometry, [meshMaterial, wireframeMaterial]);
    return mesh;
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientWidth;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientWidth);

    rect = container.getBoundingClientRect();
    topY = Number(rect.top);
    leftX = Number(rect.left);

    // render();
}

function onWindowScroll() {
    rect = container.getBoundingClientRect();
    topY = Number(rect.top);
    leftX = Number(rect.left);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.set(((event.clientX - leftX) / container.clientWidth) * 2 - 1, - ((event.clientY - topY) / container.clientHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {

        var intersect = intersects[0];

        if (intersect.object.name == "btnDiseñarEstructura") {
            if (!intersect.object.userData.selected) {
                intersect.object.material.color.set(hooverOverColor);
            }

            // render();
        }

        if (intersect.object.name == "btnEscogerColores") {
            if (!intersect.object.userData.selected) {
                intersect.object.material.color.set(hooverOverColor);
            }

            // render();
        }


        if (intersect.object.userData.type !== "menu") {
            var pos = intersect.point.add(intersect.face.normal).divideScalar(cubeSize.x).floor().multiplyScalar(cubeSize.x).addScalar(50)
            posAllowed = verifyIntersections(pos);
        }
        else
            posAllowed = 0;


        if (posAllowed !== 0) {
            rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
            rollOverMesh.position.divideScalar(cubeSize.x).floor().multiplyScalar(cubeSize.x).addScalar(50);
        }
    } else {

        if (btnDiseñarEstructura.userData.selected == true) {
            //limpio btnEscogerColores
            btnEscogerColores.material.color.set(deselectedColor);

        } else {
            btnDiseñarEstructura.material.color.set(deselectedColor);
        }


        if (btnEscogerColores.material.color.getHexString() == hooverOverColor.getHexString())
            btnEscogerColores.material.color.set(0xffffff);

        // render();

    }
    // render();
}

function verifyIntersections(position) {
    //iterate looking for a suitable neighbor (element with coordinates next to position)
    var zPosition;
    var hasVoxelBelow = true;

    if (position.x === 0) {
        xIntersection = 0;
    } else if (position.x === xInitialVoxel) {
        xIntersection = xInitialVoxel;
    } else if (position.x < 0) {
        xIntersection = position.x + cubeSize.x;
    } else if (position.x > 0) {
        xIntersection = position.x - (cubeSize.x / 2);
    }

    var yIntersection = position.y + cubeSize.y;
    var bottomIntersection = position.y - (cubeSize.y / 2);
    // var rightIntersection = position.x - cubeSize.x;

    for (let index = 0; index < voxelsCoordinates.length; index++) {
        const element = voxelsCoordinates[index];

        if (element.x === xIntersection && position.z - element.z === 0) {
            //It must check for a voxel below.
            //TODO: revisar este valor constante de 50....
            if (position.y > 100) {
                hasVoxelBelow = verifyForVoxelBelow(position);
            }
            if (hasVoxelBelow)
                return 1;
        }

    }

    return 0;
}

function verifyForVoxelBelow(position) {

    //Checks if it is the first block.
    //TODO: revisar por qué el 50, ¿no debería ser la coordenada 0?
    if (position.y === 50) {
        return true;
    }

    for (let index = 0; index < voxelsCoordinates.length; index++) {
        const element = voxelsCoordinates[index];

        if (position.x === element.x && position.z === element.z && (position.y - element.y === (cubeSize.y / 2))) {
            return true;
        }
    }

    return false;
}


function checkForParts(pos) {
    var position = { x: -1, y: -1, z: -1, exists: false };
    var parts = { left: { x: -1, y: -1, z: -1, exists: false }, right: { x: -1, y: -1, z: -1, exists: false }, bottom: { x: -1, y: -1, z: -1, exists: false }, top: { x: -1, y: -1, z: -1, exists: false } };

    parts.left.x = pos.x - (cubeSize.x / 2);
    parts.left.y = pos.y;
    parts.left.z = pos.z;

    parts.right.x = pos.x + (cubeSize.x / 2);
    parts.right.y = pos.y;
    parts.right.z = pos.z;

    parts.top.x = pos.x;
    parts.top.y = pos.y + (cubeSize.y / 2);
    parts.top.z = pos.z;

    parts.bottom.x = pos.x;
    parts.bottom.y = pos.y - (cubeSize.y / 2);
    parts.bottom.z = pos.z;

    for (let index = 0; index < voxelsCoordinates.length; index++) {
        const element = voxelsCoordinates[index];
        if (element.x === parts.left.x && element.y === parts.left.y && element.z === parts.left.z) {
            parts.left.exists = true;
        } else if (element.x === parts.right.x && element.y === parts.right.y && element.z === parts.right.z) {
            parts.right.exists = true;
        } else if (element.x === parts.top.x && element.y === parts.top.y && element.z === parts.top.z) {
            parts.top.exists = true;
        } else if (element.x === parts.bottom.x && element.y === parts.bottom.y && element.z === parts.bottom.z) {
            parts.bottom.exists = true;
        }
    }

    return parts;
}

function createLeftPart(left) {
    // var partMaterial = new THREE.MeshLambertMaterial({
    //     color:
    //         0xB2B4B7
    // });

    var defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/grey.png");
    var mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });

    var newLeftMesh = new THREE.Mesh(partGeo, mtrldefaultTexture);
    newLeftMesh.position.x = left.x;
    newLeftMesh.position.y = left.y;
    newLeftMesh.position.z = left.z;
    newLeftMesh.userData = { type: "part" };
    voxelsCoordinates.push(newLeftMesh.position);
    objects.push(newLeftMesh);
    scene.add(newLeftMesh);
}

function createTopPart(top) {
    // var partMaterial = new THREE.MeshLambertMaterial({
    //     color:
    //         0xB2B4B7
    // });
    var defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/grey.png");
    var mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
    var newTopMesh = new THREE.Mesh(partHorTopGeo, mtrldefaultTexture);
    newTopMesh.position.x = top.x;
    newTopMesh.position.y = top.y;
    newTopMesh.position.z = top.z;
    newTopMesh.userData = { type: "part" };
    voxelsCoordinates.push(newTopMesh.position);
    objects.push(newTopMesh);
    scene.add(newTopMesh);
}

function createRightPart(right) {
    var defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/grey.png");
    var mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
    var newRightMesh = new THREE.Mesh(partGeo, mtrldefaultTexture);
    newRightMesh.position.x = right.x;
    newRightMesh.position.y = right.y;
    newRightMesh.position.z = right.z;
    newRightMesh.userData = { type: "part" };
    voxelsCoordinates.push(newRightMesh.position);
    objects.push(newRightMesh);
    scene.add(newRightMesh);
}

function createBottomPart(bottom) {
    var defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/grey.png");
    var mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
    var newBottomMesh = new THREE.Mesh(partHorBottomGeo, mtrldefaultTexture);
    newBottomMesh.position.x = bottom.x;
    newBottomMesh.position.y = bottom.y;
    newBottomMesh.position.z = bottom.z;
    newBottomMesh.userData = { type: "part" };
    voxelsCoordinates.push(newBottomMesh.position);
    objects.push(newBottomMesh);
    scene.add(newBottomMesh);
}

function makeItBlink(part) {
    part.material.wireframe = true;

    // var myVar = setInterval(myTimer, 1000);
    // function myTimer() {
    //     var d = new Date();
    //     document.getElementById("demo").innerHTML = d.toLocaleTimeString();
    // }
}

function stopTheBlinking(part) {
    if (part)
        part.material.wireframe = false;
}

function buildColorSelector() {
    var mtrlMenu1 = new THREE.MeshLambertMaterial({
        color: 0xF96D4E
    });

    //azul
    mtrlMenu2 = new THREE.MeshLambertMaterial({
        color:
            0x4E89F9
    });

    mtrlMenu3 = new THREE.MeshLambertMaterial({
        color:
            0xE8F044
    });

    mtrlMenu4 = new THREE.MeshLambertMaterial({
        color:
            0xF669F2
    });

}

function buildColorChooserMenu() {
    var menuGeometry = new THREE.BoxBufferGeometry(50, 50, 10);

    var whiteTexture = new THREE.TextureLoader().load("3d-editor/textures/white.png");
    var mtrlWhiteTexture = new THREE.MeshBasicMaterial({ map: whiteTexture });
    var meshWhiteTexture = new THREE.Mesh(menuGeometry, mtrlWhiteTexture);
    meshWhiteTexture.name = "whiteMenu";
    meshWhiteTexture.position.x = 0;
    meshWhiteTexture.position.y = 150;
    meshWhiteTexture.userData = { type: "colorMenu" };
    objects.push(meshWhiteTexture);

    //ROJO
    var redTexture = new THREE.TextureLoader().load("3d-editor/textures/red.png");
    var mtrlredTexture = new THREE.MeshBasicMaterial({ map: redTexture });
    var redMesh = new THREE.Mesh(menuGeometry, mtrlredTexture);
    redMesh.name = "redMenu";
    redMesh.position.x = 0;
    redMesh.position.y = 200;
    redMesh.userData = { type: "colorMenu" };
    objects.push(redMesh);

    //PURPLE
    // var mtrlPurpleColor = new THREE.MeshLambertMaterial({
    //     color: 0xF669F2
    // });
    var blackTexture = new THREE.TextureLoader().load("3d-editor/textures/black.png");
    var mtrlblackTexture = new THREE.MeshBasicMaterial({ map: blackTexture });
    var blackMesh = new THREE.Mesh(menuGeometry, mtrlblackTexture);
    blackMesh.name = "blackMenu";
    blackMesh.position.x = 0;
    blackMesh.position.y = 0;
    blackMesh.userData = { type: "colorMenu" };
    objects.push(blackMesh);

    //YELLOW
    // var mtrlYellowColor = new THREE.MeshLambertMaterial({
    //     color: 0xE8F044
    // });

    var yellowTexture = new THREE.TextureLoader().load("3d-editor/textures/yellow.png");
    var mtrlyellowTexture = new THREE.MeshBasicMaterial({ map: yellowTexture });
    var yellowMesh = new THREE.Mesh(menuGeometry, mtrlyellowTexture);
    yellowMesh.name = "yellowMenu";
    yellowMesh.position.x = 0;
    yellowMesh.position.y = 50;
    yellowMesh.userData = { type: "colorMenu" };
    objects.push(yellowMesh);

    var blueTexture = new THREE.TextureLoader().load("3d-editor/textures/azul_claro.png");
    var mtrlblueTexture = new THREE.MeshBasicMaterial({ map: blueTexture });
    var meshblueTexture = new THREE.Mesh(menuGeometry, mtrlblueTexture);
    meshblueTexture.name = "blueMenu";
    meshblueTexture.position.x = 0;
    meshblueTexture.position.y = 100;
    meshblueTexture.userData = { type: "colorMenu" };
    objects.push(meshblueTexture);

    var texture1 = new THREE.TextureLoader().load("3d-editor/textures/brown_wood.png");
    var mtrlTexture1 = new THREE.MeshBasicMaterial({ map: texture1 });
    var texture1Mesh = new THREE.Mesh(menuGeometry, mtrlTexture1);
    texture1Mesh.name = "brownWoodMenu";
    texture1Mesh.position.x = 55;
    texture1Mesh.position.y = 0;
    texture1Mesh.userData = { type: "colorMenu" };
    objects.push(texture1Mesh);

    var texture2 = new THREE.TextureLoader().load("3d-editor/textures/light_brown_wood.png");
    var mtrlTexture2 = new THREE.MeshBasicMaterial({ map: texture2 });
    var texture2Mesh = new THREE.Mesh(menuGeometry, mtrlTexture2);
    texture2Mesh.name = "lightBrownWood";
    texture2Mesh.position.x = 55;
    texture2Mesh.position.y = 50;
    texture2Mesh.userData = { type: "colorMenu" };
    objects.push(texture2Mesh);

    var textureGreyWood = new THREE.TextureLoader().load("3d-editor/textures/grey_wood.png");
    var mtrlGreyWood = new THREE.MeshBasicMaterial({ map: textureGreyWood });
    var meshGreyWood = new THREE.Mesh(menuGeometry, mtrlGreyWood);
    meshGreyWood.name = "meshGreyWood";
    meshGreyWood.position.x = 55;
    meshGreyWood.position.y = 100;
    meshGreyWood.userData = { type: "colorMenu" };
    objects.push(meshGreyWood);

    groupColorMenu = new THREE.Group();
    groupColorMenu.add(meshWhiteTexture);
    groupColorMenu.add(blackMesh);
    groupColorMenu.add(yellowMesh);
    groupColorMenu.add(meshblueTexture);
    groupColorMenu.add(redMesh);
    groupColorMenu.add(texture1Mesh);
    groupColorMenu.add(texture2Mesh);
    groupColorMenu.add(meshGreyWood);
    groupColorMenu.position.y = 200;
    scene.add(groupColorMenu);
    groupColorMenu.visible = false;
}


function onDocumentMouseDown(event) {
    event.preventDefault();
    // mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    rect = container.getBoundingClientRect();
    topY = Number(rect.top);
    leftX = Number(rect.left);
    // alert(topY + " " + leftX);

    mouse.set(((event.clientX - leftX) / container.clientWidth) * 2 - 1, - ((event.clientY - topY) / container.clientHeight) * 2 + 1);
    // alert(event.clientX + "-" + event.clientY + "**" + leftX + "-" + topY);
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        var intersect = intersects[0];

        if (intersect.object.name === "btnDiseñarEstructura") {
            if (!intersect.object.userData.selected) {
                //Lo marca como seleccionado.
                btnDiseñarEstructura.material.color.set(selectedColor);
                btnDiseñarEstructura.userData.selected = true;
                btnDiseñarEstructura.material.transparent = true;
                btnDiseñarEstructura.material.opacity = 1;
                stopTheBlinking(selectedPart);

                rollOverMesh.visible = true;

                //Los marca como deseleccionado.
                btnEscogerColores.material.color.set(deselectedColor);
                btnEscogerColores.userData.selected = false;
                btnEscogerColores.material.transparent = true;
                btnEscogerColores.material.opacity = 0.5;
            }

            groupColorMenu.visible = false;
        }

        if (intersect.object.name === "btnEscogerColores") {
            if (!intersect.object.userData.selected) {
                //Lo marca como seleccionado.
                btnEscogerColores.material.color.set(selectedColor);
                btnEscogerColores.userData.selected = true;
                btnEscogerColores.material.transparent = true;
                btnEscogerColores.material.opacity = 1;

                rollOverMesh.visible = false;

                //Los marca como deseleccionado.
                btnDiseñarEstructura.material.color.set(deselectedColor);
                btnDiseñarEstructura.userData.selected = false;
                btnDiseñarEstructura.material.transparent = true;
                btnDiseñarEstructura.material.opacity = 0.5;

                //mueve el menú de selección de colores.

            }

            groupColorMenu.visible = true;
            groupColorMenu.position.x = 0;
            groupColorMenu.position.y = 200;
            groupColorMenu.position.z = 110;
        }

        if (intersect.object.userData.type === "part" && btnEscogerColores.userData.selected === true) {
            if (typeof selectedPart === 'undefined')
                selectedPart = intersect.object;

            if (intersect.object !== selectedPart) {
                stopTheBlinking(selectedPart);
                selectedPart = intersect.object;
            }

            makeItBlink(selectedPart);

            groupColorMenu.position.copy(intersect.point);
            groupColorMenu.position.x += 110;
            groupColorMenu.position.y += 100;
            groupColorMenu.position.z += 150;


            // intersect.object.material.transparent = true;
            // intersect.object.material.opacity = 0.5;
        }

        if (intersect.object.userData.type === "colorMenu" && btnEscogerColores.userData.selected === true) {
            var defaultTexture;
            var mtrldefaultTexture;
            switch (intersect.object.name) {
                case "whiteMenu":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/white.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                case "blackMenu":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/black.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                case "redMenu":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/red.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                case "purpleMenu":
                    selectedPart.material.color.set(purpleColor);
                    break;
                case "yellowMenu":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/yellow.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                case "blueMenu":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/azul_claro.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                case "brownWoodMenu":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/brown_wood.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                case "lightBrownWood":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/light_brown_wood.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                case "meshGreyWood":
                    defaultTexture = new THREE.TextureLoader().load("3d-editor/textures/grey_wood.png");
                    mtrldefaultTexture = new THREE.MeshLambertMaterial({ map: defaultTexture });
                    selectedPart.material = mtrldefaultTexture;
                    // selectedPart.material.map.set();
                    break;
                default:
                    break;
            }
        }

        // render();

        // delete cube
        if (isShiftDown) {
            if (intersect.object !== plane) {
                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
            }
            // create cube
        } else {

            if (btnDiseñarEstructura.userData.selected == true) {

                // var partMaterial = new THREE.MeshLambertMaterial({
                //     color:
                //         0xB2B4B7
                // });
                // var voxel = new THREE.Mesh(cubeGeo, partMaterial);

                //  corrige la posición cuando se hace clic en el lado superior del rollover.
                if (intersect.point.y % cubeSize.y === 0 && intersect.point.y >= cubeSize.y) {
                    intersect.point.y = intersect.point.y - cubeSize.y / 2;
                }

                if (intersect.object.userData.type !== "menu") {
                    var pos = intersect.point.add(intersect.face.normal).divideScalar(cubeSize.x).floor().multiplyScalar(cubeSize.x).addScalar(cubeSize.x / 2);
                    if (intersect.object.name === "rollOver") {
                        if (pos.z === 350)
                            pos.z = 250;
                    }
                    posAllowed = verifyIntersections(pos);
                } else {
                    posAllowed = 0;
                }

                if (posAllowed !== 0) {
                    var parts = checkForParts(pos);

                    if (parts.left.exists === false)
                        createLeftPart(parts.left);
                    if (parts.top.exists === false)
                        createTopPart(parts.top);
                    if (parts.right.exists === false)
                        createRightPart(parts.right);
                    if (parts.bottom.exists === false)
                        createBottomPart(parts.bottom);
                }
            }

            // if (posAllowed !== 0) {
            //     voxel.position.copy(intersect.point).add(intersect.face.normal);
            //     voxel.position.divideScalar(100).floor().multiplyScalar(100).addScalar(50);
            //     scene.add(voxel);
            //     objects.push(voxel);
            //     voxelsCoordinates.push(voxel.position);
            // }

        }
        render();
    }
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = true; break;
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = false; break;
    }
}
function render() {
    var delta = clock.getDelta();
    // trackballControls.update(delta);
    orbitControls.update(delta);

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
