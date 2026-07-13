import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('tailwindcss', () => ({
  compile: vi.fn().mockImplementation((source: string, options: any) => {
    (globalThis as any).__capturedLoadStylesheet = options?.loadStylesheet;
    return Promise.resolve({
      build: vi.fn().mockReturnValue('mocked-tailwind-css'),
    });
  }),
}));

// Stub Canvas 2D context safely
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId) => {
    if (contextId === '2d') {
      return {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        strokeStyle: '',
        lineWidth: 1,
        fillStyle: '',
      };
    }
    return null;
  });
}

// Stub requestAnimationFrame and cancelAnimationFrame
globalThis.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
  return setTimeout(cb, 16);
});
globalThis.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
  clearTimeout(id);
});
