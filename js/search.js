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
