(() => {
  const lessonIds = ["matrix-inverse", "elementary-matrices"];

  function ensureHosts() {
    lessonIds.forEach((id) => {
      const formal = document.querySelector(`#${id}-formal`);
      const hostId = `${id}-interactive`;
      if (!formal || document.querySelector(`#${hostId}`)) return;

      const host = document.createElement("section");
      host.className = "section-band lesson-page-section";
      host.id = hostId;
      formal.before(host);
    });
  }

  function start() {
    const main = document.querySelector("#mainContent");
    if (!main) return;
    const observer = new MutationObserver(() => window.requestAnimationFrame(ensureHosts));
    observer.observe(main, { childList: true, subtree: true });
    ensureHosts();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
