import path from 'path';
import sharp from 'sharp';

async function generateScreenshots() {
  const publicDir = path.join(process.cwd(), 'public');

  // Mobile screenshot (1080x1920)
  const mobileSvg = `
  <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1920" fill="#050a14"/>
    <circle cx="540" cy="800" r="350" fill="none" stroke="#f59e0b" stroke-width="4" opacity="0.4"/>
    <circle cx="540" cy="800" r="280" fill="none" stroke="#fef08a" stroke-width="2" opacity="0.3"/>
    <text x="540" y="300" font-family="serif" font-size="64" font-weight="bold" fill="#ffd700" text-anchor="middle">CATHARSIS MATRIX</text>
    <text x="540" y="380" font-family="sans-serif" font-size="32" fill="#94a3b8" text-anchor="middle">Сакральная Матрица Судьбы и Астрология</text>
    <rect x="140" y="1300" width="800" height="120" rx="30" fill="#f59e0b"/>
    <text x="540" y="1375" font-family="sans-serif" font-size="36" font-weight="bold" fill="#000000" text-anchor="middle">РАССЧИТАТЬ МАТРИЦУ</text>
  </svg>`;

  await sharp(Buffer.from(mobileSvg))
    .png()
    .toFile(path.join(publicDir, 'screenshot-mobile.png'));
  console.log('Created screenshot-mobile.png');

  // Desktop screenshot (1920x1080)
  const desktopSvg = `
  <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1920" height="1080" fill="#050a14"/>
    <circle cx="960" cy="540" r="320" fill="none" stroke="#f59e0b" stroke-width="4" opacity="0.4"/>
    <text x="960" y="200" font-family="serif" font-size="64" font-weight="bold" fill="#ffd700" text-anchor="middle">CATHARSIS MATRIX</text>
    <text x="960" y="270" font-family="sans-serif" font-size="28" fill="#94a3b8" text-anchor="middle">Эзотерическая Платформа и Натальная Астрология</text>
    <rect x="760" y="850" width="400" height="80" rx="20" fill="#f59e0b"/>
    <text x="960" y="900" font-family="sans-serif" font-size="24" font-weight="bold" fill="#000000" text-anchor="middle">ОТКРЫТЬ ПЛАТФОРМУ</text>
  </svg>`;

  await sharp(Buffer.from(desktopSvg))
    .png()
    .toFile(path.join(publicDir, 'screenshot-desktop.png'));
  console.log('Created screenshot-desktop.png');
}

generateScreenshots().catch(console.error);
