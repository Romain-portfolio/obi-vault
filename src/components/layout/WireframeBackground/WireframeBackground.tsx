import { useEffect, useRef } from 'react';
import clsx from 'clsx';

import { type AppBackgroundColor } from '../../../config/theme';

import styles from './WireframeBackground.module.css';

/**
 * All size-related props (linkDistance, lineWidth, speed, parallax, density)
 * are in CSS pixels.
 */

export type WireframeBackgroundProps = {
    variant?: AppBackgroundColor;
    density?: number;
    speed?: number;
    linkDistance?: number;
    spacing?: number;
    lineWidth?: number;
    opacity?: number;
    parallax?: number;
    /**
     * Highest frame rate of the animation (default 60).
     * 30 halves the work, with almost the same look since points move slowly.
     */
    maxFps?: number;
    /**
     * Highest pixel ratio of the canvas (default 2, sharp on Retina screens).
     * 1 divides the number of pixels by 4 on Retina screens, lines get slightly softer.
     * Changing it recreates the network.
     */
    maxPixelRatio?: number;
};

type Point = {
    x: number;
    y: number;
    depth: number; // 1 = foreground, 0.35 = background
    vx: number;
    vy: number;
    cruiseSpeed: number; // speed the point naturally returns to
    pushX: number; // push from neighbours that are too close
    pushY: number;
    screenX: number; // on-screen position (after parallax)
    screenY: number;
};

type AnimatedConfig = Required<
    Pick<
        WireframeBackgroundProps,
        'speed' | 'linkDistance' | 'lineWidth' | 'opacity' | 'parallax' | 'maxFps'
    >
>;

const MIN_POINTS = 60;
const MAX_POINTS = 520;

// Lines are grouped by opacity level and each group is drawn with a single stroke(),
// instead of one stroke() per line. 16 levels cannot be told apart from a continuous opacity.
const ALPHA_LEVELS = 16;

// Parallax smoothing: share of the remaining gap closed every 1/60 s
const PARALLAX_EASING = 0.05;

