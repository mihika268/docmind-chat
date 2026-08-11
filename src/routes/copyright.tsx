import { createFileRoute } from "@tanstack/react-router";
import Copyright from "../pages/Copyright";

export const Route = createFileRoute("/copyright")({
  component: Copyright,
});