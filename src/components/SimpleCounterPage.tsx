'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousTotalCount, setPreviousTotalCount] = useState<bigint | undefined>(undefined);
  const totalCountRef = useRef<HTMLDivElement>(null);

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
      
      // Trigger confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // If app not added yet, prompt to add after increment
      if (!added) {
        actions.addMiniApp();
      }
    }
  }, [isConfirmed, refetchTotalCount, refetchUserCount, refetchLastIncrement, added, actions]);

  /**
   * Animate number change when total count increases
   */
  useEffect(() => {
    if (totalCount && previousTotalCount !== undefined && totalCount > previousTotalCount) {
      // Trigger animation
      if (totalCountRef.current) {
        totalCountRef.current.classList.add('animate-pulse');
        setTimeout(() => {
          totalCountRef.current?.classList.remove('animate-pulse');
        }, 600);
      }
    }
    setPreviousTotalCount(totalCount);
  }, [totalCount, previousTotalCount]);

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
      const formattedCount = totalCount
        ? totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : '0';
      
      await actions.composeCast({
        text: `Just incremented the @jesse.base.eth counter to ${formattedCount}! I am based now 🟦`,
        embeds: [`${APP_URL}/simple`],
      });
      
      // Mark as shared (adds +1 to jesse balance calculation)
      setHasShared(true);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, [actions, totalCount]);

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
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4 py-6">
        <div className="text-center max-w-md">
          <div className="text-2xl font-bold text-[#0F172A] mb-4">
            Switch to Base
          </div>
          <p className="text-[#475569] mb-6">
            This app only works on Base chain.
          </p>
          <Button
            onClick={handleSwitchChain}
            className="!bg-[#FFD400] hover:!bg-[#FACC15] !text-[#0F172A] font-bold rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105"
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
      className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ? `${context.client.safeAreaInsets.top + 24}px` : '24px',
        paddingBottom: context?.client.safeAreaInsets?.bottom ? `${context.client.safeAreaInsets.bottom + 24}px` : '24px',
      }}
    >
      {/* Confetti effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Character Image */}
      <div className="mb-8 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-[#FFD400] rounded-full blur-2xl opacity-30 animate-pulse" />
        <img
          src={CHARACTER_IMAGE_URL}
          alt="Jesse character"
            className="w-28 h-28 rounded-full border-4 border-[#FFD400] relative z-10 shadow-[0_8px_24px_rgba(255,212,0,0.3)]"
        />
        </div>
      </div>

      {/* Stats Cards */}
      {isConnected && address && (
        <div className="flex justify-center gap-4 mb-8 w-full max-w-[320px] relative z-10">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
            <p className="text-[#475569] text-xs uppercase tracking-wider text-center mb-2 font-semibold">
              You incremented
            </p>
            <p className="text-3xl font-bold text-[#FFD400] text-center transition-all duration-300">
              {userCount?.toString() ?? "0"}
            </p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
            <p className="text-[#475569] text-xs uppercase tracking-wider text-center mb-2 font-semibold">
              Last Increment
            </p>
            <p className="text-xl font-bold text-[#0F172A] text-center">
              {formatTimeElapsed(lastIncrement) ?? "—"}
            </p>
          </div>
        </div>
      )}

      {/* Total Counter Display - Bigger and More Prominent */}
      <div className="mb-8 text-center relative z-10">
        <p className="text-[#475569] uppercase tracking-wider text-xs mb-3 font-semibold">
          Total Incremented
        </p>
        <div 
          ref={totalCountRef}
          className="text-7xl md:text-8xl font-black text-[#FFD400] mb-1 transition-all duration-500"
          style={{
            textShadow: '0 4px 12px rgba(255, 212, 0, 0.3)',
          }}
        >
          {totalCount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0'}
        </div>
      </div>

      {/* Jesse Balance */}
      <div className="mb-8 text-center relative z-10">
        <div className="text-2xl font-bold text-[#0052FF] mb-1">
          {jesseBalance} $jesse
        </div>
        <div className="text-xs text-[#475569]">
          {hasShared ? '1 from increment + 1 from share' : '1 from increment'}
        </div>
      </div>

      {/* Connect/Switch Chain/Increment Button */}
      <div className="mb-4 w-full max-w-[320px] relative z-10">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            className="!bg-[#FFD400] hover:!bg-[#FACC15] active:!bg-[#EAB308] !text-[#0F172A] font-bold text-base py-4 rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
          >
            {chainId !== base.id ? 'Switch to Base' : 'Connect Wallet'}
          </Button>
        ) : chainId !== base.id ? (
          <Button
            onClick={handleSwitchChain}
            className="!bg-[#FFD400] hover:!bg-[#FACC15] active:!bg-[#EAB308] !text-[#0F172A] font-bold text-base py-4 rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
          >
            Switch to Base
          </Button>
        ) : (
          <Button
            onClick={handleIncrement}
            disabled={isPending || isConfirming}
            isLoading={isPending || isConfirming}
            className="!bg-[#FFD400] hover:!bg-[#FACC15] active:!bg-[#EAB308] !text-[#0F172A] font-bold text-base py-4 rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:!bg-[#CBD5E1] disabled:!text-[#64748B] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          >
            {isPending ? 'Processing...' : isConfirming ? 'Confirming...' : 'Increment'}
          </Button>
        )}
      </div>

      {/* Share Button - only show after increment is done */}
      {(userCount && Number(userCount) > 0) && !hasShared && (
        <div className="mb-4 w-full max-w-[320px] relative z-10">
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-2 border-[#0052FF] text-[#0052FF] hover:bg-[rgba(0,82,255,0.08)] bg-transparent text-sm py-3 rounded-xl transition-all duration-300 hover:scale-105"
          >
            Share (+1 $jesse)
          </Button>
        </div>
      )}

      {/* Transaction Error */}
      {writeError && (
        <div className="mt-3 w-full max-w-[320px] relative z-10">
          {renderError(writeError)}
        </div>
      )}

      {/* Transaction Success Message */}
      {isConfirmed && (
        <div className="mt-3 text-[#22C55E] text-sm font-semibold animate-pulse relative z-10">
          ✨ Transaction confirmed! +1 $jesse
        </div>
      )}
    </div>
  );
}

// Confetti Effect Component
function ConfettiEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 80 }).map((_, i) => {
        // Use Jesse Yellow and Base Blue color palette
        const colors = ['#FFD400', '#FACC15', '#EAB308', '#0052FF', '#2563EB', '#FFD400'];
        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = 4 + Math.random() * 6;
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 50;
        
        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${startX}%`,
              top: '-10px',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              '--end-x': `${endX}%`,
            } as React.CSSProperties}
          >
            <div
              className={shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rotate-45' : ''}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                boxShadow: `0 0 ${size}px ${colors[Math.floor(Math.random() * colors.length)]}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function BlockedMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-12 h-12 text-[#F59E0B] mb-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      <h2 className="text-xl font-semibold mb-2 text-[#0F172A] text-center">
        Farcaster Client Required
      </h2>
      <p className="text-base text-[#475569] text-center max-w-md">
        {message}
      </p>
    </div>
  );
}