export default function WireframeBackground({
    variant = 'cyan',
    density = 0.45, // 0.5 = sparser network, 2 = denser
    speed = 0.7, // movement speed
    linkDistance = 350, // max distance (px) to link two points
    spacing = 0.7, // repulsion between points (0 = none, 1 = very even)
    lineWidth = 1, // line thickness
    opacity = 0.75, // max opacity of a line
    parallax = 50, // network offset following the mouse (0 = none)
    maxFps = 30, // highest frame rate
    maxPixelRatio = 1, // highest canvas resolution
}: WireframeBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Settings are read on every frame through this ref: changing speed,
    // opacity, line width or frame rate applies without restarting the animation.
    // The color is not here: it comes from the CSS (see the module file).
    const config = useRef<AnimatedConfig | null>(null);
    config.current = { speed, linkDistance, lineWidth, opacity, parallax, maxFps };

    useEffect(() => {
        const element = canvasRef.current;
        const context = element?.getContext('2d');
        if (!element || !context) return;

        // Non-nullable constants, usable inside the inner functions
        const canvas: HTMLCanvasElement = element;
        const ctx: CanvasRenderingContext2D = context;
        const getConfig = () => config.current as AnimatedConfig;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const random = (min: number, max: number) => min + Math.random() * (max - min);

        let width = 0;
        let height = 0;
        let minDistance = 0;
        let frameId = 0;
        let points: Point[] = [];
        const mouse = { x: 0, y: 0, active: false };
        const offset = { x: 0, y: 0 };

        // Area where points live: the screen plus a margin so links do not pop at the edges.
        // A single object, updated once per frame (not one new object per point and per frame).
        const bounds = { left: 0, right: 0, top: 0, bottom: 0 };

        function updateBounds() {
            const { linkDistance: distance, parallax: shift } = getConfig();
            const margin = distance + shift;
            bounds.left = -margin;
            bounds.right = width + margin;
            bounds.top = -margin;
            bounds.bottom = height + margin;
        }

        // One reusable list of segments per opacity level: [x1, y1, x2, y2, x1, y1, ...]
        const segments: number[][] = Array.from({ length: ALPHA_LEVELS }, () => []);

        // Line color comes from the CSS `color` property of the canvas.
        // getComputedStyle forces a style recalculation, so the color is only read again
        // when the variant (class of the canvas) or the theme (attributes of <html>) changes.
        let lineColor = getComputedStyle(canvas).color;
        let needsRedraw = true;
        const colorObserver = new MutationObserver(() => {
            lineColor = getComputedStyle(canvas).color;
            needsRedraw = true;
        });
        colorObserver.observe(canvas, { attributes: true, attributeFilter: ['class'] });
        colorObserver.observe(document.documentElement, { attributes: true });

        function createPoint(existing: Point[]): Point {
            // Several random tries, keeping the one farthest from the points
            // already placed: the starting distribution is even
            let x = 0;
            let y = 0;
            let best = -1;
            for (let attempt = 0; attempt < 12; attempt++) {
                const candidateX = random(bounds.left, bounds.right);
                const candidateY = random(bounds.top, bounds.bottom);
                let closest = Infinity;
                for (const p of existing) {
                    closest = Math.min(closest, (p.x - candidateX) ** 2 + (p.y - candidateY) ** 2);
                }
                if (closest > best) {
                    best = closest;
                    x = candidateX;
                    y = candidateY;
                }
            }
            const angle = random(0, Math.PI * 2);
            const depth = random(0.35, 1);
            const velocity = random(8, 26) * depth;
            return {
                x,
                y,
                depth,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                cruiseSpeed: velocity,
                pushX: 0,
                pushY: 0,
                screenX: 0,
                screenY: 0,
            };
        }

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            updateBounds();
            const area = (bounds.right - bounds.left) * (bounds.bottom - bounds.top);
            const wanted = Math.round(((width * height) / 5500) * density);
            const count = Math.max(MIN_POINTS, Math.min(MAX_POINTS, wanted));

            points = [];
            for (let i = 0; i < count; i++) points.push(createPoint(points));

            minDistance = spacing * Math.sqrt(area / count);
            needsRedraw = true;
        }

        function move(p: Point, dt: number) {
            // Neighbours that are too close bend the trajectory...
            p.vx += p.pushX * 45 * dt;
            p.vy += p.pushY * 45 * dt;
            p.pushX = 0;
            p.pushY = 0;

            // ...then the point gently returns to its cruise speed
            const currentSpeed = Math.hypot(p.vx, p.vy) || 1;
            const factor = 1 + (p.cruiseSpeed / currentSpeed - 1) * Math.min(1, 1.5 * dt);
            p.vx *= factor;
            p.vy *= factor;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Leaving the point area: come back from the opposite edge, off-screen
            if (p.x > bounds.right) p.x = bounds.left;
            else if (p.x < bounds.left) p.x = bounds.right;
            if (p.y > bounds.bottom) p.y = bounds.top;
            else if (p.y < bounds.top) p.y = bounds.bottom;
        }

        let lastTime = performance.now();

        function loop(now: number) {
            frameId = requestAnimationFrame(loop);
            const cfg = getConfig();

            // Skip display frames above maxFps (1 ms of tolerance for timing jitter)
            if (now - lastTime < 1000 / cfg.maxFps - 1) return;
            const elapsed = Math.min((now - lastTime) / 1000, 0.05);
            const dt = elapsed * cfg.speed;
            lastTime = now;

            const moving = !reducedMotion.matches;
            updateBounds();

            // Parallax: close a share of the gap that depends on the elapsed time,
            // so the smoothing feels the same at any frame rate
            const targetX = mouse.active ? (mouse.x / width - 0.5) * cfg.parallax : 0;
            const targetY = mouse.active ? (mouse.y / height - 0.5) * cfg.parallax : 0;
            const easing = 1 - Math.pow(1 - PARALLAX_EASING, elapsed * 60);
            const shiftX = (targetX - offset.x) * easing;
            const shiftY = (targetY - offset.y) * easing;
            offset.x += shiftX;
            offset.y += shiftY;
            const offsetChanged = Math.abs(shiftX) > 0.01 || Math.abs(shiftY) > 0.01;

            // With reduced motion the points stand still: the frame is only
            // redrawn when something visible changed
            if (!moving && !offsetChanged && !needsRedraw) return;
            needsRedraw = false;

            for (const p of points) {
                if (moving) move(p, dt);
                p.screenX = p.x - offset.x * p.depth;
                p.screenY = p.y - offset.y * p.depth;
            }

            const radius = cfg.linkDistance;
            const radiusSquared = radius * radius;

            for (let i = 0; i < points.length; i++) {
                const a = points[i];
                for (let j = i + 1; j < points.length; j++) {
                    const b = points[j];
                    const dx = a.screenX - b.screenX;
                    const dy = a.screenY - b.screenY;
                    const distanceSquared = dx * dx + dy * dy;
                    if (distanceSquared > radiusSquared) continue;

                    const distance = Math.sqrt(distanceSquared);

                    // Neighbours too close push each other (useless when points stand still)
                    if (moving && distance < minDistance && distance > 0) {
                        const force = (1 - distance / minDistance) / distance;
                        a.pushX += dx * force;
                        a.pushY += dy * force;
                        b.pushX -= dx * force;
                        b.pushY -= dy * force;
                    }

                    // Skip links that are entirely off-screen
                    if (
                        Math.max(a.screenX, b.screenX) < 0 ||
                        Math.min(a.screenX, b.screenX) > width ||
                        Math.max(a.screenY, b.screenY) < 0 ||
                        Math.min(a.screenY, b.screenY) > height
                    ) {
                        continue;
                    }

                    // Opacity between 0 and 1 (before the opacity prop), stored as a level
                    const alpha = (1 - distance / radius) * Math.min(a.depth, b.depth);
                    const level = Math.min(ALPHA_LEVELS - 1, Math.floor(alpha * ALPHA_LEVELS));
                    segments[level].push(a.screenX, a.screenY, b.screenX, b.screenY);
                }
            }

            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = cfg.lineWidth;
            ctx.lineCap = 'round';
            ctx.strokeStyle = lineColor;

            // One path and one stroke() per opacity level
            for (let level = 0; level < ALPHA_LEVELS; level++) {
                const list = segments[level];
                if (list.length === 0) continue;
                ctx.globalAlpha = ((level + 0.5) / ALPHA_LEVELS) * cfg.opacity;
                ctx.beginPath();
                for (let k = 0; k < list.length; k += 4) {
                    ctx.moveTo(list[k], list[k + 1]);
                    ctx.lineTo(list[k + 2], list[k + 3]);
                }
                ctx.stroke();
                list.length = 0;
            }

            ctx.globalAlpha = 1;
        }

        const handlePointerMove = (event: PointerEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            mouse.active = true;
        };

        // Empty relatedTarget = the pointer left the window
        const handlePointerOut = (event: PointerEvent) => {
            if (!event.relatedTarget) mouse.active = false;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerout', handlePointerOut);

        resize();
        frameId = requestAnimationFrame(loop);

        // Cleanup when the component unmounts (or restarts)
        return () => {
            cancelAnimationFrame(frameId);
            colorObserver.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerout', handlePointerOut);
        };
        // These settings change the network layout: points are recreated
    }, [density, spacing, maxPixelRatio]);

    return (
        <canvas
            ref={canvasRef}
            className={clsx(styles.canvas, styles[variant])}
            aria-hidden="true"
        />
    );
}
