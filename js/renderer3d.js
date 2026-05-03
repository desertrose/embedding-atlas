const Scene3D = {
    scene: null, camera: null, renderer: null, controls: null,
    pointCloud: null, pointSize: 0.05, selectedIndex: -1,
    highlightMesh: null, allCoords: null,

    COLORS: [
        0x7c5cfc, 0xf472b6, 0x34d399, 0xfbbf24, 0x60a5fa,
        0xa78bfa, 0xfb923c, 0x2dd4bf, 0xf87171, 0x4ade80,
        0x818cf8, 0xe879f9, 0x38bdf8, 0xfcd34d, 0x86efac,
        0xc084fc, 0xfdba74, 0x67e8f9, 0xfca5a5, 0x6ee7b7
    ],

    init(containerId) {
        const container = document.getElementById(containerId);
        const w = container.clientWidth, h = container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f0f1a);

        this.camera = new THREE.PerspectiveCamera(60, w/h, 0.01, 100);
        this.camera.position.set(2, 2, 2);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.target.set(0, 0, 0);

        const amb = new THREE.AmbientLight(0x404060, 0.6);
        this.scene.add(amb);
        const dl = new THREE.DirectionalLight(0xffffff, 0.8);
        dl.position.set(1, 2, 1);
        this.scene.add(dl);
        const dl2 = new THREE.DirectionalLight(0x7c5cfc, 0.3);
        dl2.position.set(-1, -1, -1);
        this.scene.add(dl2);

        const grid = new THREE.GridHelper(2, 20, 0x333355, 0x222244);
        grid.position.y = -0.5;
        this.scene.add(grid);

        const sg = new THREE.SphereGeometry(0.08, 16, 16);
        const sm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        this.highlightMesh = new THREE.Mesh(sg, sm);
        this.highlightMesh.visible = false;
        this.scene.add(this.highlightMesh);

        window.addEventListener('resize', () => this._onResize(containerId));
        this._animate();
    },

    renderPoints(coords, labels, colorMode = 'uniform', clusterAssignments = null) {
        this.allCoords = coords;
        if (this.pointCloud) { this.scene.remove(this.pointCloud); this.pointCloud.geometry.dispose(); this.pointCloud.material.dispose(); }

        const n = coords.length;
        const norm = this._normalizeCoords(coords);
        const geom = new THREE.BufferGeometry();
        const pos = new Float32Array(n * 3);
        const cols = new Float32Array(n * 3);
        const colorVals = this._assignColors(n, labels, colorMode, clusterAssignments);

        for (let i = 0; i < n; i++) {
            pos[i*3] = norm[i][
