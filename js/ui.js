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
const topicContent = {
    'slm': {
        title: '📱 About SLM (Small Language Models)',
        sections: [
            { heading: 'What is an SLM?', text: 'A Small Language Model (SLM) is a compact neural network trained on text data, typically with fewer than 7 billion parameters. Unlike their larger cousins (LLMs), SLMs are designed for efficiency — they run on consumer hardware, have faster inference times, and require significantly less memory and energy.' },
            { heading: 'Key Characteristics', text: 'SLMs typically have 100M–7B parameters. They are trained on smaller, curated datasets. They can run on laptops, phones, and edge devices. They use less energy and produce lower latency responses.' },
            { heading: 'Popular SLMs', 
              list: ['Microsoft Phi-3 (3.8B parameters)', 'Google Gemma (2B–7B)', 'Mistral 7B', 'Alibaba Qwen2.5 (0.5B–7B)', 'Meta Llama 3.2 (1B–3B)'] },
            { heading: 'The Efficiency Paradox', text: 'SLMs often outperform LLMs on specific, well-defined tasks when fine-tuned properly. They are less prone to hallucination because their narrower training scope limits their "imagination." For edge computing and real-time applications, SLMs are often the better choice.' },
            { heading: 'Use Cases', list: ['On-device chat assistants', 'Code autocomplete in IDEs', 'Embedded systems and IoT', 'Real-time translation', 'Document classification and routing'] },
            { heading: 'Trade-offs', text: 'SLMs have less world knowledge and struggle with complex reasoning. They require more careful prompt engineering and fine-tuning. They cannot match the creative breadth of large models. However, for 80% of practical use cases, an SLM is sufficient and preferable.' }
        ]
    },
    'llm': {
        title: '🧠 About LLM (Large Language Models)',
        sections: [
            { heading: 'What is an LLM?', text: 'A Large Language Model (LLM) is a deep neural network with tens to hundreds of billions of parameters, trained on massive text corpora (often trillions of tokens). LLMs exhibit emergent abilities — capabilities not present in smaller models, such as multi-step reasoning, translation, code generation, and creative writing.' },
            { heading: 'Scale Matters', text: 'LLMs like GPT-4 (estimated 1.7T parameters), Llama 3 (405B), and DeepSeek (671B) demonstrate that scaling model size and training data leads to qualitatively new capabilities. This phenomenon, called "emergence," means larger models can perform tasks they were never explicitly trained for.' },
            { heading: 'Training Pipeline', 
              list: ['Pre-training: Next-token prediction on internet-scale data', 'Supervised fine-tuning (SFT): Learning from human demonstrations', 'RLHF: Reinforcement Learning from Human Feedback', 'DPO: Direct Preference Optimization (alternative to RLHF)'] },
            { heading: 'Capabilities', list: ['Natural conversation and instruction following', 'Code generation and debugging', 'Mathematical reasoning', 'Creative writing and analysis', 'Multilingual translation', 'Tool use and function calling'] },
            { heading: 'Challenges', text: 'LLMs require massive computational resources for training (megawatt-hours of energy) and inference (multiple GPUs). They can hallucinate, exhibit biases from training data, and have high latency. Their environmental impact and cost are significant concerns.' },
            { heading: 'The Scaling Debate', text: 'There is ongoing debate about whether scaling alone will lead to AGI. Some researchers argue we need new architectures, while others believe continued scaling with better data is sufficient. What is clear: LLMs are a revolutionary step, not the final destination.' }
        ]
    },
    'transformer': {
        title: '⚡ About Transformer Architecture',
        sections: [
            { heading: 'The Paper That Changed Everything', text: 'In 2017, Google researchers published "Attention Is All You Need," introducing the Transformer architecture. This paper revolutionized NLP and became the foundation for virtually every modern language model, including GPT, BERT, Llama, and DeepSeek.' },
            { heading: 'Core Innovation: Self-Attention', text: 'Unlike RNNs that process tokens sequentially, Transformers process all tokens in parallel using a mechanism called self-attention. Each token "attends" to every other token, computing relevance scores that determine how much each word should influence the representation of every other word.' },
            { heading: 'How Self-Attention Works', text: 'For each input token, we compute three vectors: Query (Q), Key (K), and Value (V). The attention score between two tokens is the dot product of their Query and Key vectors, scaled by the square root of the dimension. These scores are normalized via softmax and used to weight the Value vectors. The result: each token\'s output is a weighted combination of all tokens, where the weights reflect relevance.' },
            { heading: 'Multi-Head Attention', text: 'Instead of one attention mechanism, Transformers use multiple "heads" running in parallel. Each head learns different relationship patterns — one might focus on syntax, another on semantics, another on positional relationships. The heads are concatenated and projected to produce the final output.' },
            { heading: 'Positional Encoding', text: 'Since Transformers process all tokens in parallel (no inherent order), we need to inject position information. This is done via sinusoidal positional encodings or learned position embeddings that tell the model where each word is in the sequence.' },
            { heading: 'Architecture Components', 
              list: ['Multi-Head Self-Attention', 'Feed-Forward Neural Networks (FFN)', 'Layer Normalization', 'Residual Connections (skip connections)', 'Positional Encoding'] },
            { heading: 'Why It Won', text: 'Transformers enabled parallel training (much faster than RNNs), captured long-range dependencies effectively, and scaled beautifully with more data and parameters. They became the default architecture for NLP, vision (ViT), audio (Whisper), and even reinforcement learning (Decision Transformer).' }
        ]
    },
    'encoder-decoder': {
        title: '🔄 Encoder / Decoder Architecture',
        sections: [
            { heading: 'The Original Transformer Design', text: 'The original Transformer from "Attention Is All You Need" used an encoder-decoder architecture. The encoder processes the input sequence and produces a rich representation; the decoder generates the output sequence token by token, attending to the encoder\'s representations.' },
            { heading: 'Encoder', text: 'The encoder consists of a stack of identical layers (typically 6–12). Each layer has two sub-layers: a multi-head self-attention mechanism and a feed-forward network. The encoder reads the entire input sequence and produces a contextualized representation for each token. BERT is a famous encoder-only model.' },
            { heading: 'Decoder', text: 'The decoder also has stacked layers, but with an additional cross-attention sub-layer that attends to the encoder\'s output. The decoder is auto-regressive — it generates one token at a time, using previously generated tokens as input for the next step. It uses masked self-attention to prevent "cheating" by looking at future tokens. GPT is a decoder-only model.' },
            { heading: 'Cross-Attention', text: 'The bridge between encoder and decoder. The decoder\'s cross-attention mechanism uses its own internal representation as Query, and the encoder\'s output as Key and Value. This allows the decoder to "look at" the input sequence while generating each output token. This is what enables translation: the encoder reads French, the decoder writes English.' },
            { heading: 'Encoder-Only vs Decoder-Only vs Encoder-Decoder',
              list: ['Encoder-only (BERT): Great for understanding tasks — classification, NER, question answering', 'Decoder-only (GPT): Great for generation — text completion, chat, code generation', 'Encoder-Decoder (T5): Great for sequence-to-sequence tasks — translation, summarization'] },
            { heading: 'Why Decoder-Only Won (For Now)', text: 'GPT-style decoder-only models have become dominant because they are simpler to train, scale more efficiently, and perform well on both understanding and generation tasks. The distinction is blurring — modern architectures often blend elements of all three designs.' },
            { heading: 'Key Insight', text: 'Embedding models (like BGE-small, which powers this app) are typically encoder-only. They produce a fixed-size vector for each input — perfect for semantic search and clustering. Decoder-only models generate text. Understanding this distinction helps you choose the right tool for your task.' }
        ]
    }
};

