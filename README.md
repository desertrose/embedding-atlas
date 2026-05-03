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
