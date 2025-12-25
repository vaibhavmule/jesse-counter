"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamic import for client-side only rendering
const SimpleCounterPage = dynamic(
  () => import("~/components/SimpleCounterPage").then((mod) => ({ default: mod.SimpleCounterPage })),
  {
    ssr: false,
    loading: () => null, // Don't show loading state, keep server preview visible
  }
);

export default function SimpleCounterPageClient() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hide the server-rendered preview once client component is mounted and ready
  useEffect(() => {
    if (isMounted) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        const preview = document.getElementById('embed-preview');
        if (preview) {
          preview.style.opacity = '0';
          preview.style.transition = 'opacity 0.3s ease-out';
          setTimeout(() => {
            preview.style.display = 'none';
          }, 300);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  // Show nothing until mounted to avoid hydration mismatch
  // The server-rendered preview will be visible until this component loads
  if (!isMounted) {
    return null;
  }

  return <SimpleCounterPage />;
}

