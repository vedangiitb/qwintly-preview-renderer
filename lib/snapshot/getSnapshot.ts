import "server-only";

import { cache } from "react";

import { fetchConfig } from "@/services/fetchConfig.service";
import type { Snapshot } from "@/types/snapshot";

export const getSnapshot = cache(async (configId: string): Promise<Snapshot> => {
  const snapshot = (await fetchConfig(configId)) as Snapshot | null;
  if (!snapshot) throw new Error("Snapshot not found");
  return snapshot;
});

