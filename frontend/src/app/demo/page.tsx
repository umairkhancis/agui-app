"use client";

import { ExampleLayout } from "@/components/example-layout";
import { ExampleCanvas } from "@/components/example-canvas";
import { useGenerativeUIExamples, useExampleSuggestions } from "@/hooks";
import { getBrandConfig } from "@/lib/brand";

import { CopilotChat } from "@copilotkit/react-core/v2";

export default function DemoPage() {
  useGenerativeUIExamples();
  useExampleSuggestions();

  return (
    <ExampleLayout
      brand={getBrandConfig("copilot")}
      chatContent={
        <CopilotChat
          attachments={{ enabled: true }}
          input={{ disclaimer: () => null, className: "pb-6" }}
        />
      }
      appContent={<ExampleCanvas />}
    />
  );
}
