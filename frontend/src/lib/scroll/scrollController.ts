/**
 * High-Performance Single Scroll Controller for NIVREN.
 *
 * Provides human-like, buttery-smooth scrolling with:
 * - Velocity interpolation (Lerp acceleration & friction deceleration)
 * - Delta-time normalization (identical feel across 60Hz, 120Hz, 144Hz displays)
 * - Sub-pixel precision accumulation without raster jitter
 * - Immediate manual user takeover (wheel, touch, trackpad, keyboard)
 * - Smooth section navigation with sticky header offset (80px)
 * - Strict prefers-reduced-motion compliance
 * - Single-RAF architecture (no multiple simultaneous animation loops)
 */

export type ScrollSpeed = "slow" | "normal" | "fast";
export type ScrollDirection = "down" | "up";

export interface SmoothScrollOptions {
  direction?: ScrollDirection;
  speed?: ScrollSpeed | number;
}

export interface TargetScrollOptions {
  offset?: number;
  duration?: number;
  onComplete?: () => void;
}

// Speed mappings (in pixels per second)
const SPEED_MAP: Record<ScrollSpeed, number> = {
  slow: 110, // Natural relaxed reading pace
  normal: 260, // Comfortable scanning & browsing pace
  fast: 580, // Quick page traversal
};

// Physics parameters
const ACCEL_COEFFICIENT = 8.5; // Exponential ramp-up speed
const FRICTION_DECAY = 12.0; // Smooth deceleration rate on stop (~200ms graceful settle)
const MIN_VELOCITY_THRESHOLD = 1.0; // px/sec cutoff to switch to idle
const DEFAULT_HEADER_OFFSET = 80; // Default offset for sticky navbar

type ScrollMode = "idle" | "continuous" | "targeted" | "stopping";

class UnifiedScrollController {
  private mode: ScrollMode = "idle";
  private rafId: number | null = null;
  private lastTime: number = 0;

  // Velocity & Position
  private currentVelocity: number = 0; // px/sec (positive = down, negative = up)
  private targetVelocity: number = 0; // px/sec
  private subpixelAccumulator: number = 0;

  // Targeted scroll state
  private targetStartY: number = 0;
  private targetEndY: number = 0;
  private targetStartTime: number = 0;
  private targetDuration: number = 600;
  private targetCallback?: () => void;

