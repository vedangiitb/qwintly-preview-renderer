import { supabase } from "@/lib/supabase";

export const ConfigRepository = {
  async fetchConfig(configId: string) {
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase
      .from("generation_snapshots")
      .select("page_config")
      .eq("id", configId)
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    if (!data) {
      return null;
    }
    return data.page_config;
  },
};