if (learnBtn && learnPanel && threeContainer) {
    // Open learn panel
    learnBtn.addEventListener('click', function() {
        threeContainer.style.display = 'none';
        learnPanel.style.display = 'block';
        // Show topics, hide content
        learnTopics.style.display = 'flex';
        learnContent.style.display = 'none';
    });

    // Close learn panel
    if (closeLearnBtn) {
        closeLearnBtn.addEventListener('click', closeLearnPanel);
    }

    function closeLearnPanel() {
        learnPanel.style.display = 'none';
        threeContainer.style.display = 'block';
    }

    // Topic click handler
    document.querySelectorAll('.learn-topic').forEach(function(topic) {
        topic.addEventListener('click', function() {
            const topicKey = this.getAttribute('data-topic');
            const content = topicContent[topicKey];
            if (!content) return;

            // Hide topics, show content
            learnTopics.style.display = 'none';
            learnContent.style.display = 'block';

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

            learnContentBody.innerHTML = html;
            learnContentBody.scrollTop = 0;
        });
    });

    // Back button
    if (learnBackBtn) {
        learnBackBtn.addEventListener('click', function() {
            learnContent.style.display = 'none';
            learnTopics.style.display = 'flex';
        });
    }

    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && learnPanel.style.display === 'block') {
            closeLearnPanel();
        }
    });
}
