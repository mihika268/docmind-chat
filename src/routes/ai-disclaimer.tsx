import { createFileRoute } from "@tanstack/react-router";
import AIDisclaimer from "../pages/AIDisclaimer";

export const Route = createFileRoute("/ai-disclaimer")({
  component: AIDisclaimer,
});