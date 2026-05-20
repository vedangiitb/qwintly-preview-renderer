import { getSnapshot } from "@/lib/snapshot/getSnapshot";
import { buildCssVars } from "@/lib/styles/buildCssVars";
import { defaultStyleConfigJson } from "@/types/styleConfig";
import { headers } from "next/headers";

export default async function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pageConfigId = h.get("x-gen-session-id");

  const cfg = pageConfigId
    ? (await getSnapshot(pageConfigId)).styleConfig
    : defaultStyleConfigJson;
  const styleTokens = buildCssVars(cfg);

  return (
    <>
      <style id="qwintly-style-tokens">{styleTokens}</style>
      {children}
    </>
  );
}
