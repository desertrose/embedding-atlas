#!/bin/bash

# =============================================
# 1. Add "Learn" button to the header in index.html
# =============================================

# Add the Learn button after the subtitle span
sed -i '' 's|<span class="subtitle">Visualize your embedding space</span>|<span class="subtitle">Visualize your embedding space</span>\n            <button id="learnBtn" class="btn learn-btn">📖 Learn</button>|' index.html

# =============================================
# 2. Add the Learn modal HTML before </body>
# =============================================

# Find the line with the script tags and insert modal before them
sed -i '' 's|<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>|<!-- Learn Modal -->\n<div id="learnModal" class="modal-overlay" style="display:none;">\n    <div class="modal-content">\n        <div class="modal-header">\n            <h2>📖 Semantic Search — Explained</h2>\n            <button id="closeLearnBtn" class="modal-close">✕</button>\n        </div>\n        <div class="modal-body">\n            <!-- Section 1: What is Semantic Search -->\n            <section class="learn-section">\n                <h3>🔍 What Is Semantic Search?</h3>\n                <p>Traditional search (keyword search) matches exact words or patterns. If you search for <em>"happy cat"</em>, it finds documents containing the word <strong>"happy"</strong> or <strong>"cat"</strong> — but it would miss <em>"joyful feline"</em> entirely.</p>\n                <p><strong>Semantic search</strong> understands meaning. It converts words into <strong>vectors</strong> (lists of numbers) that capture their meaning, then finds the <em>closest</em> meanings — not just the <em>same words</em>.</p>\n                <div class="learn-visual">\n                    <div class="compare-box">\n                        <div class="compare-label">Keyword Search</div>\n                        <div class="compare-demo">"cat" → ❌ "feline" ❌ "kitten"</div>\n                    </div>\n                    <div class="compare-arrow">→</div>\n                    <div class="compare-box highlight">\n                        <div class="compare-label">Semantic Search</div>\n                        <div class="compare-demo">"cat" → ✅ "feline" ✅ "kitten" ✅ "whiskers"</div>\n                    </div>\n                </div>\n            </section>\n\n            <!-- Section 2: Embeddings -->\n            <section class="learn-section">\n                <h3>🧠 Embeddings — The Core Idea</h3>\n                <p>An <strong>embedding</strong> is a mathematical representation of meaning — a point in high-dimensional space. Here's how it works:</p>\n                <div class="embedding-visual">\n                    <div class="embedding-row">\n                        <span class="word">"cat"</span>\n                        <span class="arrow">→</span>\n                        <span class="vector">[0.12, -0.34, 0.56, 0.78, -0.23, ...]</span>\n                        <span class="dim-label">384 dimensions</span>\n                    </div>\n                    <div class="embedding-row">\n                        <span class="word">"dog"</span>\n                        <span class="arrow">→</span>\n                        <span class="vector">[-0.23, 0.45, 0.12, -0.56, 0.34, ...]</span>\n                        <span class="dim-label">384 dimensions</span>\n                    </div>\n                    <div class="embedding-row">\n                        <span class="word">"car"</span>\n                        <span class="arrow">→</span>\n                        <span class="vector">[0.67, 0.89, -0.12, 0.34, -0.78, ...]</span>\n                        <span class="dim-label">384 dimensions</span>\n                    </div>\n                </div>\n                <p class="key-insight">💡 <strong>Key insight:</strong> Similar meanings cluster together in this space. "Cat" and "kitten" are close neighbors; "cat" and "car" are far apart.</p>\n            </section>\n\n            <!-- Section 3: How Embeddings Are Created -->\n            <section class="learn-section">\n                <h3>⚙️ How Are Embeddings Created?</h3>\n                <p>Embeddings come from <strong>neural network models</strong> trained on massive text corpora. Popular models include:</p>\n                <div class="model-cards">\n                    <div class="model-card">\n                        <div class="model-name">BGE-small</div>\n                        <div class="model-detail">384 dims — lightweight, fast</div>\n                    </div>\n                    <div class="model-card">\n                        <div class="model-name">all-MiniLM-L6-v2</div>\n                        <div class="model-detail">384 dims — Sentence Transformers</div>\n                    </div>\n                    <div class="model-card">\n                        <div class="model-name">text-embedding-3-small</div>\n                        <div class="model-detail">1536 dims — OpenAI</div>\n                    </div>\n                    <div class="model-card">\n                        <div class="model-name">text-embedding-3-large</div>\n                        <div class="model-detail">3072 dims — OpenAI (most powerful)</div>\n                    </div>\n                </div>\n                <p>These models are trained to predict which words appear near each other, learning that <em>"king — man + woman ≈ queen"</em>. This captures rich semantic relationships.</p>\n            </section>\n\n            <!-- Section 4: The Search Pipeline -->\n            <section class="learn-section">\n                <h3>🔄 The Semantic Search Pipeline</h3>\n                <div class="pipeline">\n                    <div class="pipeline-step">\n                        <div class="step-num">1</div>\n                        <div class="step-content">\n                            <strong>Convert to Vector</strong>\n                            <p>Your query "playful kitten" → embedding model → [0.45, -0.12, ...]</p>\n                        </div>\n                    </div>\n                    <div class="pipeline-step">\n                        <div class="step-num">2</div>\n                        <div class="step-content">\n                            <strong>Compare to All Documents</strong>\n                            <p>Compute similarity between query vector and every document vector in your database</p>\n                        </div>\n                    </div>\n                    <div class="pipeline-step">\n                        <div class="step-num">3</div>\n                        <div class="step-content">\n                            <strong>Rank by Similarity</strong>\n                            <p>Sort documents by how close they are to your query in embedding space</p>\n                        </div>\n                    </div>\n                    <div class="pipeline-step">\n                        <div class="step-num">4</div>\n                        <div class="step-content">\n                            <strong>Return Results</strong>\n                            <p>Show the top-K most semantically similar documents</p>\n                        </div>\n                    </div>\n                </div>\n            </section>\n\n            <!-- Section 5: Similarity Metrics -->\n            <section class="learn-section">\n                <h3>📐 Similarity Metrics</h3>\n                <div class="metrics-grid">\n                    <div class="metric-card">\n                        <h4>Cosine Similarity</h4>\n                        <div class="metric-formula">cos(θ) = A·B / (|A| × |B|)</div>\n                        <p>Measures the <strong>angle</strong> between vectors. Ranges from -1 (opposite) to 1 (identical). Most common for text embeddings.</p>\n                        <div class="metric-example">"cat" vs "kitten" → 0.92<br>"cat" vs "car" → 0.31</div>\n                    </div>\n                    <div class="metric-card">\n                        <h4>Euclidean Distance</h4>\n                        <div class="metric-formula">d = √Σ(Aᵢ - Bᵢ)²</div>\n                        <p>Measures the <strong>straight-line distance</strong> between points. Smaller = more similar. Sensitive to vector magnitude.</p>\n                        <div class="metric-example">"cat" vs "kitten" → 0.15<br>"cat" vs "car" → 2.34</div>\n                    </div>\n                    <div class="metric-card">\n                        <h4>Dot Product</h4>\n                        <div class="metric-formula">A·B = Σ(Aᵢ × Bᵢ)</div>\n                        <p>Simplest metric. Higher = more similar. Often used with <strong>normalized</strong> vectors where it equals cosine similarity.</p>\n                    </div>\n                </div>\n            </section>\n\n            <!-- Section 6: UMAP Dimensionality Reduction -->\n            <section class="learn-section">\n                <h3>🎯 What Is UMAP Doing Here?</h3>\n                <p>Embeddings live in <strong>384+ dimensions</strong> — impossible for humans to visualize. <strong>UMAP</strong> (Uniform Manifold Approximation and Projection) reduces this to <strong>3 dimensions</strong> while preserving the structure:</p>\n                <ul class="umap-list">\n                    <li><strong>Nearby points</strong> in high-dim space stay nearby in 3D</li>\n                    <li><strong>Distant points</strong> stay distant</li>\n                    <li><strong>Clusters</strong> of similar meaning remain visible as clusters</li>\n                </ul>\n                <p>This is what you're seeing in the 3D view! Each dot = one document, and its position reflects semantic relationships. Search queries find the <em>closest</em> dots using the original high-dimensional embeddings.</p>\n            </section>\n\n            <!-- Section 7: Why It Matters -->\n            <section class="learn-section">\n                <h3>🌟 Why Semantic Search Matters</h3>\n                <div class="why-grid">\n                    <div class="why-item">\n                        <span class="why-icon">🔤</span>\n                        <div>\n                            <strong>Handles synonyms</strong>\n                            <p>"car" finds "automobile", "vehicle", "sedan"</p>\n                        </div>\n                    </div>\n                    <div class="why-item">\n                        <span class="why-icon">🌍</span>\n                        <div>\n                            <strong>Multilingual</strong>\n                            <p>"cat" in English finds "gato" in Spanish</p>\n                        </div>\n                    </div>\n                    <div class="why-item">\n                        <span class="why-icon">📝</span>\n                        <div>\n                            <strong>Understands context</strong>\n                            <p>"Apple" near "fruit" vs "Apple" near "iPhone"</p>\n                        </div>\n                    </div>\n                    <div class="why-item">\n                        <span class="why-icon">🚀</span>\n                        <div>\n                            <strong>Fast at scale</strong>\n                            <p>ANN algorithms search millions in milliseconds</p>\n                        </div>\n                    </div>\n                </div>\n            </section>\n\n            <!-- Section 8: Try It Here -->\n            <section class="learn-section">\n                <h3>🧪 Try It Right Now</h3>\n                <p>In the left panel, type a word in the <strong>Search</strong> box:</p>\n                <ul class="try-list">\n                    <li>Search <strong>"cat"</strong> — see it find all feline-related points</li>\n                    <li>Search <strong>"pet"</strong> — finds both cats and dogs (they're semantically close!)</li>\n                    <li>Search <strong>"vehicle"</strong> — finds cars but not animals</li>\n                    <li>Toggle between <strong>Cosine</strong> and <strong>Euclidean</strong> to see the difference</li>\n                </ul>\n                <p class="key-insight">💡 The search results show a <em>distance</em> score. Lower = more semantically similar!</p>\n            </section>\n\n            <!-- Section 9: Applications -->\n            <section class="learn-section">\n                <h3>🏢 Real-World Applications</h3>\n                <div class="apps-grid">\n                    <div class="app-card">\n                        <strong>RAG (Retrieval Augmented Generation)</strong>\n                        <p>LLMs search your documents before answering — powers tools like ChatGPT with your data</p>\n                    </div>\n                    <div class="app-card">\n                        <strong>Recommendation Systems</strong>\n                        <p>"Users who liked X also liked Y" — find similar items by embedding proximity</p>\n                    </div>\n                    <div class="app-card">\n                        <strong>Code Search</strong>\n                        <p>Find functions by what they <em>do</em>, not just their name — GitHub's code search uses this</p>\n                    </div>\n                    <div class="app-card">\n                        <strong>Duplicate Detection</strong>\n                        <p>Find near-duplicate documents, bug reports, or support tickets</p>\n                    </div>\n                    <div class="app-card">\n                        <strong>Clustering & Topic Discovery</strong>\n                        <p>Group thousands of documents into topics automatically</p>\n                    </div>\n                    <div class="app-card">\n                        <strong>Semantic Caching</strong>\n                        <p>Cache LLM responses — similar questions get cached answers</p>\n                    </div>\n                </div>\n            </section>\n\n            <!-- Section 10: Further Learning -->\n            <section class="learn-section">\n                <h3>📚 Further Learning</h3>\n                <ul class="resources-list">\n                    <li><a href="https://arxiv.org/abs/1802.05365" target="_blank">Universal Sentence Encoder (2018)</a> — Google's embedding model paper</li>\n                    <li><a href="https://www.sbert.net/" target="_blank">Sentence Transformers</a> — The most popular library for text embeddings</li>\n                    <li><a href="https://umap-learn.readthedocs.io/" target="_blank">UMAP Documentation</a> — Learn how the dimensionality reduction works</li>\n                    <li><a href="https://arxiv.org/abs/1908.10084" target="_blank">BGE Embedding Models</a> — State-of-the-art open-source embeddings</li>\n                </ul>\n            </section>\n        </div>\n    </div>\n</div>\n\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>|' index.html

