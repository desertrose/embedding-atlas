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

// ============================================
// Learn Panel Toggle (replaces graph)
// ============================================
const learnBtn = document.getElementById('learnBtn');
const learnPanel = document.getElementById('learnPanel');
const threeContainer = document.getElementById('threeContainer');
const closeLearnBtn = document.getElementById('closeLearnBtn');
const learnTopics = document.getElementById('learnTopics');
const learnContent = document.getElementById('learnContent');
const learnContentBody = document.getElementById('learnContentBody');
const learnBackBtn = document.getElementById('learnBackBtn');

// Topic content database
//const topicContent = { "slm": { "title": "test" } };


const topicContent = {
    'slm': {
        'title': 'About SLM (Small Language Models)',
        'sections': [
            { 'heading': 'What is an SLM?', 'text': 'A Small Language Model (SLM) is a compact neural network with fewer than 7 billion parameters. They run on consumer hardware, have faster inference, and use less memory and energy.' },
            { 'heading': 'Key Characteristics', 'text': 'Typically 100M to 7B parameters. Trained on smaller curated datasets. Can run on laptops and phones. Lower latency and energy usage.' },
            { 'heading': 'Popular SLMs', 'list': ['Microsoft Phi-3 (3.8B)', 'Google Gemma (2B-7B)', 'Mistral 7B', 'Meta Llama 3.2 (1B-3B)'] },
            { 'heading': 'Use Cases', 'list': ['On-device chat assistants', 'Code autocomplete', 'Embedded systems', 'Real-time translation', 'Document classification'] }
        ]
    },
    'llm': {
        'title': 'About LLM (Large Language Models)',
        'sections': [
            { 'heading': 'What is an LLM?', 'text': 'A Large Language Model has 7B to 1.7T parameters trained on trillions of tokens. LLMs exhibit emergent abilities like chain-of-thought reasoning.' },
            { 'heading': 'Scaling Laws', 'text': 'Doubling parameters reduces loss by about 5%. Doubling data reduces loss by about 6.5%. Optimal ratio is about 20 tokens per parameter.' },
            { 'heading': 'Training Pipeline', 'list': ['Pre-training on internet data', 'Supervised fine-tuning', 'RLHF or DPO for alignment'] },
            { 'heading': 'Emergent Abilities', 'list': ['In-context learning (>1B params)', 'Chain-of-thought (>10B params)', 'Instruction following (>100B params)', 'Code generation (>175B params)'] },
            { 'heading': 'Limitations', 'list': ['Hallucination: false information', 'Recency bias: knowledge cutoff', 'High cost: $10M-$100M to train'] }
        ]
    },
    'transformer': {
        'title': 'About Transformer Architecture',
        'sections': [
            { 'heading': 'The 2017 Revolution', 'text': 'Google published "Attention Is All You Need" introducing the Transformer. It became the foundation for GPT, BERT, Llama, and DeepSeek.' },
            { 'heading': 'Self-Attention', 'text': 'Unlike RNNs that process sequentially, Transformers process all tokens in parallel. Each token computes Query, Key, and Value vectors.' },
            { 'heading': 'Multi-Head Attention', 'text': 'Multiple attention heads run in parallel, each learning different patterns. Typically 8-128 heads depending on model size.' },
            { 'heading': 'Key Components', 'list': ['Multi-Head Self-Attention', 'Feed-Forward Networks', 'Layer Normalization', 'Residual Connections', 'Positional Encoding'] }
        ]
    },
    'encoder-decoder': {
        'title': 'Encoder / Decoder Architecture',
        'sections': [
            { 'heading': 'Original Design', 'text': 'The original Transformer used encoder-decoder architecture. The encoder processes input. The decoder generates output.' },
            { 'heading': 'Encoder', 'text': 'Stacked layers of self-attention + FFN. Reads entire input sequence. BERT is encoder-only.' },
            { 'heading': 'Decoder', 'text': 'Self-attention + cross-attention + FFN. Generates one token at a time. GPT is decoder-only.' },
            { 'heading': 'Three Families', 'list': ['Encoder-only (BERT): Understanding tasks', 'Decoder-only (GPT): Generation tasks', 'Encoder-Decoder (T5): Seq2seq tasks'] },
            { 'heading': 'Why Decoder-Only Won', 'text': 'Simpler to train, scales efficiently, performs well on both understanding and generation.' }
        ]
    }
};


// Topic click handler
document.querySelectorAll('.learn-topic').forEach(function(topic) {
    topic.addEventListener('click', function() {
        const topicKey = this.getAttribute('data-topic');
        const content = topicContent[topicKey];
        if (!content) return;

        // Hide topics, show content
        document.getElementById('learnTopics').style.display = 'none';
        document.getElementById('learnContent').style.display = 'block';

        // Build content HTML
        let html = '<h2>' + content.title + '</h2>';
        content.sections.forEach(function(section) {
            html += '<h3>' + section.heading + '</h3>';
            if (section.text) {
                html += '<p>' + section.text + '</p>';
            }
            if (section.list) {
                html += '<ul>';
                section.list.forEach(function(item) {
                    html += '<li>' + item + '</li>';
                });
                html += '</ul>';
            }
        });

        document.getElementById('learnContentBody').innerHTML = html;
    });
});

// Back button
document.getElementById('learnBackBtn').addEventListener('click', function() {
    document.getElementById('learnContent').style.display = 'none';
    document.getElementById('learnTopics').style.display = 'flex';
});
