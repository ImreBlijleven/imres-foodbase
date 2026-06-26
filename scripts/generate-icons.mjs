import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';

// Refined bowl — wider body (75% of canvas), curved base, 3 steam S-curves, clean handle
const makeSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2D4A3E"/>
  <g transform="translate(${size / 2}, ${size / 2}) scale(${size / 56}) translate(-28, -28)">
    <!-- Bowl body: wider rim (x7–49), curved bottom via quadratic bezier -->
    <path d="M7 20H49L44.5 36Q28 42 11.5 36Z" fill="#FDF0E8"/>
    <!-- Handle -->
    <path d="M49 24.5h3.5a4.5 4.5 0 010 9H49" stroke="#FDF0E8" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <!-- Steam: 3 evenly-spaced S-curves (left, center, right) -->
    <path d="M19 18c1.2-2-1.2-2 0-5.5" stroke="#FDF0E8" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/>
    <path d="M28 16c1.2-2-1.2-2 0-5.5" stroke="#FDF0E8" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/>
    <path d="M37 18c1.2-2-1.2-2 0-5.5" stroke="#FDF0E8" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/>
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
