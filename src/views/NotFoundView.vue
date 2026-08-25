<template>
  <section class="not-found">
    <p class="code font-display">404</p>
    <h1>Page not found</h1>
    <p class="hint">The page you're looking for doesn't exist or has been moved.</p>
    <RouterLink to="/" class="btn-home">Back to home</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
.code {
  font-size: 96px;
  line-height: 1;
  color: var(--brand);
  margin-bottom: 8px;
}
h1 { font-family: 'Cabinet Grotesk', sans-serif; font-size: 28px; }
.hint { color: var(--text-muted); margin-top: 8px; }
.btn-home {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  margin-top: 24px;
  background: var(--brand);
  color: var(--text-primary);
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
}
.btn-home:hover { background: var(--brand-hover); }
</style>
