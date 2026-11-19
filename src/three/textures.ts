import * as THREE from 'three';
import { WasteCategory } from '../data/wasteItems';

export function createWoodFloorTexture(anisotropy: number, warmTone = '#C9935B'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = warmTone;
  ctx.fillRect(0, 0, 512, 512);

  const plankHeight = 64;
  for (let row = 0; row < 8; row += 1) {
    const y = row * plankHeight;
    ctx.fillStyle = row % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(120,60,15,0.07)';
    ctx.fillRect(0, y, 512, plankHeight);

    // Subtle wood grain streaks
    ctx.strokeStyle = 'rgba(110, 55, 18, 0.14)';
    ctx.lineWidth = 2;
    for (let g = 0; g < 4; g += 1) {
      const gy = y + 12 + g * 14;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(160, gy + 4, 340, gy - 4, 512, gy);
      ctx.stroke();
    }

    // Plank seam
    ctx.strokeStyle = 'rgba(92, 44, 12, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    const offset = (row % 2) * 128 + 64;
    ctx.beginPath();
    ctx.moveTo(offset, y);
    ctx.lineTo(offset, y + plankHeight);
    ctx.moveTo((offset + 256) % 512, y);
    ctx.lineTo((offset + 256) % 512, y + plankHeight);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  tex.anisotropy = anisotropy;
  return tex;
}

export function createGrassTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5BB347';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 420; i += 1) {
    const x = (i * 73) % 512;
    const y = (i * 137) % 512;
    ctx.fillStyle = i % 2 === 0 ? '#6CC955' : '#4C9F3A';
    ctx.fillRect(x, y, 8, 16);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.anisotropy = anisotropy;
  return tex;
}

