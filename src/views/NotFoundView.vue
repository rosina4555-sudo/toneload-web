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
  height: 40px;
  padding: 0 18px;
  margin-top: 24px;
  background: var(--brand);
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.15px;
  border: 1px solid var(--brand);
  transition: background 0.14s ease, border-color 0.14s ease;
}
.btn-home:hover { background: var(--brand-hover); border-color: var(--brand-hover); }
</style>
