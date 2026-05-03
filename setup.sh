#!/bin/bash

# Embedding Atlas - Complete Project Setup
# Run this in your empty GitHub repo folder
# Usage: bash setup.sh

set -e

echo "🚀 Setting up Embedding Atlas..."

# Create directory structure
mkdir -p css js demo-data

# =============================================
# index.html
# =============================================
cat > index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Embedding Atlas</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
    <div id="app">
        <header id="header">
            <h1>🧬 Embedding Atlas</h1>
            <span class="subtitle">Visualize your embedding space</span>
            <div class="header-status" id="headerStatus">Ready</div>
        </header>

        <div id="main">
            <!-- Left Panel -->
            <aside id="leftPanel">
                <!-- Upload -->
                <section class="panel-section" id="uploadSection">
                    <h2>Upload Data</h2>
                    <div id="dropZone">
                        <div class="drop-content">
                            <span class="drop-icon">📁</span>
                            <p>Drop your file here or <a href="#" id="uploadLink">browse</a></p>
                            <p class="drop-hint">Supports .csv and .json (max 100MB)</p>
                        </div>
                        <input type="file" id="fileInput" accept=".csv,.json" hidden>
                    </div>
                </section>

                <!-- Column Mapping -->
                <section class="panel-section" id="mappingSection" style="display:none;">
                    <h2>Column Mapping</h2>
                    <div class="mapping-row">
                        <label>Label Column</label>
                        <select id="labelColumn"></select>
                    </div>
                    <div class="mapping-row">
                        <label>Text Column (optional)</label>
                        <select id="textColumn"><option value="">— None —</option></select>
                    </div>
                    <div class="mapping-row">
                        <label>Embedding Columns</label>
                        <select id="embeddingFormat">
                            <option value="auto">Auto-detect</option>
                            <option value="columns">Separate dimension columns</option>
                            <option value="array">Single array column</option>
                        </select>
                    </div>
                    <div class="mapping-row" id="arrayColumnRow" style="display:none;">
                        <label>Array Column</label>
                        <select id="arrayColumn"></select>
                    </div>
                    <button id="visualizeBtn" class="btn primary">Visualize →</button>
                </section>

                <!-- Search -->
                <section class="panel-section" id="searchSection" style="display:none;">
                    <h2>Search</h2>
                    <div class="search-row">
                        <input type="text" id="searchInput" placeholder="Search nearest neighbors...">
                        <select id="searchMetric">
                            <option value="cosine">Cosine</option>
                            <option value="euclidean">Euclidean</option>
                        </select>
                    </div>
                    <div class="search-results" id="searchResults"></div>
                </section>

                <!-- Color Controls -->
                <section class="panel-section" id="colorSection" style="display:none;">
                    <h2>Color</h2>
                    <div class="color-row">
                        <label>Color by</label>
                        <select id="colorMode">
                            <option value="label">Label column</option>
                            <option value="cluster">Auto-cluster</option>
                            <option value="uniform">Uniform</option>
                        </select>
                    </div>
                    <div class="color-row" id="clusterCountRow" style="display:none;">
                        <label>Clusters</label>
                        <input type="number" id="clusterCount" value="5" min="2" max="20">
                    </div>
                </section>

                <!-- Export -->
                <section class="panel-section" id="exportSection" style="display:none;">
                    <h2>Export</h2>
                    <div class="export-btns">
                        <button id="exportPng" class="btn">Export PNG</button>
                        <button id="exportSvg" class="btn">Export SVG</button>
                    </div>
                </section>

                <!-- Advanced -->
                <section class="panel-section" id="advancedSection" style="display:none;">
                    <div class="section-header collapsible" id="advancedToggle">
                        <h2>Advanced Settings ▸</h2>
                    </div>
                    <div class="collapsible-content" id="advancedContent" style="display:none;">
                        <div class="adv-row">
                            <label>Max Points</label>
                            <input type="number" id="maxPoints" value="10000" min="100" max="100000">
                        </div>
                        <div class="adv-row">
                            <label>UMAP nNeighbors</label>
                            <input type="number" id="umapNeighbors" value="15" min="2" max="200">
                        </div>
                        <div class="adv-row">
                            <label>UMAP minDist</label>
                            <input type="number" id="umapMinDist" value="0.1" min="0.001" max="0.999" step="0.01">
                        </div>
                        <div class="adv-row">
                            <label>UMAP nComponents</label>
                            <input type="number" id="umapComponents" value="3" min="2" max="3">
                        </div>
                        <div class="adv-row">
                            <label>Normalize embeddings</label>
                            <input type="checkbox" id="normalizeData" checked>
                        </div>
                    </div>
                </section>
            </aside>

            <!-- Right Panel: 3D Viewport -->
            <main id="viewport">
                <div id="progressOverlay" style="display:none;">
                    <div class="progress-box">
                        <h3>Computing UMAP...</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <p id="progressText">Preparing data...</p>
                    </div>
                </div>

                <div id="errorToast" class="toast error" style="display:none;">
                    <span id="errorMessage"></span>
                    <button id="errorClose">✕</button>
                </div>

                <div id="threeContainer"></div>
            </main>
        </div>

        <footer id="footer">
            <span>Open source on <a href="#" id="githubLink">GitHub</a></span>
            <span>Built with Three.js + UMAP.js</span>
        </footer>
    </div>

    <div id="pointTooltip" style="display:none;"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/umap-js@1.3.1/lib/umap-js.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>

    <script src="js/fileParser.js"></script>
    <script src="js/search.js"></script>
    <script src="js/clustering.js"></script>
    <script src="js/renderer3d.js"></script>
    <script src="js/export.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
