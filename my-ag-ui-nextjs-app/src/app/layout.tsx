"use client";

import "./globals.css";
import "@copilotkit/react-core/v2/styles.css";

import { CopilotKit } from "@copilotkit/react-core/v2";
import { ThemeProvider } from "@/hooks/use-theme";
// A2UI catalog: definitions + renderers in ./declarative-generative-ui/
import { demonstrationCatalog } from "./declarative-generative-ui/renderers";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/talabat-logo.png"
        />
        {/* Material Symbols font — required for A2UI basic Icon component. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className={`antialiased`}>
        <ThemeProvider>
          <CopilotKit
            runtimeUrl="/api/copilotkit"
            inspectorDefaultAnchor={{ horizontal: "right", vertical: "top" }}
            a2ui={{ catalog: demonstrationCatalog }}
            openGenerativeUI={{}}
            useSingleEndpoint={false}
          >
            {children}
          </CopilotKit>
        </ThemeProvider>
      </body>
    </html>
  );
}
