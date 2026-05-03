#!/bin/bash

# Fix script for Embedding Atlas — macOS compatible
# Run this in your project folder (where index.html, js/, css/ are)
# Usage: bash fix.sh

set -e

echo "🔧 Fixing Embedding Atlas..."

# =============================================
# Fix 1: Create missing app.js
# =============================================
cat > js/app.js << 'JAVASCRIPT'
/**
 * app.js — Main application controller for Embedding Atlas.
 * Wires together file parsing, UMAP computation, 3D rendering, search, and UI.
 */

const App = {
    parsedData: null,
    parsedMeta: null,
    embeddings: null,
    labels: null,
    texts: null,
    umapCoords: null,
    clusterAssignments: null,
    currentColorMode: 'label',

    async init() {
        Scene3D.init('threeContainer');
        UI.init(this);
        await this.loadDemoData();
    },

    async loadDemoData() {
        try {
            UI.showProgress('Loading demo data...', 10);

            const response = await fetch('demo-data/sample-embeddings.json');
            const raw = await response.json();

            this.parsedData = raw;
            this.parsedMeta = {
                columns: Object.keys(raw[0]),
                rowCount: raw.length,
                isJson: true
            };

            UI.showProgress('Processing demo data...', 30);

            this.embeddings = FileParser.extractEmbeddings(this.parsedData, 'array', ['embedding']);
            FileParser.validateEmbeddings(this.embeddings);

            this.labels = this.parsedData.map(row => row.label || '');
            this.texts = this.parsedData.map(row => row.text || '');

            UI.showMappingSection(this.parsedMeta.columns);

            document.getElementById('labelColumn').value = 'label';
            document.getElementById('textColumn').value = 'text';
            document.getElementById('embeddingFormat').value = 'array';
            document.getElementById('arrayColumn').value = 'embedding';
            document.getElementById('arrayColumnRow').style.display = 'block';

            await this.runUMAP();

            document.getElementById('headerStatus').textContent = 'Demo loaded — 30 points';
            document.getElementById('headerStatus').className = 'header-status ready';

        } catch (err) {
            console.error('Failed to load demo data:', err);
            document.getElementById('headerStatus').textContent = 'Upload a file to begin';
        }
    },

    async _handleFile(file) {
        try {
            UI.showProgress(`Parsing ${file.name}...`, 10);

            if (file.size > 100 * 1024 * 1024) {
                UI.showError('File too large. Maximum size is 100MB.');
                UI.hideProgress();
                return;
            }

            const result = await FileParser.parseFile(file);
            this.parsedData = result.data;
            this.parsedMeta = result.meta;

            UI.showProgress(`Detected ${result.meta.rowCount} rows, ${result.meta.columns.length} columns`, 20);

            UI.showMappingSection(this.parsedMeta.columns);

            document.getElementById('headerStatus').textContent = `${result.meta.rowCount} rows loaded`;
            document.getElementById('headerStatus').className = 'header-status ready';

            UI.hideProgress();

        } catch (err) {
            UI.hideProgress();
            UI.showError(err.message);
            console.error(err);
        }
    },

    async onVisualize() {
        try {
            const format = document.getElementById('embeddingFormat').value;
            let columns, actualFormat;

            if (format === 'auto') {
                const detection = FileParser.detectEmbeddingColumns(this.parsedData, this.parsedMeta.columns);
                if (!detection.format) {
                    UI.showError('Could not auto-detect embedding columns. Please select the format manually.');
                    return;
                }
                columns = detection.columns;
                actualFormat = detection.format;
            } else if (format === 'array') {
                const col = document.getElementById('arrayColumn').value;
                if (!col) { UI.showError('Please select the array column containing embeddings.'); return; }
                columns = [col];
                actualFormat = 'array';
            } else {
                const labelCol = document.getElementById('labelColumn').value;
                const textCol = document.getElementById('textColumn').value;
                columns = this.parsedMeta.columns.filter(c =>
                    c !== labelCol && c !== textCol &&
                    this.parsedData.every(r => typeof r[c] === 'number' && !isNaN(r[c]))
                );
                if (columns.length < 2) {
                    UI.showError('Not enough numeric columns found for embedding dimensions.');
                    return;
                }
                actualFormat = 'columns';
            }

            this.embeddings = FileParser.extractEmbeddings(this.parsedData, actualFormat, columns);
            const dim = FileParser.validateEmbeddings(this.embeddings);

            this.labels = this.parsedData.map(row => {
                const val = row[document.getElementById('labelColumn').value];
                return val !== undefined && val !== null ? String(val) : `Point ${row.index || ''}`;
            });
            this.texts = this.parsedData.map(row => {
                const val = row[document.getElementById('textColumn').value];
                return val !== undefined && val !== null ? String(val) : '';
            });

            const maxPoints = parseInt(document.getElementById('maxPoints').value) || 10000;
            if (this.embeddings.length > maxPoints) {
                const downsampled = FileParser.downsample(this.parsedData, this.embeddings, this.labels, maxPoints);
                this.parsedData = downsampled.data;
                this.embeddings = downsampled.embeddings;
                this.labels = downsampled.labels;
            }

            await this.runUMAP();

        } catch (err) {
            UI.hideProgress();
            UI.showError(err.message);
            console.error(err);
        }
    },

    async runUMAP() {
        let embeddings = this.embeddings;

        if (document.getElementById('normalizeData').checked) {
            UI.showProgress('Normalizing embeddings...', 15);
            embeddings = FileParser.normalizeEmbeddings(embeddings);
        }

        const nNeighbors = parseInt(document.getElementById('umapNeighbors').value) || 15;
        const minDist = parseFloat(document.getElementById('umapMinDist').value) || 0.1;
        const nComponents = parseInt(document.getElementById('umapComponents').value) || 3;

        UI.showProgress(`Running UMAP (${nNeighbors} neighbors, ${minDist} minDist, ${nComponents}D)...`, 30);

        const n = embeddings.length;

        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const umap = new UMAP.UMAP({
                nNeighbors: nNeighbors,
                minDist: minDist,
                nComponents: nComponents,
                nEpochs: Math.min(500, Math.max(200, Math.floor(2000 / Math.log2(n + 1))))
            });

            const progressInterval = setInterval(() => {
                const progressEl = document.getElementById('progressFill');
                const current = parseFloat(progressEl.style.width) || 30;
                if (current < 80) {
                    progressEl.style.width = Math.min(current + 5, 80) + '%';
                }
            }, 500);

            const result = umap.fitAsync(embeddings);

            clearInterval(progressInterval);

            this.umapCoords = await result;

            document.getElementById('progressFill').style.width = '90%';
            document.getElementById('progressText').textContent = 'Rendering 3D scene...';

        } catch (err) {
            console.warn('UMAP failed, using simple projection:', err);
            this.umapCoords = this._simpleProjection(embeddings, nComponents);
        }

        this._updateClusters();
        this._renderScene();

        EmbeddingSearch.init(this.parsedData, this.embeddings, this.labels, this.texts, this.umapCoords);

        UI.showVisualizationSections();
        UI.hideProgress();

        document.getElementById('headerStatus').textContent = `${n} points visualized in 3D`;
    },

    _simpleProjection(data, nComponents) {
        const n = data.length;
        const dim = data[0].length;

        const means = new Array(dim).fill(0);
        for (let i = 0; i < n; i++) {
            for (let d = 0; d < dim; d++) means[d] += data[i][d];
        }
        for (let d = 0; d < dim; d++) means[d] /= n;

        const centered = data.map(row => row.map((v, d) => v - means[d]));

        const result = [];
        for (let i = 0; i < n; i++) {
            const proj = new Array(nComponents).fill(0);
            for (let c = 0; c < nComponents; c++) {
                const idx = c % n;
                for (let d = 0; d < dim; d++) {
                    proj[c] += centered[i][d] * centered[idx][d];
                }
            }
            result.push(proj);
        }
        return result;
    },

    _updateClusters() {
        const k = parseInt(document.getElementById('clusterCount').value) || 5;
        if (this.embeddings.length >= k) {
            this.clusterAssignments = ClusterEngine.kMeans(this.embeddings, k);
        } else {
            this.clusterAssignments = null;
        }
    },

    _renderScene() {
        const colorMode = document.getElementById('colorMode').value;
        this.currentColorMode = colorMode;

        let labels = null;
        let clusters = null;

        if (colorMode === 'label') {
            labels = this.labels;
        } else if (colorMode === 'cluster') {
            clusters = this.clusterAssignments;
        }

        Scene3D.renderPoints(this.umapCoords, labels, colorMode, clusters);
    },

    onSearch(query) {
        if (!query || query.length < 1) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }

        const metric = document.getElementById('searchMetric').value;

        let results;
        if (/^\d+$/.test(query)) {
            results = EmbeddingSearch.search(parseInt(query), metric, 10, 'embedding');
        } else {
            results = EmbeddingSearch.searchByLabel(query, metric, 10, 'embedding');
        }

        UI.showSearchResults(results);
    },

    onSelectPoint(index) {
        Scene3D.highlightPoint(index, this.umapCoords);
    },

    onViewportClick(event) {
        const index = Scene3D.getPointAtMouse(event);
        if (index >= 0) {
            Scene3D.highlightPoint(index, this.umapCoords);
            const tooltip = document.getElementById('pointTooltip');
            const label = this.labels ? this.labels[index] : `Point ${index}`;
            const text = this.texts ? this.texts[index] : '';
            tooltip.innerHTML = `<strong>${label}</strong>${text ? '<br>' + text : ''}`;
            tooltip.style.left = (event.clientX + 12) + 'px';
            tooltip.style.top = (event.clientY - 10) + 'px';
            tooltip.style.display = 'block';
            setTimeout(() => { tooltip.style.display = 'none'; }, 3000);
        }
    },

    onRecolor() {
        const mode = document.getElementById('colorMode').value;
        if (mode === 'cluster') {
            this._updateClusters();
        }
        this._renderScene();
    },

    onExportPNG() {
        if (!Scene3D.renderer) return;
        ExportManager.exportPNG(Scene3D.renderer, Scene3D.scene, Scene3D.camera);
    },

    onExportSVG() {
        if (!Scene3D.allCoords) return;
        const mode = this.currentColorMode;
        const colorValues = Scene3D._assignColors(
            Scene3D.allCoords.length,
            mode === 'label' ? this.labels : null,
            mode,
            mode === 'cluster' ? this.clusterAssignments : null
        );
        ExportManager.exportSVG(Scene3D.allCoords, this.labels, colorValues, colorValues);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
JAVASCRIPT
echo "  ✓ js/app.js created"

# =============================================
# Fix 2: Rewrite ui.js with correct App references
# =============================================
cat > js/ui.js << 'JAVASCRIPT'
const UI = {
    init(appRef) {
        this.app = appRef;

        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const uploadLink = document.getElementById('uploadLink');

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                App._handleFile(e.dataTransfer.files[0]);
            }
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                App._handleFile(fileInput.files[0]);
            }
        });
        uploadLink.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });

        document.getElementById('visualizeBtn').addEventListener('click', () => appRef.onVisualize());

        document.getElementById('searchInput').addEventListener('input', (e) => {
            appRef.onSearch(e.target.value);
        });
        document.getElementById('searchMetric').addEventListener('change', () => {
            const input = document.getElementById('searchInput');
            if (input.value) appRef.onSearch(input.value);
        });

        document.getElementById('colorMode').addEventListener('change', () => {
            const mode = document.getElementById('colorMode').value;
            document.getElementById('clusterCountRow').style.display = mode === 'cluster' ? 'block' : 'none';
            appRef.onRecolor();
        });
        document.getElementById('clusterCount').addEventListener('change', () => appRef.onRecolor());

        document.getElementById('exportPng').addEventListener('click', () => appRef.onExportPNG());
        document.getElementById('exportSvg').addEventListener('click', () => appRef.onExportSVG());

        const advToggle = document.getElementById('advancedToggle');
        advToggle.addEventListener('click', () => {
            const content = document.getElementById('advancedContent');
            const isOpen = content.style.display !== 'none';
            content.style.display = isOpen ? 'none' : 'block';
            advToggle.querySelector('h2').textContent = 'Advanced Settings ' + (isOpen ? '▸' : '▾');
        });

        document.getElementById('errorClose').addEventListener('click', () => {
            document.getElementById('errorToast').style.display = 'none';
        });

        document.getElementById('embeddingFormat').addEventListener('change', () => {
            const format = document.getElementById('embeddingFormat').value;
            document.getElementById('arrayColumnRow').style.display = format === 'array' ? 'block' : 'none';
        });

        document.getElementById('threeContainer').addEventListener('click', (e) => {
            appRef.onViewportClick(e);
        });
    },

    showMappingSection(columns) {
        document.getElementById('mappingSection').style.display = 'block';
        this._populateSelect('labelColumn', columns, columns[0]);
        this._populateSelect('textColumn', columns, null, true);
        this._populateSelect('arrayColumn', columns, null, true);
    },

    _populateSelect(id, options, selected, includeNone) {
        const select = document.getElementById(id);
        select.innerHTML = '';
        if (includeNone) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '— None —';
            select.appendChild(opt);
        }
        options.forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            if (col === selected) opt.selected = true;
            select.appendChild(opt);
        });
    },

    showVisualizationSections() {
        document.getElementById('searchSection').style.display = 'block';
        document.getElementById('colorSection').style.display = 'block';
        document.getElementById('exportSection').style.display = 'block';
        document.getElementById('advancedSection').style.display = 'block';
    },

    showProgress(text, percent) {
        document.getElementById('progressOverlay').style.display = 'flex';
        document.getElementById('progressText').textContent = text;
        document.getElementById('progressFill').style.width = percent + '%';
    },

    hideProgress() {
        document.getElementById('progressOverlay').style.display = 'none';
    },

    showError(message) {
        const toast = document.getElementById('errorToast');
        document.getElementById('errorMessage').textContent = message;
        toast.style.display = 'flex';
        setTimeout(() => { toast.style.display = 'none'; }, 5000);
    },

    showSearchResults(results) {
        const container = document.getElementById('searchResults');
        container.innerHTML = '';
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item" style="color: var(--text-secondary);">No results</div>';
            return;
        }
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `<span>${r.label}</span><span style="color: var(--text-secondary); font-size: 0.75rem;">${r.distance.toFixed(4)}</span>`;
            div.addEventListener('click', () => this.app.onSelectPoint(r.index));
            container.appendChild(div);
        });
    },

    setStatus(text, type = 'ready') {
        const status = document.getElementById('headerStatus');
        status.textContent = text;
        status.className = 'header-status ' + type;
    }
};
JAVASCRIPT
echo "  ✓ js/ui.js fixed"

