/**
 * <site-nav> — owns the responsive navigation behaviour.
 *
 * The element is sticky (CSS). On scroll past a small threshold it gains a
 * [data-scrolled] attribute, which squashes the bar to a compact height and
 * reveals a hairline shadow — set once, then held for the rest of the scroll.
 *
 * On desktop the links are always visible (CSS). On mobile a toggle button
 * shows/hides the menu panel. This element manages the open/closed state,
 * ARIA attributes, Escape-to-close, and closing after a link is tapped.
 */
const SCROLL_THRESHOLD = 24; // px scrolled before the bar squashes

export class SiteNav extends HTMLElement {
  #toggle: HTMLButtonElement | null = null;
  #panel: HTMLElement | null = null;
  #open = false;
  #scrolled = false;
  #ticking = false;

  connectedCallback(): void {
    this.#toggle = this.querySelector<HTMLButtonElement>("[data-nav-toggle]");
    this.#panel = this.querySelector<HTMLElement>("[data-nav-panel]");

    window.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#updateScrolled(); // honour an already-scrolled position on load

    if (!this.#toggle || !this.#panel) return;

    this.#toggle.addEventListener("click", this.#onToggle);
    this.#panel.addEventListener("click", this.#onPanelClick);
    document.addEventListener("keydown", this.#onKeydown);
    this.#sync();
  }

  disconnectedCallback(): void {
    window.removeEventListener("scroll", this.#onScroll);
    this.#toggle?.removeEventListener("click", this.#onToggle);
    this.#panel?.removeEventListener("click", this.#onPanelClick);
    document.removeEventListener("keydown", this.#onKeydown);
  }

  #onScroll = (): void => {
    if (this.#ticking) return;
    this.#ticking = true;
    requestAnimationFrame(() => {
      this.#updateScrolled();
      this.#ticking = false;
    });
  };

  #updateScrolled(): void {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    if (scrolled === this.#scrolled) return;
    this.#scrolled = scrolled;
    this.toggleAttribute("data-scrolled", scrolled);
  }

  #onToggle = (): void => {
    this.#open = !this.#open;
    this.#sync();
  };

  #onPanelClick = (e: Event): void => {
    // Close when a navigation link inside the panel is activated.
    if ((e.target as HTMLElement).closest("a")) {
      this.#open = false;
      this.#sync();
    }
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.#open) {
      this.#open = false;
      this.#sync();
      this.#toggle?.focus();
    }
  };

  #sync(): void {
    if (!this.#toggle || !this.#panel) return;
    this.#toggle.setAttribute("aria-expanded", String(this.#open));
    this.#panel.toggleAttribute("data-open", this.#open);
    this.#toggle.dataset.open = String(this.#open);
  }
}

if (!customElements.get("site-nav")) {
  customElements.define("site-nav", SiteNav);
}
