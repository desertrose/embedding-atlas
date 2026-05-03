#!/bin/bash

# Embedding Atlas - README & Demo Data Setup
# Run this after setup.sh to add README, demo data, and project docs
# Usage: bash readme-setup.sh

set -e

echo "📝 Adding README, demo data, and project structure..."

# =============================================
# demo-data/sample-embeddings.json
# =============================================
mkdir -p demo-data

cat > demo-data/sample-embeddings.json << 'JSON'
[
  {"label": "cat", "text": "A small domestic feline with soft fur and whiskers", "embedding": [0.124, 0.342, -0.561, 0.233, -0.145, 0.421, -0.312, 0.089, 0.567, -0.234, 0.112, -0.345]},
  {"label": "cat", "text": "A playful kitten chasing a ball of yarn", "embedding": [0.145, 0.321, -0.542, 0.256, -0.123, 0.445, -0.298, 0.102, 0.578, -0.212, 0.134, -0.321]},
  {"label": "cat", "text": "An orange tabby cat sleeping in the sun", "embedding": [0.112, 0.356, -0.573, 0.221, -0.156, 0.412, -0.324, 0.078, 0.554, -0.245, 0.101, -0.356]},
  {"label": "cat", "text": "A black cat with bright green eyes", "embedding": [0.134, 0.334, -0.555, 0.242, -0.138, 0.433, -0.308, 0.095, 0.571, -0.228, 0.121, -0.338]},
  {"label": "cat", "text": "A fluffy Persian cat grooming its fur", "embedding": [0.108, 0.367, -0.582, 0.214, -0.167, 0.401, -0.335, 0.072, 0.545, -0.256, 0.095, -0.367]},
  {"label": "dog", "text": "A loyal golden retriever fetching a stick", "embedding": [-0.231, 0.456, 0.123, -0.345, 0.234, -0.123, 0.456, -0.345, 0.123, 0.567, -0.234, 0.145]},
  {"label": "dog", "text": "A small brown beagle sniffing the ground", "embedding": [-0.256, 0.432, 0.145, -0.321, 0.256, -0.145, 0.432, -0.321, 0.145, 0.543, -0.212, 0.167]},
  {"label": "dog", "text": "A energetic puppy playing in the park", "embedding": [-0.223, 0.467, 0.112, -0.356, 0.223, -0.112, 0.467, -0.356, 0.112, 0.578, -0.245, 0.134]},
  {"label": "dog", "text": "A husky howling at the moon", "embedding": [-0.245, 0.445, 0.134, -0.334, 0.245, -0.134, 0.445, -0.334, 0.134, 0.554, -0.228, 0.156]},
  {"label": "dog", "text": "A German shepherd guarding its home", "embedding": [-0.212, 0.478, 0.101, -0.367, 0.212, -0.101, 0.478, -0.367, 0.101, 0.589, -0.256, 0.123]},
  {"label": "bird", "text": "A blue jay singing on a tree branch", "embedding": [0.567, -0.234, 0.112, -0.145, 0.421, -0.312, 0.089, 0.345, -0.123, 0.234, -0.456, 0.321]},
  {"label": "bird", "text": "A hawk soaring high in the sky", "embedding": [0.543, -0.212, 0.134, -0.167, 0.445, -0.298, 0.102, 0.367, -0.145, 0.256, -0.432, 0.345]},
  {"label": "bird", "text": "A tiny hummingbird hovering near a flower", "embedding": [0.578, -0.245, 0.101, -0.134, 0.412, -0.324, 0.078, 0.334, -0.112, 0.223, -0.467, 0.312]},
  {"label": "bird", "text": "An owl perched silently in the night", "embedding": [0.554, -0.228, 0.121, -0.156, 0.433, -0.308, 0.095, 0.356, -0.134, 0.245, -0.445, 0.334]},
  {"label": "bird", "text": "A flock of sparrows flying together", "embedding": [0.589, -0.256, 0.095, -0.123, 0.401, -0.335, 0.072, 0.321, -0.101, 0.212, -0.478, 0.301]},
  {"label": "fish", "text": "A vibrant goldfish swimming in a bowl", "embedding": [-0.145, 0.421, -0.312, 0.567, -0.234, 0.112, -0.345, 0.124, 0.342, -0.561, 0.233, -0.456]},
  {"label": "fish", "text": "A school of tropical fish near coral reef", "embedding": [-0.167, 0.445, -0.298, 0.543, -0.212, 0.134, -0.321, 0.145, 0.321, -0.542, 0.256, -0.432]},
  {"label": "fish", "text": "A large tuna swimming in deep ocean", "embedding": [-0.134, 0.412, -0.324, 0.578, -0.245, 0.101, -0.356, 0.112, 0.356, -0.573, 0.221, -0.467]},
  {"label": "fish", "text": "A colorful betta fish with flowing fins", "embedding": [-0.156, 0.433, -0.308, 0.554, -0.228, 0.121, -0.338, 0.134, 0.334, -0.555, 0.242, -0.445]},
  {"label": "fish", "text": "A small guppy darting through plants", "embedding": [-0.123, 0.401, -0.335, 0.589, -0.256, 0.095, -0.367, 0.108, 0.367, -0.582, 0.214, -0.478]},
  {"label": "car", "text": "A red sports car speeding on a highway", "embedding": [0.345, -0.123, 0.456, -0.231, 0.567, 0.124, -0.342, 0.561, -0.233, 0.145, -0.421, 0.312]},
  {"label": "car", "text": "A blue sedan parked in a garage", "embedding": [0.321, -0.145, 0.432, -0.256, 0.543, 0.145, -0.321, 0.542, -0.256, 0.167, -0.445, 0.298]},
  {"label": "car", "text": "A black SUV driving through snow", "embedding": [0.356, -0.112, 0.467, -0.223, 0.578, 0.112, -0.356, 0.573, -0.221, 0.134, -0.412, 0.324]},
  {"label": "car", "text": "An electric car charging at a station", "embedding": [0.334, -0.134, 0.445, -0.245, 0.554, 0.134, -0.334, 0.555, -0.242, 0.156, -0.433, 0.308]},
  {"label": "car", "text": "A vintage classic car at a show", "embedding": [0.367, -0.101, 0.478, -0.212, 0.589, 0.101, -0.367, 0.582, -0.214, 0.123, -0.401, 0.335]},
  {"label": "tree", "text": "A tall oak tree with spreading branches", "embedding": [-0.561, 0.233, -0.145, 0.421, -0.312, 0.567, -0.234, 0.112, -0.345, 0.124, 0.342, 0.089]},
  {"label": "tree", "text": "A pine tree covered in fresh snow", "embedding": [-0.542, 0.256, -0.123, 0.445, -0.298, 0.543, -0.212, 0.134, -0.321, 0.145, 0.321, 0.102]},
  {"label": "tree", "text": "A cherry blossom tree in full bloom", "embedding": [-0.573, 0.221, -0.156, 0.412, -0.324, 0.578, -0.245, 0.101, -0.356, 0.112, 0.356, 0.078]},
  {"label": "tree", "text": "A willow tree weeping by a pond", "embedding": [-0.555, 0.242, -0.138, 0.433, -0.308, 0.554, -0.228, 0.121, -0.338, 0.134, 0.334, 0.095]},
  {"label": "tree", "text": "A maple tree with vibrant autumn leaves", "embedding": [-0.582, 0.214, -0.167, 0.401, -0.335, 0.589, -0.256, 0.095, -0.367, 0.108, 0.367, 0.072]}
]
JSON
echo "  ✓ demo-data/sample-embeddings.json"

