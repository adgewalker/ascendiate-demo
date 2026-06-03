/**
 * <scroll-reveal> — fades + lifts its `[data-reveal]` descendants into view as
 * they enter the viewport. The transition is defined in CSS; this element owns
 * the observer that toggles the `is-visible` class. Reduced-motion users get the
 * content shown immediately (handled in CSS), so we simply reveal everything.
 */
export class ScrollReveal extends HTMLElement {
  #observer?: IntersectionObserver;

  connectedCallback(): void {
    const items = Array.from(this.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (items.length === 0) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    this.#observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // reveal once, then stop watching
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    items.forEach((el) => this.#observer!.observe(el));
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
  }
}

if (!customElements.get("scroll-reveal")) {
  customElements.define("scroll-reveal", ScrollReveal);
}
