/**
 * Behavior Simulator
 *
 * Simulates human-like browser behavior during extraction:
 * - Mouse movement patterns
 * - Realistic scroll behavior
 * - Click coordinate variance
 * - Random dwell times
 *
 * LinkedIn tracks these signals to detect bots.
 */

import { ANTI_DETECTION } from '../shared/constants';

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulate mouse movement within the viewport.
 * Creates realistic-looking mouse events at random positions.
 */
export function simulateMouseMovement(): void {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Random position within visible area (avoid edges)
  const x = randomBetween(100, viewport.width - 100);
  const y = randomBetween(100, viewport.height - 100);

  window.dispatchEvent(
    new MouseEvent('mousemove', {
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true,
    })
  );
}

/**
 * Start periodic mouse movement simulation.
 * Returns a cleanup function to stop simulation.
 */
export function startMouseSimulation(): () => void {
  const intervalId = setInterval(
    simulateMouseMovement,
    ANTI_DETECTION.mouseMovementInterval + randomBetween(-1000, 1000)
  );

  return () => clearInterval(intervalId);
}

/**
 * Simulate a realistic scroll to a target position.
 * Uses ease-in-out curve instead of linear scrolling.
 */
export async function humanScroll(targetY: number): Promise<void> {
  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 10) return;

  const steps = randomBetween(
    ANTI_DETECTION.scrollStepsMin,
    ANTI_DETECTION.scrollStepsMax
  );

  for (let i = 0; i <= steps; i++) {
    // Ease-in-out curve
    const t = i / steps;
    const eased =
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    window.scrollTo(0, startY + distance * eased);

    await sleep(
      randomBetween(
        ANTI_DETECTION.scrollStepDelayMin,
        ANTI_DETECTION.scrollStepDelayMax
      )
    );
  }
}

/**
 * Simulate dwelling on a search result (as if reading it).
 * Scrolls it into view and pauses for a natural duration.
 */
export async function dwellOnResult(element: Element): Promise<void> {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(
    randomBetween(ANTI_DETECTION.dwellTimeMin, ANTI_DETECTION.dwellTimeMax)
  );
}

/**
 * Simulate a human-like click on an element.
 * Adds slight coordinate randomization around the element's center.
 */
export function humanClick(element: Element): void {
  const rect = element.getBoundingClientRect();

  // Click near center with slight randomization
  const x = rect.left + rect.width / 2 + randomBetween(-5, 5);
  const y = rect.top + rect.height / 2 + randomBetween(-3, 3);

  // Dispatch a realistic click sequence
  const commonProps = {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  };

  element.dispatchEvent(new MouseEvent('mousedown', commonProps));
  element.dispatchEvent(new MouseEvent('mouseup', commonProps));
  element.dispatchEvent(new MouseEvent('click', commonProps));
}
