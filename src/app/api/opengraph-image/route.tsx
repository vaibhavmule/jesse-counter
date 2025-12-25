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

        {/* Character image */}
        <div tw="flex items-center justify-center mb-8">
          <img
            src={`${APP_URL}/icon.png`}
            alt="Jesse"
            tw="w-24 h-24 rounded-full"
            style={{
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
            }}
          />
        </div>

        {/* Title */}
        <h1
          tw="text-5xl font-bold mb-6"
          style={{
            color: '#60a5fa',
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
            color: '#4ade80',
            fontFamily: 'system-ui, -apple-system',
            lineHeight: '1',
            textShadow: '0 0 40px rgba(74, 222, 128, 0.6)',
          }}
        >
          {formattedCounter}
        </div>

        {/* User greeting if provided */}
        {user && (
          <p
            tw="text-3xl mb-4"
            style={{
              color: '#e2e8f0',
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
            color: '#a78bfa',
            opacity: 0.95,
            fontFamily: 'system-ui, -apple-system',
          }}
        >
          Increment the counter on Base
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );

  // Add cache headers to prevent caching
  imageResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  imageResponse.headers.set('Pragma', 'no-cache');
  imageResponse.headers.set('Expires', '0');
  
  return imageResponse;
}