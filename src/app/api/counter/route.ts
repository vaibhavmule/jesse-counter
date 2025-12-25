import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { jesseCounterAbi } from '~/contracts/abi';

const JESSE_CONTRACT = '0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59' as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const totalCount = await publicClient.readContract({
      address: JESSE_CONTRACT,
      abi: jesseCounterAbi,
      functionName: 'getTotalCount',
    });

    return NextResponse.json({
      totalCount: totalCount.toString(),
    });
  } catch (error) {
    console.error('Error fetching counter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch counter', totalCount: '0' },
      { status: 500 }
    );
  }
}