# =============================================
# Fix 3: Create missing export.js
# =============================================
cat > js/export.js << 'JAVASCRIPT'
const ExportManager = {
    exportPNG(renderer, scene, camera) {
        renderer.render(scene, camera);
        const link = document.createElement('a');
        link.download = 'embedding-atlas.png';
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
    },

    exportSVG(coords, labels, colors) {
        if (!coords || coords.length === 0) return;

        const w = 800, h = 600;
        const padding = 40;

        // Normalize coords to SVG space
        const xs = coords.map(p => p[0]);
        const ys = coords.map(p => p[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#0f0f1a"/>
  <g transform="translate(${padding}, ${padding})">\n`;

        const scaleX = (w - 2*padding) / rangeX;
        const scaleY = (h - 2*padding) / rangeY;
        const scale = Math.min(scaleX, scaleY);

        for (let i = 0; i < coords.length; i++) {
            const x = (coords[i][0] - minX) * scale;
            const y = (coords[i][1] - minY) * scale;
            const color = colors ? '#' + colors[i].toString(16).padStart(6, '0') : '#7c5cfc';
            const r = Math.max(2, Math.min(4, 30 / Math.sqrt(coords.length)));
            svg += `    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.8"/>\n`;
        }

        svg += `  </g>\n</svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'embedding-atlas.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }
};
JAVASCRIPT
echo "  ✓ js/export.js created"

echo ""
echo "========================================"
echo "✅ All fixes applied!"
echo "========================================"
echo ""
echo "Now test locally: open index.html in your browser"
echo "Then deploy with:"
echo "  git add ."
echo "  git commit -m \"Fix drag-drop, add app.js and export.js\""
echo "  git push"
