<script lang="ts">
  export let title: string = 'Sacred Resonance';
  export let links: Array<{ href: string; label: string }> = [];
  export let currentPath: string = '/';

  const visibleLinks = links.filter((l) => l.href !== currentPath);
</script>

<nav class="navbar">
  <div class="nav-content">
    <a href="/" class="brand">{title}</a>
    <div class="links">
      {#each visibleLinks as link}
        <a href={link.href} class="nav-link">{link.label}</a>
      {/each}
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: linear-gradient(180deg, rgba(20, 18, 48, 0.9) 0%, rgba(20, 18, 48, 0.6) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
  }
  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .brand {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.4px;
  }
  .links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .nav-link {
    color: #fff;
    text-decoration: none;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
</style>
