'use client';

import { useCallback, useState, useEffect } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useChainId,
  useSwitchChain,
  useConnect,
} from 'wagmi';
import { useMiniApp } from '@neynar/react';
import { base } from 'wagmi/chains';
import { Button } from './ui/Button';
import { renderError } from '~/lib/errorUtils';
import { APP_URL } from '~/lib/constants';
import { jesseCounterAbi } from '~/contracts/abi';
import { config } from '~/components/providers/WagmiProvider';

const JESSE_CONTRACT = '0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59' as const;
const CHARACTER_IMAGE_URL = 'https://pbs.twimg.com/profile_images/1879556312822120448/QngrqCSC_400x400.jpg';

/**
 * SimpleCounterPage component displays a minimal counter interface.
 * 
 * Features:
 * - Pixel art character image
 * - Personalized greeting
 * - Counter display
 * - Increment button (awards 1 jesse token)
 * - Jesse token balance display
 * - Share functionality (awards +1 jesse token)
 */
export function SimpleCounterPage() {
  // --- State ---
  const [hasShared, setHasShared] = useState(false);

  // --- Hooks ---
  const { context, actions, added } = useMiniApp();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Read counter values from contract
  const { data: totalCount, refetch: refetchTotalCount } = useReadContract({
    address: JESSE_CONTRACT,
    abi: jesseCounterAbi,
    functionName: 'getTotalCount',
    query: { enabled: true },
  }) as { data: bigint | undefined; refetch: () => void };

  const { data: userCount, refetch: refetchUserCount } = useReadContract({
    address: JESSE_CONTRACT,
    abi: jesseCounterAbi,
    functionName: 'getUserCount',
    ...(address && { args: [address as `0x${string}`] }),
    query: { enabled: !!address },
  }) as { data: bigint | undefined; refetch: () => void };

  const { data: lastIncrement, refetch: refetchLastIncrement } = useReadContract({
    address: JESSE_CONTRACT,
    abi: jesseCounterAbi,
    functionName: 'getLastIncrementTimestamp',
    ...(address && { args: [address as `0x${string}`] }),
    query: { enabled: !!address },
  }) as { data: string | undefined; refetch: () => void };

  // --- Effects ---
  /**
   * Auto-prompt to add app and enable notifications on first load
   */
  useEffect(() => {
    if (!added && context?.client) {
      // Prompt to add the mini app
      actions.addMiniApp();
    }
  }, [added, context?.client, actions]);

  /**
   * Refetch counter values after transaction confirmation
   */
  useEffect(() => {
    if (isConfirmed) {
      refetchTotalCount();
      refetchUserCount();
      refetchLastIncrement();
      
      // If app not added yet, prompt to add after increment
      if (!added) {
        actions.addMiniApp();
      }
    }
  }, [isConfirmed, refetchTotalCount, refetchUserCount, refetchLastIncrement, added, actions]);

  // Calculate jesse balance: 1 per increment + 1 if shared
  const jesseBalance = userCount ? Number(userCount) + (hasShared ? 1 : 0) : 0;

  // Format time elapsed since last increment
  const formatTimeElapsed = (timestamp: string | number | undefined) => {
    if (!timestamp || timestamp === "never") return "Never";
    const numTimestamp = parseInt(timestamp.toString(), 10);
    if (isNaN(numTimestamp) || numTimestamp <= 0) return "Never";
    const now = Math.floor(Date.now() / 1000);
    const secondsElapsed = now - numTimestamp;
    if (secondsElapsed <= 0) return "Just now";

    const days = Math.floor(secondsElapsed / (24 * 60 * 60));
    const hours = Math.floor((secondsElapsed % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((secondsElapsed % (60 * 60)) / 60);
    const seconds = secondsElapsed % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && parts.length === 0) parts.push(`${seconds} sec${seconds !== 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(" ") + " ago" : "Just now";
  };

  // --- Handlers ---
  /**
   * Handles incrementing the counter by calling the contract.
   * Awards 1 jesse token per increment.
   */
  const handleIncrement = useCallback(async () => {
    if (!isConnected) {
      return;
    }

    try {
      await writeContract({
        address: JESSE_CONTRACT,
        abi: jesseCounterAbi,
        functionName: 'incrementCounter',
      });
    } catch (error) {
      console.error('Increment failed:', error);
    }
  }, [isConnected, writeContract]);

  /**
   * Handles sharing the app to earn +1 jesse token.
   */
  const handleShare = useCallback(async () => {
    try {
      await actions.composeCast({
        text: `I have just incremented $jesse counter and I am based`,
        embeds: [`${APP_URL}/simple`],
      });
      
      // Mark as shared (adds +1 to jesse balance calculation)
      setHasShared(true);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, [actions]);

  // --- Connect/Switch Handlers ---
  const { connect } = useConnect();
  
  const handleConnect = useCallback(() => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    } else {
      connect({ connector: config.connectors[0] });
    }
  }, [chainId, switchChain, connect]);

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: base.id });
  }, [switchChain]);

  // --- Checks ---
  // Only works in Farcaster client (allow for testing in development)
  // In production, this should be enforced
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!context?.client && !isDevelopment) {
    return <BlockedMessage message="This mini app is designed for Farcaster client only." />;
  }

  // Only works on Base chain (check is done in render, but we ensure it's handled)
  if (isConnected && chainId !== base.id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-6">
        <div className="text-center max-w-md">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Switch to Base
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This app only works on Base chain.
          </p>
          <Button
            onClick={handleSwitchChain}
            className="!bg-yellow-400 hover:!bg-yellow-500 !text-gray-900 font-bold"
          >
            Switch to Base
          </Button>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-6"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ? `${context.client.safeAreaInsets.top + 16}px` : '16px',
        paddingBottom: context?.client.safeAreaInsets?.bottom ? `${context.client.safeAreaInsets.bottom + 16}px` : '16px',
      }}
    >
      {/* Character Image */}
      <div className="mb-6">
        <img
          src={CHARACTER_IMAGE_URL}
          alt="Jesse character"
          className="w-24 h-24 rounded-full border-4 border-yellow-300"
        />
      </div>

      {/* Stats Cards */}
      {isConnected && address && (
        <div className="flex justify-center gap-4 mb-6 w-full max-w-[320px]">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 flex-1">
            <p className="text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider text-center mb-1">
              You incremented
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white text-center">
              {userCount?.toString() ?? "0"}
            </p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 flex-1">
            <p className="text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider text-center mb-1">
              Last Increment
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white text-center">
              {formatTimeElapsed(lastIncrement) ?? "—"}
            </p>
          </div>
        </div>
      )}

      {/* Total Counter Display - Bigger and More Prominent */}
      <div className="mb-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs mb-2">
          Total Incremented
        </p>
        <div className="text-6xl md:text-7xl font-black text-yellow-600 dark:text-yellow-400 mb-1">
          {totalCount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0'}
        </div>
      </div>

      {/* Jesse Balance */}
      <div className="mb-6 text-center">
        <div className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-0.5">
          {jesseBalance} $jesse
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {hasShared ? '1 from increment + 1 from share' : '1 from increment'}
        </div>
      </div>

      {/* Connect/Switch Chain/Increment Button */}
      <div className="mb-4 w-full max-w-[280px]">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            className="!bg-yellow-400 hover:!bg-yellow-500 !text-gray-900 font-bold text-base py-3.5 border-0"
          >
            {chainId !== base.id ? 'Switch to Base' : 'Connect Wallet'}
          </Button>
        ) : chainId !== base.id ? (
          <Button
            onClick={handleSwitchChain}
            className="!bg-yellow-400 hover:!bg-yellow-500 !text-gray-900 font-bold text-base py-3.5 border-0"
          >
            Switch to Base
          </Button>
        ) : (
          <Button
            onClick={handleIncrement}
            disabled={isPending || isConfirming}
            isLoading={isPending || isConfirming}
            className="!bg-yellow-400 hover:!bg-yellow-500 !text-gray-900 font-bold text-base py-3.5 border-0"
          >
            {isPending ? 'Processing...' : isConfirming ? 'Confirming...' : 'Increment'}
          </Button>
        )}
      </div>

      {/* Share Button - only show after increment is done */}
      {(userCount && Number(userCount) > 0) && !hasShared && (
        <div className="mb-3 w-full max-w-[280px]">
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-sm py-2.5"
          >
            Share (+1 $jesse)
          </Button>
        </div>
      )}

      {/* Transaction Error */}
      {writeError && (
        <div className="mt-3 w-full max-w-[280px]">
          {renderError(writeError)}
        </div>
      )}

      {/* Transaction Success Message */}
      {isConfirmed && (
        <div className="mt-3 text-green-600 dark:text-green-400 text-xs">
          Transaction confirmed! +1 $jesse
        </div>
      )}
    </div>
  );
}

function BlockedMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mb-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white text-center">
        Farcaster Client Required
      </h2>
      <p className="text-base text-gray-600 dark:text-gray-400 text-center max-w-md">
        {message}
      </p>
    </div>
  );
}
