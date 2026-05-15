export type Brand = "talabat" | "copilot";

export interface BrandConfig {
  title: string;
  favicon: { href: string; type: string };
  sidebar: {
    logoSrc: string;
    alt: string;
    logoClassName: string;
    text?: string;
  };
}

const CONFIGS: Record<Brand, BrandConfig> = {
  talabat: {
    title: "Talabat",
    favicon: { href: "/talabat-logo.png", type: "image/png" },
    sidebar: {
      logoSrc: "/talabat-logo.png",
      alt: "Talabat",
      logoClassName: "h-10 rounded-lg",
    },
  },
  copilot: {
    title: "CopilotKit",
    favicon: { href: "/copilotkit-logo-mark.svg", type: "image/svg+xml" },
    sidebar: {
      logoSrc: "/copilotkit-logo-mark.svg",
      alt: "CopilotKit",
      logoClassName: "h-7",
      text: "CopilotKit",
    },
  },
};

export function getBrandConfig(name: Brand): BrandConfig {
  return CONFIGS[name];
}

// Default brand used by the root layout's <head> for initial SSR and by any
// consumer that doesn't pick one explicitly. Pages can pass a different brand
// to ExampleLayout to override at runtime.
export const brand: BrandConfig = CONFIGS.talabat;