HTML
echo "  ✓ index.html"

# =============================================
# css/style.css
# =============================================
cat > css/style.css << 'CSS'
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --bg-primary: #0f0f1a;
    --bg-secondary: #1a1a2e;
    --bg-tertiary: #25253e;
    --text-primary: #e8e8f0;
    --text-secondary: #9a9ab0;
    --accent: #7c5cfc;
    --accent-hover: #6a48e8;
    --accent-dim: rgba(124, 92, 252, 0.15);
    --success: #4ade80;
    --error: #f87171;
    --border: #2a2a45;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --radius: 8px;
    --transition: 0.2s ease;
}

html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
}

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

#header {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    gap: 12px;
}

#header h1 {
    font-size: 1.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent), #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

#header .subtitle {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.header-status {
    margin-left: auto;
    font-size: 0.75rem;
    padding: 4px 12px;
    border-radius: 12px;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
}

.header-status.loading { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.header-status.ready { background: rgba(74, 222, 128, 0.15); color: var(--success); }
.header-status.error { background: rgba(248, 113, 113, 0.15); color: var(--error); }

#main {
    display: flex;
    flex: 1;
    overflow: hidden;
}

#leftPanel {
    width: 320px;
    min-width: 280px;
    overflow-y: auto;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

#leftPanel::-webkit-scrollbar { width: 6px; }
#leftPanel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.panel-section {
    background: var(--bg-tertiary);
    border-radius: var(--radius);
    padding: 16px;
}

.panel-section h2 {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

#dropZone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 32px 16px;
    text-align: center;
    cursor: pointer;
    transition: var(--transition);
    background: var(--bg-secondary);
}

#dropZone:hover, #dropZone.dragover {
    border-color: var(--accent);
    background: var(--accent-dim);
}

.drop-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
.drop-content p { font-size: 0.85rem; color: var(--text-secondary); }
.drop-content a { color: var(--accent); text-decoration: none; }
.drop-content a:hover { text-decoration: underline; }
.drop-hint { font-size: 0.75rem !important; margin-top: 4px; opacity: 0.6; }

.mapping-row { margin-bottom: 12px; }
.mapping-row label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.mapping-row select, .mapping-row input {
    width: 100%;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.85rem;
    outline: none;
    transition: var(--transition);
}
.mapping-row select:focus, .mapping-row input:focus { border-color: var(--accent); }

.btn {
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    font-size: 0.85rem;
    transition: var(--transition);
}
.btn:hover { background: var(--bg-tertiary); border-color: var(--accent); }
.btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    font-weight: 600;
}
.btn.primary:hover { background: var(--accent-hover); }

