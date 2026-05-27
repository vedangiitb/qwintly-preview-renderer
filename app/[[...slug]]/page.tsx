import { RenderElement } from "@/lib/renderer/RenderElement";
import { getSnapshot } from "@/lib/snapshot/getSnapshot";
import type { BuilderElement } from "@/types/elements";
import { PageConfig, Snapshot } from "@/types/snapshot";
import { headers } from "next/headers";
import Script from "next/script";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { compile } from "tailwindcss";
import { NotFoundPage } from "@/components/not-found-page";

const projectRoot = process.cwd();
const tailwindRoot = path.join(projectRoot, "node_modules", "tailwindcss");

const tailwindCompilerPromise = compile('@import "tailwindcss";', {
  async loadStylesheet(id, base) {
    // Keep resolution statically analyzable for Turbopack by avoiding `require.resolve(...)`.
    // Tailwind's runtime compiler will request `tailwindcss` (and sometimes subpaths).
    let resolved: string;
    if (id === "tailwindcss") {
      resolved = path.join(tailwindRoot, "index.css");
    } else if (id.startsWith("tailwindcss/")) {
      resolved = path.join(tailwindRoot, `${id.slice("tailwindcss/".length)}.css`);
    } else if (id.startsWith(".") || id.startsWith("/")) {
      resolved = path.resolve(base, id);
    } else {
      resolved = id;
    }

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
}: Readonly<{
  params: Promise<{ slug?: string[] }>;
}>) {
  const h = await headers();
  const pageConfigId = h.get("x-gen-session-id");

  if (!pageConfigId) {
    return <NotFoundPage />;
  }

  const { slug } = await params;

  const route = slug?.length ? `/${slug.join("/")}` : "/";

  const snapshot: Snapshot = await getSnapshot(pageConfigId);

  if (!snapshot) {
    return <NotFoundPage />;
  }

  const pageConfig: PageConfig = snapshot.routes[route];

  if (!pageConfig) {
    return <NotFoundPage />;
  }

  const candidates = collectTailwindCandidates(pageConfig.elements);
  const compiler = await tailwindCompilerPromise;
  const runtimeCss = compiler.build(candidates);
  const parentOrigin = process.env.NEXT_PUBLIC_PARENT_ORIGIN;

  if (!parentOrigin) throw new Error("NEXT_PUBLIC_PARENT_ORIGIN is required");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: runtimeCss }} />
      {pageConfig.elements.map((el) => (
        <RenderElement key={el.id} el={el} />
      ))}
      <Script
        src="/qwintly-preview-editor.js"
        data-parent-origin={parentOrigin}
        strategy="afterInteractive"
      />
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
