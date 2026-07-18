/* Screenshot-driven alignment fixes for Chapter 2 cinematic scenes. */
(() => {
  if (typeof window.defineChapter2LessonEnhancer !== "function") return;

  window.defineChapter2LessonEnhancer((section, root) => {
    if (section?.id !== "cofactor-expansion") return undefined;
    const board = root.querySelector("[data-cofactor-board]");
    if (!board) return undefined;

    let frame = 0;
    const alignStrikeLines = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const selected = board.querySelector("[data-cof-table] .is-current");
        const rowLine = board.querySelector(".ch2-v2-strike-row");
        const colLine = board.querySelector(".ch2-v2-strike-col");
        if (!selected || !rowLine || !colLine) return;
        const boardRect = board.getBoundingClientRect();
        const cellRect = selected.getBoundingClientRect();
        rowLine.style.top = `${cellRect.top - boardRect.top + cellRect.height / 2}px`;
        colLine.style.left = `${cellRect.left - boardRect.left + cellRect.width / 2}px`;
      });
    };

    const handleBoardClick = () => alignStrikeLines();
    const handleResize = () => alignStrikeLines();
    board.addEventListener("click", handleBoardClick);
    window.addEventListener("resize", handleResize, { passive: true });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(alignStrikeLines) : null;
    observer?.observe(board);
    alignStrikeLines();

    return () => {
      cancelAnimationFrame(frame);
      board.removeEventListener("click", handleBoardClick);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  });
})();