.search-row { display: flex; gap: 8px; }
.search-row input {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.85rem;
    outline: none;
}
.search-row input:focus { border-color: var(--accent); }
.search-row select {
    padding: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.8rem;
    outline: none;
}

.search-results { margin-top: 8px; max-height: 200px; overflow-y: auto; }
.search-result-item {
    padding: 6px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    transition: var(--transition);
}
.search-result-item:hover { background: var(--accent-dim); }

.color-row { margin-bottom: 8px; }
.color-row label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.color-row select, .color-row input {
    width: 100%;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.85rem;
    outline: none;
}

.export-btns { display: flex; gap: 8px; }
.export-btns .btn { flex: 1; text-align: center; }

.section-header { cursor: pointer; user-select: none; }
.section-header:hover h2 { color: var(--accent); }

.adv-row { margin-bottom: 10px; }
.adv-row label {
    display: block;
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.adv-row input[type="number"] {
    width: 100%;
    padding: 6px 10px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.85rem;
    outline: none;
}
.adv-row input[type="checkbox"] { accent-color: var(--accent); }

#viewport {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: var(--bg-primary);
}

#threeContainer { width: 100%; height: 100%; }

#progressOverlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 15, 26, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.progress-box {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px 48px;
    text-align: center;
    box-shadow: var(--shadow);
}
.progress-box h3 { margin-bottom: 16px; font-size: 1rem; }
.progress-bar {
    width: 300px;
    height: 8px;
    background: var(--bg-primary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}
.progress-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--accent), #a78bfa);
    border-radius: 4px;
    transition: width 0.3s ease;
}
#progressText { font-size: 0.8rem; color: var(--text-secondary); }

.toast {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: var(--radius);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 200;
    box-shadow: var(--shadow);
    animation: slideDown 0.3s ease;
}
.toast.error { background: var(--error); color: #fff; }
.toast button { background: none; border: none; color: inherit; cursor: pointer; font-size: 1rem; }

@keyframes slideDown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

#footer {
    display: flex;
    justify-content: space-between;
    padding: 8px 24px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    font-size: 0.7rem;
    color: var(--text-secondary);
    flex-shrink: 0;
}
#footer a { color: var(--accent); text-decoration: none; }
#footer a:hover { text-decoration: underline; }

#pointTooltip {
    position: absolute;
    pointer-events: none;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.78rem;
    color: var(--text-primary);
    max-width: 250px;
    box-shadow: var(--shadow);
    z-index: 50;
    display: none;
}
CSS
echo "  ✓ css/style.css"

# =============================================
# css/responsive.css
# =============================================
cat > css/responsive.css << 'CSS'
@media (max-width: 768px) {
    #main { flex-direction: column; }
    #leftPanel {
        width: 100%;
        min-width: unset;
        max-height: 50vh;
        border-right: none;
        border-bottom: 1px solid var(--border);
    }
    #viewport { flex: 1; min-height: 50vh; }
    #header h1 { font-size: 1rem; }
    .subtitle { display: none; }
    .progress-box { padding: 24px; }
    .progress-bar { width: 200px; }
}

@media (max-width: 480px) {
    #header { padding: 8px 12px; }
    #leftPanel { padding: 12px; max-height: 40vh; }
    .panel-section { padding: 12px; }
    .search-row { flex-direction: column; }
    .export-btns { flex-direction: column; }
}
CSS
echo "  ✓ css/responsive.css"

