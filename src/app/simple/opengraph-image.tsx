import { ImageResponse } from 'next/og';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { jesseCounterAbi } from '~/contracts/abi';

const JESSE_CONTRACT = '0xbA5502536ad555eD625397872EA09Cd4A39ea014' as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getCounterValue(): Promise<string> {
  try {
    const totalCount = await publicClient.readContract({
      address: JESSE_CONTRACT,
      abi: jesseCounterAbi,
      functionName: 'getTotalCount',
    });
    return totalCount.toString();
  } catch (error) {
    console.error('Error fetching counter for OG image:', error);
    return '0';
  }
}

export default async function Image() {
  const counterValue = await getCounterValue();
  const formattedCounter = counterValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        }}
      >
        {/* Glow effect background */}
        <div
          tw="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Top hat icon area */}
        <div tw="flex items-center justify-center mb-6">
          <div
            tw="flex items-center justify-center"
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: '#fbbf24',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
            }}
          >
            <span tw="text-3xl">🎩</span>
          </div>
        </div>

        {/* Title */}
        <h1
          tw="text-5xl font-bold mb-2"
          style={{
            color: '#60a5fa',
            fontFamily: 'system-ui, -apple-system',
            letterSpacing: '0.05em',
          }}
        >
          $JESSE COUNTER
        </h1>

        {/* Subtitle */}
        <p
          tw="text-xl mb-10"
          style={{
            color: '#e2e8f0',
            opacity: 0.9,
            fontFamily: 'system-ui, -apple-system',
          }}
        >
          LIVE ON-CHAIN COUNT
        </p>

        {/* Counter Value */}
        <div
          tw="flex items-center justify-center"
          style={{
            fontSize: '140px',
            fontWeight: '900',
            color: '#4ade80',
            fontFamily: 'system-ui, -apple-system',
            lineHeight: '1',
            textShadow: '0 0 30px rgba(74, 222, 128, 0.5)',
          }}
        >
          {formattedCounter}
        </div>

        {/* Bottom text */}
        <p
          tw="text-lg mt-10"
          style={{
            color: '#a78bfa',
            opacity: 0.95,
            fontFamily: 'system-ui, -apple-system',
          }}
        >
          Increment the counter
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

