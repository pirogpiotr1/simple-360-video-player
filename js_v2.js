/**
 * dekalracja zmiennych
 */
var camera, scene, renderer;
var texture_placeholder,
        isUserInteracting = false,
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0,
        distance = 400;


/**
 * Funkcja inicjalizacyjna calosc 
 * Stworzenie sceny, sfery, tekstury, kamery, obsluga zdarzen. Spójne polaczenie calosci
 * @param {type} src  sciezka filmu 360
 */
function init(src){

    var container, mesh;
    container = $('.canvas-con');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 110000); 
    camera.target = new THREE.Vector3(0, 0, 0);

    scene = new THREE.Scene();
    var geometry = new THREE.SphereBufferGeometry(5000, 60, 40); 
    geometry.scale(-1, 1, 1); 

    var video = document.createElement('video');

    video.setAttribute('crossorigin', 'anonymous'); 

    video.src = src;

    videoOptions(video); 

    var texture = new THREE.VideoTexture(video); 
    texture.minFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    var material = new THREE.MeshBasicMaterial({map: texture});

    mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'sphere';
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(1000, 500);
    renderer.setClearColor(0x000000, 0); 
    container.append(renderer.domElement);

    document.addEventListener('mousedown', MouseDown, false);
    document.addEventListener('mousemove', MouseMove, false);
    document.addEventListener('mouseup', MouseUp, false);

    $('.plus').on('click', function () {
        moveCloser();
    });
    $('.minus').on('click', function () {
        moveFarther();
    });

    $('.Yplus').on('click', function () {
        scaleY(mesh);
    });
    $('.Xplus').on('click', function () {
        scaleX(mesh);
    });
    $('.Zplus').on('click', function () {
        scaleZ(mesh);
    });

    $('.Yminus').on('click', function () {
        scaleY(mesh, 'minus');
    });
    $('.Xminus').on('click', function () {
        scaleX(mesh, 'minus');
    });
    $('.Zminus').on('click', function () {
        scaleZ(mesh, 'minus');
    });

    var edges;

    $('.edges').on('click', function () {
        if (!scene.getObjectByName('edges')) {
            edges = addEdges(mesh);
            scene.add(edges);
        } else {
            scene.remove(edges);
            animate();
        }
    });

    $('.texture').on('click', function () {
        if (!scene.getObjectByName('sphere')) {
            scene.add(mesh);
        } else {
            scene.remove(mesh);
            animate();
        }
    });

    window.addEventListener('resize', WindowResize, false);

}
/**
 * Update widoku kamery przy zmianie rozmiarów okna
 */
function WindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); 

}

/**
 * Przechwycenie nacisniecia przycisku myszy, zapisanie parametrów
 * @param {type} event
 */
function MouseDown(event) {

    event.preventDefault();

    isUserInteracting = true;

    onPointerDownPointerX = event.clientX; 
    onPointerDownPointerY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;
   
}

/**
 * Przechwycenie ruchu myszy wylacznie po nacisnieciu klawisza myszy, zapis polozenia
 * @param {type} event
 */
function MouseMove(event) { 

    if (isUserInteracting === true) {

        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

    }

}

/**
 * Przechwycenie puszczenia przycisku myszy
 * @param {type} event
 */
function MouseUp(event) {

    isUserInteracting = false;

}

/**
 * Zmiejszenie ogleglosci kamery
 */
function moveCloser() {
    distance -= 20;
    ;
}

/**
 * Zwiekszenie odleglosci kamery
 */
function moveFarther() {
    distance += 20;
    ;
}

/**
 * Zamiar wykonania animacji, wywolanie okreslonej funkcji w celu odswiezenia animacji 
 */
function animate() {

    requestAnimationFrame(animate);
    update();

}

/**
 *  Aktualizacja kamery w sferycznym ukladzie wspólrzednych
 */
function update() {

    lat = Math.max(-60, Math.min(60, lat)); 
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);

    camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
    camera.position.y = distance * Math.cos(phi);
    camera.position.z = distance * Math.sin(phi) * Math.sin(theta);


    camera.lookAt(camera.target);
    renderer.render(scene, camera);

}

/**
 *  Start, stop zamieszczonego wideo .
 *  Dodanie paska dlugosci wideo.
 *  Zmiana dlugosci wideo po kliknieciu.
 * @param {type} video  obiekt DOM video
 */
function videoOptions(video) {
    $('.video-options').on('click', function () {

        if (video.paused || video.ended) {
            $(this).html('Pause Video');
            video.play()
        } else {
            $(this).html("Start Video");
            video.pause();
        }
    });
    const progressBar = document.querySelector('.progress-bar'); 
    const progressBarBackground = document.querySelector('.progress-bar-background');
   
    /**
     *  Czas na string
     * @returns {date}
     */
    let toTimeString = function () {
        date = date.toTimeString().split(' ')[0];
        date = date.slice(3, 8);
        return date;
    }

    /**
     * Czas trwania
     */
    video.onloadeddata = function () {
        let duration = new Date(0, 0, 0, 0, 0, 0, video.duration * 1000);
    }

    /**
     *  Aktualizacja czasu wideo po kliknieciu przycisku myszy na pasek wideo
     * @param {type} event
     */
    progressBarBackground.onclick = event => {
        let positionRatio = event.offsetX / progressBarBackground.offsetWidth;
        video.currentTime = video.duration * positionRatio;
    }

    /**
     *  Aktualizcaja widoku paska wideo
     */
    video.ontimeupdate = function () {

        // progress bar
        let durationRatio = video.currentTime / video.duration;
        progressBar.style.width = durationRatio * 100 + '%';

    }
}

/**
 *  Stworzenie sfery z widoczynmi krawedziami
 * @param {type} mesh
 * @returns {THREE.LineSegments|addEdges.wireframe}
 */
function addEdges(mesh) {
    var geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 2});
    var wireframe = new THREE.LineSegments(geo, mat);
    wireframe.name = 'edges';
    wireframe.scale.x = mesh.scale.x; //dostosuj sie do skali sfery
    wireframe.scale.z = mesh.scale.z;
    wireframe.scale.y = mesh.scale.y;
    return wireframe;
}

/**
 *   Skalownie y
 * @param {type} mesh 
 * @param {type} sign
 */
function scaleY(mesh, sign = 'plus') {
    if (sign == 'minus')
        mesh.scale.y = mesh.scale.y - 0.05;
    else
        mesh.scale.y = mesh.scale.y + 0.05;

    let edge = scene.getObjectByName('edges');
    if (edge) // jesl bylo narysowanae zmien tez edge
        edge.scale.y = mesh.scale.y;
    camera.position = mesh.position;

}

/**
 *  Skalowanie X
 * @param {type} mesh
 * @param {type} sign
 */
function scaleX(mesh, sign = 'plus') {
    if (sign == 'minus')
        mesh.scale.x = mesh.scale.x - 0.05;
    else
        mesh.scale.x = mesh.scale.x + 0.05;
    let edge = scene.getObjectByName('edges');
    if (edge)
        edge.scale.x = mesh.scale.x;
    camera.position = mesh.position;

}
/**
 * Skalowanie Z
 * @param {type} mesh
 * @param {type} sign
 */
function scaleZ(mesh, sign = 'plus') {
    if (sign == 'minus')
        mesh.scale.z = mesh.scale.z - 0.05;
    else
        mesh.scale.z = mesh.scale.z + 0.05;
    let edge = scene.getObjectByName('edges');
    if (edge)
        edge.scale.z = mesh.scale.z;
    camera.position = mesh.position;
}