export type CanonicalGlyph = {
  archetype: string;
  geometry: 'torus' | 'spiral' | 'circle' | 'triangle' | 'mandala' | 'lotus' | string;
  color: string;
  frequency: number;
};

export const canonicalGlyphs: Record<string, CanonicalGlyph> = {
  'torus-flow': { archetype: 'Renewal', geometry: 'torus', color: '#1e40af', frequency: 396 },
  'spiral-ascent': { archetype: 'Growth', geometry: 'spiral', color: '#7c3aed', frequency: 432 },
  'circle-unity': { archetype: 'Wholeness', geometry: 'circle', color: '#166534', frequency: 528 },
  'triangle-balance': { archetype: 'Harmony', geometry: 'triangle', color: '#d97706', frequency: 639 },
  'mandala-reflection': { archetype: 'Integration', geometry: 'mandala', color: '#64748b', frequency: 741 },
  'lotus-awakening': { archetype: 'Compassion', geometry: 'lotus', color: '#7c3aed', frequency: 852 }
};
