import { describe, it, expect } from 'vitest';
import { cn } from '../../lib/utils';

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle tailwind conflict resolution', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
  });

  it('should handle conditional classes', () => {
    expect(cn('p-4', false && 'bg-red-500', true && 'text-white')).toBe('p-4 text-white');
  });

  it('should handle empty inputs and return empty string', () => {
    expect(cn()).toBe('');
  });
});
