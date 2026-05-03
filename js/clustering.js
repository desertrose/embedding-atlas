const ClusterEngine = {
    kMeans(data, k, maxIter = 50) {
        const n = data.length, dim = data[0].length;
        const centroids = this._kmeansPlusPlus(data, k);
        const assignments = new Array(n).fill(0);

        for (let iter = 0; iter < maxIter; iter++) {
            let changed = false;
            for (let i = 0; i < n; i++) {
                let minDist = Infinity, best = 0;
                for (let j = 0; j < k; j++) {
                    const d = this._euclidean(data[i], centroids[j]);
                    if (d < minDist) { minDist = d; best = j; }
                }
                if (assignments[i] !== best) { assignments[i] = best; changed = true; }
            }
            if (!changed) break;

            const counts = new Array(k).fill(0);
            const sums = Array.from({length: k}, () => new Array(dim).fill(0));
            for (let i = 0; i < n; i++) {
                counts[assignments[i]]++;
                for (let d = 0; d < dim; d++) sums[assignments[i]][d] += data[i][d];
            }
            for (let j = 0; j < k; j++) {
                if (counts[j] > 0) for (let d = 0; d < dim; d++) centroids[j][d] = sums[j][d] / counts[j];
            }
        }
        return assignments;
    },

    _kmeansPlusPlus(data, k) {
        const centroids = [data[Math.floor(Math.random() * data.length)]];
        for (let c = 1; c < k; c++) {
            const dists = data.map(p => Math.min(...centroids.map(cent => this._euclidean(p, cent))));
            const total = dists.reduce((a, b) => a + b*b, 0);
            let r = Math.random() * total;
            for (let i = 0; i < data.length; i++) {
                r -= dists[i]*dists[i];
                if (r <= 0) { centroids.push(data[i]); break; }
            }
        }
        return centroids;
    },

    _euclidean(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += (a[i]-b[i])**2;
        return Math.sqrt(sum);
    }
};
