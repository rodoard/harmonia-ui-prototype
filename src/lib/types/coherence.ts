export type Breath = 'inhale' | 'exhale' | 'pause';
export type Tempo = 'slow' | 'steady' | 'fast';

export type GlyphPhase = { breath: Breath; tempo: Tempo };

export type BaseGlyph = {
  uuid: string;
  glyphIds: string[];
  userId: string;
  type: 'solo' | 'pair';
};

export type RenderableGlyph = BaseGlyph & {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  opacity: number;
  scale: number;
  pulsePhase: number;
  phase: GlyphPhase;
  coherenceMode?: boolean;
  pulseIntensity?: number;
  orbitCenterX?: number;
  orbitCenterY?: number;
  orbitRadius?: number;
  orbitAngle?: number;
  orbitSpeed?: number;
};

export type CorridorInstance = {
  id: string;
  type: 'individual' | 'group';
  glyphs: string[]; // RenderableGlyph uuids
  coherenceEventId?: string;
  opacity: number;
  intensity: number;
  coherenceLevel?: number;
  strength?: number;
  pulsePhase?: number;
};

export type CoherenceEventInstance = {
  id: string;
  type: 'exploration' | 'healing';
  corridors: string[]; // Corridor ids
  strength: number;
  x?: number;
  y?: number;
  radius?: number;
  opacity?: number;
};
