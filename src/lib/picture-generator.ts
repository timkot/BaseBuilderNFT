import { MemePicture, svgFromPicture, svgToDataUrl } from './mint-art';

export interface GeneratedPicture extends MemePicture {
  dataUrl: string;
}

type MemePalette = MemePicture['palette'];

interface MemeTemplate {
  id: string;
  name: string;
  emoji: string;
  moods: string[];
  leadLines: string[];
  subLines: string[];
  palettes: MemePalette[];
}

const MEME_LIBRARY: MemeTemplate[] = [
  {
    id: 'pepe',
    name: 'Pepe Builder',
    emoji: '🐸',
    moods: ['Comfy Focus', 'Greenlight', 'Zen Mode', 'GM Energy', 'Stackin Blocks'],
    leadLines: [
      'Feels good to build',
      'Shipping with a grin',
      'Stay comfy, ser',
      'No rug, only hugs',
      'Pepe pair programming tonight'
    ],
    subLines: [
      'Meme labs on Base',
      'Minting vibes not rugs',
      'Gasless frogs forever',
      'Spreadsheet? Nah, shipping art',
      'Keep calm, wagmi'
    ],
    palettes: [
      { background: '#0f172a', card: '#111c2d', accent: '#4ade80', text: '#f8fafc', muted: '#94a3b8' },
      { background: '#101923', card: '#132130', accent: '#22d3ee', text: '#e2e8f0', muted: '#94a3b8' }
    ]
  },
  {
    id: 'doge',
    name: 'Doge Velocity',
    emoji: '🐕',
    moods: ['Wow Energy', 'Base Speed', 'Moon Ready', 'Barkchain', 'Turbo Builder'],
    leadLines: [
      'Such mint, very Base',
      'Blazing through blocks',
      'Infinite meme supply',
      'Frontrunning vibes only',
      'Fast like your reflexes after coffee'
    ],
    subLines: [
      'Gas sponsored flow',
      'Only vibes, no stress',
      'Stay hydrated fren',
      'No sleep till mainnet',
      'Bark twice if bullish'
    ],
    palettes: [
      { background: '#1d1a28', card: '#221f31', accent: '#f59e0b', text: '#f8fafc', muted: '#a1a1aa' },
      { background: '#171621', card: '#1f1e2c', accent: '#facc15', text: '#f5f5f5', muted: '#9ca3af' }
    ]
  },
  {
    id: 'wojak',
    name: 'Wojak Calm',
    emoji: '🧠',
    moods: ['Deep Build', 'Still Water', 'Soft Focus', 'Stealth Shipping', 'Mind Palace'],
    leadLines: [
      'We ship in silence',
      'Bear market yoga',
      'Composure unlocked',
      'Tap, deploy, meditate',
      'Roadmap? Only vibes'
    ],
    subLines: [
      'Base accounts stay ready',
      'One block at a time',
      'Signals only, ser',
      'Serenity in standups',
      'Snacks stocked, code locked'
    ],
    palettes: [
      { background: '#0d161b', card: '#101c24', accent: '#60a5fa', text: '#e0f2fe', muted: '#94a3b8' },
      { background: '#0f1b25', card: '#12212c', accent: '#a855f7', text: '#e9d5ff', muted: '#a5b4fc' }
    ]
  },
  {
    id: 'cat',
    name: 'Pixel Cat',
    emoji: '😺',
    moods: ['Soft Launch', 'Night Shift', 'Glow Mode', 'Debug Purr', 'Sneak Drop'],
    leadLines: [
      'Paws on the keys',
      'Minting midnight loops',
      'Nine lives, endless drops',
      'Laser eyes on staging',
      'Shipping between cat naps'
    ],
    subLines: [
      'Auto approvals engaged',
      'Base vibes stay cozy',
      'Stretch, ship, repeat',
      'Donut stash on standby',
      'Deploy at first light'
    ],
    palettes: [
      { background: '#14131c', card: '#181925', accent: '#f472b6', text: '#fdf2f8', muted: '#c4b5fd' },
      { background: '#151822', card: '#171c27', accent: '#fb7185', text: '#fee2e2', muted: '#fda4af' }
    ]
  },
  {
    id: 'wizard',
    name: 'Gasless Wizard',
    emoji: '🧙',
    moods: ['Contract Sorcery', 'Paymaster Aura', 'Deployer Supreme', 'On-Chain Ritual', 'Alchemy Mode'],
    leadLines: [
      'Summoning flawless bytecode',
      'Scroll of allowlist etched',
      'Casting sponsored spells',
      'Chaotic neutral devops',
      'ABI incantations ready'
    ],
    subLines: [
      'Base nodes hum at dawn',
      'Runes of wallet_sendCalls',
      'Potion of infinite test ETH',
      'Slaying flaky tests live',
      'Bridge trolls stand aside'
    ],
    palettes: [
      { background: '#0b1021', card: '#111836', accent: '#38bdf8', text: '#dbeafe', muted: '#94a3b8' },
      { background: '#090f1d', card: '#0f1a2d', accent: '#c084fc', text: '#ede9fe', muted: '#a3a3b4' }
    ]
  },
  {
    id: 'anon',
    name: 'Anon Alpha',
    emoji: '🕶️',
    moods: ['Stealth Drop', 'Alpha Leak', 'Dark Mode Builder', 'Shadow Ship', 'Ghost Commit'],
    leadLines: [
      'Anon but still accountable',
      'Shipping behind VPNs',
      'Keyboard clacks in silence',
      'Ghosting meetings, not merges',
      'Alpha lives in draft PRs'
    ],
    subLines: [
      'Docs redacted for style',
      'Standups via anon DM',
      'KPIs? Only vibes',
      'Deploy first, tweet later',
      'Back to the bunker ser'
    ],
    palettes: [
      { background: '#050607', card: '#0b0d10', accent: '#64748b', text: '#e2e8f0', muted: '#94a3b8' },
      { background: '#07090c', card: '#0f1318', accent: '#f87171', text: '#fee2e2', muted: '#94a3b8' }
    ]
  },
  {
    id: 'ape',
    name: 'Builder Ape',
    emoji: '🦧',
    moods: ['Heavy Shipping', 'Banana Fuel', 'Merge Mode', 'Standup Swing', 'Launchpad'],
    leadLines: [
      'Bananas for Base',
      'PRs shipping with extra potassium',
      'Climb the roadmap tree',
      'Slinging commits like vines',
      'Deploy button go brrr'
    ],
    subLines: [
      'Retro after retro',
      'Can someone mute the monkeys?',
      'Roadmap taped to cave wall',
      'Fresh coffee from the canopy',
      'QA done by throwing bananas'
    ],
    palettes: [
      { background: '#1a1611', card: '#221c15', accent: '#fbbf24', text: '#fef3c7', muted: '#d6d3d1' },
      { background: '#1a1511', card: '#1f1913', accent: '#f97316', text: '#ffedd5', muted: '#d6d3d1' }
    ]
  }
];

