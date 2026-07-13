import { describe, it, expect, vi } from 'vitest';
import { fetchConfig } from '../../services/fetchConfig.service';
import { ConfigRepository } from '@/repository/config.repository';

vi.mock('@/repository/config.repository', () => ({
  ConfigRepository: {
    fetchConfig: vi.fn(),
  },
}));

describe('fetchConfig service', () => {
  it('should call ConfigRepository.fetchConfig and return the value', async () => {
    vi.mocked(ConfigRepository.fetchConfig).mockResolvedValueOnce({ page_config: 'mock' } as any);
    const result = await fetchConfig('config-id');
    expect(ConfigRepository.fetchConfig).toHaveBeenCalledWith('config-id');
    expect(result).toEqual({ page_config: 'mock' });
  });
});
