import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  const imageResponse = new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative bg-primary">
        {user?.pfp_url && (
          <div tw="flex w-96 h-96 rounded-full overflow-hidden mb-8 border-8 border-white">
            <img src={user.pfp_url} alt="Profile" tw="w-full h-full object-cover" />
          </div>
        )}
        <h1 tw="text-8xl text-white">{user?.display_name ? `Hello from ${user.display_name ?? user.username}!` : 'Hello!'}</h1>
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