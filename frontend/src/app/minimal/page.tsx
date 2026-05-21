"use client";

import { ExampleLayout } from "@/components/example-layout";
import { MinimalCanvas } from "@/components/minimal-canvas";
import { getBrandConfig } from "@/lib/brand";

import { CopilotChat } from "@copilotkit/react-core/v2";

export default function MinimalPage() {
  return (
    <ExampleLayout
      brand={getBrandConfig("copilot")}
      chatContent={
        <CopilotChat
          input={{ disclaimer: () => null, className: "pb-6" }}
        />
      }
      appContent={<MinimalCanvas />}
    />
  );
}
