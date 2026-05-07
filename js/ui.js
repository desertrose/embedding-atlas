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
                'code': 'Example: Microsoft Phi-3 (3.8B params) runs on a MacBook at 45 tokens/sec
Example: Gemma 2B runs on a Pixel phone at 30 tokens/sec
Compare: GPT-4 (1.7T params) requires cloud servers' 
            },
            { 
                'heading': 'The Math Behind SLMs', 
                'text': 'SLMs predict the next token given previous tokens. The probability is computed as:',
                'code': 'P(w1, w2, ..., wn) = P(w1) x P(w2|w1) x P(w3|w1,w2) x ... x P(wn|w1,...,wn-1)

Example: "The cat sat"
P("The") = 0.15
P("cat" | "The") = 0.08
P("sat" | "The cat") = 0.12
P("The cat sat") = 0.15 x 0.08 x 0.12 = 0.00144' 
            },
            { 
                'heading': 'Quantization: Making SLMs Tiny', 
                'text': 'Quantization reduces model size by using fewer bits per parameter. This is why SLMs can run on phones.',
                'code': 'Original model at FP16 (16-bit): 7.6 GB memory, 100% accuracy
8-bit quantization: 3.8 GB, 99% accuracy
4-bit quantization: 1.9 GB, 97% accuracy
2-bit quantization: 0.95 GB, 93% accuracy

Phi-3 at 4-bit fits entirely on an iPhone with 2GB RAM free!' 
            },
            { 
                'heading': 'Popular SLMs Comparison', 
                'text': 'How the most popular SLMs compare on key metrics:',
                'code': 'Model          | Params | RAM    | Speed     | MMLU Score
Phi-3 Mini     | 3.8B   | 2.1GB  | 45 tok/s  | 69%
Gemma 2B       | 2B     | 1.2GB  | 62 tok/s  | 56%
Mistral 7B     | 7B     | 4.0GB  | 28 tok/s  | 64%
Llama 3.2 3B   | 3B     | 1.8GB  | 50 tok/s  | 61%
Qwen2.5 1.5B   | 1.5B   | 0.9GB  | 72 tok/s  | 48%' 
            },
            { 
                'heading': 'Code Example: Running an SLM in Python', 
                'text': 'Here is how you use Phi-3 for text generation on your own machine:',
                'code': 'from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "microsoft/Phi-3-mini-4k-instruct",
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("microsoft/Phi-3-mini-4k-instruct")

prompt = "Explain what an embedding vector is:"
inputs = tokenizer(prompt, return_tensors="pt")
output = model.generate(
    inputs.input_ids,
    max_new_tokens=150,
    temperature=0.7
)
print(tokenizer.decode(output[0]))

# Output will be a clear explanation of embeddings' 
            },
            { 
                'heading': 'Real-World Use Case: On-Device Chat', 
                'text': 'Apple Intelligence uses SLMs for on-device processing. Here is how it works:',
                'code': 'User types: "What is the weather?"

Step 1: SLM on device classifies intent (weather query)
Step 2: Small embedding model converts to vector
Step 3: Local search finds relevant weather data
Step 4: SLM generates response: "It is 72F and sunny"

Total time: ~200ms. No data leaves the phone.
Compare to cloud LLM: ~2-3 seconds + data sent to server' 
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
                'code': 'Scale comparison:
GPT-2 (2019): 1.5B params, 40B tokens trained
GPT-3 (2020): 175B params, 300B tokens
GPT-4 (2023): ~1.7T params, ~13T tokens
Llama 3 (2024): 405B params, 15T tokens
DeepSeek (2025): 671B params, 14.8T tokens

Each generation: ~10x more compute than previous' 
            },
            { 
                'heading': 'Scaling Laws — The Science of Bigger Models', 
                'text': 'Predictable relationships between model size, data, and performance:',
                'code': 'Kaplan et al. 2020 findings:
- Doubling parameters reduces loss by ~5%
- Doubling training data reduces loss by ~6.5%
- Optimal ratio: ~20 tokens per parameter

Example: A 7B model needs ~140B tokens minimum
Example: GPT-4 (1.7T) needs ~34T tokens minimum (trained on ~13T)

Chinchilla Law (2022): Most models are undertrained.
Many models should have been smaller with more data.' 
            },
            { 
                'heading': 'Emergent Abilities — Magic at Scale', 
                'text': 'Some abilities only appear above certain model sizes. They are not explicitly programmed:',
                'code': 'Size Threshold    | Ability Emerges
------------------|-----------------
> 1B params       | In-context learning (few-shot prompts work)
> 10B params      | Chain-of-thought reasoning
> 100B params     | Instruction following without examples
> 175B params     | Code generation and debugging
> 500B params     | Multi-step mathematical reasoning
> 1T params       | Tool use and function calling

Example of emergence:
Small model (3B): "What is 23 x 47?" → "About 1000" (vague)
Large model (405B): "23 x 47 = 23 x 50 - 23 x 3 = 1150 - 69 = 1081" (exact)' 
            },
            { 
                'heading': 'The Training Pipeline', 
                'text': 'Training a modern LLM costs $10M-$100M and takes months:',
                'code': 'PHASE 1: PRE-TRAINING (3-6 months, $10M-$50M)
- Hardware: 16,000+ H100 GPUs
- Data: CommonCrawl, GitHub, arXiv, books (trillions of tokens)
- Task: Predict next token
- Energy: ~50 GWh (equivalent to 5,000 homes for a year)

PHASE 2: SUPERVISED FINE-TUNING (1-2 weeks, $100K-$1M)
- Data: 10K-100K human-written instruction examples
- Task: Learn to follow instructions

PHASE 3: RLHF/DPO (2-4 weeks, $200K-$2M)
- Human feedback ranks model outputs
- Model learns to prefer helpful, honest answers

Total: $10M - $55M per model' 
            },
            { 
                'heading': 'Code Example: Using GPT-4 via API', 
                'text': 'Practical example of using an LLM for code review:',
                'code': 'import openai

response = openai.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {
            "role": "system",
            "content": "You are an expert code reviewer. \nIdentify bugs, security issues, and improvements."
        },
        {
            "role": "user",
            "content": "Review this Python code:\n\ndef get_user(id):\n    return db.query(f\"SELECT * FROM users WHERE id = {id}\")\n\nNote: This contains an SQL injection vulnerability."
        }
    ],
    temperature=0.2
)

