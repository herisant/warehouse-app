/**
 * Vector SVG Barcode & QR Code Generator for Warehouse label printing
 */

// Simple Code 128 / Pseudo-EAN bar pattern generator for crisp SVG rendering
export function generateBarcodeSvg(code: string, width = 240, height = 70): string {
  // Hash characters to deterministic bar widths (1 to 4 px)
  const cleanCode = (code || '00000000').toUpperCase();
  const bars: { x: number; w: number }[] = [];
  
  // Guard bars at start
  let currentX = 12;
  const unit = (width - 24) / (cleanCode.length * 11 + 35);

  const addBar = (wUnits: number, isSpace: boolean) => {
    if (!isSpace) {
      bars.push({ x: currentX, w: wUnits * unit });
    }
    currentX += wUnits * unit;
  };

  // Start pattern (Code 128-like quiet & start)
  addBar(2, false);
  addBar(1, true);
  addBar(1, false);
  addBar(2, true);
  addBar(3, false);
  addBar(2, true);

  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    const p1 = (charCode % 4) + 1;
    const s1 = ((charCode >> 1) % 3) + 1;
    const p2 = ((charCode >> 2) % 4) + 1;
    const s2 = ((charCode >> 3) % 3) + 1;

    addBar(p1, false);
    addBar(s1, true);
    addBar(p2, false);
    addBar(s2, true);
  }

  // Stop pattern
  addBar(2, false);
  addBar(3, true);
  addBar(3, false);
  addBar(1, true);
  addBar(1, false);
  addBar(1, true);
  addBar(2, false);

  const rects = bars
    .map(b => `<rect x="${b.x.toFixed(1)}" y="8" width="${Math.max(1, b.w).toFixed(1)}" height="${height - 24}" fill="#0f172a" />`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="w-full h-auto">
    <rect width="${width}" height="${height}" fill="#ffffff" rx="4" />
    ${rects}
    <text x="${width / 2}" y="${height - 5}" font-family="monospace" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle" letter-spacing="2">${cleanCode}</text>
  </svg>`;
}

// Generate simple SVG QR code visual for racks and locations
export function generateQrSvg(text: string, size = 120): string {
  const clean = text || 'LOC-A1';
  const grid = 21; // 21x21 modules
  const cellSize = (size - 16) / grid;
  
  // Create deterministic matrix using string hash
  const matrix: boolean[][] = Array.from({ length: grid }, () => Array(grid).fill(false));

  // Finder patterns at top-left, top-right, bottom-left
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(grid - 7, 0);
  drawFinder(0, grid - 7);

  // Timing patterns
  for (let i = 8; i < grid - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // Populate data area based on characters
  let charIdx = 0;
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // Don't overwrite finders
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= grid - 8) ||
        (r >= grid - 8 && c < 8) ||
        (r === 6 || c === 6)
      ) {
        continue;
      }
      const charVal = clean.charCodeAt(charIdx % clean.length) + (r * 7) + (c * 13);
      if (charVal % 3 === 0 || charVal % 5 === 0) {
        matrix[r][c] = true;
      }
      charIdx++;
    }
  }

  const cells: string[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (matrix[r][c]) {
        const x = 8 + c * cellSize;
        const y = 8 + r * cellSize;
        cells.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#0f172a" />`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="6" />
    ${cells.join('')}
  </svg>`;
}
