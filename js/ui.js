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


// Learn button click - show panel, hide graph
learnBtn.addEventListener('click', function() {
    threeContainer.style.display = 'none';
    learnPanel.style.display = 'block';
    learnTopics.style.display = 'flex';
    learnContent.style.display = 'none';
});

// Close button
closeLearnBtn.addEventListener('click', function() {
    learnPanel.style.display = 'none';
    threeContainer.style.display = 'block';
});

// Topic click handler
document.querySelectorAll('.learn-topic').forEach(function(topic) {
    topic.addEventListener('click', function() {
        const topicKey = this.getAttribute('data-topic');
        const content = topicContent[topicKey];
        if (!content) return;

        learnTopics.style.display = 'none';
        learnContent.style.display = 'block';

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
    });
});

// Back button
learnBackBtn.addEventListener('click', function() {
    learnContent.style.display = 'none';
    learnTopics.style.display = 'flex';
});

});  // Close DOMContentLoaded


const topicContent = {
    'slm': {
        'title': 'About SLM (Small Language Models)',
        'sections': [
            { 
                'heading': 'What is an SLM?', 
                'text': 'A Small Language Model (SLM) is a compact neural network with fewer than 7 billion parameters. They are designed for efficiency — running on consumer hardware like laptops and phones, with fast inference and low energy use.',
                'code': 'Example: Microsoft Phi-3 (3.8B params) runs on a MacBook at 45 tokens/sec\nExample: Gemma 2B runs on a Pixel phone at 30 tokens/sec\nCompare: GPT-4 (1.7T params) requires cloud servers' 
            },
            { 
                'heading': 'The Math Behind SLMs', 
                'text': 'SLMs predict the next token given previous tokens. The probability is computed as:',
                'code': 'P(w1, w2, ..., wn) = P(w1) x P(w2|w1) x P(w3|w1,w2) x ... x P(wn|w1,...,wn-1)\n\nExample: "The cat sat"\nP("The") = 0.15\nP("cat" | "The") = 0.08\nP("sat" | "The cat") = 0.12\nP("The cat sat") = 0.15 x 0.08 x 0.12 = 0.00144' 
            },
            { 
                'heading': 'Quantization: Making SLMs Tiny', 
                'text': 'Quantization reduces model size by using fewer bits per parameter. This is why SLMs can run on phones.',
                'code': 'Original model at FP16 (16-bit): 7.6 GB memory, 100% accuracy\n8-bit quantization: 3.8 GB, 99% accuracy\n4-bit quantization: 1.9 GB, 97% accuracy\n2-bit quantization: 0.95 GB, 93% accuracy\n\nPhi-3 at 4-bit fits entirely on an iPhone with 2GB RAM free!' 
            },
            { 
                'heading': 'Popular SLMs Comparison', 
                'text': 'How the most popular SLMs compare on key metrics:',
                'code': 'Model          | Params | RAM    | Speed     | MMLU Score\nPhi-3 Mini     | 3.8B   | 2.1GB  | 45 tok/s  | 69%\nGemma 2B       | 2B     | 1.2GB  | 62 tok/s  | 56%\nMistral 7B     | 7B     | 4.0GB  | 28 tok/s  | 64%\nLlama 3.2 3B   | 3B     | 1.8GB  | 50 tok/s  | 61%\nQwen2.5 1.5B   | 1.5B   | 0.9GB  | 72 tok/s  | 48%' 
            },
            { 
                'heading': 'Code Example: Running an SLM in Python', 
                'text': 'Here is how you use Phi-3 for text generation on your own machine:',
                'code': 'from transformers import AutoModelForCausalLM, AutoTokenizer\n\nmodel = AutoModelForCausalLM.from_pretrained(\n    "microsoft/Phi-3-mini-4k-instruct",\n    torch_dtype="auto",\n    device_map="auto"\n)\ntokenizer = AutoTokenizer.from_pretrained("microsoft/Phi-3-mini-4k-instruct")\n\nprompt = "Explain what an embedding vector is:"\ninputs = tokenizer(prompt, return_tensors="pt")\noutput = model.generate(\n    inputs.input_ids,\n    max_new_tokens=150,\n    temperature=0.7\n)\nprint(tokenizer.decode(output[0]))\n\n# Output will be a clear explanation of embeddings' 
            },
            { 
                'heading': 'Real-World Use Case: On-Device Chat', 
                'text': 'Apple Intelligence uses SLMs for on-device processing. Here is how it works:',
                'code': 'User types: "What is the weather?"\n\nStep 1: SLM on device classifies intent (weather query)\nStep 2: Small embedding model converts to vector\nStep 3: Local search finds relevant weather data\nStep 4: SLM generates response: "It is 72F and sunny"\n\nTotal time: ~200ms. No data leaves the phone.\nCompare to cloud LLM: ~2-3 seconds + data sent to server' 
            },
            { 
                'heading': 'When to Choose SLM', 
                'text': 'SLMs are ideal for 80% of practical AI use cases. Choose SLM when:',
                'list': ['You need real-time responses (< 500ms)', 'You want offline capability', 'Privacy is important (no data to cloud)', 'You have limited compute budget', 'Your task is narrow and well-defined'] 
            }
        ]
    },
    'llm': {
        'title': 'About LLM (Large Language Models)',
        'sections': [
            { 
                'heading': 'What is an LLM?', 
                'text': 'A Large Language Model is a deep neural network with 7 billion to 1.7 trillion parameters, trained on trillions of text tokens from the internet. LLMs exhibit emergent abilities that appear only at scale, such as chain-of-thought reasoning and instruction following.',
                'code': 'Scale comparison:\nGPT-2 (2019): 1.5B params, 40B tokens trained\nGPT-3 (2020): 175B params, 300B tokens\nGPT-4 (2023): ~1.7T params, ~13T tokens\nLlama 3 (2024): 405B params, 15T tokens\nDeepSeek (2025): 671B params, 14.8T tokens\n\nEach generation: ~10x more compute than previous' 
            },
            { 
                'heading': 'Scaling Laws — The Science of Bigger Models', 
                'text': 'Predictable relationships between model size, data, and performance:',
                'code': 'Kaplan et al. 2020 findings:\n- Doubling parameters reduces loss by ~5%\n- Doubling training data reduces loss by ~6.5%\n- Optimal ratio: ~20 tokens per parameter\n\nExample: A 7B model needs ~140B tokens minimum\nExample: GPT-4 (1.7T) needs ~34T tokens minimum (trained on ~13T)\n\nChinchilla Law (2022): Most models are undertrained.\nMany models should have been smaller with more data.' 
            },
            { 
                'heading': 'Emergent Abilities — Magic at Scale', 
                'text': 'Some abilities only appear above certain model sizes. They are not explicitly programmed:',
                'code': 'Size Threshold    | Ability Emerges\n------------------|-----------------\n> 1B params       | In-context learning (few-shot prompts work)\n> 10B params      | Chain-of-thought reasoning\n> 100B params     | Instruction following without examples\n> 175B params     | Code generation and debugging\n> 500B params     | Multi-step mathematical reasoning\n> 1T params       | Tool use and function calling\n\nExample of emergence:\nSmall model (3B): "What is 23 x 47?" → "About 1000" (vague)\nLarge model (405B): "23 x 47 = 23 x 50 - 23 x 3 = 1150 - 69 = 1081" (exact)' 
            },
            { 
                'heading': 'The Training Pipeline', 
                'text': 'Training a modern LLM costs $10M-$100M and takes months:',
                'code': 'PHASE 1: PRE-TRAINING (3-6 months, $10M-$50M)\n- Hardware: 16,000+ H100 GPUs\n- Data: CommonCrawl, GitHub, arXiv, books (trillions of tokens)\n- Task: Predict next token\n- Energy: ~50 GWh (equivalent to 5,000 homes for a year)\n\nPHASE 2: SUPERVISED FINE-TUNING (1-2 weeks, $100K-$1M)\n- Data: 10K-100K human-written instruction examples\n- Task: Learn to follow instructions\n\nPHASE 3: RLHF/DPO (2-4 weeks, $200K-$2M)\n- Human feedback ranks model outputs\n- Model learns to prefer helpful, honest answers\n\nTotal: $10M - $55M per model' 
            },
            { 
                'heading': 'Code Example: Using GPT-4 via API', 
                'text': 'Practical example of using an LLM for code review:',
                'code': 'import openai\n\nresponse = openai.chat.completions.create(\n    model="gpt-4-turbo",\n    messages=[\n        {\n            "role": "system",\n            "content": "You are an expert code reviewer. \\nIdentify bugs, security issues, and improvements."\n        },\n        {\n            "role": "user",\n            "content": "Review this Python code:\\n\\ndef get_user(id):\\n    return db.query(f\\"SELECT * FROM users WHERE id = {id}\\")\\n\\nNote: This contains an SQL injection vulnerability."\n        }\n    ],\n    temperature=0.2\n)\n\nprint(response.choices[0].message.content)\n\n# Output will identify: SQL injection, missing error handling,\n# missing type hints, and suggest parameterized queries' 
            },
            { 
                'heading': 'Limitations and Risks', 
                'text': 'Critical weaknesses every LLM user should understand:',
                'list': ['Hallucination: Models confidently state false information as fact', 'Recency bias: Knowledge cutoff means no awareness of recent events', 'Sycophancy: Models tend to agree with user even when wrong', 'Reasoning fragility: Slight rephrasing causes completely different answers', 'Security: Prompt injection, jailbreaking, data extraction are ongoing threats', 'Cost: Each API call costs ~$0.01-$0.10, adds up fast at scale', 'Environmental: One training run emits ~300 tons of CO2'] 
            }
        ]
    },
    'transformer': {
        'title': 'About Transformer Architecture',
        'sections': [
            { 
                'heading': 'The 2017 Revolution', 
                'text': 'In 2017, Google published "Attention Is All You Need" introducing the Transformer. It replaced RNNs and became the foundation for every modern AI model. Over 100,000 citations.',
                'code': 'Before Transformers (2012-2017):\n- RNNs/LSTMs: Process tokens one by one (sequential, slow)\n- CNNs: Process in parallel but limited receptive field\n- Problem: Long-range dependencies hard to capture\n- Problem: Sequential processing = no GPU parallelization\n\nAfter Transformers (2017-present):\n- All tokens processed simultaneously (parallel, 100x faster)\n- Direct connections between any two tokens\n- Scales beautifully with more data and parameters\n- GPU utilization: near 100% vs RNNs: ~20%' 
            },
            { 
                'heading': 'Self-Attention Explained Step by Step', 
                'text': 'The core innovation. Each token "attends" to every other token:',
                'code': 'For sentence: "The cat sat on the mat"\n\nStep 1: Each word gets three vectors\n  "cat" → Query(Q), Key(K), Value(V)  (each a 64D vector)\n  "sat" → Query(Q), Key(K), Value(V)\n  "mat" → Query(Q), Key(K), Value(V)\n\nStep 2: Compute attention scores\n  Attention("sat", "cat") = Q("sat") · K("cat") / sqrt(64)\n  = how much should "sat" focus on "cat"?\n\nStep 3: Softmax to get weights (sum to 1)\n  "sat" attends to:\n    "The": 0.03 (low relevance)\n    "cat": 0.45 (high! subject of sentence)\n    "sat": 0.10 (self)\n    "on": 0.05 (preposition)\n    "the": 0.02 (article)\n    "mat": 0.35 (high! object where sitting happens)\n\nStep 4: Weighted combination\n  Output("sat") = 0.45*V("cat") + 0.10*V("sat") + ... + 0.35*V("mat")\n  = "sat" now knows it was performed by "cat" on "mat"' 
            },
            { 
                'heading': 'Multi-Head Attention — Seeing From Multiple Angles', 
                'text': 'Instead of one attention function, Transformers use 8-128 heads in parallel. Each head learns different relationship types.',
                'code': 'Head 1: Syntactic relationships (subject-verb agreement)\n  "The cats sit" → "cats" attends strongly to "sit"\n\nHead 2: Semantic similarity\n  "dog" attends to "pet", "animal", "canine"\n\nHead 3: Positional relationships\n  "the" tends to attend to the next noun\n\nHead 4: Coreference resolution\n  "She went to the store. She bought milk."\n  Second "She" attends to first "She"\n\nHead 5: Negation handling\n  "not bad" → "not" attends strongly to "bad"\n\nAll heads run in parallel on GPU, results concatenated\nEach head is a different "lens" on the same text' 
            },
            { 
                'heading': 'Positional Encoding — Giving Order to Parallel Processing', 
                'text': 'Since Transformers process all tokens at once, they need explicit position information.',
                'code': 'Sinusoidal Positional Encoding:\nPE(pos, 2i)   = sin(pos / 10000^(2i/d_model))\nPE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))\n\nExample for d_model=4:\nPosition 0: [0.00, 1.00, 0.00, 1.00]\nPosition 1: [0.84, 0.54, 0.01, 0.99]\nPosition 2: [0.91, -0.42, 0.02, 0.99]\nPosition 3: [0.14, -0.99, 0.04, 0.99]\n\nEach position has a unique pattern.\nThe model learns to read these patterns like a clock.\n\nModern models use RoPE (Rotary Position Embedding):\nInstead of adding position to the embedding,\nRoPE rotates the Query and Key vectors by position angle.\nThis allows the model to understand relative distances.\nUsed in: Llama 2/3, Mistral, GPT-4, DeepSeek' 
            },
            { 
                'heading': 'Complete Architecture Diagram', 
                'text': 'A full Transformer layer with every component:',
                'code': 'INPUT: "The cat sat"\n  │\n  ▼\n[Token Embedding] → each word → 512D vector\n  │\n  ▼\n[Positional Encoding] → adds position info\n  │\n  ▼\n┌──────────────────────────────────┐\n│  MULTI-HEAD SELF-ATTENTION       │\n│  8 heads × 64D = 512D output     │\n│  Captures word relationships     │\n└──────────────────────────────────┘\n  │\n  ▼  (Residual connection: add input back)\n[Layer Normalization] → stabilizes values\n  │\n  ▼\n┌──────────────────────────────────┐\n│  FEED-FORWARD NETWORK            │\n│  512 → 2048 → 512 (SwiGLU)       │\n│  Processes each position indep.  │\n└──────────────────────────────────┘\n  │\n  ▼  (Residual connection: add input back)\n[Layer Normalization]\n  │\n  ▼\nOUTPUT: Contextualized "The", "cat", "sat"\nEach word now understands its role in the sentence\n\nRepeat for N layers (6 for small, 126 for Llama 405B)' 
            }
        ]
    },
    'encoder-decoder': {
        'title': 'Encoder / Decoder Architecture',
        'sections': [
            { 
                'heading': 'The Original Design', 
                'text': 'The original Transformer used an encoder-decoder structure for sequence-to-sequence tasks like translation.',
                'code': 'ENCODER                        DECODER\n┌──────────┐                  ┌──────────┐\n│ Input:   │                  │ Output:  │\n│ "Je suis │                  │ "I am a  │\n│  etudiant"│                  │ student" │\n└──────────┘                  └──────────┘\n     │                             ▲\n     │   ┌──────────────────┐      │\n     └──►│ CROSS-ATTENTION  ├──────┘\n         │ Decoder looks at │\n         │ encoder output   │\n         └──────────────────┘\n\nEncoder reads ALL of "Je suis etudiant"\n→ produces representations for each word\n\nDecoder generates ONE token at a time:\nStep 1: "I"\nStep 2: "I am" (looks at encoder for context)\nStep 3: "I am a"\nStep 4: "I am a student"\nStep 5: "I am a student." (stop)' 
            },
            { 
                'heading': 'Encoder — The Understanding Half', 
                'text': 'The encoder reads the entire input sequence and builds rich representations:',
                'code': 'Encoder: Bidirectional (sees all tokens)\n\nInput: "The movie was not good at all"\n\nEncoder processes ALL tokens simultaneously:\n"good" gets context from both sides:\n  ← "not" (negation!)\n  → "at all" (emphasis!)\n  ← "movie" (subject)\n\nResult: "good" is understood as NEGATIVE\n→ embedding shifts towards "bad" meaning\n\nThis is why BERT (encoder-only) excels at understanding tasks:\n- Sentiment analysis\n- Named entity recognition\n- Question answering\n- Text classification\n\nEncoder output: One vector per input token\nEach vector captures the FULL context' 
            },
            { 
                'heading': 'Decoder — The Generation Half', 
                'text': 'The decoder generates text one token at a time, auto-regressively:',
                'code': 'Decoder: Unidirectional (can only see past tokens)\n\nGeneration step by step:\n  Step 1: [START] → "I"\n  Step 2: [START] "I" → "am"\n  Step 3: [START] "I" "am" → "a"\n  Step 4: [START] "I" "am" "a" → "student"\n  Step 5: [START] "I" "am" "a" "student" → [END]\n\nMASKED SELF-ATTENTION:\nAt step 3, the decoder can see:\n  ✅ [START], "I", "am"\n  ❌ "a", "student", [END] (future = hidden)\n\nThis prevents cheating! The model cannot peek ahead.\n\nCROSS-ATTENTION:\nAt each step, decoder also looks at encoder output:\n  "am" ← attends to "suis" in French input\n  "student" ← attends to "etudiant" in French input\n\nThis is the bridge between understanding and generation.' 
            },
            { 
                'heading': 'Three Families — When to Use Each', 
                'text': 'Modern models fall into three camps, each suited for different tasks:',
                'code': 'ENCODER-ONLY (e.g., BERT, BGE-small, RoBERTa)\n- Architecture: Encoder layers only\n- Training: Masked language model (fill in blanks)\n- Best for: Understanding, classification, embeddings\n- Example: "I am so [MASK] today" → predicts "happy"\n- Use case: This app! BGE-small creates embeddings for search\n\nDECODER-ONLY (e.g., GPT-4, Llama, DeepSeek)\n- Architecture: Decoder layers only\n- Training: Next token prediction\n- Best for: Generation, chat, code\n- Example: "Write a poem about" → generates poem\n- Use case: ChatGPT, coding assistants\n\nENCODER-DECODER (e.g., T5, BART, original Transformer)\n- Architecture: Encoder + Decoder\n- Training: Various seq2seq objectives\n- Best for: Translation, summarization\n- Example: "Translate: Hello → Bonjour"\n- Use case: Google Translate' 
            },
            { 
                'heading': 'Why Decoder-Only Became Dominant', 
                'text': 'GPT-style decoder-only models won the architecture war. Here is why:',
                'code': '1. SIMPLER = BETTER\n   - One stack instead of two\n   - Fewer parameters for same compute\n   - Easier to train and optimize\n\n2. SCALES EFFICIENTLY\n   - No cross-attention overhead\n   - KV cache speeds up inference\n   - Better GPU utilization\n\n3. GENERAL-PURPOSE\n   - Can do understanding (with prompting)\n   - Can do generation (native)\n   - Can do translation (with few-shot examples)\n\n4. THE GPT MOMENTUM\n   - OpenAI proved decoder-only works at scale\n   - Research community followed the leader\n   - Hardware optimized for decoder-only patterns\n\nModern insight: Encoder-only for embeddings (like this app),\nDecoder-only for generation. Both have their place.' 
            },
            { 
                'heading': 'How This App Uses Encoder Architecture', 
                'text': 'BGE-small (the embedding model powering this app) is encoder-only:',
                'code': 'Your document → BGE-small encoder → 384D embedding vector\n\nUnlike GPT which generates text, BGE-small just converts\ntext into a fixed-size vector in embedding space.\n\nThis is why:\n✅ You can search by semantic meaning\n✅ You can visualize clusters of similar documents\n✅ You can find nearest neighbors\n❌ You cannot ask it questions or generate text\n\nComplete mental model:\n┌────────────────────────────────────────────┐\n│  Encoder models (BGE, BERT)               │\n│  Input: Text → Output: Vector (for search) │\n│  Like: A map that puts similar things near │\n├────────────────────────────────────────────┤\n│  Decoder models (GPT, Llama)              │\n│  Input: Text → Output: More text          │\n│  Like: A writer that continues your story  │\n├────────────────────────────────────────────┤\n│  Encoder-Decoder (T5, original)           │\n│  Input: Text → Output: Transformed text   │\n│  Like: A translator between languages      │\n└────────────────────────────────────────────┘' 
            }
        ]
    }
};
