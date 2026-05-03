const ExportManager = {
    exportPNG(renderer, scene, camera) {
        renderer.render(scene, camera);
        const link = document.createElement('a');
        link.download = 'embedding-atlas.png';
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
    },

    exportSVG(coords, labels, colors) {
        if (!coords || coords.length === 0) return;

        const w = 800, h = 600;
        const padding = 40;

        // Normalize coords to SVG space
        const xs = coords.map(p => p[0]);
        const ys = coords.map(p => p[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#0f0f1a"/>
  <g transform="translate(${padding}, ${padding})">\n`;

        const scaleX = (w - 2*padding) / rangeX;
        const scaleY = (h - 2*padding) / rangeY;
        const scale = Math.min(scaleX, scaleY);

        for (let i = 0; i < coords.length; i++) {
            const x = (coords[i][0] - minX) * scale;
            const y = (coords[i][1] - minY) * scale;
            const color = colors ? '#' + colors[i].toString(16).padStart(6, '0') : '#7c5cfc';
            const r = Math.max(2, Math.min(4, 30 / Math.sqrt(coords.length)));
            svg += `    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.8"/>\n`;
        }

        svg += `  </g>\n</svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'embedding-atlas.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }
};
