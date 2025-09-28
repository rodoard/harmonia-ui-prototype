<script>
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	// FeltResonanceInput interface implementation
	let formData = writable({
		breath: '',
		tempo: '',
		colorChoice: '',
		shapeChoice: '',
		intention: '',
		mood: '',
		energy: ''
	});

	let currentStep = writable(0);
	let isComplete = writable(false);

	const steps = [
		{ id: 'breath', title: 'Elemental Breath Stones', subtitle: 'Choose your sacred breath pattern' },
		{ id: 'tempo', title: 'Rhythmic Flow Glyphs', subtitle: 'Select your inner tempo' },
		{ id: 'color', title: 'Altar of Hues', subtitle: 'Choose your resonant color (optional)' },
		{ id: 'shape', title: 'Sacred Form Grid', subtitle: 'Select your guiding geometry (optional)' },
		{ id: 'intention', title: 'Sacred Intention', subtitle: 'Speak your heart\'s desire (optional)' },
		{ id: 'mood', title: 'Honor Current Mood', subtitle: 'Acknowledge your present state (optional)' },
		{ id: 'energy', title: 'Energy Attunement', subtitle: 'Set your energetic frequency (optional)' }
	];

	const breathOptions = [
		{ value: 'inhale', label: 'Inhale', emoji: '🌬️', description: 'Drawing in life force' },
		{ value: 'exhale', label: 'Exhale', emoji: '💨', description: 'Releasing what no longer serves' },
		{ value: 'pause', label: 'Pause', emoji: '⏸️', description: 'Sacred stillness between breaths' }
	];

	const tempoOptions = [
		{ value: 'slow', label: 'Slow', emoji: '🐌', description: 'Deep, contemplative rhythm' },
		{ value: 'steady', label: 'Steady', emoji: '🎯', description: 'Balanced, grounded pace' },
		{ value: 'fast', label: 'Fast', emoji: '⚡', description: 'Dynamic, energizing flow' }
	];

	const colorOptions = [
		{ value: 'deep-ocean-blue', label: 'Deep Ocean Blue', color: '#1e3a8a' },
		{ value: 'mystic-violet', label: 'Mystic Violet', color: '#7c3aed' },
		{ value: 'forest-emerald', label: 'Forest Emerald', color: '#059669' },
		{ value: 'sunset-amber', label: 'Sunset Amber', color: '#d97706' },
		{ value: 'rose-quartz', label: 'Rose Quartz', color: '#ec4899' },
		{ value: 'moonlight-silver', label: 'Moonlight Silver', color: '#64748b' }
	];

	const shapeOptions = [
		{ value: 'torus', label: 'Torus', emoji: '🍩' },
		{ value: 'spiral', label: 'Spiral', emoji: '🌀' },
		{ value: 'circle', label: 'Circle', emoji: '⭕' },
		{ value: 'triangle', label: 'Triangle', emoji: '🔺' },
		{ value: 'mandala', label: 'Mandala', emoji: '🕸️' },
		{ value: 'lotus', label: 'Lotus', emoji: '🪷' }
	];

	const moodOptions = [
		{ value: 'calm', label: 'Calm', emoji: '😌' },
		{ value: 'joyful', label: 'Joyful', emoji: '😊' },
		{ value: 'anxious', label: 'Anxious', emoji: '😰' },
		{ value: 'reflective', label: 'Reflective', emoji: '🤔' },
		{ value: 'energized', label: 'Energized', emoji: '⚡' },
		{ value: 'peaceful', label: 'Peaceful', emoji: '☮️' }
	];

	function nextStep() {
		currentStep.update(n => {
			if (n < steps.length - 1) {
				return n + 1;
			} else {
				isComplete.set(true);
				return n;
			}
		});
	}

	function prevStep() {
		currentStep.update(n => Math.max(0, n - 1));
		isComplete.set(false);
	}

	function selectOption(field, value) {
		formData.update(data => ({ ...data, [field]: value }));
	}

	function canProceed(step) {
		const data = $formData;
		switch (step) {
			case 0: return data.breath !== '';
			case 1: return data.tempo !== '';
			default: return true; // Optional steps
		}
	}

	function resetRitual() {
		formData.set({
			breath: '',
			tempo: '',
			colorChoice: '',
			shapeChoice: '',
			intention: '',
			mood: '',
			energy: ''
		});
		currentStep.set(0);
		isComplete.set(false);
	}
</script>

