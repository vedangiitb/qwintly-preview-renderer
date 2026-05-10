import { ConfigRepository } from "@/repository/config.repository";

export const fetchConfig = async (configId: string) => {
  return await ConfigRepository.fetchConfig(configId);
};