export function createChalkboardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep matte school chalkboard green
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#1D4D37');
  grad.addColorStop(1, '#163D2B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle chalk dust smudge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.ellipse(512, 260, 380, 140, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chalk Title
  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.font = 'bold 62px "Fredoka", "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AYO PILAH SAMPAH!', 512, 145);

  ctx.fillStyle = '#BBF7D0';
  ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Organik  ·  Anorganik  ·  B3', 512, 225);

  // Chalk decorative doodles (leaf, sun, star)
  ctx.strokeStyle = '#FDE047';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(170, 150, 36, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#86EFAC';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(830, 190);
  ctx.quadraticCurveTo(860, 110, 910, 130);
  ctx.quadraticCurveTo(890, 200, 830, 190);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

export function createBinLabelTexture(
  category: WasteCategory,
  anisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cfg = {
    organik: {
      bg: '#DCFCE7',
      border: '#15803D',
      title: 'ORGANIK',
      sub: 'Sisa Makanan & Daun',
      iconBg: '#16A34A',
    },
    anorganik: {
      bg: '#FEF3C7',
      border: '#B45309',
      title: 'ANORGANIK',
      sub: 'Plastik, Kertas & Kaleng',
      iconBg: '#D97706',
    },
    b3: {
      bg: '#FEE2E2',
      border: '#B91C1C',
      title: 'B3',
      sub: 'Berbahaya & Beracun',
      iconBg: '#DC2626',
    },
  }[category];

  // Crisp rounded plaque card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = cfg.bg;
  ctx.fillRect(20, 20, 472, 472);

  ctx.strokeStyle = cfg.border;
  ctx.lineWidth = 18;
  ctx.strokeRect(24, 24, 464, 464);

  // Emblem circle
  ctx.fillStyle = cfg.iconBg;
  ctx.beginPath();
  ctx.arc(256, 175, 92, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (category === 'organik') {
    // Leaf shape
    ctx.beginPath();
    ctx.moveTo(212, 215);
    ctx.quadraticCurveTo(215, 130, 300, 130);
    ctx.quadraticCurveTo(295, 215, 212, 215);
    ctx.fill();
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(212, 215);
    ctx.lineTo(272, 155);
    ctx.stroke();
  } else if (category === 'anorganik') {
    // Recycle triangle arrows
    ctx.beginPath();
    ctx.moveTo(256, 120);
    ctx.lineTo(306, 205);
    ctx.lineTo(206, 205);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Hazard exclamation triangle
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(256, 114);
    ctx.lineTo(316, 218);
    ctx.lineTo(196, 218);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(256, 146);
    ctx.lineTo(256, 182);
    ctx.stroke();
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.arc(256, 202, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title text
  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.font = 'bold 64px "Fredoka", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cfg.title, 256, 355);

  ctx.fillStyle = cfg.border;
  ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(cfg.sub, 256, 420);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createRugPatternTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 28;
  ctx.strokeRect(28, 28, 456, 456);

  ctx.strokeStyle = '#0EA5E9';
  ctx.lineWidth = 14;
  ctx.strokeRect(68, 68, 376, 376);

  ctx.fillStyle = '#FDBA74';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(140 + i * 76, 256, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

export function createClockFaceTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.stroke();

  // 12 hour markers
  for (let i = 0; i < 12; i += 1) {
    const ang = (i * Math.PI * 2) / 12;
    ctx.strokeStyle = i % 3 === 0 ? '#0F172A' : '#64748B';
    ctx.lineWidth = i % 3 === 0 ? 7 : 4;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(ang) * 84, 128 + Math.sin(ang) * 84);
    ctx.lineTo(128 + Math.cos(ang) * 102, 128 + Math.sin(ang) * 102);
    ctx.stroke();
  }

  // Hour & Minute hands (pointing to ~10:10)
  ctx.strokeStyle = '#0F172A';
  ctx.lineCap = 'round';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(84, 96);
  ctx.stroke();

  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(182, 82);
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(128, 128, 10, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

export function createWallArtTexture(
  kind: 'piket' | 'eco' | 'hills' | 'sunny',
  anisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  if (kind === 'piket') {
    ctx.fillStyle = '#FFFBEB';
    ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(0, 0, 512, 84);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 38px "Fredoka", sans-serif';
    ctx.fillText('JADWAL PIKET', 256, 56);

    const cols = ['#DBEAFE', '#DCFCE7', '#FEF3C7', '#FCE7F3'];
    for (let r = 0; r < 2; r += 1) {
      for (let c = 0; c < 2; c += 1) {
        const x = 28 + c * 236;
        const y = 108 + r * 124;
        ctx.fillStyle = cols[r * 2 + c];
        ctx.fillRect(x, y, 220, 108);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 220, 108);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 22, y + 26, 140, 14);
        ctx.fillStyle = '#64748B';
        ctx.fillRect(x + 22, y + 54, 170, 10);
        ctx.fillRect(x + 22, y + 74, 120, 10);
      }
    }
  } else if (kind === 'eco') {
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#16A34A';
    ctx.fillRect(0, 0, 512, 84);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 38px "Fredoka", sans-serif';
    ctx.fillText('KELAS HIJAU', 256, 56);

    const circles = [
      { x: 112, c: '#22C55E', label: 'ORGANIK' },
      { x: 256, c: '#F59E0B', label: 'ANORGANIK' },
      { x: 400, c: '#EF4444', label: 'B3' },
    ];
    circles.forEach((item) => {
      ctx.fillStyle = item.c;
      ctx.beginPath();
      ctx.arc(item.x, 200, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(item.label, item.x, 294);
    });
  } else if (kind === 'hills') {
    ctx.fillStyle = '#BAE6FD';
    ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(390, 96, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.arc(140, 390, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(370, 400, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(130, 95, 34, 0, Math.PI * 2);
    ctx.arc(165, 90, 42, 0, Math.PI * 2);
    ctx.arc(205, 98, 30, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.arc(256, 210, 88, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0EA5E9';
    ctx.fillRect(0, 240, 512, 144);
    ctx.fillStyle = '#FDBA74';
    ctx.fillRect(190, 265, 132, 12);
    ctx.fillRect(216, 294, 80, 10);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

