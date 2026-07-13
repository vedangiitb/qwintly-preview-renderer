import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

const mockHeadersGet = vi.fn();
vi.mock('next/headers', () => ({
  headers: async () => ({
    get: mockHeadersGet,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/snapshot/getSnapshot', () => ({
  getSnapshot: vi.fn(),
}));


vi.mock('node:fs/promises', () => {
  const mockReadFile = vi.fn().mockResolvedValue('/* mocked css file */');
  return {
    default: {
      readFile: mockReadFile,
    },
    readFile: mockReadFile,
  };
});

vi.mock('next/script', () => ({
  default: ({ src, ...props }: any) => <script src={src} data-testid="next-script" {...props} />
}));

describe('Page Component', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_PARENT_ORIGIN = 'https://parent.example.com';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('renders NotFoundPage when x-gen-session-id header is missing', async () => {
    mockHeadersGet.mockReturnValue(null);
    const Page = (await import('../../../app/[[...slug]]/page')).default;

    const pagePromise = Page({ params: Promise.resolve({ slug: [] }) });
    const { unmount } = render(await pagePromise);

    expect(screen.getByText('404')).toBeInTheDocument();
    unmount();
  });

  it('renders NotFoundPage when snapshot is null', async () => {
    mockHeadersGet.mockReturnValue('session-123');
    const { getSnapshot } = await import('@/lib/snapshot/getSnapshot');
    vi.mocked(getSnapshot).mockResolvedValueOnce(null as any);

    const Page = (await import('../../../app/[[...slug]]/page')).default;
    const pagePromise = Page({ params: Promise.resolve({ slug: [] }) });
    const { unmount } = render(await pagePromise);

    expect(screen.getByText('404')).toBeInTheDocument();
    unmount();
  });

  it('renders NotFoundPage when route config in snapshot is missing', async () => {
    mockHeadersGet.mockReturnValue('session-123');
    const { getSnapshot } = await import('@/lib/snapshot/getSnapshot');
    vi.mocked(getSnapshot).mockResolvedValueOnce({
      routes: {} // missing root route "/"
    } as any);

    const Page = (await import('../../../app/[[...slug]]/page')).default;
    const pagePromise = Page({ params: Promise.resolve({ slug: [] }) });
    const { unmount } = render(await pagePromise);

    expect(screen.getByText('404')).toBeInTheDocument();
    unmount();
  });

  it('throws error when NEXT_PUBLIC_PARENT_ORIGIN is missing', async () => {
    delete process.env.NEXT_PUBLIC_PARENT_ORIGIN;
    mockHeadersGet.mockReturnValue('session-123');

    const { getSnapshot } = await import('@/lib/snapshot/getSnapshot');
    vi.mocked(getSnapshot).mockResolvedValueOnce({
      routes: {
        '/': { elements: [] }
      }
    } as any);

    const Page = (await import('../../../app/[[...slug]]/page')).default;
    const pagePromise = Page({ params: Promise.resolve({ slug: [] }) });
    await expect(pagePromise).rejects.toThrow('NEXT_PUBLIC_PARENT_ORIGIN is required');
  });

  it('renders correctly with matching pageConfig, custom script and Tailwind compilation', async () => {
    mockHeadersGet.mockReturnValue('session-123');
    const { getSnapshot } = await import('@/lib/snapshot/getSnapshot');

    const elements = [
      {
        id: 'el-text',
        type: 'text',
        className: 'text-lg font-bold',
        props: { text: 'Hello Page' },
        children: [
          { id: 'el-child-text', type: 'text', className: 'text-sm text-slate-500', props: { text: 'Sub text' } }
        ]
      }
    ];
    vi.mocked(getSnapshot).mockResolvedValueOnce({
      routes: {
        '/about/us': { elements }
      }
    } as any);

    const Page = (await import('../../../app/[[...slug]]/page')).default;
    const pagePromise = Page({ params: Promise.resolve({ slug: ['about', 'us'] }) });
    const { container } = render(await pagePromise);

    expect(screen.getByText('Hello Page')).toBeInTheDocument();

    // Assert style tag is populated
    const style = container.querySelector('style');
    expect(style).toBeInTheDocument();
    expect(style?.innerHTML).toBe('mocked-tailwind-css');

    // Assert script is populated
    const script = screen.getByTestId('next-script');
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute('src', '/qwintly-preview-editor.js');
    expect(script).toHaveAttribute('data-parent-origin', 'https://parent.example.com');
  });

  it('covers the tailwind loadStylesheet resolution paths', async () => {
    mockHeadersGet.mockReturnValue('session-123');
    const { getSnapshot } = await import('@/lib/snapshot/getSnapshot');
    vi.mocked(getSnapshot).mockResolvedValueOnce({
      routes: {
        '/': { elements: [] }
      }
    } as any);

    const Page = (await import('../../../app/[[...slug]]/page')).default;
    await Page({ params: Promise.resolve({ slug: [] }) });

    const loader = (globalThis as any).__capturedLoadStylesheet;
    expect(loader).not.toBeNull();

    // 1. id === "tailwindcss"
    const r1 = await loader('tailwindcss', '');
    expect(r1.path).toContain('node_modules');
    expect(r1.path).toContain('index.css');

    // 2. id.startsWith("tailwindcss/")
    const r2 = await loader('tailwindcss/theme', '');
    expect(r2.path).toContain('node_modules');
    expect(r2.path).toContain('theme.css');

    // 3. id.startsWith(".")
    const r3 = await loader('../../../app/[[...slug]]/local.css', '/some/base');
    expect(r3.path).toBe(path.resolve('/some/base', '../../../app/[[...slug]]/local.css'));

    // 4. default path resolution
    const r4 = await loader('some-other-path', '');
    expect(r4.path).toBe('some-other-path');
  });
});
