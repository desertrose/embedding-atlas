embedding-atlas/
├── index.html                # Main entry point
├── README.md                 # This file
├── css/
│   ├── style.css             # Main styles (dark theme)
│   └── responsive.css        # Mobile-responsive styles
├── js/
│   ├── app.js                # Main app controller & state
│   ├── fileParser.js         # CSV/JSON parsing & validation
│   ├── search.js             # Nearest neighbor search (cosine + euclidean)
│   ├── clustering.js         # K-means clustering (k-means++)
│   ├── renderer3d.js         # Three.js 3D scene & point cloud
│   ├── export.js             # PNG & SVG export
│   └── ui.js                 # UI event handlers & panel management
└── demo-data/
    └── sample-embeddings.json  # 30-point demo dataset (6 categories)