echo "✓ Added Learn modal to index.html"

# =============================================
# 3. Add CSS for the modal
# =============================================

cat >> css/style.css << 'CSS'

/* ============================================
   Learn Modal Styles
   ============================================ */

.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 15, 26, 0.92);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 8px 48px rgba(0, 0, 0, 0.6);
    animation: modalIn 0.3s ease;
}

.modal-content::-webkit-scrollbar { width: 8px; }
.modal-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
.modal-content::-webkit-scrollbar-track { background: transparent; }

@keyframes modalIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    background: var(--bg-secondary);
    z-index: 10;
    border-radius: 12px 12px 0 0;
}

.modal-header h2 {
    font-size: 1.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent), #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
}

.modal-close {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.modal-close:hover {
    background: var(--accent-dim);
    color: var(--text-primary);
    border-color: var(--accent);
}

.modal-body {
    padding: 24px;
}

.learn-section {
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
}

.learn-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.learn-section h3 {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.learn-section p {
    font-size: 0.88rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin-bottom: 10px;
}

.learn-section p:last-child {
    margin-bottom: 0;
}

.learn-visual {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 16px 0;
    justify-content: center;
    flex-wrap: wrap;
}

.compare-box {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 20px;
    text-align: center;
    flex: 1;
    min-width: 200px;
}

.compare-box.highlight {
    border-color: var(--accent);
    background: var(--accent-dim);
}

.compare-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.compare-demo {
    font-size: 0.85rem;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.compare-arrow {
    font-size: 1.5rem;
    color: var(--accent);
}

.embedding-visual {
    margin: 16px 0;
}

.embedding-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-bottom: 6px;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.78rem;
}

.embedding-row .word {
    color: var(--accent);
    font-weight: 600;
    min-width: 40px;
}

.embedding-row .arrow {
    color: var(--text-secondary);
}

.embedding-row .vector {
    color: var(--text-primary);
    flex: 1;
}

.embedding-row .dim-label {
    color: var(--text-secondary);
    font-size: 0.7rem;
    background: var(--bg-primary);
    padding: 2px 8px;
    border-radius: 4px;
}

.key-insight {
    background: var(--accent-dim);
    border-left: 3px solid var(--accent);
    padding: 10px 14px;
    border-radius: 0 6px 6px 0;
    font-size: 0.85rem !important;
    color: var(--text-primary) !important;
}

.model-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
    margin: 12px 0;
}

.model-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
}

