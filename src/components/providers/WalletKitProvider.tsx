"use client";

import { WalletKitLink, WalletKitLinkProvider } from "@walletkit/react-link";
import { useMemo } from "react";

/**
 * WalletKitProvider wraps the application with WalletKitLinkProvider.
 * 
 * This provider initializes WalletKit with the project ID from environment variables
 * and makes WalletKit functionality available throughout the app.
 * 
 * To use WalletKit, you need to:
 * 1. Get a Project ID from the WalletKit dashboard (https://walletkit.com)
 * 2. Set NEXT_PUBLIC_WALLETKIT_PROJECT_ID in your environment variables
 * 
 * @example
 * ```tsx
 * <WalletKitProvider>
 *   <YourApp />
 * </WalletKitProvider>
 * ```
 */
export function WalletKitProvider({ children }: { children: React.ReactNode }) {
  // Initialize WalletKitLink with project ID from environment
  const wkLink = useMemo(() => {
    const projectId = process.env.NEXT_PUBLIC_WALLETKIT_PROJECT_ID;
    
    if (!projectId) {
      console.warn(
        "WalletKit: NEXT_PUBLIC_WALLETKIT_PROJECT_ID is not set. " +
        "WalletKit features will not work. Get your Project ID from https://walletkit.com"
      );
      // Return a dummy instance to prevent errors, but it won't work
      return new WalletKitLink({
        projectId: "dummy-project-id",
      });
    }

    return new WalletKitLink({
      projectId,
    });
  }, []);

  // Only render provider if project ID is available
  if (!process.env.NEXT_PUBLIC_WALLETKIT_PROJECT_ID) {
    console.warn("WalletKitProvider: Skipping WalletKit setup - project ID not configured");
    return <>{children}</>;
  }

  return (
    <WalletKitLinkProvider link={wkLink}>
      {children}
    </WalletKitLinkProvider>
  );
}

