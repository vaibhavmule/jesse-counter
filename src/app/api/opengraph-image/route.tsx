import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { jesseCounterAbi } from "~/contracts/abi";
import { APP_URL } from "~/lib/constants";

const JESSE_CONTRACT = '0xbA5502536ad555eD625397872EA09Cd4A39ea014' as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;
  const counterValue = await getCounterValue();
  const formattedCounter = counterValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const imageResponse = new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col items-center justify-center relative"
        style={{
          background: '#F7F7F7',
        }}
      >
        {/* Character image */}
        <div tw="flex items-center justify-center mb-8 relative">
          {/* Yellow glow effect */}
          <div
            tw="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(255, 212, 0, 0.3) 0%, transparent 70%)',
            }}
          />
          <img
            src={`${APP_URL}/icon.png`}
            alt="Jesse"
            tw="w-28 h-28 rounded-full relative z-10"
            style={{
              border: '4px solid #FFD400',
              boxShadow: '0 8px 24px rgba(255, 212, 0, 0.3)',
            }}
          />
        </div>

        {/* Title */}
        <h1
          tw="text-5xl font-bold mb-6"
          style={{
            color: '#0F172A',
            fontFamily: 'system-ui, -apple-system',
            letterSpacing: '0.05em',
          }}
        >
          $JESSE COUNTER
        </h1>

        {/* Counter Value */}
        <div
          tw="flex items-center justify-center mb-6"
          style={{
            fontSize: '140px',
            fontWeight: '900',
            color: '#FFD400',
            fontFamily: 'system-ui, -apple-system',
            lineHeight: '1',
            textShadow: '0 4px 12px rgba(255, 212, 0, 0.3)',
          }}
        >
          {formattedCounter}
        </div>

        {/* User greeting if provided */}
        {user && (
          <p
            tw="text-3xl mb-4"
            style={{
              color: '#0F172A',
              fontFamily: 'system-ui, -apple-system',
            }}
          >
            {user.display_name || user.username}
          </p>
        )}

        {/* Subtitle */}
        <p
          tw="text-xl"
          style={{
            color: '#475569',
            fontFamily: 'system-ui, -apple-system',
          }}
        >
          Increment the counter on Base
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    }
  );
  
  return imageResponse;
}