/* Chapter 3 responsive stage: preserve the full comparison picture at every size. */
(() => {
  const NS = "http://www.w3.org/2000/svg";

  function geometryGroup(panel, key) {
    let group = panel.querySelector(`:scope > [data-story-geometry="${key}"]`);
    if (group) return group;
    const children = [...panel.children];
    const caption = children.at(-1);
    group = document.createElementNS(NS, "g");
    group.dataset.storyGeometry = key;
    panel.insertBefore(group, caption || null);
    children.slice(4, -1).forEach((node) => group.append(node));
    return group;
  }

  function fitGeometry(panel, key, bounds) {
    const group = geometryGroup(panel, key);
    group.removeAttribute("transform");
    const box = group.getBBox();
    if (!box.width || !box.height) return;
    const padding = 14;
    const scale = Math.min(
      1,
      bounds.width / (box.width + padding),
      bounds.height / (box.height + padding),
    );
    const sourceX = box.x + box.width / 2;
    const sourceY = box.y + box.height / 2;
    const targetX = bounds.x + bounds.width / 2;
    const targetY = bounds.y + bounds.height / 2;
    group.setAttribute(
      "transform",
      `translate(${targetX} ${targetY}) scale(${scale}) translate(${-sourceX} ${-sourceY})`,
    );
  }

  function mountStoryResponsiveFix(section, root) {
    const story = root.querySelector(`[data-ch3-story="${CSS.escape(section.id)}"]`);
    const svg = story?.querySelector("[data-story-svg]");
    if (!story || !svg) return null;

    const media = window.matchMedia("(max-width: 760px)");
    let frame = 0;

    function apply() {
      frame = 0;
      const mobile = media.matches;
      svg.setAttribute("viewBox", mobile ? "0 0 480 430" : "0 0 960 430");

      const mobilePanel = svg.querySelector(".ch3-mobile-panel");
      if (mobilePanel) {
        if (mobile) mobilePanel.setAttribute("transform", "scale(.5 1)");
        else mobilePanel.removeAttribute("transform");
      }

      if (section.id !== "n-vector-space") return;

      svg.querySelectorAll(".ch3-desktop-panel").forEach((panel, index) => {
        const x = 28 + index * 310;
        fitGeometry(panel, "vector-desktop", { x: x + 24, y: 88, width: 236, height: 232 });
      });

      if (mobile && mobilePanel) {
        fitGeometry(mobilePanel, "vector-mobile", { x: 92, y: 88, width: 776, height: 232 });
      }
    }

    function schedule() {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    }

    const observer = new MutationObserver(schedule);
    observer.observe(svg, { childList: true });
    media.addEventListener?.("change", schedule);
    apply();

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }

  window.defineChapter3LessonEnhancer?.(mountStoryResponsiveFix);
})();