const EXTRA_PUNCHLINES = [
  'Standup lasted 4 memecoins',
  'No meetings, only mintings',
  'Roadmap powered by cold brew',
  'Retro action item: keep vibing',
  'Giga brain mode engaged',
  'Burner phone on Do Not Disturb',
  'Shipped before the meme expired',
  'Deploy, tweet, hydrate, repeat',
  'All hands replaced by all memes',
  'If it compiles we celebrate',
  'Composability > composure',
  'Builders gonna build, memes gonna meme'
];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generatePicture(): GeneratedPicture {
  const now = new Date();
  const timestamp = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);
  const isoTimestamp = now.toISOString();

  const template = pick(MEME_LIBRARY);
  const palette = { ...pick(template.palettes) };
  const mood = pick(template.moods);
  const lead = pick(template.leadLines);
  const sub = pick(template.subLines);
  const includePunchline = Math.random() > 0.4;
  const parts = [lead, sub];
  if (includePunchline) {
    parts.push(pick(EXTRA_PUNCHLINES));
  }
  const tagline = parts.join('\n');
  const seed = `${template.id}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

  const meme = {
    id: template.id,
    name: template.name,
    emoji: template.emoji,
    mood,
    tagline
  };

  const picture: MemePicture = {
    meme,
    timestamp,
    isoTimestamp,
    palette,
    seed
  };

  const svg = svgFromPicture(picture, { size: 512 });
  const dataUrl = svgToDataUrl(svg);

  return { ...picture, dataUrl };
}
