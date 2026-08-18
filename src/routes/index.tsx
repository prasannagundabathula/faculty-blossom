import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// The BVCITS website is a static multi-page site served from /public.
// "/" hands off to the site homepage so all existing relative links keep working.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BVCITS Autonomous — Institute of Technology & Science" },
      {
        name: "description",
        content:
          "Bonam Venkata Chalamayya Institute of Technology & Science (Autonomous), Batlapalem — academics, placements, campus life and the BVCITS ERP student & faculty portals.",
      },
      { property: "og:title", content: "BVCITS Autonomous — Institute of Technology & Science" },
      {
        property: "og:description",
        content:
          "Explore BVCITS academics, departments, placements and the BVCITS ERP student & faculty portals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/index.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <a href="/index.html" className="text-sm text-muted-foreground underline">
        Continue to the BVCITS website
      </a>
    </div>
  );
}
