<script>
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    import { page } from '$app/stores';
    const title = 'Harmonia';
    const links = [
        { href: '/', label: 'Home' },
        { href: '/attunement', label: 'Attunement' },
        { href: '/coherence-field', label: 'Coherence Field' }
    ];
</script>

{#if $page.url.pathname !== '/'}
    <Navbar {title} {links} currentPath={$page.url.pathname} />
{/if}

<main>
    <slot />
</main>
