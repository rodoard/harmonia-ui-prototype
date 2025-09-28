# Harmonia - Coherence Field Visualization

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

An interactive visualization tool that creates a dynamic field of glyphs that respond to user interaction, forming patterns and corridors of coherence.

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/rodoard/harmonia-ui-prototype.git
   cd harmonia-ui-prototype
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Deployment

This application is configured for deployment to [Render](https://render.com/).

### Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or deploy manually:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm run preview -- --host`
   - **Environment Variables**:
     - `NODE_VERSION`: 18.x
4. Deploy!ion build
npm run preview
├── src/
│   ├── routes/
│   │   ├── +layout.svelte          # Global layout
│   │   ├── +page.svelte            # Landing page
│   │   ├── attunement/
│   │   │   └── +page.svelte        # 7-step wizard
│   │   └── coherence-field/
│   │       └── +page.svelte        # Advanced visualization with scenarios
│   ├── app.html                    # HTML template
│   └── app.css                     # Global sacred styles
├── package.json                    # Dependencies
├── svelte.config.js               # Svelte configuration
├── vite.config.js                 # Vite configuration
└── SVELTE_PROJECT_SUMMARY.md      # This documentation
```

## 🌟 Sacred Design Philosophy

This interface embodies the principle that technology can be a conduit for meaningful human experience. The **scenario-based exploration system** allows users to witness different aspects of collective resonance, from individual contemplation to full community coherence.

### **Ritual Cycle Meaning:**
- **Queueing**: Individual souls gathering in sacred space
- **Formation**: Community bonds forming through shared intention
- **Coherence**: Peak collective resonance and unity
- **Dissolving**: Gentle release and integration of the experience

### **NEW: Exploration Philosophy:**
- **Solitary Resonance**: Honors individual spiritual practice
- **Corridor Formation**: Celebrates emerging connections
- **Coherence Event**: Witnesses full collective transformation

## 🎯 Performance & Optimization

### **Animation Performance:**
- Optimized requestAnimationFrame loops
- Efficient SVG rendering with minimal DOM manipulation
- Memory-conscious data structures
- Smooth 60fps animations with graceful degradation
- **Single Cycle Optimization**: No infinite loops reduce memory usage

### **Responsive Design:**
- Mobile-first approach with touch-friendly interactions
- Adaptive layouts for different screen sizes
- Consistent sacred aesthetic across all devices

## 🚀 Production Ready

The application is fully production-ready with:
- Comprehensive error handling
- Performance optimization
- Mobile responsiveness
- Cross-browser compatibility
- Scalable architecture for future enhancements
- **NEW: Scenario-based exploration system**

## 🔮 Future Enhancement Possibilities

- Integration with real-time data APIs
- Audio integration for ritual atmosphere
- Additional sacred geometries and animations
- User-generated content and personalization
- Multi-language support for global accessibility
- **Corridor Visualization**: Dedicated `/corridor/[uuid]` route (next phase)

---

**This complete implementation transforms data visualization into a sacred ritual experience with scenario-based exploration, creating meaningful technology that serves the human spirit through multiple pathways of discovery.** ✨

*May this resonance guide your journey through the interconnected web of collective consciousness, whether in solitude, connection, or full coherence.* 🌟