# =============================================
# README.md
# =============================================
cat > README.md << 'README'
# 🧬 Embedding Atlas

An open-source, browser-based 3D embedding visualization tool inspired by [Apple's Embedding Atlas](https://apple.github.io/embedding-atlas/tool.html).

Upload your CSV or JSON file containing text data with pre-computed embeddings, and explore them in an interactive 3D space powered by UMAP dimensionality reduction.

## ✨ Features

- **File Upload** — Drag & drop CSV or JSON files (up to 100MB)
- **Auto-Detect** — Automatically identifies embedding columns (separate dim columns or array format)
- **3D Visualization** — Interactive 3D scatter plot with Three.js (rotate, zoom, pan)
- **UMAP Reduction** — Dimensionality reduction in-browser using UMAP.js
- **Nearest Neighbor Search** — Cosine similarity or Euclidean distance search
- **Auto-Clustering** — K-means clustering for color-coding
- **Color Modes** — Color by label column, cluster assignment, or uniform
- **Export** — Save your visualization as PNG or SVG
- **Responsive** — Works on desktop and mobile
- **100% Client-Side** — No backend, no data leaves your browser

## 📋 File Format

### CSV with separate dimension columns

```csv
label,text,dim_0,dim_1,dim_2,...,dim_383
cat,A cute cat,0.12,0.34,-0.56,...,0.78
dog,A loyal dog,-0.23,0.45,0.12,...,-0.34
