import { RenderElement } from "@/lib/renderer/RenderElement";
import { fetchConfig } from "@/services/fetchConfig.service";
import { PageConfig, Snapshot } from "@/types/snapshot";
import { headers } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const h = await headers();
  const pageConfigId = h.get("x-page-config-id");

  if (!pageConfigId) {
    return <div>404</div>;
  }

  const { slug } = await params;

  const route = slug?.length ? `/${slug.join("/")}` : "/";

  const snapshot: Snapshot = await fetchConfig(pageConfigId);

  if (!snapshot) {
    return <div>404</div>;
  }

  const pageConfig: PageConfig = snapshot.routes[route];

  if (!pageConfig) {
    return <div>404</div>;
  }

  return pageConfig.elements.map((el) => <RenderElement key={el.id} el={el} />);
}
