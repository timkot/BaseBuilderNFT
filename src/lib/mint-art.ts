export type MemePicture = {
  meme: {
    id: string;
    name: string;
    emoji: string;
    mood: string;
    tagline: string;
  };
  timestamp: string;
  isoTimestamp: string;
  palette: {
    background: string;
    card: string;
    accent: string;
    text: string;
    muted: string;
  };
  seed: string;
};

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function svgFromPicture(p: MemePicture, opts?: { size?: number }) {
  const size = opts?.size ?? 512;
  const cardPadding = size * 0.12;
  const cardWidth = size - cardPadding * 2;
  const cardHeight = size - cardPadding * 2;
  const cardX = cardPadding;
  const cardY = cardPadding;
  const contentCenterX = cardX + cardWidth / 2;
  const radius = size * 0.04;
  const accentBarHeight = size * 0.015;
  const taglineLines = p.meme.tagline
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const emojiFont = size * 0.18;
  const nameFont = size * 0.08;
  const taglineFont = size * 0.045;
  const moodFont = size * 0.035;
  const timestampFont = size * 0.034;
  const taglineSpacing = taglineFont * 1.2;

  const moodY = cardY + cardHeight * 0.24;
  const emojiY = moodY + emojiFont * 0.9;
  const nameY = emojiY + nameFont * 0.8;
  const taglineStartY = nameY + taglineSpacing;
  const timestampY = cardY + cardHeight - taglineSpacing;

  const gradientId = `glow-${p.seed.slice(0, 8)}`;

  const svg =
    `<?xml version='1.0' encoding='UTF-8'?>` +
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>` +
    `<defs>` +
    `<radialGradient id='${gradientId}' cx='50%' cy='50%' r='55%'>` +
    `<stop offset='0%' stop-color='${p.palette.accent}' stop-opacity='0.25'/>` +
    `<stop offset='100%' stop-color='${p.palette.background}' stop-opacity='0.05'/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect width='100%' height='100%' fill='${p.palette.background}'/>` +
    `<rect x='${cardX}' y='${cardY}' width='${cardWidth}' height='${cardHeight}' rx='${radius * 4}' fill='${
      p.palette.card
    }'/>` +
    `<rect x='${cardX}' y='${cardY}' width='${cardWidth}' height='${accentBarHeight}' rx='${accentBarHeight / 2}' fill='${
      p.palette.accent
    }' opacity='0.35'/>` +
    `<circle cx='${cardX + radius * 2}' cy='${cardY + radius * 2}' r='${radius}' fill='${
      p.palette.accent
    }' opacity='0.4'/>` +
    `<circle cx='${contentCenterX}' cy='${cardY + cardHeight / 2}' r='${
      cardWidth / 2
    }' fill='url(#${gradientId})' opacity='0.35'/>` +
    `<text x='${contentCenterX}' y='${moodY}' fill='${
      p.palette.muted
    }' font-family='"Space Grotesk", "Inter", "Helvetica Neue", Arial, sans-serif' font-size='${moodFont}' letter-spacing='6' text-anchor='middle'>${escapeXml(
      p.meme.mood.toUpperCase()
    )}</text>` +
    `<text x='${contentCenterX}' y='${emojiY}' fill='${
      p.palette.accent
    }' font-family='"Apple Color Emoji", "Segoe UI Emoji", sans-serif' font-size='${emojiFont}' text-anchor='middle'>${escapeXml(
      p.meme.emoji
    )}</text>` +
    `<text x='${contentCenterX}' y='${nameY}' fill='${
      p.palette.text
    }' font-family='"Space Grotesk", "Inter", "Helvetica Neue", Arial, sans-serif' font-size='${nameFont}' font-weight='600' text-anchor='middle'>${escapeXml(
      p.meme.name
    )}</text>` +
    taglineLines
      .map((line, idx) => {
        const y = taglineStartY + idx * taglineSpacing;
        return `<text x='${contentCenterX}' y='${y}' fill='${
          p.palette.text
        }' font-family='"Inter", "Helvetica Neue", Arial, sans-serif' font-size='${taglineFont}' text-anchor='middle'>${escapeXml(
          line
        )}</text>`;
      })
      .join('') +
    `<line x1='${cardX + radius}' y1='${timestampY - taglineSpacing * 0.7}' x2='${cardX + cardWidth - radius}' y2='${
      timestampY - taglineSpacing * 0.7
    }' stroke='${p.palette.muted}' stroke-width='1' stroke-opacity='0.3'/>` +
    `<text x='${cardX + radius}' y='${timestampY}' fill='${
      p.palette.muted
    }' font-family='"Inter", "Helvetica Neue", Arial, sans-serif' font-size='${timestampFont}' text-anchor='start'>${escapeXml(
      p.timestamp
    )}</text>` +
    `<text x='${cardX + cardWidth - radius}' y='${timestampY}' fill='${
      p.palette.muted
    }' font-family='"Space Grotesk", "Inter", "Helvetica Neue", Arial, sans-serif' font-size='${timestampFont}' text-anchor='end'>${escapeXml(
      p.meme.id.toUpperCase()
    )}</text>` +
    `</svg>`;

  return svg;
}

export function svgToDataUrl(svg: string) {
  const b64 =
    typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(svg))) : Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}
