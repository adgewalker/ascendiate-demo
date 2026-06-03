/**
 * <hero-drift> — applies the slow parallax drift to its inner hero image.
 *
 * The keyframes themselves live in CSS (`.hero-img-motion`); this element owns
 * the *behaviour*: it only enables the animation once the image is on screen and
 * respects the user's reduced-motion preference. Markup degrades to a static
 * image if the script never runs.
 */
export class HeroDrift extends HTMLElement {
  #observer?: IntersectionObserver;

  connectedCallback(): void {
    const target = this.querySelector<HTMLElement>("[data-drift-target]");
    if (!target) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Only animate while visible — saves work when scrolled away.
    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          target.classList.toggle("hero-img-motion", entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );
    this.#observer.observe(target);
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
  }
}

if (!customElements.get("hero-drift")) {
  customElements.define("hero-drift", HeroDrift);
}
