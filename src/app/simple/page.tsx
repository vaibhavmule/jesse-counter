import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { jesseCounterAbi } from "~/contracts/abi";
import SimpleCounterPageClient from "./SimpleCounterPageClient";

const JESSE_CONTRACT = '0xbA5502536ad555eD625397872EA09Cd4A39ea014' as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const revalidate = 60; // Revalidate every 60 seconds

async function getCounterValue(): Promise<string> {
  try {
    const totalCount = await publicClient.readContract({
      address: JESSE_CONTRACT,
      abi: jesseCounterAbi,
      functionName: 'getTotalCount',
    });
    return totalCount.toString();
  } catch (error) {
    console.error('Error fetching counter for embed:', error);
    return '0';
  }
}

export default async function SimplePage() {
  const counterValue = await getCounterValue();
  const formattedCounter = counterValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden">
      {/* Server-rendered preview - shows immediately in embed */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center z-0 px-4 py-6" 
        id="embed-preview"
        style={{
          paddingTop: '24px',
          paddingBottom: '24px',
        }}
      >
        {/* Character Image */}
        <div className="mb-8 relative">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FFD400] rounded-full blur-2xl opacity-30" />
            <img
              src="/icon.png"
              alt="Jesse character"
              className="w-28 h-28 rounded-full border-4 border-[#FFD400] relative z-10 shadow-[0_8px_24px_rgba(255,212,0,0.3)]"
            />
          </div>
        </div>

        {/* Total Counter Display */}
        <div className="mb-8 text-center">
          <p className="text-[#475569] uppercase tracking-wider text-xs mb-3 font-semibold">
            Total Incremented
          </p>
          <div 
            className="text-7xl md:text-8xl font-black text-[#FFD400] mb-1"
            style={{
              textShadow: '0 4px 12px rgba(255, 212, 0, 0.3)',
            }}
          >
            {formattedCounter}
          </div>
        </div>

        {/* App Info */}
        <div className="text-center">
          <p className="text-lg font-bold text-[#0F172A] mb-2">
            $JESSE COUNTER
          </p>
          <p className="text-sm text-[#475569]">
            Increment the counter on Base
          </p>
        </div>
      </div>

      {/* Client-side interactive component - hydrates after load */}
      <div className="relative z-10 w-full" suppressHydrationWarning>
        <SimpleCounterPageClient />
      </div>
    </div>
  );
}
