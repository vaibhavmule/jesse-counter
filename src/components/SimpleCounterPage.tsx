'use client';

import React, { useCallback } from 'react';
import { useMiniApp } from '@neynar/react';
import { Button } from './ui/Button';

const CHARACTER_IMAGE_URL = '/icon.png';
const JESSE_CONTRACT = '0xbA5502536ad555eD625397872EA09Cd4A39ea014' as const;
const CONTRACT_EXPLORER_URL = `https://basescan.org/address/${JESSE_CONTRACT}`;

/**
 * SimpleCounterPage component displays a coming soon message.
 * 
 * Features:
 * - Coming soon message
 * - $Jesse 2.0 announcement
 * - Ideas submission message
 * - Waitlist signup button
 */
export function SimpleCounterPage() {
  // --- Hooks ---
  const { context, actions, added, notificationDetails } = useMiniApp();

  // --- Handlers ---
  /**
   * Handles joining the waitlist by adding the mini app and enabling notifications.
   */
  const handleJoinWaitlist = useCallback(() => {
    actions.addMiniApp();
  }, [actions]);

  // --- Checks ---
  // Only works in Farcaster client (allow for testing in development)
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!context?.client && !isDevelopment) {
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
          This mini app is designed for Farcaster client only.
        </p>
      </div>
    );
  }

  // --- Render ---
  const basePaddingTop = context?.client.safeAreaInsets?.top ? context.client.safeAreaInsets.top + 24 : 24;
  
  return (
    <div 
      className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4 py-6"
      style={{
        paddingTop: `${basePaddingTop}px`,
        paddingBottom: context?.client.safeAreaInsets?.bottom ? `${context.client.safeAreaInsets.bottom + 24}px` : '24px',
      }}
    >
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

      {/* Coming Soon Title */}
      <div className="mb-6 text-center relative z-10">
        <h1 className="text-4xl font-black text-[#FFD400] mb-2" style={{
          textShadow: '0 4px 12px rgba(255, 212, 0, 0.3)',
        }}>
          Coming Soon
        </h1>
        <p className="text-lg text-[#475569] font-medium mb-4">
          Will be back
        </p>
      </div>

      {/* Info Card */}
      <div className="mb-8 w-full max-w-[400px] relative z-10">
        <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <p className="text-sm text-[#475569] leading-relaxed text-center mb-4">
            Thanks everyone who supported early on! 🙏
          </p>
          <p className="text-sm text-red-700 leading-relaxed text-center mb-4">
            The Counter has been taken down. It was also sybil attacked.{' '}
            <a 
              href={CONTRACT_EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-red-800"
            >
              View Contract
            </a>
          </p>
          <p className="text-sm text-[#475569] leading-relaxed text-center">
            Thinking what to do next, if you have any ideas DM to{' '}
            <a 
              href="https://warpcast.com/vaibhavmule" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0052FF] font-semibold hover:underline"
            >
              @vaibhavmule
            </a>
          </p>
        </div>
      </div>

      {/* Waitlist Button */}
      <div className="w-full max-w-[320px] relative z-10">
        <Button
          onClick={handleJoinWaitlist}
          disabled={added && !!notificationDetails}
          className="!bg-[#FFD400] hover:!bg-[#FACC15] active:!bg-[#EAB308] !text-[#0F172A] font-bold text-base py-4 rounded-2xl transition-all duration-200 relative disabled:!bg-[#CBD5E1] disabled:!text-[#64748B] disabled:cursor-not-allowed"
          style={{
            boxShadow: added && !!notificationDetails 
              ? '0 4px 0 0 #A3A3A3' 
              : '0 8px 0 0 #EAB308, 0 12px 20px rgba(0,0,0,0.15)',
            transform: 'translateY(0)',
          }}
          onMouseDown={(e) => {
            if (!added || !notificationDetails) {
              e.currentTarget.style.transform = 'translateY(4px)';
              e.currentTarget.style.boxShadow = '0 4px 0 0 #EAB308, 0 8px 16px rgba(0,0,0,0.12)';
            }
          }}
          onMouseUp={(e) => {
            if (!added || !notificationDetails) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 0 0 #EAB308, 0 12px 20px rgba(0,0,0,0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!added || !notificationDetails) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 0 0 #EAB308, 0 12px 20px rgba(0,0,0,0.15)';
            }
          }}
        >
          {added && !!notificationDetails 
            ? '✓ Added & Notifications Enabled' 
            : 'Add App & Enable Notifications'}
        </Button>
      </div>
    </div>
  );
}
