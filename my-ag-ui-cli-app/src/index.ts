import * as readline from "readline";
import { randomUUID } from "@ag-ui/client";
import { agent } from "./agent";
import process from "process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chatLoop() {
  console.log("🤖 AG-UI chat started! Type your messages and press Enter. Press Ctrl+D to quit.\n");

  return new Promise<void>((resolve) => {
    const promptUser = () => {
      rl.question("> ", async (input: string) => {
        if (input.trim() === "") {
          promptUser();
          return;
        }
        console.log("");

        rl.pause();

        agent.messages.push({
          id: randomUUID(),
          role: "user",
          content: input.trim(),
        });

        try {
          await agent.runAgent(
            {},
            {
              onTextMessageStartEvent() {
                process.stdout.write("🤖 AG-UI assistant: ");
              },
              onTextMessageContentEvent({ event }) {
                process.stdout.write(event.delta);
              },
              onTextMessageEndEvent() {
                console.log("\n");
              },
              onToolCallStartEvent({ event }) {
                console.log("🔧 Tool call:", event.toolCallName);
              },
              onToolCallArgsEvent({ event }) {
                process.stdout.write(event.delta);
              },
              onToolCallEndEvent() {
                console.log("");
              },
              onToolCallResultEvent({ event }) {
                if (event.content) {
                  console.log("🔍 Tool call result:", event.content);
                }
              },
            },
          );
        } catch (error) {
          console.error("❌ Error running agent:", error);
        }

        rl.resume();
        promptUser();
      });
    };

    rl.on("close", () => {
      console.log("\n👋 Goodbye!");
      resolve();
    });

    promptUser();
  });
}

async function main() {
  await chatLoop();
}

main().catch(console.error);
