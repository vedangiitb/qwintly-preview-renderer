import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SlugLayout from '../../../app/[[...slug]]/layout';

const mockHeadersGet = vi.fn();
vi.mock('next/headers', () => ({
  headers: async () => ({
    get: mockHeadersGet,
  }),
}));

vi.mock('@/lib/snapshot/getSnapshot', () => ({
  getSnapshot: vi.fn(),
}));

vi.mock('@/lib/styles/buildCssVars', () => ({
  buildCssVars: vi.fn().mockReturnValue(':root{--mocked-vars: 12px;}'),
}));

describe('SlugLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders styled tokens when x-gen-session-id header is absent', async () => {
    mockHeadersGet.mockReturnValue(null);
    const { buildCssVars } = await import('@/lib/styles/buildCssVars');
    const { defaultStyleConfigJson } = await import('@/types/styleConfig');

    const layoutPromise = SlugLayout({ children: <div data-testid="slug-child">Hello</div> });
    const rendered = render(await layoutPromise);

    expect(mockHeadersGet).toHaveBeenCalledWith('x-gen-session-id');
    expect(buildCssVars).toHaveBeenCalledWith(defaultStyleConfigJson);
    expect(screen.getByTestId('slug-child')).toBeInTheDocument();

    const styleTag = rendered.container.querySelector('#qwintly-style-tokens');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.textContent).toBe(':root{--mocked-vars: 12px;}');
  });

  it('renders styled tokens when x-gen-session-id header is present', async () => {
    mockHeadersGet.mockReturnValue('session-id-456');
    const { getSnapshot } = await import('@/lib/snapshot/getSnapshot');
    const { buildCssVars } = await import('@/lib/styles/buildCssVars');

    const mockSnapshot = {
      styleConfig: {
        version: 1,
        tokens: { radius: '5px' }
      }
    };
    vi.mocked(getSnapshot).mockResolvedValue(mockSnapshot as any);

    const layoutPromise = SlugLayout({ children: <div data-testid="slug-child">Hello</div> });
    render(await layoutPromise);

    expect(mockHeadersGet).toHaveBeenCalledWith('x-gen-session-id');
    expect(getSnapshot).toHaveBeenCalledWith('session-id-456');
    expect(buildCssVars).toHaveBeenCalledWith(mockSnapshot.styleConfig);
  });

  it('renders styled tokens when x-gen-session-id header is present but styleConfig is null', async () => {
    mockHeadersGet.mockReturnValue('session-id-789');
    const { getSnapshot } = await import('@/lib/snapshot/getSnapshot');
    const { buildCssVars } = await import('@/lib/styles/buildCssVars');
    const { defaultStyleConfigJson } = await import('@/types/styleConfig');

    vi.mocked(getSnapshot).mockResolvedValue({
      styleConfig: null
    } as any);

    const layoutPromise = SlugLayout({ children: <div data-testid="slug-child">Hello</div> });
    render(await layoutPromise);

    expect(buildCssVars).toHaveBeenCalledWith(defaultStyleConfigJson);
  });
});
