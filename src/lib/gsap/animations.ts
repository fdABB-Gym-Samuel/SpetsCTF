import gsap from "gsap";

/**
 * Plays all registered animations scoped to the provided root element.
 * Returns a GSAP context that can be reverted to clean up.
 */
export function playAnimations(root: HTMLElement, stagger: number = 0.1) {
  // Create a GSAP context to scope all selectors inside `root`
  const ctx = gsap.context(() => {
    // Top-down slide
    gsap.fromTo(
      ".gsap-top-down",
      { y: -8 },
      { y: 0, duration: 0.6, ease: "power2.out" }
    );

    // Top-down with opacity
    gsap.fromTo(
      ".gsap-top-down-opacity",
      { y: -8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: stagger }
    );

    // Bottom-up with opacity
    gsap.fromTo(
      ".gsap-bottom-up-opacity",
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: stagger }
    );

    // Left-to-right with opacity
    gsap.fromTo(
      ".gsap-left-right-opacity",
      { x: -8, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: stagger }
    );

    // Right-to-left with opacity
    gsap.fromTo(
      ".gsap-right-left-opacity",
      { x: 8, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: stagger }
    );

    // Fade in
    gsap.fromTo(
      ".gsap-opacity",
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: "power2.out" }
    );

    // Fade in slow
    gsap.fromTo(
      ".gsap-opacity-slow",
      { opacity: 0 },
      { opacity: 1, duration: 2, ease: "power2.inOut" }
    );
  }, root);

  return ctx;
}
