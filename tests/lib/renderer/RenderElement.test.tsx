import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RenderElement } from '../../../lib/renderer/RenderElement';
import type { BuilderElement } from '@/types/elements';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    refresh: mockRefresh,
  }),
}));

describe('RenderElement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when el.visible is false', () => {
    const el: BuilderElement = {
      id: 'el-1',
      type: 'div',
      visible: false,
    };
    const { container } = render(<RenderElement el={el} />);
    expect(container.firstChild).toBeNull();
  });

  it('should show warning for unknown element type', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el: BuilderElement = {
      id: 'el-1',
      type: 'unknown-type' as any,
    };
    render(<RenderElement el={el} />);
    expect(screen.getByText('Unknown element: unknown-type')).toBeInTheDocument();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('should render registry components (e.g. div) and support custom click actions', () => {
    const el: BuilderElement = {
      id: 'div-1',
      type: 'div',
      className: 'test-class',
      props: {
        text: 'hello',
      },
    };
    const { container } = render(<RenderElement el={el} />);
    const div = container.querySelector('#div-1')!;
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('test-class');
  });

  it('should handle onClick route action (replace: false)', () => {
    const el: BuilderElement = {
      id: 'div-route',
      type: 'div',
      props: {
        onClick: {
          kind: 'route',
          href: '/target-route',
          replace: false,
        },
      },
    };
    const { container } = render(<RenderElement el={el} />);
    const div = container.querySelector('#div-route')!;
    fireEvent.click(div);
    expect(mockPush).toHaveBeenCalledWith('/target-route');
  });

  it('should handle onClick route action (replace: true)', () => {
    const el: BuilderElement = {
      id: 'div-route-replace',
      type: 'div',
      props: {
        onClick: {
          kind: 'route',
          href: '/target-route',
          replace: true,
        },
      },
    };
    const { container } = render(<RenderElement el={el} />);
    const div = container.querySelector('#div-route-replace')!;
    fireEvent.click(div);
    expect(mockReplace).toHaveBeenCalledWith('/target-route');
  });

  it('should handle onClick back action', () => {
    const el: BuilderElement = {
      id: 'div-back',
      type: 'div',
      props: {
        onClick: {
          kind: 'back',
        },
      },
    };
    const { container } = render(<RenderElement el={el} />);
    const div = container.querySelector('#div-back')!;
    fireEvent.click(div);
    expect(mockBack).toHaveBeenCalled();
  });

  it('should handle onClick reload action', () => {
    const el: BuilderElement = {
      id: 'div-reload',
      type: 'div',
      props: {
        onClick: {
          kind: 'reload',
        },
      },
    };
    const { container } = render(<RenderElement el={el} />);
    const div = container.querySelector('#div-reload')!;
    fireEvent.click(div);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should handle onClick external action (newTab: true)', () => {
    const mockOpen = vi.fn();
    const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(mockOpen);
    const el: BuilderElement = {
      id: 'div-ext-tab',
      type: 'div',
      props: {
        onClick: {
          kind: 'external',
          href: 'https://example.com',
          newTab: true,
        },
      },
    };
    const { container } = render(<RenderElement el={el} />);
    const div = container.querySelector('#div-ext-tab')!;
    fireEvent.click(div);
    expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('should handle onClick external action (newTab: false)', () => {
    const mockLoc = { href: '' };
    const locSpy = vi.spyOn(globalThis, 'location', 'get').mockReturnValue(mockLoc as any);
    const el: BuilderElement = {
      id: 'div-ext-same',
      type: 'div',
      props: {
        onClick: {
          kind: 'external',
          href: 'https://example.com',
          newTab: false,
        },
      },
    };
    const { container } = render(<RenderElement el={el} />);
    const div = container.querySelector('#div-ext-same')!;
    fireEvent.click(div);
    expect(mockLoc.href).toBe('https://example.com');
    locSpy.mockRestore();
  });
});
