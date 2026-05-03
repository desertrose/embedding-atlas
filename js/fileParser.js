const FileParser = {
    parseFile(file) {
        return new Promise((resolve, reject) => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'csv') this._parseCSV(file, resolve, reject);
            else if (ext === 'json') this._parseJSON(file, resolve, reject);
            else reject(new Error(`Unsupported format: .${ext}. Please upload .csv or .json.`));
        });
    },

    _parseCSV(file, resolve, reject) {
        const reader = new FileReader();
        reader.onload = (e) => {
            Papa.parse(e.target.result, {
                header: true, dynamicTyping: true, skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(`CSV error at row ${results.errors[0].row}: ${results.errors[0].message}`));
                        return;
                    }
                    if (results.data.length === 0) { reject(new Error('CSV file is empty.')); return; }
                    resolve({ data: results.data, meta: { columns: results.meta.fields, rowCount: results.data.length, isJson: false } });
                },
                error: (err) => reject(new Error(`CSV parsing failed: ${err.message}`))
            });
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
    },

    _parseJSON(file, resolve, reject) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const raw = JSON.parse(e.target.result);
                const data = Array.isArray(raw) ? raw : [raw];
                if (data.length === 0) { reject(new Error('JSON file is empty.')); return; }
                resolve({ data, meta: { columns: Object.keys(data[0]), rowCount: data.length, isJson: true } });
            } catch (err) {
                reject(new Error(`JSON parsing failed: ${err.message}`));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
    },

    detectEmbeddingColumns(data, allColumns) {
        const arrayCol = allColumns.find(col => {
            const v = data[0][col];
            return Array.isArray(v) && v.length > 0 && typeof v[0] === 'number';
        });
        if (arrayCol) return { format: 'array', columns: [arrayCol], arrayColumn: arrayCol };

        const dimCols = allColumns.filter(col => /^(dim|embedding|feature|vec|v)\s*[_\-]?\d+$/i.test(col.trim()));
        if (dimCols.length >= 2) return { format: 'columns', columns: dimCols, arrayColumn: null };

        const numericCols = allColumns.filter(col => data.every(r => typeof r[col] === 'number' && !isNaN(r[col])));
        if (numericCols.length >= 2) return { format: 'columns', columns: numericCols, arrayColumn: null };

        return { format: null, columns: [], arrayColumn: null };
    },

    extractEmbeddings(data, format, columns) {
        return data.map((row, idx) => {
            if (format === 'array') {
                const arr = row[columns[0]];
                if (!Array.isArray(arr)) throw new Error(`Row ${idx+1}: Expected array in "${columns[0]}", got ${typeof arr}`);
                return arr.map(v => { if (typeof v !== 'number' || isNaN(v)) throw new Error(`Row ${idx+1}: Non-numeric in embedding`); return v; });
            } else {
                return columns.map(col => {
                    const v = row[col];
                    if (typeof v !== 'number' || isNaN(v)) throw new Error(`Row ${idx+1}: Non-numeric "${v}" in "${col}"`);
                    return v;
                });
            }
        });
    },

    validateEmbeddings(embeddings) {
        if (embeddings.length === 0) throw new Error('No embedding data found.');
        const dim = embeddings[0].length;
        if (dim < 2) throw new Error(`Only ${dim} dimension(s). Need at least 2.`);
        embeddings.forEach((v, i) => { if (v.length !== dim) throw new Error(`Row ${i+1}: Inconsistent dimension. Expected ${dim}, got ${v.length}.`); });
        return dim;
    },

    normalizeEmbeddings(embeddings) {
        return embeddings.map(vec => {
            const norm = Math.sqrt(vec.reduce((s, v) => s + v*v, 0));
            return norm > 0 ? vec.map(v => v / norm) : vec;
        });
    },

    downsample(data, embeddings, labels, maxPoints) {
        if (data.length <= maxPoints) return { data, embeddings, labels, indices: data.map((_, i) => i) };
        const indices = new Set();
        while (indices.size < maxPoints) indices.add(Math.floor(Math.random() * data.length));
        const sorted = [...indices].sort((a, b) => a - b);
        return {
            data: sorted.map(i => data[i]),
            embeddings: sorted.map(i => embeddings[i]),
            labels: labels ? sorted.map(i => labels[i]) : null,
            indices: sorted
        };
    }
};
