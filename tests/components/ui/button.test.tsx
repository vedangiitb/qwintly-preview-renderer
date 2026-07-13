import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../../../components/ui/button';

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: 'Click me' });
    expect(btn).toBeInTheDocument();
  });

  it('should apply variant and size classes', () => {
    const { rerender } = render(<Button variant="destructive" size="sm">Destructive</Button>);
    let btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-destructive/10');
    expect(btn).toHaveClass('h-7');

    rerender(<Button variant="secondary" size="lg">Secondary</Button>);
    btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-secondary');
    expect(btn).toHaveClass('h-9');
  });

  it('should render as a slot component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('group/button');
  });
});
