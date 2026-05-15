export type Brand = "talabat" | "copilot";

interface BrandConfig {
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

// Switch branding here: "talabat" or "copilot"
const ACTIVE_BRAND: Brand = "copilot";

export const brand = CONFIGS[ACTIVE_BRAND];
