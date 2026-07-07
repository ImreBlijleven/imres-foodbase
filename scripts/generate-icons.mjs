import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';

// Line-art mug with steam S-curve, heart, and saucer — forest green bg, cream art
const makeSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2D4A3E"/>
  <g transform="translate(${size / 2}, ${size / 2}) scale(${size / 56}) translate(-28, -28)">
    <!-- Steam S-curve -->
    <path d="M25 20C23 15 29 11 25 6" stroke="#FDF0E8" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <!-- Heart at tip of steam -->
    <path d="M25 8C22 6 21 4 22.5 3.5C23.5 3 24.5 3.5 25 4.5C25.5 3.5 26.5 3 27.5 3.5C29 4 28 6 25 8Z" fill="#FDF0E8"/>
    <!-- Cup rim -->
    <path d="M8 22H48" stroke="#FDF0E8" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <!-- Cup body -->
    <path d="M8 22L11 41Q28 46 45 41L48 22" stroke="#FDF0E8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <!-- Handle -->
    <path d="M45 28C54 28 54 40 45 40" stroke="#FDF0E8" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <!-- Saucer -->
    <ellipse cx="28" cy="47" rx="19" ry="2.5" stroke="#FDF0E8" stroke-width="1.6" fill="none"/>
  </g>
</svg>`;

for (const size of [180, 192, 512]) {
  const svg = makeSvg(size);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const pngData = resvg.render();
  const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  writeFileSync(`public/${filename}`, pngData.asPng());
  console.log(`✓ ${filename}`);
}