.model-name {
    font-weight: 700;
    color: var(--accent);
    font-size: 0.85rem;
    margin-bottom: 4px;
}

.model-detail {
    font-size: 0.72rem;
    color: var(--text-secondary);
}

.pipeline {
    margin: 16px 0;
}

.pipeline-step {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.step-num {
    width: 32px;
    height: 32px;
    min-width: 32px;
    background: var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    color: #fff;
}

.step-content {
    flex: 1;
}

.step-content strong {
    display: block;
    font-size: 0.88rem;
    color: var(--text-primary);
    margin-bottom: 2px;
}

.step-content p {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin: 12px 0;
}

.metric-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
}

.metric-card h4 {
    font-size: 0.9rem;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.metric-formula {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.8rem;
    color: var(--accent);
    background: var(--bg-primary);
    padding: 6px 10px;
    border-radius: 4px;
    margin-bottom: 8px;
    text-align: center;
}

.metric-card p {
    font-size: 0.8rem !important;
    margin-bottom: 8px !important;
}

.metric-example {
    font-size: 0.72rem;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    color: var(--text-secondary);
    background: var(--bg-primary);
    padding: 6px 10px;
    border-radius: 4px;
    line-height: 1.6;
}

.umap-list {
    list-style: none;
    padding: 0;
    margin: 12px 0;
}

.umap-list li {
    padding: 6px 0;
    padding-left: 20px;
    position: relative;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.umap-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--success);
    font-weight: 700;
}

