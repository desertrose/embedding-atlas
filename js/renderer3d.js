const Scene3D = {
    scene: null, camera: null, renderer: null, controls: null,
    pointCloud: null, pointSize: 0.05, selectedIndex: -1,
    highlightMesh: null, allCoords: null, labels: null,

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
        this.controls.update();

        // Lights
        const amb = new THREE.AmbientLight(0x404060, 0.6);
        this.scene.add(amb);
        const dl = new THREE.DirectionalLight(0xffffff, 0.8);
        dl.position.set(1, 2, 1);
        this.scene.add(dl);
        const dl2 = new THREE.DirectionalLight(0x7c5cfc, 0.3);
        dl2.position.set(-1, -1, -1);
        this.scene.add(dl2);

        // Grid
        const grid = new THREE.GridHelper(2, 20, 0x333355, 0x222244);
        grid.position.y = -0.5;
        this.scene.add(grid);

        // Highlight sphere
        const sg = new THREE.SphereGeometry(0.08, 16, 16);
        const sm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        this.highlightMesh = new THREE.Mesh(sg, sm);
        this.highlightMesh.visible = false;
        this.scene.add(this.highlightMesh);

        // Resize handler
        window.addEventListener('resize', () => this._onResize(containerId));

        this._animate();
    },

    renderPoints(coords, labels, colorMode = 'uniform', clusterAssignments = null) {
        this.allCoords = coords;
        this.labels = labels;

        // Remove old point cloud
        if (this.pointCloud) {
            this.scene.remove(this.pointCloud);
            this.pointCloud.geometry.dispose();
            this.pointCloud.material.dispose();
        }

        const n = coords.length;
        const norm = this._normalizeCoords(coords);
        const geom = new THREE.BufferGeometry();
        const pos = new Float32Array(n * 3);
        const cols = new Float32Array(n * 3);
        const colorVals = this._assignColors(n, labels, colorMode, clusterAssignments);

        for (let i = 0; i < n; i++) {
            pos[i*3] = norm[i][0];
            pos[i*3+1] = norm[i][1];
            pos[i*3+2] = norm[i][2] || 0;

            const c = new THREE.Color(colorVals[i]);
            cols[i*3] = c.r;
            cols[i*3+1] = c.g;
            cols[i*3+2] = c.b;
        }

        geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(cols, 3));

        const size = Math.max(0.02, Math.min(0.08, 0.5 / Math.sqrt(n)));
        const mat = new THREE.PointsMaterial({
            size: size,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.pointCloud = new THREE.Points(geom, mat);
        this.scene.add(this.pointCloud);
    },

    highlightPoint(index, coords) {
        if (!coords || !coords[index]) return;
        this.highlightMesh.visible = true;
        const norm = this._normalizeCoords(coords);
        this.highlightMesh.position.set(norm[index][0], norm[index][1], norm[index][2] || 0);
    },

    getPointAtMouse(event) {
        if (!this.allCoords) return -1;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        if (!this.pointCloud) return -1;

        const intersects = raycaster.intersectObject(this.pointCloud);
        if (intersects.length > 0) {
            return intersects[0].index;
        }
        return -1;
    },

    _normalizeCoords(coords) {
        const n = coords.length;
        const dim = coords[0].length;
        const means = new Array(dim).fill(0);
        const maxs = new Array(dim).fill(-Infinity);
        const mins = new Array(dim).fill(Infinity);

        for (let i = 0; i < n; i++) {
            for (let d = 0; d < dim; d++) {
                means[d] += coords[i][d];
                if (coords[i][d] > maxs[d]) maxs[d] = coords[i][d];
                if (coords[i][d] < mins[d]) mins[d] = coords[i][d];
            }
        }
        for (let d = 0; d < dim; d++) means[d] /= n;

        const result = [];
        for (let i = 0; i < n; i++) {
            const p = [];
            for (let d = 0; d < dim; d++) {
                const range = Math.max(maxs[d] - mins[d], 0.001);
                p[d] = (coords[i][d] - means[d]) / range * 1.5;
            }
            result.push(p);
        }
        return result;
    },

    _assignColors(n, labels, colorMode, clusterAssignments) {
        const colors = new Array(n);

        if (colorMode === 'label' && labels) {
            const unique = [...new Set(labels)];
            const colorMap = {};
            unique.forEach((label, i) => {
                colorMap[label] = this.COLORS[i % this.COLORS.length];
            });
            for (let i = 0; i < n; i++) {
                colors[i] = colorMap[labels[i]] || this.COLORS[0];
            }
        } else if (colorMode === 'cluster' && clusterAssignments) {
            for (let i = 0; i < n; i++) {
                colors[i] = this.COLORS[clusterAssignments[i] % this.COLORS.length];
            }
        } else {
            // Uniform purple
            for (let i = 0; i < n; i++) {
                colors[i] = 0x7c5cfc;
            }
        }
        return colors;
    },

    _onResize(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const w = container.clientWidth, h = container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    },

    _animate() {
        requestAnimationFrame(() => this._animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
};
