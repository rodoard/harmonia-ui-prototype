<script>
	import { goto } from '$app/navigation';
</script>

<div class="welcome-container">
	<h1>Welcome to Harmonia</h1>
	<p>Begin your sacred ritual journey</p>
	<div class="action-buttons">
		<button on:click={() => goto('/attunement')} class="begin-button primary">
			Begin Attunement
		</button>
		<button on:click={() => goto('/coherence-field')} class="begin-button secondary">
			View Coherence Field
		</button>
	</div>
</div>

<style>
	.welcome-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		text-align: center;
		color: white;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		background: linear-gradient(45deg, #9333ea, #c084fc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	p {
		font-size: 1.2rem;
		margin-bottom: 2rem;
		opacity: 0.8;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.begin-button {
		padding: 1rem 2rem;
		font-size: 1.1rem;
		color: white;
		border: none;
		border-radius: 50px;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 200px;
	}

	.begin-button.primary {
		background: linear-gradient(45deg, #9333ea, #c084fc);
		box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
	}

	.begin-button.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
	}

	.begin-button.secondary {
		background: linear-gradient(45deg, #10b981, #34d399);
		box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
	}

	.begin-button.secondary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
	}
</style>

