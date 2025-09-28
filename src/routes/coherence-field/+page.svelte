<script lang="ts">
  import { onMount } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { goto } from '$app/navigation';
  import type { RenderableGlyph, BaseGlyph, CorridorInstance, CoherenceEventInstance, Breath, Tempo } from '$lib/types/coherence';
  import { coherenceData } from '$lib/data/coherenceData';
  import { canonicalGlyphs } from '$lib/data/canonicalGlyphs';

  // Scenario state: null (selection screen), 1 (glyphs only), 2 (glyphs + corridors), 3 (full with coherence event)
  let scenario = $state<number | null>(null);
  
  // Notification state for scenario 1
  let notifyClicked = $state(false);

  // Lifecycle phases
  let currentPhase = $state('');
  let phaseProgress = new Tween(0, { duration: 1000, easing: cubicOut });
  
  // Glyph positions and states
  let glyphPositions = $state<RenderableGlyph[]>([]);
  let corridorConnections: any[] = [];
  let visibleGlyphs = $state<number[]>([]);
  let visibleCorridors = $state<CorridorInstance[]>([]);
  let visibleCoherenceEvents = $state<CoherenceEventInstance[]>([]);

  // Animation state
  let animationStarted = $state(false);
  let stopRequested = $state(false);
  let coherenceLevel = $state(0); // Track field coherence level (0-100%)
  let traceArtifactCreated = $state(false); // Track if trace artifact has been created
  let completedPhases = $state<Set<string>>(new Set()); // Track which phases have completed

  // Canvas and glyph boundary config - make responsive to viewport
  let GLYPH_RADIUS = $state(20); // base glyph radius (will be scaled to fit)

  // Calculate canvas size based on viewport
  let CANVAS_WIDTH = $state(800);
  let CANVAS_HEIGHT = $state(800);
  
  // Get the full canvas boundaries
  function getCanvasBoundaries() {
    return {
      minX: 0,
      maxX: CANVAS_WIDTH,
      minY: 0,
      maxY: CANVAS_HEIGHT
    };
  }

  // Update canvas size on mount and resize
  onMount(() => {
    const updateCanvasSize = () => {
      const container = document.querySelector('.visualization-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        CANVAS_WIDTH = Math.floor(rect.width * 0.9); // 90% of container width
        CANVAS_HEIGHT = Math.floor(rect.height * 0.9); // 80% of container height
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  });

  function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
  const BASE_CORRIDOR_RADIUS = $derived(GLYPH_RADIUS * 3);
  const BASE_EVENT_RADIUS = $derived(BASE_CORRIDOR_RADIUS * 3);

  onMount(() => {
    initializeGlyphs();
  });

  function initializeGlyphs() {
    const glyphCount = coherenceData.glyphs.length;
  
    // Calculate the smallest square grid that can fit all glyphs
    const gridSize = Math.ceil(Math.sqrt(glyphCount));
    const cols = gridSize;
    const rows = gridSize;
    const cellSize = CANVAS_WIDTH/cols;

    // Calculate the center point of each cell
    const getCellCenter = (col: number, row: number) => {
      // Calculate position within the cell
      const cellX = col * cellSize + (cellSize / 2);
      const cellY = row * cellSize + (cellSize / 2);
      
      // Ensure position stays within canvas bounds
      return {
        x: cellX,
        y: cellY
      };
    };
    
    // Place glyphs in the grid cells
    glyphPositions = coherenceData.glyphs.map<RenderableGlyph>((glyph, index) => {
      // Calculate grid position (left to right, top to bottom)
      const col = index % cols;
      const row = Math.floor(index / cols);
        // Generate random phase for each glyph
      const breathOptions = ['inhale', 'exhale', 'pause'] as const;
      const tempoOptions = ['slow', 'steady', 'fast'] as const;

      // Get the center of the cell
      const { x, y } = getCellCenter(col, row);

      return {
        ...glyph,
        x: x,
        y: y,
        originalX: x,
        originalY: y,
        opacity: 0,
        scale: 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
        phase: {
          breath: breathOptions[Math.floor(Math.random() * breathOptions.length)],
          tempo: tempoOptions[Math.floor(Math.random() * tempoOptions.length)]
        }
      };
    });
  }

  // Get pulse duration based on tempo
  function getPulseDuration(tempo: Tempo): number {
    switch (tempo) {
      case 'slow': return 5000; // 5 seconds
      case 'steady': return 3000; // 3 seconds
      case 'fast': return 1500; // 1.5 seconds
      default: return 3000;
    }
  }

  // Get pulse scale based on breath
  function getPulseScale(breath: Breath, progress: number): number {
    switch (breath) {
      case 'inhale':
        // Gentle expansion
        return 1 + (Math.sin(progress * Math.PI) * 0.2);
      case 'exhale':
        // Contraction with glow
        return 1 - (Math.sin(progress * Math.PI) * 0.15);
      case 'pause':
        // Steady heartbeat-like glow
        return 1 + (Math.sin(progress * Math.PI * 2) * 0.1);
      default:
        return 1;
    }
  }

  // Get pulse opacity based on breath
  function getPulseOpacity(breath: Breath, progress: number): number {
    switch (breath) {
      case 'inhale':
        return 0.8 + (Math.sin(progress * Math.PI) * 0.2);
      case 'exhale':
        // Brief glow as it shrinks
        return 0.9 + (Math.sin(progress * Math.PI) * 0.3);
      case 'pause':
        // Stable glow
        return 0.85 + (Math.sin(progress * Math.PI * 2) * 0.15);
      default:
        return 0.8;
    }
  }

  // Get shimmer effect based on frequency
  function getShimmerIntensity(frequency: number): number {
    // Higher frequency = more shimmer
    return Math.max(0.5, Math.min(2.0, frequency / 500));
  }

  async function startLifecycleAnimation() {
    if (animationStarted || scenario === null) return;
    
    animationStarted = true;
    stopRequested = false;
    completedPhases.clear()
    traceArtifactCreated = false; // Reset trace artifact state
    
    // Initialize data based on scenario
    initializeScenarioData();
    
   // Phase 1: Queueing
   currentPhase = 'queueing';
      await animateQueueing();
      if (stopRequested) return handleAnimationStop();
      completedPhases.add('queueing');
   
    // Phase 2: Formation (20-30 seconds)
    currentPhase = 'formation';
    await animateFormation();
    completedPhases.add('formation');

    if (stopRequested || scenario===1) {
      await disolve()
    }
    
    // Phase 3: Coherence (20-30 seconds)
    currentPhase = 'coherence';
    await animateCoherence();
    if (stopRequested) {
      currentPhase = 'dissolving';
      await animateDissolving(22000);
      animationStarted = false;
      stopRequested = false;
      return;
    }
    
    // Phase 4: Dissolving (20-30 seconds)
    currentPhase = 'dissolving';
    await animateDissolving(22000);

    // Animation complete - reset for potential restart
    animationStarted = false;
    currentPhase = '';
  }

  async function dissolve() {
    if (!animationStarted) return;
    // Run dissolving animation to fade out gracefully
    currentPhase = 'dissolving';
    await animateDissolving(3000); // Short dissolve for smooth fade-out
    // Reset all state including feedback
    animationStarted = false;
    currentPhase = '';
    notifyClicked = false;
    visibleGlyphs = [];
    visibleCorridors = [];
    visibleCoherenceEvents = [];
    completedPhases.clear();
    coherenceLevel = 0;
    traceArtifactCreated = false;
    visibleCoherenceEvents = [];
  }

  async function stopLifecycle() {
    if (!animationStarted) return;
    // Signal running loops to abort ASAP
    stopRequested = true;
    await dissolve();
    // Don't clear glyphPositions - preserve spiral layout!

    // Reset glyph states but keep positions
    glyphPositions.forEach(glyph => {
      glyph.opacity = 0;
      glyph.scale = 0.5;
    });
  }

  function initializeScenarioData() {
    // Reset all data but preserve carefully calculated glyph positions
    visibleGlyphs = [];
    visibleCorridors = [];
    visibleCoherenceEvents = [];

    // Reset glyph states but keep their spiral positions
    glyphPositions.forEach(glyph => {
      glyph.opacity = 0;
      glyph.scale = 0.8;
      // Don't change x, y - preserve spiral positions!
    });

    // Initialize corridors based on scenario
    if ((scenario ?? 0) >= 2) {
      coherenceData.corridors.forEach(corridor => {
        corridor.opacity = 0;
        corridor.intensity = 0;
      });
    }

    // Initialize coherence events based on scenario
    if ((scenario ?? 0) >= 3) {
      coherenceData.coherenceEvents.forEach(event => {
        event.opacity = 0;
      });
    }
  }

  function handleAnimationStop() {
    currentPhase = 'dissolving';
    completedPhases = new Set();
    return animateDissolving(22000).finally(() => {
      animationStarted = false;
      stopRequested = false;
    });
  }

  async function animateQueueing() {
    console.log('Starting Queueing phase - faint, random motion, slow moving...');
    
    // Glyphs appear one by one with gentle floating motion
    for (let i = 0; i < glyphPositions.length; i++) {
      if (stopRequested) break;
      visibleGlyphs = [...visibleGlyphs, i];
      
      // Animate glyph appearance
      const glyph = glyphPositions[i];
      glyph.opacity = 0.3; // Faint
      glyph.scale = 0.8;
      
      // Smooth entrance animation
      setTimeout(() => {
        glyph.opacity = 0.6; // Still faint
        glyph.scale = 1;
        glyphPositions = [...glyphPositions];
      }, 100);
      
      // Slow appearance but abortable
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (stopRequested) break;
    }
    
    // Hold phase with gentle floating animation and random motion
    const floatAnimation = setInterval(() => {
      if (stopRequested) {
        clearInterval(floatAnimation);
        return;
      }
      glyphPositions.forEach(glyph => {
        // Random drift motion
        glyph.x += (Math.random() - 0.5) * 2; // Slow moving
        glyph.y += (Math.random() - 0.5) * 2;
        
        // Keep within bounds fully inside canvas
        clampGlyphPosition(glyph);
      });
      glyphPositions = [...glyphPositions];
    }, 200);
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // 25 seconds
    clearInterval(floatAnimation);
  }

  async function animateFormation() {
    console.log('Starting Formation phase - glyphs move to form corridors...');
    
    // Group glyphs according to corridors with orbital motion
    for (let corridorIndex = 0; corridorIndex < coherenceData.corridors.length; corridorIndex++) {
      if (stopRequested) break;
        const corridor = coherenceData.corridors[corridorIndex];
        const glyphsInCorridor = [];

        // Find glyphs that belong to this corridor
        for (let glyphId of corridor.glyphs) {
          const glyphIndex = glyphPositions.findIndex(g => g.uuid === glyphId);
          if (glyphIndex !== -1) {
            glyphsInCorridor.push(glyphIndex);
          }
        }

        // Add corridor and fade in after placing glyphs
        corridor.opacity = 0;
        corridor.intensity = 0;
        visibleCorridors = [...visibleCorridors, corridor];
        setTimeout(() => {
          corridor.opacity = 0.7;
          corridor.intensity = 1;
          visibleCorridors = [...visibleCorridors];
        }, 1500);

        await new Promise(resolve => setTimeout(resolve, 2000));
        if (stopRequested) break;
      }
      // No orbital animation needed - positions are static
      await new Promise(resolve => setTimeout(resolve, 5000)); // 10 seconds
    } 


  async function animateCoherence() {
    console.log('Starting Coherence phase - stable, luminous, corridors move in synchrony...');
    
    // Update coherence level based on scenario
    coherenceLevel = 100; // Full coherence for scenario 3
    
    // Only proceed with coherence effects for scenario 3
    if ((scenario ?? 0) >= 2) {
      // Intensify all connections and create synchronized motion
      visibleCorridors.forEach((corridor, index) => {
        corridor.intensity = 2;
        corridor.opacity = 1;
        
        // Add synchronized pulsing effect
        corridor.pulsePhase = index * (Math.PI / 4);
      });
      
      // Add coherence events if scenario >= 3
      if ((scenario ?? 0) >= 3) {
        // Update glyph motion to be synchronized within coherence events
        const coherenceEvents = coherenceData.coherenceEvents;
        coherenceEvents.forEach(event => {          // Add coherence event to visible list
          event.opacity = 0.8;
          visibleCoherenceEvents = [...visibleCoherenceEvents, event];
        });
      }
      
      // No orbital animation needed during coherence - positions remain static
      visibleCorridors = [...visibleCorridors];
      glyphPositions = [...glyphPositions];
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
    } else {
      // Scenario 1: Just intensify glyph brightness and add gentle pulsing
      glyphPositions.forEach(glyph => {
        glyph.opacity = 1;
        glyph.pulseIntensity = 1.2;
      });
      glyphPositions = [...glyphPositions];
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
    }
  }

  async function animateEmergence() {
    console.log('Starting Emergence phase - trace artifact forming...');
    currentPhase = 'emergence';
    
    // Simulate trace artifact creation
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds for emergence
    traceArtifactCreated = true;
    completedPhases.add('emergence');
    
    // Pause before dissolving
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
  }

  async function animateDissolving(maxDurationMs: number = 22000) {
    console.log('Starting Dissolving phase - glow fades, components scatter outward...');
    currentPhase = 'dissolving';
    const startTime = Date.now();
    
    // Gradually reduce coherence level during dissolving
    const startCoherence = coherenceLevel;
    const endCoherence = 0;
    const duration = maxDurationMs;
    
    // Process outermost components first (coherence events)
    for (const event of coherenceData.coherenceEvents) {
      if (Date.now() - startTime > maxDurationMs) break;
      const eventCorridors = visibleCorridors.filter(c => c.coherenceEventId === event.id);
      
      if (eventCorridors.length > 0) {
        // Slowly come to a stop
        const stopAnimation = setInterval(() => {
          if (Date.now() - startTime > maxDurationMs) {
            clearInterval(stopAnimation);
            return;
          }
          eventCorridors.forEach(corridor => {
            corridor.glyphs.forEach((glyphId: string) => {
              const glyphIndex = glyphPositions.findIndex(g => g.uuid === glyphId);
              if (glyphIndex !== -1) {
                const glyph = glyphPositions[glyphIndex];
                glyph.orbitSpeed = (glyph.orbitSpeed ?? 0) * 0.95; // Gradually slow down
              }
            });
          });
          glyphPositions = [...glyphPositions];
        }, 100);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        clearInterval(stopAnimation);
        
        // Border slowly fades
        eventCorridors.forEach(corridor => {
          corridor.opacity *= 0.5;
          corridor.intensity *= 0.5;
        });
        visibleCorridors = [...visibleCorridors];
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Components inside scatter in different directions
        eventCorridors.forEach(corridor => {
          corridor.glyphs.forEach(glyphId => {
            const glyphIndex = glyphPositions.findIndex(g => g.uuid === glyphId);
            if (glyphIndex !== -1) {
              const glyph = glyphPositions[glyphIndex];
              
              // Scatter outward
              const scatterAngle = Math.random() * Math.PI * 2;
              const scatterDistance = 100 + Math.random() * 200;
              const targetX = glyph.x + Math.cos(scatterAngle) * scatterDistance;
              const targetY = glyph.y + Math.sin(scatterAngle) * scatterDistance;
              
              animateGlyphPosition(glyph, targetX, targetY, 4000);
              
              // Fade glyph
              setTimeout(() => {
                glyph.opacity *= 0.3;
                glyph.scale *= 0.7;
                glyphPositions = [...glyphPositions];
              }, 2000);
            }
          });
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Remove all corridors
    for (let i = visibleCorridors.length - 1; i >= 0; i--) {
      if (Date.now() - startTime > maxDurationMs) break;
      visibleCorridors.splice(i, 1);
      visibleCorridors = [...visibleCorridors];
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Final fade of remaining glyphs
    for (let i = visibleGlyphs.length - 1; i >= 0; i--) {
      if (Date.now() - startTime > maxDurationMs) break;
      const glyphIndex = visibleGlyphs[i];
      const glyph = glyphPositions[glyphIndex];
      
      glyph.opacity = 0;
      glyph.scale = 0.3;
      glyphPositions = [...glyphPositions];
      
      visibleGlyphs.splice(i, 1);
      visibleGlyphs = [...visibleGlyphs];
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('Dissolving phase complete.');
  }

  function clampGlyphPosition(glyph: { x: number, y: number, radius?: number }): void {
    const diameter = (glyph.radius || GLYPH_RADIUS) * 2;
    glyph.x = Math.max(diameter, Math.min(CANVAS_WIDTH - diameter, glyph.x));
    glyph.y = Math.max(diameter, Math.min(CANVAS_HEIGHT - diameter, glyph.y));
  }

  function animateGlyphPosition(glyph: RenderableGlyph, targetX: number, targetY: number, duration: number): void {
    const startX = glyph.x;
    const startY = glyph.y;
    const startTime = Date.now();
    const startCoherence = coherenceLevel;
    const maxDurationMs = duration;
    
    function updatePosition() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / maxDurationMs, 1);
      
      // Update coherence level
      coherenceLevel = Math.max(0, startCoherence - (startCoherence * progress));
      const eased = 1 - Math.pow(1 - progress, 3); //ease out cubic
      
      glyph.x = startX + (targetX - startX) * eased;
      glyph.y = startY + (targetY - startY) * eased;
      clampGlyphPosition(glyph);
      
      glyphPositions = [...glyphPositions];
      
      if (progress < 1) {
        requestAnimationFrame(updatePosition);
      }
    }
    
    requestAnimationFrame(updatePosition);
  }

  function getGlyphBoundaries() {
    // Return full canvas boundaries with no padding
    return {
      minX: 0,
      maxX: CANVAS_WIDTH,
      minY: 0,
      maxY: CANVAS_HEIGHT
    };
  }

  function getGlyphSymbol(glyphId: string): string {
    const glyph = canonicalGlyphs[glyphId];
    if (!glyph) return '⭕';
    switch (glyph.geometry) {
      case 'torus': return '🍩';
      case 'spiral': return '🌀';
      case 'circle': return '⭕';
      case 'triangle': return '🔺';
      case 'mandala': return '🕸️';
      case 'lotus': return '🪷';
      default: return '⭕';
    }
  }

  function getGlyphColor(glyphId: string): string {
    const glyph = canonicalGlyphs[glyphId];
    return glyph ? glyph.color : '#ffffff';
  }

  function getPhaseLabel(phase: string): string {
    switch (phase) {
      case 'queueing': return 'User symbolic signatures added to field';
      case 'formation': return 'Groups forming based on signatures';
      case 'coherence': return 'Coherence event for group sizes that reach coherence threshold';
      case 'dissolving': return 'Event closing';
      case '': return '';
      default: return phase;
    }
  }
</script>

<svelte:head>
  <title>Coherence Field - Harmonia</title>
</svelte:head>

<div class="coherence-field">
  {#if scenario === null}
    <!-- Scenario Selection Screen -->
    <div class="field-header">
      <h1>Harmonia Exploration</h1>
      <p class="phase-indicator">Choose your journey into the Coherence Field</p>
    </div>
    
    <div class="scenario-selection">
      <div class="scenario-grid">
        <button class="scenario-card" onclick={() => scenario = 1}>
          <div class="scenario-icon">🔮</div>
          <h3>Only Glyphs</h3>
        </button>
        
        <button class="scenario-card" onclick={() => scenario = 2}>
          <div class="scenario-icon">🌀</div>
          <h3>Corridors & Glyphs</h3>
        </button>
        
        <button class="scenario-card" onclick={() => scenario = 3}>
          <div class="scenario-icon">✨</div>
          <h3>Coherence Event</h3>
        </button>
      </div>
    </div>
    
    
  {:else}
    <!-- Visualization Screen -->
    <div class="field-header">
      <h1>Coherence Field</h1>
      {#if currentPhase}
        <p class="phase-indicator">Phase: {getPhaseLabel(currentPhase)}</p>
      {/if}
    </div>

    <div class="field-grid">
      <!-- Feedback Panel -->
      <div class="feedback-panel">
        <h3>Resonance Feedback</h3>
        <div class="feedback-content">
          {#if currentPhase === 'dissolving'}
            <div class="feedback-item dissolving-message">
              <span class="feedback-value">Structures dissolving back into the field...</span>
            </div>
          {:else}
            {#if completedPhases.has('queueing')}
              <div class="feedback-item">
                <span class="feedback-label">Glyphs Active:</span>
                <span class="feedback-value">{visibleGlyphs.length}</span>
              </div>
            {/if}
            
            {#if completedPhases.has('formation')}
              <div class="feedback-item">
                <span class="feedback-label">Corridors Formed:</span>
                <span class="feedback-value">{visibleCorridors.length}</span>
              </div>
            {/if}
            
            {#if completedPhases.has('coherence')}
              <div class="feedback-item">
                <span class="feedback-label">Coherence Events:</span>
                <span class="feedback-value">{visibleCoherenceEvents.length}</span>
              </div>
            {/if}
            
            {#if completedPhases.has('emergence')}
              <div class="feedback-item">
                <span class="feedback-label">Trace Artifact:</span>
                <span class="feedback-value">Created</span>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <!-- Visualization Container -->
      <div class="visualization-container">
        <div class="viz-content">
          <svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} class="field-canvas">
        <!-- Background pattern -->
        <defs>
          <radialGradient id="fieldGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#4c1d95;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#1e1b4b;stop-opacity:0.8" />
          </radialGradient>
        
        <!-- Glow filters for different intensities -->
        <filter id="glow-soft">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="glow-intense">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#fieldGradient)" />
      
      <!-- Simple glyph rendering - focus on basic positioning first -->
      {#each visibleGlyphs as glyphIndex}
        {@const glyph = glyphPositions[glyphIndex]}
        {@const now = Date.now()}
        <g 
          class="glyph" 
          transform="translate({glyph.x}, {glyph.y}) scale({glyph.scale})"
          opacity={glyph.opacity}
        >
          <!-- Glyph circle background -->
          <circle
            r="30"
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="1"
            filter="url(#glow-soft)"
            class="glyph-boundary"
          />
          
          <!-- Render each geometry inside the glyph -->
          {#each glyph.glyphIds as glyphId, i}
            {@const canonicalGlyph = canonicalGlyphs[glyphId]}
            {@const pulseDuration = getPulseDuration(glyph.phase.tempo)}
            {@const pulseProgress = ((now + glyph.pulsePhase * 1000) % pulseDuration) / pulseDuration}
            {@const pulseScale = getPulseScale(glyph.phase.breath, pulseProgress)}
            {@const pulseOpacity = getPulseOpacity(glyph.phase.breath, pulseProgress)}
            {@const shimmerIntensity = getShimmerIntensity(canonicalGlyph.frequency)}
            
            <g transform="translate({glyph.type === 'pair' ? (i === 0 ? -12 : 12) : 0}, 0)">
              <!-- Inner geometry circle -->
              <circle
                r={18 * pulseScale}
                fill={canonicalGlyph.color}
                opacity={pulseOpacity}
                filter="url(#glow-soft)"
                class="glyph-geometry"
                style="animation: shimmer {3 / shimmerIntensity}s ease-in-out infinite;"
              />
              
              <!-- Geometry symbol -->
              <text
                text-anchor="middle"
                dominant-baseline="central"
                font-size="16"
                fill="white"
                filter="url(#glow-soft)"
                opacity={pulseOpacity}
                style="transform: scale({pulseScale})"
              >
                {getGlyphSymbol(glyphId)}
              </text>
            </g>
          {/each}
        </g>
      {/each}
      </svg>
      <div class="viz-actions">
        {#if animationStarted}
          <button class="viz-begin-button" onclick={stopLifecycle}>
            ⏹️ Stop Ritual
          </button>
        {:else}
          <button class="viz-begin-button" onclick={startLifecycleAnimation}>
            Begin Coherence Ritual
          </button>
        {/if}
      </div>
    </div>
  </div>
  
    </div>

  {/if}
</div>

<style>
  .coherence-field {
    min-height: calc(100vh - 80px);
    background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    color: white;
    max-height: calc(100vh - 80px);
    overflow: hidden;
  }

  /* Single column layout for visualization only */
  .field-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 1400px;
    justify-items: stretch;
    align-items: start;
  }

  .feedback-panel {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    padding: 1.25rem;
    backdrop-filter: blur(6px);
    color: white;
  }

  .feedback-panel h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #d8b4fe;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .feedback-item {
    margin-bottom: 1rem;
  }

  .feedback-label {
    display: block;
    font-size: 0.9rem;
    color: #c4b5fd;
    margin-bottom: 0.25rem;
  }

  .feedback-value {
    font-size: 1rem;
    font-weight: 500;
  }

  .dissolving-message {
    text-align: center;
    padding: 0.5rem 0;
  }
  
  .dissolving-message .feedback-value {
    color: #f0abfc;
    font-style: italic;
  }

  .feedback-item {
    min-height: 1.5rem; /* Ensure consistent height even when empty */
  }

  .coherence-meter {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    margin-top: 0.5rem;
    overflow: hidden;
  }

  .coherence-level {
    height: 100%;
    background: linear-gradient(90deg, #7c3aed, #8b5cf6);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .visualization-container {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    padding: 1.25rem;
    backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 120px);
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .visualization-container .field-canvas {
    width: 100%;
    height: auto;
    max-height: 60vh;
    max-width: 100%;
    display: block;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
  }

  /* Centered action below visualization */
  .viz-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .viz-actions {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .viz-begin-button {
    padding: 0.65rem 1.2rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: linear-gradient(45deg, #7c3aed, #4c1d95);
    color: #fff;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
  }

  .viz-begin-button:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.45);
  }

  .viz-begin-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    .field-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        'viz'
        'feedback';
    }
  }

  

  /* Scenario Selection Styles */
  .scenario-selection {
    max-width: 1200px;
    width: 100%;
    margin: 3rem 0;
  }

  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .scenario-card {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    color: white;
  }

  .scenario-card:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(16, 185, 129, 0.5);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
  }

  .scenario-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .scenario-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #10b981;
  }

  .scenario-card p {
    font-size: 1rem;
    line-height: 1.6;
    opacity: 0.9;
  }

  /* Feedback Section Styles */
  .feedback-section {
    text-align: center;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .feedback-message {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    color: rgba(139, 92, 246, 0.9);
  }

  .feedback-message.success {
    color: rgba(16, 185, 129, 0.9);
  }

  .feedback-message.loading {
    color: rgba(139, 92, 246, 0.9);
  }

  .feedback-actions {
    margin-top: 1rem;
  }

  .notify-button {
    background: linear-gradient(45deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  }

  .notify-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }

  .enter-corridor-button {
    background: linear-gradient(45deg, #10b981, #059669);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .enter-corridor-button:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .enter-corridor-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    background: rgba(139, 92, 246, 0.8);
    border-radius: 50%;
    animation: wave 1.4s ease-in-out infinite;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes wave {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }

  .field-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .field-header h1 {
    font-size: 3rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .phase-indicator {
    font-size: 1.2rem;
    opacity: 0.8;
    text-transform: capitalize;
    letter-spacing: 0.1em;
  }

  .visualization-container {
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    backdrop-filter: blur(10px);
  }

  .field-canvas {
    display: block;
  }

  .glyph {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .glyph-boundary {
    transition: all 0.3s ease;
  }

  .glyph-geometry {
    transition: all 0.2s ease;
  }

  @keyframes shimmer {
    0%, 100% { 
      filter: brightness(1) saturate(1);
    }
    50% { 
      filter: brightness(1.3) saturate(1.2);
    }
  }

  .glyph-background {
    transition: all 0.3s ease;
  }

  .glyph-background.pulsing {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 0.8;
    }
    50% { 
      transform: scale(1.1);
      opacity: 1;
    }
  }

  .corridor-line {
    transition: all 1s ease;
  }

  .corridor.individual .corridor-line {
    stroke-dasharray: none;
  }

  .corridor.group .corridor-line {
    stroke-dasharray: 3,3;
    animation: flow 2s linear infinite;
  }

  .nucleus-connection {
    transition: all 0.5s ease;
  }

  .corridor-nucleus {
    transition: all 1s ease;
  }

  .individual-nucleus {
    animation: gentle-pulse 4s ease-in-out infinite;
  }

  .group-nucleus {
    animation: aura-pulse 3s ease-in-out infinite;
  }

  .corridor-aura {
    animation: aura-shimmer 5s ease-in-out infinite;
  }

  .coherence-bubble {
    transition: all 2s ease;
    animation: coherence-pulse 6s ease-in-out infinite;
  }

  .coherence-aura {
    animation: coherence-shimmer 8s ease-in-out infinite;
  }

  @keyframes flow {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 12; }
  }

  @keyframes gentle-pulse {
    0%, 100% { 
      opacity: 0.6;
      transform: scale(1);
    }
    50% { 
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  @keyframes aura-pulse {
    0%, 100% { 
      opacity: 0.7;
      transform: scale(1);
    }
    50% { 
      opacity: 1;
      transform: scale(1.1);
    }
  }

  @keyframes aura-shimmer {
    0%, 100% { 
      opacity: 0.3;
    }
    50% { 
      opacity: 0.6;
    }
  }

  @keyframes coherence-pulse {
    0%, 100% { 
      opacity: 0.8;
      transform: scale(1);
    }
    50% { 
      opacity: 1;
      transform: scale(1.02);
    }
  }

  @keyframes coherence-shimmer {
    0%, 100% { 
      opacity: 0.4;
    }
    33% { 
      opacity: 0.7;
    }
    66% {
      opacity: 0.5;
    }
  }

  .corridor.exploration .corridor-line {
    stroke-dasharray: 5,5;
    animation: swirl 3s linear infinite;
  }

  .corridor.healing .corridor-line {
    filter: url(#glow-intense);
  }

  @keyframes swirl {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 20; }
  }

  .field-controls {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .field-controls button {
    background: linear-gradient(45deg, #10b981, #3b82f6);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .field-controls button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .field-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .return-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 25px;
    transition: all 0.3s ease;
  }

  .return-link:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
</style>


