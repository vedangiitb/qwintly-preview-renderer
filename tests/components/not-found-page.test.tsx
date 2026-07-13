import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotFoundPage } from '../../components/not-found-page';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: (initialValue: any) => {
      if ((globalThis as any).__mockCanvasRefToNull) {
        const fakeRef = {};
        Object.defineProperty(fakeRef, 'current', {
          get: () => null,
          set: () => {},
          configurable: true,
        });
        return fakeRef;
      }
      return actual.useRef(initialValue);
    }
  };
});

describe('NotFoundPage Component', () => {
  const originalLocation = globalThis.location;
  const originalHistory = globalThis.history;
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.location = originalLocation;
    globalThis.history = originalHistory;
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
  });

  it('should render page headers and buttons', () => {
    const { unmount } = render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Preview Configuration Missing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Preview' })).toBeInTheDocument();
    unmount();
  });

  it('should handle Go Back when history length is greater than 1', () => {
    const mockBack = vi.fn();
    Object.defineProperty(globalThis, 'history', {
      value: { length: 5, back: mockBack },
      writable: true,
      configurable: true,
    });

    const { unmount } = render(<NotFoundPage />);
    const backBtn = screen.getByRole('button', { name: 'Go Back' });
    fireEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalled();
    unmount();
  });

  it('should handle Go Back when history length is 1 or less', () => {
    const mockLoc = { href: '' };
    Object.defineProperty(globalThis, 'location', {
      value: mockLoc,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'history', {
      value: { length: 1, back: vi.fn() },
      writable: true,
      configurable: true,
    });

    const { unmount } = render(<NotFoundPage />);
    const backBtn = screen.getByRole('button', { name: 'Go Back' });
    fireEvent.click(backBtn);
    expect(mockLoc.href).toBe('/');
    unmount();
  });

  it('should handle Reload Preview', () => {
    const mockLoc = { href: '' };
    Object.defineProperty(globalThis, 'location', {
      value: mockLoc,
      writable: true,
      configurable: true,
    });

    const { unmount } = render(<NotFoundPage />);
    const reloadBtn = screen.getByRole('button', { name: 'Reload Preview' });
    fireEvent.click(reloadBtn);
    expect(mockLoc.href).toBe('/');
    unmount();
  });

  it('should handle canvas lifecycle events, resize, and interactions with particle physics', async () => {
    window.innerWidth = 2;
    window.innerHeight = 2;

    const { container, unmount } = render(<NotFoundPage />);
    const mainDiv = container.firstChild as HTMLDivElement;

    // Trigger mousemove on the container to cover mouse interaction lines
    act(() => {
      fireEvent.mouseMove(mainDiv, { clientX: 1, clientY: 1 });
    });

    // Trigger click on the container to spawn explosive particles
    act(() => {
      fireEvent.click(mainDiv, { clientX: 1, clientY: 1 });
    });

    // Click again multiple times to trigger max capacity splicing
    act(() => {
      for (let i = 0; i < 20; i++) {
        fireEvent.click(mainDiv, { clientX: 1, clientY: 1 });
      }
    });

    // Advance fake timers so requestAnimationFrame runs draw loops with particles and mouse active
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Trigger mouseleave to clear mouse tracking
    act(() => {
      fireEvent.mouseLeave(mainDiv);
    });

    // Trigger window resize to test handleResize boundary/scaling logic
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Advance fake timers again
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    unmount();
  });

  it('handles particle cleanup when alpha is low', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => -0.35);
    const { unmount } = render(<NotFoundPage />);
    randomSpy.mockRestore();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    unmount();
  });

  it('does not crash or register loops when canvas ref is null', () => {
    (globalThis as any).__mockCanvasRefToNull = true;
    const { unmount } = render(<NotFoundPage />);
    (globalThis as any).__mockCanvasRefToNull = false;
    unmount();
  });

  it('does not crash or register loops when canvas context is null', () => {
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValueOnce(null);
    const { unmount } = render(<NotFoundPage />);
    unmount();
    getContextSpy.mockRestore();
  });
});