# =============================================
# js/fileParser.js
# =============================================
cat > js/fileParser.js << 'JAVASCRIPT'
const FileParser = {
    parseFile(file) {
        return new Promise((resolve, reject) => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'csv') this._parseCSV(file, resolve, reject);
            else if (ext === 'json') this._parseJSON(file, resolve, reject);
            else reject(new Error(`Unsupported format: .${ext}. Please upload .csv or .json.`));
        });
    },

    _parseCSV(file, resolve, reject) {
        const reader = new FileReader();
        reader.onload = (e) => {
            Papa.parse(e.target.result, {
                header: true, dynamicTyping: true, skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(`CSV error at row ${results.errors[0].row}: ${results.errors[0].message}`));
                        return;
                    }
                    if (results.data.length === 0) { reject(new Error('CSV file is empty.')); return; }
                    resolve({ data: results.data, meta: { columns: results.meta.fields, rowCount: results.data.length, isJson: false } });
                },
                error: (err) => reject(new Error(`CSV parsing failed: ${err.message}`))
            });
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
    },

    _parseJSON(file, resolve, reject) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const raw = JSON.parse(e.target.result);
                const data = Array.isArray(raw) ? raw : [raw];
                if (data.length === 0) { reject(new Error('JSON file is empty.')); return; }
                resolve({ data, meta: { columns: Object.keys(data[0]), rowCount: data.length, isJson: true } });
            } catch (err) {
                reject(new Error(`JSON parsing failed: ${err.message}`));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
    },

    detectEmbeddingColumns(data, allColumns) {
        const arrayCol = allColumns.find(col => {
            const v = data[0][col];
            return Array.isArray(v) && v.length > 0 && typeof v[0] === 'number';
        });
        if (arrayCol) return { format: 'array', columns: [arrayCol], arrayColumn: arrayCol };

        const dimCols = allColumns.filter(col => /^(dim|embedding|feature|vec|v)\s*[_\-]?\d+$/i.test(col.trim()));
        if (dimCols.length >= 2) return { format: 'columns', columns: dimCols, arrayColumn: null };

        const numericCols = allColumns.filter(col => data.every(r => typeof r[col] === 'number' && !isNaN(r[col])));
        if (numericCols.length >= 2) return { format: 'columns', columns: numericCols, arrayColumn: null };

        return { format: null, columns: [], arrayColumn: null };
    },

    extractEmbeddings(data, format, columns) {
        return data.map((row, idx) => {
            if (format === 'array') {
                const arr = row[columns[0]];
                if (!Array.isArray(arr)) throw new Error(`Row ${idx+1}: Expected array in "${columns[0]}", got ${typeof arr}`);
                return arr.map(v => { if (typeof v !== 'number' || isNaN(v)) throw new Error(`Row ${idx+1}: Non-numeric in embedding`); return v; });
            } else {
                return columns.map(col => {
                    const v = row[col];
                    if (typeof v !== 'number' || isNaN(v)) throw new Error(`Row ${idx+1}: Non-numeric "${v}" in "${col}"`);
                    return v;
                });
            }
        });
    },

    validateEmbeddings(embeddings) {
        if (embeddings.length === 0) throw new Error('No embedding data found.');
        const dim = embeddings[0].length;
        if (dim < 2) throw new Error(`Only ${dim} dimension(s). Need at least 2.`);
        embeddings.forEach((v, i) => { if (v.length !== dim) throw new Error(`Row ${i+1}: Inconsistent dimension. Expected ${dim}, got ${v.length}.`); });
        return dim;
    },

    normalizeEmbeddings(embeddings) {
        return embeddings.map(vec => {
            const norm = Math.sqrt(vec.reduce((s, v) => s + v*v, 0));
            return norm > 0 ? vec.map(v => v / norm) : vec;
        });
    },

    downsample(data, embeddings, labels, maxPoints) {
        if (data.length <= maxPoints) return { data, embeddings, labels, indices: data.map((_, i) => i) };
        const indices = new Set();
        while (indices.size < maxPoints) indices.add(Math.floor(Math.random() * data.length));
        const sorted = [...indices].sort((a, b) => a - b);
        return {
            data: sorted.map(i => data[i]),
            embeddings: sorted.map(i => embeddings[i]),
            labels: labels ? sorted.map(i => labels[i]) : null,
            indices: sorted
        };
    }
};
JAVASCRIPT
echo "  ✓ js/fileParser.js"

