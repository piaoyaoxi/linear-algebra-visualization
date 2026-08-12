(() => {
  const openButton = document.querySelector("#searchOpen");
  const modal = document.querySelector("#searchModal");
  if (!openButton || !modal) return;

  const syncExpandedState = () => {
    openButton.setAttribute("aria-expanded", modal.hidden ? "false" : "true");
  };

  syncExpandedState();
  new MutationObserver(syncExpandedState).observe(modal, {
    attributes: true,
    attributeFilter: ["hidden"],
  });
})();