<div class="ritual-container">
  <h1>Attunement Form Wizard</h1>
  <br/>
	{#if !$isComplete}
		<!-- Progress Indicator -->
		<div class="progress-container">
			<div class="progress-dots">
				{#each steps as step, index}
					<div 
						class="progress-dot" 
						class:active={index === $currentStep}
						class:completed={index < $currentStep}
					></div>
				{/each}
			</div>
			<div class="progress-text">
				Step {$currentStep + 1} of {steps.length}
			</div>
		</div>

		<!-- Step Content -->
		<div class="step-container">
			<div class="step-header">
				<h1 class="step-title">{steps[$currentStep].title}</h1>
				<p class="step-subtitle">{steps[$currentStep].subtitle}</p>
			</div>

			<div class="step-content">
				{#if $currentStep === 0}
					<!-- Breath Step -->
					<div class="options-grid">
						{#each breathOptions as option}
							<button 
								class="option-card" 
								class:selected={$formData.breath === option.value}
								on:click={() => selectOption('breath', option.value)}
							>
								<div class="option-emoji">{option.emoji}</div>
								<div class="option-label">{option.label}</div>
								<div class="option-description">{option.description}</div>
							</button>
						{/each}
					</div>

				{:else if $currentStep === 1}
					<!-- Tempo Step -->
					<div class="options-grid">
						{#each tempoOptions as option}
							<button 
								class="option-card" 
								class:selected={$formData.tempo === option.value}
								on:click={() => selectOption('tempo', option.value)}
							>
								<div class="option-emoji">{option.emoji}</div>
								<div class="option-label">{option.label}</div>
								<div class="option-description">{option.description}</div>
							</button>
						{/each}
					</div>

				{:else if $currentStep === 2}
					<!-- Color Step -->
					<div class="color-grid">
						{#each colorOptions as option}
							<button 
								class="color-card" 
								class:selected={$formData.colorChoice === option.value}
								style="background: {option.color}"
								on:click={() => selectOption('colorChoice', option.value)}
							>
								<div class="color-label">{option.label}</div>
							</button>
						{/each}
					</div>

				{:else if $currentStep === 3}
					<!-- Shape Step -->
					<div class="shapes-grid">
						{#each shapeOptions as option}
							<button 
								class="shape-card" 
								class:selected={$formData.shapeChoice === option.value}
								on:click={() => selectOption('shapeChoice', option.value)}
							>
								<div class="shape-emoji">{option.emoji}</div>
								<div class="shape-label">{option.label}</div>
							</button>
						{/each}
					</div>

				{:else if $currentStep === 4}
					<!-- Intention Step -->
					<div class="intention-container">
						<textarea 
							bind:value={$formData.intention}
							placeholder="Speak your heart's deepest intention..."
							class="intention-textarea"
						></textarea>
					</div>

				{:else if $currentStep === 5}
					<!-- Mood Step -->
					<div class="mood-grid">
						{#each moodOptions as option}
							<button 
								class="mood-card" 
								class:selected={$formData.mood === option.value}
								on:click={() => selectOption('mood', option.value)}
							>
								<div class="mood-emoji">{option.emoji}</div>
								<div class="mood-label">{option.label}</div>
							</button>
						{/each}
					</div>

				{:else if $currentStep === 6}
					<!-- Energy Step -->
					<div class="energy-container">
						<div class="energy-toggle">
							<button 
								class="energy-option" 
								class:selected={$formData.energy === 'low'}
								on:click={() => selectOption('energy', 'low')}
							>
								<div class="energy-icon">🌙</div>
								<div class="energy-label">Low Energy</div>
								<div class="energy-description">Gentle, restorative flow</div>
							</button>
							<button 
								class="energy-option" 
								class:selected={$formData.energy === 'high'}
								on:click={() => selectOption('energy', 'high')}
							>
								<div class="energy-icon">☀️</div>
								<div class="energy-label">High Energy</div>
								<div class="energy-description">Dynamic, activating force</div>
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Navigation -->
			<div class="navigation">
				{#if $currentStep > 0}
					<button class="nav-button secondary" on:click={prevStep}>
						← Back
					</button>
				{/if}
				
				<div class="nav-spacer"></div>
				
				{#if canProceed($currentStep)}
					<button class="nav-button primary" on:click={nextStep}>
						{$currentStep === steps.length - 1 ? 'Complete Ritual' : 'Continue →'}
					</button>
				{/if}
			</div>
		</div>

	{:else}
		<!-- Completion Screen -->
		<div class="completion-container">
			<div class="completion-header">
				<h1 class="completion-title">Reflection Complete</h1>
				<p class="completion-subtitle">Your ritual has been honored</p>
			</div>

			<div class="resonance-summary">
				<h2>Your Reflection</h2>
				<div class="summary-grid">
					<div class="summary-item">
						<span class="summary-label">Breath:</span>
						<span class="summary-value">{$formData.breath}</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">Tempo:</span>
						<span class="summary-value">{$formData.tempo}</span>
					</div>
					{#if $formData.colorChoice}
						<div class="summary-item">
							<span class="summary-label">Color:</span>
							<span class="summary-value">{$formData.colorChoice}</span>
						</div>
					{/if}
					{#if $formData.shapeChoice}
						<div class="summary-item">
							<span class="summary-label">Shape:</span>
							<span class="summary-value">{$formData.shapeChoice}</span>
						</div>
					{/if}
					{#if $formData.intention}
						<div class="summary-item">
							<span class="summary-label">Intention:</span>
							<span class="summary-value">{$formData.intention}</span>
						</div>
					{/if}
					{#if $formData.mood}
						<div class="summary-item">
							<span class="summary-label">Mood:</span>
							<span class="summary-value">{$formData.mood}</span>
						</div>
					{/if}
					{#if $formData.energy}
						<div class="summary-item">
							<span class="summary-label">Energy:</span>
							<span class="summary-value">{$formData.energy}</span>
						</div>
					{/if}
				</div>
			</div>

			<div class="completion-actions">
				<button class="nav-button secondary" on:click={resetRitual}>
					Begin New Ritual
				</button>
				<a href="/coherence-field" class="nav-button primary">
					Enter Coherence Field
				</a>
				<button class="nav-button secondary" on:click={() => goto('/')}>
					Return Home
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.ritual-container {
		min-height: 100vh;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
	}

	/* Progress Indicator */
	.progress-container {
		margin-bottom: 3rem;
		text-align: center;
	}

	.progress-dots {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.progress-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		transition: all 0.3s ease;
	}

	.progress-dot.active {
		background: #9333ea;
		box-shadow: 0 0 20px rgba(147, 51, 234, 0.6);
		transform: scale(1.2);
	}

	.progress-dot.completed {
		background: #10b981;
	}

	.progress-text {
		font-size: 0.9rem;
		opacity: 0.7;
	}

	/* Step Container */
	.step-container {
		max-width: 800px;
		width: 100%;
	}

	.step-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.step-title {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		background: linear-gradient(45deg, #9333ea, #c084fc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.step-subtitle {
		font-size: 1.1rem;
		opacity: 0.8;
	}

	/* Options Grid */
	.options-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.option-card {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		color: white;
	}

	.option-card:hover {
		transform: translateY(-5px);
		border-color: rgba(147, 51, 234, 0.5);
		box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
	}

	.option-card.selected {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.2);
		box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
	}

	.option-emoji {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.option-label {
		font-size: 1.3rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.option-description {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	/* Color Grid */
	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.color-card {
		height: 120px;
		border: 3px solid transparent;
		border-radius: 15px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: end;
		padding: 1rem;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.color-card:hover {
		transform: scale(1.05);
		border-color: rgba(255, 255, 255, 0.5);
	}

	.color-card.selected {
		border-color: #10b981;
		box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
	}

	.color-label {
		font-weight: bold;
	}

	/* Shapes Grid */
	.shapes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.shape-card {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 15px;
		padding: 1.5rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		color: white;
	}

	.shape-card:hover {
		transform: translateY(-3px);
		border-color: rgba(147, 51, 234, 0.5);
	}

	.shape-card.selected {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.2);
	}

	.shape-emoji {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.shape-label {
		font-weight: bold;
	}

	/* Intention */
	.intention-container {
		margin-bottom: 3rem;
	}

	.intention-textarea {
		width: 100%;
		min-height: 150px;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 15px;
		padding: 1.5rem;
		color: white;
		font-size: 1.1rem;
		resize: vertical;
	}

	.intention-textarea::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	.intention-textarea:focus {
		outline: none;
		border-color: #9333ea;
		box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
	}

	/* Mood Grid */
	.mood-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.mood-card {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 15px;
		padding: 1.5rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		color: white;
	}

	.mood-card:hover {
		transform: translateY(-3px);
		border-color: rgba(147, 51, 234, 0.5);
	}

	.mood-card.selected {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.2);
	}

	.mood-emoji {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.mood-label {
		font-weight: bold;
	}

	/* Energy */
	.energy-container {
		margin-bottom: 3rem;
	}

	.energy-toggle {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.energy-option {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		color: white;
	}

	.energy-option:hover {
		transform: translateY(-5px);
		border-color: rgba(147, 51, 234, 0.5);
	}

	.energy-option.selected {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.2);
	}

	.energy-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.energy-label {
		font-size: 1.3rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.energy-description {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	/* Navigation */
	.navigation {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-spacer {
		flex: 1;
	}

	.nav-button {
		padding: 1rem 2rem;
		border-radius: 50px;
		border: none;
		font-size: 1.1rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.nav-button.primary {
		background: linear-gradient(45deg, #9333ea, #c084fc);
		color: white;
		box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
	}

	.nav-button.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
	}

	.nav-button.secondary {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.nav-button.secondary:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
	}

	/* Completion Screen */
	.completion-container {
		text-align: center;
		max-width: 600px;
	}

	.completion-header {
		margin-bottom: 3rem;
	}

	.completion-title {
		font-size: 3rem;
		margin-bottom: 1rem;
		background: linear-gradient(45deg, #10b981, #34d399);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.completion-subtitle {
		font-size: 1.2rem;
		opacity: 0.8;
	}

	.resonance-summary {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		padding: 2rem;
		margin-bottom: 3rem;
	}

	.resonance-summary h2 {
		margin-bottom: 1.5rem;
		color: #10b981;
	}

	.summary-grid {
		display: grid;
		gap: 1rem;
		text-align: left;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.summary-label {
		font-weight: bold;
		opacity: 0.8;
	}

	.summary-value {
		color: #10b981;
	}

	.completion-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.ritual-container {
			padding: 1rem;
		}

		.step-title {
			font-size: 2rem;
		}

		.options-grid {
			grid-template-columns: 1fr;
		}

		.energy-toggle {
			grid-template-columns: 1fr;
		}

		.completion-actions {
			flex-direction: column;
		}
	}
</style>