# =============================================
# js/search.js
# =============================================
cat > js/search.js << 'JAVASCRIPT'
const EmbeddingSearch = {
    _embeddings: null, _labels: null, _texts: null, _umapCoords: null,

    init(data, embeddings, labels, texts, umapCoords) {
        this._data = data;
        this._embeddings = embeddings;
        this._labels = labels;
        this._texts = texts;
        this._umapCoords = umapCoords;
    },

    _cosineSimilarity(a, b) {
        let dot = 0, nA = 0, nB = 0;
        for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; nA += a[i]*a[i]; nB += b[i]*b[i]; }
        const den = Math.sqrt(nA) * Math.sqrt(nB);
        return den === 0 ? 0 : dot / den;
    },

    _euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += (a[i]-b[i])**2;
        return Math.sqrt(sum);
    },

    search(query, metric = 'cosine', k = 10, space = 'embedding') {
        const vectors = space === 'embedding' ? this._embeddings : this._umapCoords;
        let qVec = typeof query === 'number' || typeof query === 'string' ? vectors[parseInt(query)] : query;
        if (!qVec) return [];

        const dists = vectors.map((v, i) => ({
            index: i,
            distance: metric === 'cosine' ? 1 - this._cosineSimilarity(qVec, v) : this._euclideanDistance(qVec, v)
        }));
        dists.sort((a, b) => a.distance - b.distance);

        return dists.slice(0, k).map(d => ({
            index: d.index,
            distance: d.distance,
            label: this._labels ? this._labels[d.index] : `Point ${d.index}`,
            text: this._texts ? this._texts[d.index] : ''
        }));
    },

    searchByLabel(query, metric = 'cosine', k = 10, space = 'embedding') {
        if (!this._labels) return [];
        const q = query.toLowerCase();
        let bestIdx = -1, bestScore = 0;
        this._labels.forEach((l, i) => {
            const label = String(l).toLowerCase();
            if (label === q) { bestIdx = i; bestScore = q.length; }
            else if (label.includes(q) && q.length > bestScore) { bestScore = q.length; bestIdx = i; }
        });
        return bestIdx >= 0 ? this.search(bestIdx, metric, k, space) : [];
    }
};
JAVASCRIPT
echo "  ✓ js/search.js"

# =============================================
# js/clustering.js
# =============================================
cat > js/clustering.js << 'JAVASCRIPT'
const ClusterEngine = {
    kMeans(data, k, maxIter = 50) {
        const n = data.length, dim = data[0].length;
        const centroids = this._kmeansPlusPlus(data, k);
        const assignments = new Array(n).fill(0);

        for (let iter = 0; iter < maxIter; iter++) {
            let changed = false;
            for (let i = 0; i < n; i++) {
                let minDist = Infinity, best = 0;
                for (let j = 0; j < k; j++) {
                    const d = this._euclidean(data[i], centroids[j]);
                    if (d < minDist) { minDist = d; best = j; }
                }
                if (assignments[i] !== best) { assignments[i] = best; changed = true; }
            }
            if (!changed) break;

            const counts = new Array(k).fill(0);
            const sums = Array.from({length: k}, () => new Array(dim).fill(0));
            for (let i = 0; i < n; i++) {
                counts[assignments[i]]++;
                for (let d = 0; d < dim; d++) sums[assignments[i]][d] += data[i][d];
            }
            for (let j = 0; j < k; j++) {
                if (counts[j] > 0) for (let d = 0; d < dim; d++) centroids[j][d] = sums[j][d] / counts[j];
            }
        }
        return assignments;
    },

    _kmeansPlusPlus(data, k) {
        const centroids = [data[Math.floor(Math.random() * data.length)]];
        for (let c = 1; c < k; c++) {
            const dists = data.map(p => Math.min(...centroids.map(cent => this._euclidean(p, cent))));
            const total = dists.reduce((a, b) => a + b*b, 0);
            let r = Math.random() * total;
            for (let i = 0; i < data.length; i++) {
                r -= dists[i]*dists[i];
                if (r <= 0) { centroids.push(data[i]); break; }
            }
        }
        return centroids;
    },

    _euclidean(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += (a[i]-b[i])**2;
        return Math.sqrt(sum);
    }
};
JAVASCRIPT
echo "  ✓ js/clustering.js"

# =============================================
# js/renderer3d.js
# =============================================
cat > js/renderer3d.js << 'JAVASCRIPT'
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
