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

// ============================================
// Learn Modal Toggle
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const learnBtn = document.getElementById('learnBtn');
    const modal = document.getElementById('learnModal');
    const closeBtn = document.getElementById('closeLearnBtn');

    if (learnBtn && modal && closeBtn) {
        learnBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
});
