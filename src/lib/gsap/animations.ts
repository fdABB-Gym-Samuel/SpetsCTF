import gsap from 'gsap';

export function playAnimations(root: HTMLElement, stagger: number = 0.1) {
    const ctx = gsap.context(() => {
        const animations = [
            {
                selector: '.gsap-top-down',
                from: { y: -8 },
                to: { y: 0, duration: 0.6, ease: 'power2.out' },
            },
            {
                selector: '.gsap-top-down-opacity',
                from: { y: -8, opacity: 0 },
                to: { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger },
            },
            {
                selector: '.gsap-bottom-up-opacity',
                from: { y: 8, opacity: 0 },
                to: { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger },
            },
            {
                selector: '.gsap-left-right-opacity',
                from: { x: -8, opacity: 0 },
                to: { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger },
            },
            {
                selector: '.gsap-right-left-opacity',
                from: { x: 8, opacity: 0 },
                to: { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger },
            },
            {
                selector: '.gsap-opacity',
                from: { opacity: 0 },
                to: { opacity: 1, duration: 0.2, ease: 'power2.out' },
            },
            {
                selector: '.gsap-opacity-slow',
                from: { opacity: 0 },
                to: { opacity: 1, duration: 2, ease: 'power2.inOut' },
            },
        ];

        // Only animate elements that exist.
        animations.forEach(({ selector, from, to }) => {
            const elements = gsap.utils.toArray(selector);
            if (elements.length > 0) {
                gsap.fromTo(selector, from, to);
            }
        });
    }, root);

    return ctx;
}
