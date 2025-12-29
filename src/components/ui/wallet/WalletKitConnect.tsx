"use client";

import { useWalletKitLink } from "@walletkit/react-link";
import { useState, useEffect } from "react";
import { Button } from "../Button";
import { truncateAddress } from "../../../lib/truncateAddress";

/**
 * WalletKitConnect component provides wallet connection functionality using WalletKit SDK.
 * 
 * This component allows users to:
 * - Connect their wallet using WalletKit
 * - View their connected wallet address
 * - Disconnect their wallet
 * 
 * @example
 * ```tsx
 * <WalletKitConnect />
 * ```
 */
export function WalletKitConnect() {
  const walletKit = useWalletKitLink();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get address from walletKit instance
  const address = walletKit?.activeAddress;
  
  // Check connection status - user is connected if address exists
  const isConnected = !!address;

  /**
   * Handles wallet connection
   */
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await walletKit?.connect();
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Handles wallet disconnection
   */
  const handleDisconnect = async () => {
    try {
      setError(null);
      await walletKit?.disconnect();
    } catch (err) {
      console.error("Wallet disconnection error:", err);
      setError(err instanceof Error ? err.message : "Failed to disconnect wallet");
    }
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    if (!isConnected && walletKit && !isConnecting) {
      // Optionally auto-connect if there's a stored session
      // walletKit.connect().catch(console.error);
    }
  }, [walletKit, isConnected, isConnecting]);

  if (isConnected && address) {
    return (
      <div className="space-y-4 w-full">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Connected Wallet
          </div>
          <div className="font-mono text-sm font-semibold">
            {truncateAddress(address)}
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        <Button 
          onClick={handleDisconnect}
          variant="outline"
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connect your wallet using WalletKit to get started
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      <Button 
        onClick={handleConnect}
        isLoading={isConnecting}
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  );
}