print(response.choices[0].message.content)

# Output will identify: SQL injection, missing error handling,
# missing type hints, and suggest parameterized queries' 
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
                'code': 'Before Transformers (2012-2017):
- RNNs/LSTMs: Process tokens one by one (sequential, slow)
- CNNs: Process in parallel but limited receptive field
- Problem: Long-range dependencies hard to capture
- Problem: Sequential processing = no GPU parallelization

After Transformers (2017-present):
- All tokens processed simultaneously (parallel, 100x faster)
- Direct connections between any two tokens
- Scales beautifully with more data and parameters
- GPU utilization: near 100% vs RNNs: ~20%' 
            },
            { 
                'heading': 'Self-Attention Explained Step by Step', 
                'text': 'The core innovation. Each token "attends" to every other token:',
                'code': 'For sentence: "The cat sat on the mat"

Step 1: Each word gets three vectors
  "cat" → Query(Q), Key(K), Value(V)  (each a 64D vector)
  "sat" → Query(Q), Key(K), Value(V)
  "mat" → Query(Q), Key(K), Value(V)

Step 2: Compute attention scores
  Attention("sat", "cat") = Q("sat") · K("cat") / sqrt(64)
  = how much should "sat" focus on "cat"?

Step 3: Softmax to get weights (sum to 1)
  "sat" attends to:
    "The": 0.03 (low relevance)
    "cat": 0.45 (high! subject of sentence)
    "sat": 0.10 (self)
    "on": 0.05 (preposition)
    "the": 0.02 (article)
    "mat": 0.35 (high! object where sitting happens)

Step 4: Weighted combination
  Output("sat") = 0.45*V("cat") + 0.10*V("sat") + ... + 0.35*V("mat")
  = "sat" now knows it was performed by "cat" on "mat"' 
            },
            { 
                'heading': 'Multi-Head Attention — Seeing From Multiple Angles', 
                'text': 'Instead of one attention function, Transformers use 8-128 heads in parallel. Each head learns different relationship types.',
                'code': 'Head 1: Syntactic relationships (subject-verb agreement)
  "The cats sit" → "cats" attends strongly to "sit"

Head 2: Semantic similarity
  "dog" attends to "pet", "animal", "canine"

Head 3: Positional relationships
  "the" tends to attend to the next noun

Head 4: Coreference resolution
  "She went to the store. She bought milk."
  Second "She" attends to first "She"

Head 5: Negation handling
  "not bad" → "not" attends strongly to "bad"

All heads run in parallel on GPU, results concatenated
Each head is a different "lens" on the same text' 
            },
            { 
                'heading': 'Positional Encoding — Giving Order to Parallel Processing', 
                'text': 'Since Transformers process all tokens at once, they need explicit position information.',
                'code': 'Sinusoidal Positional Encoding:
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

Example for d_model=4:
Position 0: [0.00, 1.00, 0.00, 1.00]
Position 1: [0.84, 0.54, 0.01, 0.99]
Position 2: [0.91, -0.42, 0.02, 0.99]
Position 3: [0.14, -0.99, 0.04, 0.99]

Each position has a unique pattern.
The model learns to read these patterns like a clock.

Modern models use RoPE (Rotary Position Embedding):
Instead of adding position to the embedding,
RoPE rotates the Query and Key vectors by position angle.
This allows the model to understand relative distances.
Used in: Llama 2/3, Mistral, GPT-4, DeepSeek' 
            },
            { 
                'heading': 'Complete Architecture Diagram', 
                'text': 'A full Transformer layer with every component:',
                'code': 'INPUT: "The cat sat"
  │
  ▼
[Token Embedding] → each word → 512D vector
  │
  ▼
[Positional Encoding] → adds position info
  │
  ▼
┌──────────────────────────────────┐
│  MULTI-HEAD SELF-ATTENTION       │
│  8 heads × 64D = 512D output     │
│  Captures word relationships     │
└──────────────────────────────────┘
  │
  ▼  (Residual connection: add input back)
[Layer Normalization] → stabilizes values
  │
  ▼
┌──────────────────────────────────┐
│  FEED-FORWARD NETWORK            │
│  512 → 2048 → 512 (SwiGLU)       │
│  Processes each position indep.  │
└──────────────────────────────────┘
  │
  ▼  (Residual connection: add input back)
[Layer Normalization]
  │
  ▼
OUTPUT: Contextualized "The", "cat", "sat"
Each word now understands its role in the sentence

Repeat for N layers (6 for small, 126 for Llama 405B)' 
            }
        ]
    },
    'encoder-decoder': {
        'title': 'Encoder / Decoder Architecture',
        'sections': [
            { 
                'heading': 'The Original Design', 
                'text': 'The original Transformer used an encoder-decoder structure for sequence-to-sequence tasks like translation.',
                'code': 'ENCODER                        DECODER
┌──────────┐                  ┌──────────┐
│ Input:   │                  │ Output:  │
│ "Je suis │                  │ "I am a  │
│  etudiant"│                  │ student" │
└──────────┘                  └──────────┘
     │                             ▲
     │   ┌──────────────────┐      │
     └──►│ CROSS-ATTENTION  ├──────┘
         │ Decoder looks at │
         │ encoder output   │
         └──────────────────┘

Encoder reads ALL of "Je suis etudiant"
→ produces representations for each word

Decoder generates ONE token at a time:
Step 1: "I"
Step 2: "I am" (looks at encoder for context)
Step 3: "I am a"
Step 4: "I am a student"
Step 5: "I am a student." (stop)' 
            },
            { 
                'heading': 'Encoder — The Understanding Half', 
                'text': 'The encoder reads the entire input sequence and builds rich representations:',
                'code': 'Encoder: Bidirectional (sees all tokens)

Input: "The movie was not good at all"

Encoder processes ALL tokens simultaneously:
"good" gets context from both sides:
  ← "not" (negation!)
  → "at all" (emphasis!)
  ← "movie" (subject)

Result: "good" is understood as NEGATIVE
→ embedding shifts towards "bad" meaning

This is why BERT (encoder-only) excels at understanding tasks:
- Sentiment analysis
- Named entity recognition
- Question answering
- Text classification

Encoder output: One vector per input token
Each vector captures the FULL context' 
            },
            { 
                'heading': 'Decoder — The Generation Half', 
                'text': 'The decoder generates text one token at a time, auto-regressively:',
                'code': 'Decoder: Unidirectional (can only see past tokens)

Generation step by step:
  Step 1: [START] → "I"
  Step 2: [START] "I" → "am"
  Step 3: [START] "I" "am" → "a"
  Step 4: [START] "I" "am" "a" → "student"
  Step 5: [START] "I" "am" "a" "student" → [END]

MASKED SELF-ATTENTION:
At step 3, the decoder can see:
  ✅ [START], "I", "am"
  ❌ "a", "student", [END] (future = hidden)

This prevents cheating! The model cannot peek ahead.

CROSS-ATTENTION:
At each step, decoder also looks at encoder output:
  "am" ← attends to "suis" in French input
  "student" ← attends to "etudiant" in French input

This is the bridge between understanding and generation.' 
            },
            { 
                'heading': 'Three Families — When to Use Each', 
                'text': 'Modern models fall into three camps, each suited for different tasks:',
                'code': 'ENCODER-ONLY (e.g., BERT, BGE-small, RoBERTa)
- Architecture: Encoder layers only
- Training: Masked language model (fill in blanks)
- Best for: Understanding, classification, embeddings
- Example: "I am so [MASK] today" → predicts "happy"
- Use case: This app! BGE-small creates embeddings for search

DECODER-ONLY (e.g., GPT-4, Llama, DeepSeek)
- Architecture: Decoder layers only
- Training: Next token prediction
- Best for: Generation, chat, code
- Example: "Write a poem about" → generates poem
- Use case: ChatGPT, coding assistants

ENCODER-DECODER (e.g., T5, BART, original Transformer)
- Architecture: Encoder + Decoder
- Training: Various seq2seq objectives
- Best for: Translation, summarization
- Example: "Translate: Hello → Bonjour"
- Use case: Google Translate' 
            },
            { 
                'heading': 'Why Decoder-Only Became Dominant', 
                'text': 'GPT-style decoder-only models won the architecture war. Here is why:',
                'code': '1. SIMPLER = BETTER
   - One stack instead of two
   - Fewer parameters for same compute
   - Easier to train and optimize

2. SCALES EFFICIENTLY
   - No cross-attention overhead
   - KV cache speeds up inference
   - Better GPU utilization

3. GENERAL-PURPOSE
   - Can do understanding (with prompting)
   - Can do generation (native)
   - Can do translation (with few-shot examples)

4. THE GPT MOMENTUM
   - OpenAI proved decoder-only works at scale
   - Research community followed the leader
   - Hardware optimized for decoder-only patterns

Modern insight: Encoder-only for embeddings (like this app),
Decoder-only for generation. Both have their place.' 
            },
            { 
                'heading': 'How This App Uses Encoder Architecture', 
                'text': 'BGE-small (the embedding model powering this app) is encoder-only:',
                'code': 'Your document → BGE-small encoder → 384D embedding vector

Unlike GPT which generates text, BGE-small just converts
text into a fixed-size vector in embedding space.

This is why:
✅ You can search by semantic meaning
✅ You can visualize clusters of similar documents
✅ You can find nearest neighbors
❌ You cannot ask it questions or generate text

Complete mental model:
┌────────────────────────────────────────────┐
│  Encoder models (BGE, BERT)               │
│  Input: Text → Output: Vector (for search) │
│  Like: A map that puts similar things near │
├────────────────────────────────────────────┤
│  Decoder models (GPT, Llama)              │
│  Input: Text → Output: More text          │
│  Like: A writer that continues your story  │
├────────────────────────────────────────────┤
│  Encoder-Decoder (T5, original)           │
│  Input: Text → Output: Transformed text   │
│  Like: A translator between languages      │
└────────────────────────────────────────────┘' 
            }
        ]
    }
};
