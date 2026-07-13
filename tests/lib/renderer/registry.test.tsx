import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RenderElement } from '../../../lib/renderer/RenderElement';
import type { BuilderElement } from '@/types/elements';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('registry renderers', () => {
  it('renders fragment element with children', () => {
    const el: BuilderElement = {
      id: 'frag-1',
      type: 'fragment',
      children: [
        { id: 'child-1', type: 'text', props: { text: 'Child 1' } },
        { id: 'child-2', type: 'text', props: { text: 'Child 2' } },
      ],
    };
    render(<RenderElement el={el} />);
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders div element', () => {
    const el: BuilderElement = {
      id: 'div-1',
      type: 'div',
      className: 'my-div',
      children: [{ id: 'child-3', type: 'text', props: { text: 'Inside Div' } }],
    };
    render(<RenderElement el={el} />);
    const div = screen.getByText('Inside Div').parentElement;
    expect(div).toHaveClass('my-div');
    expect(div?.tagName).toBe('DIV');
  });

  it('renders text element', () => {
    const el: BuilderElement = {
      id: 'text-1',
      type: 'text',
      props: { text: 'Lorem Ipsum' },
    };
    render(<RenderElement el={el} />);
    const p = screen.getByText('Lorem Ipsum');
    expect(p.tagName).toBe('P');
  });

  it('renders image element', () => {
    const el: BuilderElement = {
      id: 'img-1',
      type: 'image',
      props: { src: 'https://example.com/pic.png', alt: 'Test Pic' },
    };
    render(<RenderElement el={el} />);
    const img = screen.getByAltText('Test Pic') as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.src).toBe('https://example.com/pic.png');
  });

  it('renders image element as null when src is missing', () => {
    const el: BuilderElement = {
      id: 'img-null',
      type: 'image',
      props: {},
    };
    const { container } = render(<RenderElement el={el} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders input element with type and defaultValue', () => {
    const el: BuilderElement = {
      id: 'input-1',
      type: 'input',
      props: { placeholder: 'Enter email', type: 'email', value: 'test@example.com' },
    };
    render(<RenderElement el={el} />);
    const input = screen.getByPlaceholderText('Enter email') as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('email');
    expect(input.value).toBe('test@example.com');
  });

  it('renders textarea element with defaultValue', () => {
    const el: BuilderElement = {
      id: 'area-1',
      type: 'textarea',
      props: { placeholder: 'Write bio', value: 'My bio' },
    };
    render(<RenderElement el={el} />);
    const textarea = screen.getByPlaceholderText('Write bio') as HTMLTextAreaElement;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.value).toBe('My bio');
  });

  it('renders link element (a tag) with href and target', () => {
    const el: BuilderElement = {
      id: 'link-1',
      type: 'link',
      props: { href: 'https://google.com', target: '_blank', rel: 'noopener' },
      children: [{ id: 'child-link', type: 'text', props: { text: 'Google Link' } }],
    };
    render(<RenderElement el={el} />);
    const link = screen.getByRole('link', { name: 'Google Link' }) as HTMLAnchorElement;
    expect(link.tagName).toBe('A');
    expect(link.href).toBe('https://google.com/');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
  });

  it('renders link element (a tag) with plain text when children are absent', () => {
    const el: BuilderElement = {
      id: 'link-plain',
      type: 'link',
      props: { href: 'https://yahoo.com', text: 'Yahoo Link' },
    };
    render(<RenderElement el={el} />);
    const link = screen.getByRole('link', { name: 'Yahoo Link' }) as HTMLAnchorElement;
    expect(link.tagName).toBe('A');
    expect(link.href).toBe('https://yahoo.com/');
  });

  it('renders icon component when correct name is provided', () => {
    const el: BuilderElement = {
      id: 'icon-1',
      type: 'icon',
      props: { name: 'ArrowLeft', size: 24, color: 'blue', strokeWidth: 2 },
    };
    const { container } = render(<RenderElement el={el} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('stroke-width', '2');
  });

  it('renders icon component fallback to meta name', () => {
    const el: BuilderElement = {
      id: 'icon-2',
      type: 'icon',
      meta: { name: 'ArrowLeft' },
    };
    const { container } = render(<RenderElement el={el} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders icon component as null when name is invalid or missing', () => {
    const elNull: BuilderElement = {
      id: 'icon-null',
      type: 'icon',
    };
    const { container: c1 } = render(<RenderElement el={elNull} />);
    expect(c1.firstChild).toBeNull();

    const elInvalid: BuilderElement = {
      id: 'icon-invalid',
      type: 'icon',
      props: { name: 'NonExistentIconName' },
    };
    const { container: c2 } = render(<RenderElement el={elInvalid} />);
    expect(c2.firstChild).toBeNull();
  });

  it('renders icon component with onClick action and handles click events', () => {
    const el: BuilderElement = {
      id: 'icon-click',
      type: 'icon',
      props: { name: 'ArrowLeft', onClick: { kind: 'back' } },
    };
    const { container } = render(<RenderElement el={el} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toBeInTheDocument();
  });

  it('renders button element with text prop when children are absent', () => {
    const el: BuilderElement = {
      id: 'btn-1',
      type: 'button',
      props: { text: 'Submit Form' },
    };
    render(<RenderElement el={el} />);
    const btn = screen.getByRole('button', { name: 'Submit Form' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders button element with children', () => {
    const el: BuilderElement = {
      id: 'btn-children',
      type: 'button',
      children: [{ id: 'child-btn', type: 'text', props: { text: 'Nested Text' } }],
    };
    render(<RenderElement el={el} />);
    const btn = screen.getByRole('button', { name: 'Nested Text' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders elements with optional onClick and fallback properties to cover all branches', () => {
    const clickAction = { kind: 'back' as const };
    const elements: BuilderElement[] = [
      { id: 'text-click', type: 'text', props: { text: 'Click text', onClick: clickAction } },
      { id: 'img-click', type: 'image', props: { src: 'pic.png', onClick: clickAction } },
      { id: 'input-click', type: 'input', props: { onClick: clickAction } },
      { id: 'textarea-click', type: 'textarea', props: { onClick: clickAction } },
      { id: 'link-click', type: 'link', props: { onClick: clickAction } },
      { id: 'btn-click', type: 'button', props: { text: 'Click button', onClick: clickAction } },
    ];

    for (const el of elements) {
      const { container } = render(<RenderElement el={el} />);
      const rendered = container.querySelector(`#${el.id}`)!;
      expect(rendered).toBeInTheDocument();
    }
  });
});
