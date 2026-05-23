import { BuilderElement } from "./elements";
import { StyleConfig } from "./styleConfig";

export type PageConfig = {
  elements: BuilderElement[];
};

export type Snapshot = {
  routes: Record<string, PageConfig>;
  styleConfig: StyleConfig;
};
