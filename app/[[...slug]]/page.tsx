import { RenderElement } from "@/lib/renderer/RenderElement";
import { fetchConfig } from "@/services/fetchConfig.service";
import type { BuilderElement } from "@/types/elements";
import { PageConfig, Snapshot } from "@/types/snapshot";
import { headers } from "next/headers";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { compile } from "tailwindcss";

const projectRoot = process.cwd();
const tailwindRoot = path.join(projectRoot, "node_modules", "tailwindcss");

const tailwindCompilerPromise = compile('@import "tailwindcss";', {
  async loadStylesheet(id, base) {
    // Keep resolution statically analyzable for Turbopack by avoiding `require.resolve(...)`.
    // Tailwind's runtime compiler will request `tailwindcss` (and sometimes subpaths).
    const resolved =
      id === "tailwindcss"
        ? path.join(tailwindRoot, "index.css")
        : id.startsWith("tailwindcss/")
          ? path.join(tailwindRoot, `${id.slice("tailwindcss/".length)}.css`)
          : id.startsWith(".") || id.startsWith("/")
            ? path.resolve(base, id)
            : id;

    const content = await readFile(resolved, "utf8");
    return {
      path: resolved,
      base: path.dirname(resolved),
      content,
    };
  },
});

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const h = await headers();
  const pageConfigId = h.get("x-gen-session-id");

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

  const candidates = collectTailwindCandidates(pageConfig.elements);
  const compiler = await tailwindCompilerPromise;
  const runtimeCss = compiler.build(candidates);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: runtimeCss }} />
      {pageConfig.elements.map((el) => (
        <RenderElement key={el.id} el={el} />
      ))}
    </>
  );
}

function collectTailwindCandidates(elements: BuilderElement[]) {
  const out = new Set<string>();
  const visit = (els: BuilderElement[]) => {
    for (const el of els) {
      if (el.className) {
        for (const token of el.className.split(/\s+/g)) {
          const t = token.trim();
          if (t) out.add(t);
        }
      }
      if (el.children?.length) visit(el.children);
    }
  };
  visit(elements);
  return [...out];
}
