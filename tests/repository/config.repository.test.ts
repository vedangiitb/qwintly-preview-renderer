import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ConfigRepository', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should return null when supabase client is not initialized', async () => {
    vi.doMock('@/lib/supabase', () => ({
      supabase: null,
    }));
    const { ConfigRepository } = await import('../../repository/config.repository');
    const result = await ConfigRepository.fetchConfig('config-id');
    expect(result).toBeNull();
  });

  it('should return page_config on successful query', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { page_config: { test: true } }, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    vi.doMock('@/lib/supabase', () => ({
      supabase: {
        from: mockFrom,
      },
    }));

    const { ConfigRepository } = await import('../../repository/config.repository');
    const result = await ConfigRepository.fetchConfig('config-id');

    expect(mockFrom).toHaveBeenCalledWith('generation_snapshots');
    expect(mockSelect).toHaveBeenCalledWith('page_config');
    expect(mockEq).toHaveBeenCalledWith('id', 'config-id');
    expect(result).toEqual({ test: true });
  });

  it('should return null and console.error on query error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('Db Error') });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    vi.doMock('@/lib/supabase', () => ({
      supabase: {
        from: mockFrom,
      },
    }));

    const { ConfigRepository } = await import('../../repository/config.repository');
    const result = await ConfigRepository.fetchConfig('config-id');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should return null when no data is returned', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    vi.doMock('@/lib/supabase', () => ({
      supabase: {
        from: mockFrom,
      },
    }));

    const { ConfigRepository } = await import('../../repository/config.repository');
    const result = await ConfigRepository.fetchConfig('config-id');

    expect(result).toBeNull();
  });
});
