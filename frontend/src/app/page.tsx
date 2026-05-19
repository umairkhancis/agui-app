"use client";

import { ExampleLayout } from "@/components/example-layout";
import { FoodDiscoveryCanvas } from "@/components/food-discovery-canvas";
import { useGenerativeUIExamples, useExampleSuggestions } from "@/hooks";

import { CopilotChat } from "@copilotkit/react-core/v2";

export default function HomePage() {
  // useGenerativeUIExamples();
  // useExampleSuggestions();

  return (
    <ExampleLayout
      chatContent={
        <CopilotChat
          attachments={{ enabled: true }}
          input={{ disclaimer: () => null, className: "pb-6" }}
        />
      }
      appContent={<FoodDiscoveryCanvas />}
    />
  );
}
