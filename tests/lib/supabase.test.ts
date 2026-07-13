import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ mockClient: true }),
}));

describe('supabase client library', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should return null when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const { getSupabaseClient, supabase } = await import('../../lib/supabase');
    expect(getSupabaseClient()).toBeNull();
    expect(supabase).toBeNull();
  });

  it('should initialize client when env vars are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'some-key';

    const { getSupabaseClient, supabase } = await import('../../lib/supabase');
    const { createClient } = await import('@supabase/supabase-js');

    expect(getSupabaseClient()).toEqual({ mockClient: true });
    expect(supabase).toEqual({ mockClient: true });
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'some-key');
  });
});