  private isListenerAttached: boolean = false;
  private onStopCallbacks: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.attachUserEventListeners();
    }
  }

  /** Checks if user prefers reduced motion */
  public prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }

  /**
   * Start continuous, velocity-smoothed scrolling.
   */
  public startContinuousScroll(options: SmoothScrollOptions = {}): void {
    if (typeof window === "undefined") return;

    if (this.prefersReducedMotion()) {
      // Respect accessibility: do not do continuous motion
      return;
    }

    const direction = options.direction ?? "down";
    const baseSpeed =
      typeof options.speed === "number"
        ? options.speed
        : SPEED_MAP[options.speed ?? "normal"];

    const targetSpeed = direction === "down" ? baseSpeed : -baseSpeed;

    this.targetVelocity = targetSpeed;
    this.mode = "continuous";

    if (this.rafId === null) {
      this.lastTime = performance.now();
      this.subpixelAccumulator = 0;
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  /**
   * Stop continuous scrolling.
   * If `immediate` is true, cuts off immediately (e.g. on manual user touch).
   * Otherwise applies natural friction deceleration for a gentle stop.
   */
  public stopScroll(options: { immediate?: boolean; source?: "user" | "api" } = {}): void {
    if (typeof window === "undefined") return;

    const { immediate = false } = options;

    if (this.mode === "idle") return;

    if (immediate || this.prefersReducedMotion()) {
      this.currentVelocity = 0;
      this.targetVelocity = 0;
      this.subpixelAccumulator = 0;
      this.cancelLoop();
      this.mode = "idle";
      this.notifyStop();
      return;
    }

    // Graceful deceleration
    this.targetVelocity = 0;
    this.mode = "stopping";
  }

  /**
   * Smoothly scroll to a specific DOM section by ID with sticky header offset.
   */
  public scrollToSection(sectionId: string, options: TargetScrollOptions = {}): boolean {
    if (typeof window === "undefined") return false;

    // Clean section ID (strip leading # if provided)
    const cleanId = sectionId.replace(/^#/, "");
    const element = document.getElementById(cleanId);
    if (!element) return false;

    const offset = options.offset ?? DEFAULT_HEADER_OFFSET;
    const rect = element.getBoundingClientRect();
    const targetY = Math.max(0, window.scrollY + rect.top - offset);

    this.scrollToPosition(targetY, options);
    return true;
  }

  /**
   * Smoothly scroll by a relative pixel delta (e.g. single-step scroll).
   */
  public scrollByDelta(deltaY: number, options: TargetScrollOptions = {}): void {
    if (typeof window === "undefined") return;
    const targetY = window.scrollY + deltaY;
    this.scrollToPosition(targetY, options);
  }

  /**
   * Smoothly scroll to an absolute Y position with custom easing.
   */
  public scrollToPosition(targetY: number, options: TargetScrollOptions = {}): void {
    if (typeof window === "undefined") return;

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const clampedTargetY = Math.min(Math.max(0, targetY), maxScroll);

    if (this.prefersReducedMotion()) {
      window.scrollTo({ top: clampedTargetY, behavior: "auto" });
      options.onComplete?.();
      return;
    }

    this.mode = "targeted";
    this.targetStartY = window.scrollY || window.pageYOffset;
    this.targetEndY = clampedTargetY;
    this.targetStartTime = performance.now();
    this.targetCallback = options.onComplete;

    // Calculate dynamic duration based on distance (350ms min, 850ms max)
    const distance = Math.abs(this.targetEndY - this.targetStartY);
    this.targetDuration =
      options.duration ?? Math.min(850, Math.max(350, Math.round(distance * 0.45)));

    if (this.rafId === null) {
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  /** Returns whether scrolling is actively occurring */
  public isScrolling(): boolean {
    return this.mode !== "idle";
  }

  /** Register callback when scrolling stops */
  public onStop(callback: () => void): () => void {
    this.onStopCallbacks.add(callback);
    return () => this.onStopCallbacks.delete(callback);
  }

  private notifyStop(): void {
    this.onStopCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (_) {}
    });
  }

  private cancelLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Main 60/120/144fps Unified Loop
   */
  private loop = (now: number): void => {
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    // Clamp delta time to avoid large jumps if tab was unfocused
    const dt = Math.min(rawDt, 0.08);

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const currentY = window.scrollY || window.pageYOffset;

    if (this.mode === "continuous" || this.mode === "stopping") {
      // 1. Velocity Interpolation
      if (this.mode === "stopping") {
        // Apply smooth friction decay
        const friction = Math.exp(-FRICTION_DECAY * dt);
        this.currentVelocity *= friction;

        if (Math.abs(this.currentVelocity) < MIN_VELOCITY_THRESHOLD) {
          this.currentVelocity = 0;
          this.mode = "idle";
          this.cancelLoop();
          this.notifyStop();
          return;
        }
      } else {
        // Accelerate smoothly towards target velocity
        const blend = 1 - Math.exp(-ACCEL_COEFFICIENT * dt);
        this.currentVelocity += (this.targetVelocity - this.currentVelocity) * blend;
      }

      // 2. Boundary Checks
      if (this.currentVelocity > 0 && currentY >= maxScroll - 1) {
        // Reached bottom
        this.stopScroll({ immediate: true });
        return;
      }
      if (this.currentVelocity < 0 && currentY <= 1) {
        // Reached top
        this.stopScroll({ immediate: true });
        return;
      }

      // 3. Subpixel Accumulation
      this.subpixelAccumulator += this.currentVelocity * dt;
      const stepPixels = Math.trunc(this.subpixelAccumulator);

      if (stepPixels !== 0) {
        this.subpixelAccumulator -= stepPixels;
        window.scrollBy(0, stepPixels);
      }

      this.rafId = requestAnimationFrame(this.loop);
    } else if (this.mode === "targeted") {
      const elapsed = now - this.targetStartTime;
      const progress = Math.min(1, elapsed / this.targetDuration);

      // Quartic ease-out: smooth, organic deceleration
      const ease = 1 - Math.pow(1 - progress, 4);
      const newY = this.targetStartY + (this.targetEndY - this.targetStartY) * ease;

      window.scrollTo(0, Math.round(newY));

      if (progress >= 1) {
        window.scrollTo(0, Math.round(this.targetEndY));
        this.mode = "idle";
        this.cancelLoop();
        const cb = this.targetCallback;
        this.targetCallback = undefined;
        cb?.();
        this.notifyStop();
        return;
      }

      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.cancelLoop();
    }
  };

  /**
   * Listen for any user input to immediately release AI scroll control.
   */
  private attachUserEventListeners(): void {
    if (this.isListenerAttached) return;
    this.isListenerAttached = true;

    const handleUserInteraction = () => {
      // If user manually initiates scroll or touch, immediately release control
      if (this.mode !== "idle") {
        this.stopScroll({ immediate: true, source: "user" });
      }
    };

    const handleKeyInteraction = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Space",
        "Home",
        "End",
      ];
      if (scrollKeys.includes(e.key) && this.mode !== "idle") {
        this.stopScroll({ immediate: true, source: "user" });
      }
    };

    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("touchmove", handleUserInteraction, { passive: true });
    window.addEventListener("pointerdown", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleKeyInteraction, { passive: true });
  }
}

// Global Singleton
export const scrollController = new UnifiedScrollController();
