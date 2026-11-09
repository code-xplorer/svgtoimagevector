export interface SampleItem {
  id: string;
  name: string;
  category: string;
  description: string;
  svg: string;
}

export const SAMPLE_SVGS: SampleItem[] = [
  {
    id: 'gradient-star',
    name: 'Gradient Star Badge',
    category: 'Icons',
    description: 'Vibrant star icon with linear gradient fill and rounded stroke',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <defs>
    <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF6B6B" />
      <stop offset="100%" stop-color="#4ECDC4" />
    </linearGradient>
  </defs>
  <path d="M 12.00 2.00 L 15.09 8.26 L 22.00 9.27 L 17.00 14.14 L 18.18 21.02 L 12.00 17.77 L 5.82 21.02 L 7.00 14.14 L 2.00 9.27 L 8.91 8.26 Z" fill="url(#starGrad)" stroke="#1D1B20" stroke-width="0.8" stroke-linejoin="round" />
</svg>`
  },
  {
    id: 'android-mascot',
    name: 'Android Bot',
    category: 'Illustrations',
    description: 'The iconic Android mascot with antennas, head, eyes, body and limbs',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g id="android" fill="#3DDC84">
    <!-- Antennas -->
    <line x1="6.5" y1="2.5" x2="8.5" y2="5.5" stroke="#3DDC84" stroke-width="1" stroke-linecap="round" />
    <line x1="17.5" y1="2.5" x2="15.5" y2="5.5" stroke="#3DDC84" stroke-width="1" stroke-linecap="round" />
    <!-- Head -->
    <path d="M 5.0 10.0 C 5.0 6.0 8.0 4.0 12.0 4.0 C 16.0 4.0 19.0 6.0 19.0 10.0 Z" fill="#3DDC84" />
    <!-- Eyes -->
    <circle cx="8.5" cy="7.5" r="0.8" fill="#FFFFFF" />
    <circle cx="15.5" cy="7.5" r="0.8" fill="#FFFFFF" />
    <!-- Body -->
    <rect x="5.0" y="11.0" width="14.0" height="9.0" rx="1.0" fill="#3DDC84" />
    <!-- Left Arm -->
    <rect x="2.0" y="11.0" width="2.2" height="7.0" rx="1.1" fill="#3DDC84" />
    <!-- Right Arm -->
    <rect x="19.8" y="11.0" width="2.2" height="7.0" rx="1.1" fill="#3DDC84" />
    <!-- Left Leg -->
    <rect x="7.5" y="20.0" width="2.5" height="3.5" rx="1.25" fill="#3DDC84" />
    <!-- Right Leg -->
    <rect x="14.0" y="20.0" width="2.5" height="3.5" rx="1.25" fill="#3DDC84" />
  </g>
</svg>`
  },
  {
    id: 'radial-orb',
    name: 'Cyber Orb',
    category: 'Badges',
    description: 'Glowing sphere with radial gradient and concentric rings',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <defs>
    <radialGradient id="orbGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#00F2FE" />
      <stop offset="70%" stop-color="#4FACFE" />
      <stop offset="100%" stop-color="#000B29" />
    </radialGradient>
  </defs>
  <circle cx="12" cy="12" r="9.5" fill="url(#orbGlow)" stroke="#00F2FE" stroke-width="0.75" />
  <circle cx="12" cy="12" r="6" fill="none" stroke="#FFFFFF" stroke-width="0.5" stroke-dasharray="2 1" opacity="0.8" />
  <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" opacity="0.9" />
</svg>`
  },
  {
    id: 'compose-logo',
    name: 'Compose Multiplatform Emblem',
    category: 'Tech',
    description: 'Layered geometric shapes reminiscent of modern app logos',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7C4DFF" />
      <stop offset="100%" stop-color="#00B0FF" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF4081" />
      <stop offset="100%" stop-color="#FFAB40" />
    </linearGradient>
  </defs>
  <path d="M 6.0 16.0 L 16.0 6.0 L 26.0 16.0 L 16.0 26.0 Z" fill="url(#primaryGrad)" />
  <path d="M 12.0 16.0 L 16.0 12.0 L 20.0 16.0 L 16.0 20.0 Z" fill="url(#accentGrad)" />
  <circle cx="16" cy="16" r="2" fill="#FFFFFF" />
</svg>`
  },
  {
    id: 'verified-badge',
    name: 'Verified Check Badge',
    category: 'Icons',
    description: 'Clean verified checkmark in scalloped badge using evenodd fill rule',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2L14.4 3.7L17.2 3.1L18.4 5.7L21.1 6.8L20.8 9.7L22.5 12L20.8 14.3L21.1 17.2L18.4 18.3L17.2 20.9L14.4 20.3L12 22L9.6 20.3L6.8 20.9L5.6 18.3L2.9 17.2L3.2 14.3L1.5 12L3.2 9.7L2.9 6.8L5.6 5.7L6.8 3.1L9.6 3.7L12 2ZM10.5 15.5L16.2 9.8L14.8 8.4L10.5 12.7L8.7 10.9L7.3 12.3L10.5 15.5Z" fill="#1D9BF0" />
</svg>`
  },
  {
    id: 'heart-gradient',
    name: 'Heart Pulse',
    category: 'Icons',
    description: 'Soft heart icon with warm linear gradient',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <defs>
    <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF416C" />
      <stop offset="100%" stop-color="#FF4B2B" />
    </linearGradient>
  </defs>
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#heartGrad)" />
</svg>`
  }
];
