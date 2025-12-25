"use client";

import dynamic from "next/dynamic";

// Dynamic import for client-side only rendering
const SimpleCounterPage = dynamic(
  () => import("~/components/SimpleCounterPage").then((mod) => ({ default: mod.SimpleCounterPage })),
  {
    ssr: false,
  }
);

export default function SimpleCounterPageClient() {
  return <SimpleCounterPage />;
}

