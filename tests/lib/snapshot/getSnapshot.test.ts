import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/fetchConfig.service', () => ({
  fetchConfig: vi.fn(),
}));

describe('getSnapshot service utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return snapshot when config is found', async () => {
    const { fetchConfig } = await import('@/services/fetchConfig.service');
    const { getSnapshot } = await import('../../../lib/snapshot/getSnapshot');

    const mockSnapshot = { routes: {}, styleConfig: { version: 1, tokens: {} } };
    vi.mocked(fetchConfig).mockResolvedValueOnce(mockSnapshot);

    const result = await getSnapshot('config-123');
    expect(fetchConfig).toHaveBeenCalledWith('config-123');
    expect(result).toEqual(mockSnapshot);
  });

  it('should throw an error when snapshot is null', async () => {
    const { fetchConfig } = await import('@/services/fetchConfig.service');
    const { getSnapshot } = await import('../../../lib/snapshot/getSnapshot');

    vi.mocked(fetchConfig).mockResolvedValueOnce(null);

    await expect(getSnapshot('config-invalid')).rejects.toThrow('Snapshot not found');
  });
});