.why-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 12px 0;
}

.why-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
}

.why-icon {
    font-size: 1.5rem;
    min-width: 40px;
    text-align: center;
}

.why-item strong {
    display: block;
    font-size: 0.85rem;
    color: var(--text-primary);
    margin-bottom: 2px;
}

.why-item p {
    font-size: 0.8rem !important;
    color: var(--text-secondary);
    margin: 0 !important;
}

.try-list {
    list-style: none;
    padding: 0;
    margin: 12px 0;
}

.try-list li {
    padding: 6px 0;
    padding-left: 24px;
    position: relative;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.try-list li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--accent);
    font-weight: 700;
}

.apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
    margin: 12px 0;
}

.app-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px;
}

.app-card strong {
    display: block;
    font-size: 0.85rem;
    color: var(--text-primary);
    margin-bottom: 6px;
}

.app-card p {
    font-size: 0.8rem !important;
    color: var(--text-secondary);
    margin: 0 !important;
}

.resources-list {
    list-style: none;
    padding: 0;
    margin: 12px 0;
}

.resources-list li {
    padding: 6px 0;
}

.resources-list a {
    color: var(--accent);
    text-decoration: none;
    font-size: 0.85rem;
}

.resources-list a:hover {
    text-decoration: underline;
}

.learn-btn {
    background: var(--accent-dim);
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 4px 14px;
    font-size: 0.78rem;
    border-radius: 16px;
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
    margin-left: auto;
}

.learn-btn:hover {
    background: var(--accent);
    color: #fff;
}

@media (max-width: 600px) {
    .modal-content { width: 95%; max-height: 90vh; }
    .modal-body { padding: 16px; }
    .learn-visual { flex-direction: column; }
    .compare-box { min-width: unset; width: 100%; }
    .model-cards { grid-template-columns: 1fr 1fr; }
    .metrics-grid { grid-template-columns: 1fr; }
}
CSS

echo "✓ Added Learn modal CSS"

# =============================================
# 4. Add JavaScript for modal toggle
# =============================================

cat >> js/ui.js << 'JAVASCRIPT'

// Learn Modal toggle
document.addEventListener('DOMContentLoaded', function() {
    const learnBtn = document.getElementById('learnBtn');
    const modal = document.getElementById('learnModal');
    const closeBtn = document.getElementById('closeLearnBtn');

    if (learnBtn && modal && closeBtn) {
        learnBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
});
JAVASCRIPT

echo "✓ Added Learn modal JavaScript"

echo ""
echo "========================================"
echo "✅ Learn menu added!"
echo "========================================"
echo ""
echo "Commit and push:"
echo "  git add ."
echo "  git commit -m \"Add Learn menu explaining semantic search\""
echo "  git push"
