import type { BaseGlyph, CorridorInstance, CoherenceEventInstance } from '../types/coherence';

export const coherenceData: {
  glyphs: BaseGlyph[];
  corridors: CorridorInstance[];
  coherenceEvents: CoherenceEventInstance[];
} = {
  glyphs: [
    { uuid: 'g1', glyphIds: ['torus-flow'], userId: 'u1', type: 'solo' },
    { uuid: 'g2', glyphIds: ['spiral-ascent'], userId: 'u2', type: 'solo' },
    { uuid: 'g3', glyphIds: ['circle-unity'], userId: 'u3', type: 'solo' },
    { uuid: 'g4', glyphIds: ['triangle-balance'], userId: 'u4', type: 'solo' },
    { uuid: 'g5', glyphIds: ['mandala-reflection'], userId: 'u5', type: 'solo' },
    { uuid: 'g6', glyphIds: ['lotus-awakening'], userId: 'u6', type: 'solo' },
    { uuid: 'g7', glyphIds: ['torus-flow', 'spiral-ascent'], userId: 'u7', type: 'pair' },
    { uuid: 'g8', glyphIds: ['circle-unity', 'triangle-balance'], userId: 'u8', type: 'pair' },
    { uuid: 'g9', glyphIds: ['mandala-reflection'], userId: 'u9', type: 'solo' },
    { uuid: 'g10', glyphIds: ['lotus-awakening'], userId: 'u10', type: 'solo' },
    { uuid: 'g11', glyphIds: ['spiral-ascent'], userId: 'u11', type: 'solo' },
    { uuid: 'g12', glyphIds: ['circle-unity'], userId: 'u12', type: 'solo' },
    { uuid: 'g13', glyphIds: ['triangle-balance'], userId: 'u13', type: 'solo' },
    { uuid: 'g14', glyphIds: ['mandala-reflection'], userId: 'u14', type: 'solo' },
    { uuid: 'g15', glyphIds: ['torus-flow'], userId: 'u15', type: 'solo' }
  ],
  corridors: [
    { id: 'c1', type: 'individual', glyphs: ['g1'], opacity: 0, intensity: 0 },
    { id: 'c2', type: 'group', glyphs: ['g2', 'g3', 'g4'], coherenceEventId: 'e1', opacity: 0, intensity: 0 },
    { id: 'c3', type: 'group', glyphs: ['g5', 'g6', 'g7'], coherenceEventId: 'e1', opacity: 0, intensity: 0 },
    { id: 'c4', type: 'individual', glyphs: ['g8'], opacity: 0, intensity: 0 },
    { id: 'c5', type: 'group', glyphs: ['g9', 'g10', 'g11', 'g12'], coherenceEventId: 'e2', opacity: 0, intensity: 0 },
    { id: 'c6', type: 'group', glyphs: ['g13', 'g14', 'g15'], opacity: 0, intensity: 0 }
  ],
  coherenceEvents: [
    // The original data showed only e2; if e1 is needed later, it can be added back.
    { id: 'e2', type: 'healing', corridors: ['c5'], strength: 4 }
  ]
};
