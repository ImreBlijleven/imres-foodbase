import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';

// Bowl icon SVG — forest green background (#2D4A3E) with cream bowl + steam
const makeSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2D4A3E"/>
  <g transform="translate(${size / 2}, ${size / 2}) scale(${size / 56}) translate(-28, -28)">
    <!-- Bowl body -->
    <path d="M10 22h36l-4.5 18a4 4 0 01-4 3H18.5a4 4 0 01-4-3L10 22z" fill="#FDF0E8"/>
    <!-- Handle -->
    <path d="M46 27.5h3.5a4.5 4.5 0 010 9H46" stroke="#FDF0E8" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Steam left -->
    <path d="M18 17c1-3 3-4 3-7.5" stroke="#FDF0E8" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>
    <!-- Steam right -->
    <path d="M28 15c.5-2.8 2-4.5 2-8" stroke="#FDF0E8" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>
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
