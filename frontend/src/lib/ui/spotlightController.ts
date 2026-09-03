/**
 * ============================================================================
 * NIVREN VISUAL SPOTLIGHT CONTROLLER (AGENTIC UI FOCUS ENGINE)
 * ============================================================================
 * Autonomously spotlights and draws glowing focus halos around specific cards,
 * statistics, buttons, and sections on the webpage when triggered by the AI agent.
 */

class SpotlightController {
  private activeElement: HTMLElement | null = null;
  private spotlightOverlay: HTMLDivElement | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  public highlight(selector: string, label?: string, durationMs: number = 6000) {
    if (typeof document === "undefined") return;

    this.clearSpotlight();

    // Try finding element by ID, attribute, or CSS selector
    let target = document.querySelector(selector) as HTMLElement | null;
    if (!target && !selector.startsWith("#") && !selector.startsWith(".")) {
      target = (document.getElementById(selector) ||
        document.querySelector(`[id*="${selector}"]`) ||
        document.querySelector(`[data-section*="${selector}"]`)) as HTMLElement | null;
    }

    if (!target) {
      console.warn(`[SPOTLIGHT] Element '${selector}' not found on the active page.`);
      return;
    }

    this.activeElement = target;

    // Smoothly bring element into comfortable reading view
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Create glowing pulse spotlight badge on the element
    target.classList.add("agent-spotlight-active");

    const overlay = document.createElement("div");
    overlay.className = "agent-spotlight-badge";
    overlay.innerHTML = `
      <div class="agent-spotlight-inner">
        <span class="agent-spotlight-dot"></span>
        <span class="agent-spotlight-label">${label || "AI Agent Focus"}</span>
      </div>
    `;

    target.style.position = target.style.position === "static" || !target.style.position ? "relative" : target.style.position;
    target.appendChild(overlay);
    this.spotlightOverlay = overlay;

    this.cleanupTimer = setTimeout(() => {
      this.clearSpotlight();
    }, durationMs);
  }

  public clearSpotlight() {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.spotlightOverlay) {
      try {
        this.spotlightOverlay.remove();
      } catch (_) {}
      this.spotlightOverlay = null;
    }
    if (this.activeElement) {
      this.activeElement.classList.remove("agent-spotlight-active");
      this.activeElement = null;
    }
  }
}

export const spotlightController = new SpotlightController();
