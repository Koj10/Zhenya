/**
 * Сканирует папку VaP, конвертирует MOV → MP4 для браузера, генерирует media.json
 * Запуск: node build-vap.js
 */
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.m4v'];
const CONVERT_EXT = ['.mov'];

function resolveVaPDir() {
  for (const name of ['VaP', 'Vap', 'vap']) {
    const dir = path.join(__dirname, name);
    if (fs.existsSync(dir)) return dir;
  }
  const dir = path.join(__dirname, 'VaP');
  fs.mkdirSync(dir);
  console.log('Создана папка VaP/');
  return dir;
}

function hasFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function mp4PathFor(file) {
  const base = path.basename(file, path.extname(file));
  return `${base}.mp4`;
}

function needsConversion(srcPath, destPath) {
  if (!fs.existsSync(destPath)) return true;
  return fs.statSync(srcPath).mtimeMs > fs.statSync(destPath).mtimeMs;
}

function convertToMp4(VaP_DIR, file) {
  const src = path.join(VaP_DIR, file);
  const destName = mp4PathFor(file);
  const dest = path.join(VaP_DIR, destName);

  if (!needsConversion(src, dest)) {
    console.log(`  ✓ ${destName} уже актуален`);
    return destName;
  }

  console.log(`  → конвертация ${file} → ${destName} ...`);
  const result = spawnSync(
    'ffmpeg',
    [
      '-y', '-i', src,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-vf', "scale='min(1920,iw)':-2",
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      dest,
    ],
    { stdio: 'inherit', shell: true }
  );

  if (result.status !== 0) {
    console.warn(`  ✗ не удалось конвертировать ${file}`);
    return null;
  }
  console.log(`  ✓ ${destName} готов`);
  return destName;
}

const VaP_DIR = resolveVaPDir();
const ffmpegOk = hasFfmpeg();

function listMediaFiles() {
  return fs
    .readdirSync(VaP_DIR)
    .filter((f) => !f.startsWith('.') && f !== 'media.json' && f !== 'README.md');
}

let allFiles = listMediaFiles();

// Конвертируем MOV → MP4
const movFiles = allFiles.filter((f) => CONVERT_EXT.includes(path.extname(f).toLowerCase()));
if (movFiles.length > 0) {
  if (ffmpegOk) {
    console.log(`Конвертация ${movFiles.length} видео для браузера...`);
    movFiles.forEach((f) => convertToMp4(VaP_DIR, f));
  } else {
    console.warn('ffmpeg не найден — MOV-файлы могут не работать в Chrome/Edge');
  }
}

// Перечитываем папку после конвертации
allFiles = listMediaFiles();

// Собираем список: MOV пропускаем, если есть MP4 с тем же именем
const mp4Basenames = new Set(
  allFiles
    .filter((f) => path.extname(f).toLowerCase() === '.mp4')
    .map((f) => path.basename(f, '.mp4').toLowerCase())
);

const files = allFiles
  .filter((f) => {
    const ext = path.extname(f).toLowerCase();
    if (!IMAGE_EXT.includes(ext) && !VIDEO_EXT.includes(ext)) return false;
    if (CONVERT_EXT.includes(ext)) {
      const base = path.basename(f, path.extname(f)).toLowerCase();
      if (mp4Basenames.has(base)) return false;
    }
    return true;
  })
  .sort((a, b) => a.localeCompare(b, 'ru'));

let photoNum = 0;
let videoNum = 0;

function humanTitle(file, type) {
  const raw = path
    .basename(file, path.extname(file))
    .replace(/^photo[_\s-]+/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();

  const isGenericPhoto = type === 'image' && (/^\d{8,}/.test(raw) || /^photo/i.test(file));
  const isGenericVideo = type === 'video' && /^img\s*\d+/i.test(raw);

  if (isGenericPhoto) {
    photoNum += 1;
    return `Фото ${photoNum}`;
  }
  if (isGenericVideo) {
    videoNum += 1;
    return `Видео ${videoNum}`;
  }
  return raw || file;
}

const items = files.map((file) => {
  const ext = path.extname(file).toLowerCase();
  const type = VIDEO_EXT.includes(ext) ? 'video' : 'image';
  return { file, type, title: humanTitle(file, type) };
});

const manifest = {
  generated: new Date().toISOString(),
  folder: path.basename(VaP_DIR),
  items,
};

fs.writeFileSync(path.join(VaP_DIR, 'media.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`\nГотово: ${path.basename(VaP_DIR)}/media.json — ${items.length} файл(ов)`);
