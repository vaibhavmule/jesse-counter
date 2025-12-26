"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import { encodeFunctionData, parseUnits } from "viem";
import { Button } from "../Button";
import { truncateAddress } from "../../../lib/truncateAddress";

// USDC contract addresses on different chains
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base mainnet USDC
  // Add other chains as needed
};

// Default recipient address for tips
const DEFAULT_TIP_RECIPIENT_ADDRESS = "0xFFe16898FC0af80ee9BCF29D2B54a0F20F9498ad" as `0x${string}`;

// Mini app token for USDC on Base (1 USDC = 1000000 with 6 decimals)
const MINI_APP_TOKEN = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

type TipUsdcProps = {
  recipientFid?: number;
  username?: string;
  recipientAddress?: `0x${string}`;
  amount?: number; // Amount in USDC (defaults to 1)
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onSuccess?: () => void; // Callback when tip is successful
};

type TipStatus = "idle" | "pending" | "success" | "error";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "shortMessage" in error) {
    const shortMessage = (error as { shortMessage?: unknown }).shortMessage;
    if (typeof shortMessage === "string" && shortMessage.length > 0) {
      return shortMessage;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to complete tip.";
}

// ERC20 ABI for transfer function
const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

/**
 * TipUsdc component handles sending USDC tip transactions.
 * 
 * This component provides a simple interface for users to send USDC
 * to a recipient by FID, username, or wallet address. It uses the native
 * mini app SDK tipping flow when FID is provided, or falls back to direct
 * ERC20 transfer when only an address is provided.
 */
export function TipUsdc({
  recipientFid,
  username: _username,
  recipientAddress,
  amount = 1, // Default to 1 USDC
  className,
  variant,
  size,
  onSuccess,
}: TipUsdcProps = {}) {
  // --- Hooks ---
  const { actions, isSDKLoaded } = useMiniApp();
  const { isConnected, chainId } = useAccount();
  const {
    sendTransaction,
    data: usdcTransactionHash,
    error: usdcTransactionError,
    isError: isUsdcTransactionError,
    isPending: isUsdcTransactionPending,
  } = useSendTransaction();

  const { isLoading: isUsdcTransactionConfirming, isSuccess: isUsdcTransactionConfirmed } =
    useWaitForTransactionReceipt({
      hash: usdcTransactionHash,
    });

  const [status, setStatus] = useState<TipStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine which tipping method to use
  const resolvedRecipientAddress = recipientAddress || DEFAULT_TIP_RECIPIENT_ADDRESS;
  const usingEvmTip = Boolean(resolvedRecipientAddress && !recipientFid);

  // Calculate amount in USDC (6 decimals)
  const amountInWei = useMemo(() => {
    // USDC has 6 decimals, so multiply by 1,000,000
    return Math.floor(amount * 1_000_000).toString();
  }, [amount]);

  // Reset transient states when recipient changes
  useEffect(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, [recipientFid, resolvedRecipientAddress]);

  const miniAppReady = useMemo(() => {
    if (usingEvmTip) {
      return false;
    }
    return Boolean(recipientFid && isSDKLoaded && typeof actions?.sendToken === "function");
  }, [actions, isSDKLoaded, recipientFid, usingEvmTip]);

  // --- Computed Values ---
  /**
   * Gets the USDC contract address for the current chain.
   */
  const usdcAddress = useMemo(() => {
    if (!chainId) return undefined;
    return USDC_ADDRESSES[chainId];
  }, [chainId]);

  /**
   * Determines if USDC is supported on the current chain.
   */
  const isUsdcSupported = useMemo(() => {
    return !!usdcAddress;
  }, [usdcAddress]);

  // --- Handlers ---
  /**
   * Handles sending the USDC tip transaction.
   */
  const sendUsdcTip = useCallback(async () => {
    // Use native mini app SDK tipping when FID is provided
    if (!usingEvmTip) {
      if (!miniAppReady || !recipientFid || typeof actions?.sendToken !== "function") {
        return;
      }

      setStatus("pending");
      setErrorMessage(null);

      try {
        const result = await actions.sendToken({
          recipientFid,
          token: MINI_APP_TOKEN,
          amount: amountInWei,
        });
        
        if (result.success) {
          setStatus("success");
          onSuccess?.();
          setTimeout(() => {
            setStatus("idle");
          }, 2500);
          return;
        }

        if (result.reason === "rejected_by_user") {
          setStatus("idle");
          return;
        }

        setStatus("error");
        setErrorMessage(result.error?.message ?? "Unable to complete tip.");
      } catch (error) {
        setStatus("error");
        setErrorMessage(getErrorMessage(error));
      }
      return;
    }

    // Fall back to direct ERC20 transfer
    if (!usdcAddress || !isConnected) {
      console.error("USDC not supported on this chain or wallet not connected");
      return;
    }

    setStatus("pending");
    setErrorMessage(null);

    try {
      // Convert amount to wei (USDC has 6 decimals)
      const amountInWei = parseUnits(amount.toString(), 6);

      // Encode the transfer function call
      const data = encodeFunctionData({
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [resolvedRecipientAddress, amountInWei],
      });

      sendTransaction(
        {
          to: usdcAddress,
          data,
        },
        {
          onSuccess: () => {
            setStatus("success");
            onSuccess?.();
            setTimeout(() => {
              setStatus("idle");
            }, 2500);
          },
          onError: (error) => {
            setStatus("error");
            setErrorMessage(getErrorMessage(error));
          },
        }
      );
    } catch (error) {
      setStatus("error");
      setErrorMessage(getErrorMessage(error));
    }
  }, [
    actions,
    isConnected,
    miniAppReady,
    recipientFid,
    resolvedRecipientAddress,
    sendTransaction,
    usdcAddress,
    usingEvmTip,
    amountInWei,
    amount,
    onSuccess,
  ]);

  // --- Render Logic ---
  const isPending = status === "pending";
  const isSuccess = status === "success";

  const preventSend = usingEvmTip
    ? !isConnected || !isUsdcSupported
    : !miniAppReady;

  const buttonDisabled = usingEvmTip
    ? preventSend || isUsdcTransactionPending || isPending
    : preventSend || isPending;

  const label = isPending
    ? usingEvmTip
      ? "Confirm in wallet..."
      : "Opening tip flow..."
    : isSuccess
      ? "Tip sent!"
      : `Send ${amount} USDC ❤️`;

  const resolvedVariant = variant ?? (isSuccess ? "primary" : "primary");
  const resolvedSize = size ?? "lg";
  const resolvedClassName = className ?? "mt-8 pb-8";

  // Only show on Base (or other chains with USDC support) when using EVM
  if (usingEvmTip && !isUsdcSupported) {
    return null;
  }

  return (
    <div className={`w-full space-y-1.5 text-center ${resolvedClassName}`}>
      <Button
        onClick={sendUsdcTip}
        disabled={buttonDisabled}
        isLoading={usingEvmTip ? isUsdcTransactionPending || isPending : isPending}
        variant={resolvedVariant}
        size={resolvedSize}
        className="max-w-full"
      >
        {preventSend && !isPending ? "Preparing Warpcast..." : label}
      </Button>
      {usingEvmTip && usdcTransactionHash && (
        <div className="text-xs text-center text-gray-400">
          <div>Hash: {truncateAddress(usdcTransactionHash)}</div>
          <div>
            Status:{" "}
            {isUsdcTransactionConfirming
              ? "Confirming..."
              : isUsdcTransactionConfirmed
              ? "Confirmed!"
              : "Pending"}
          </div>
        </div>
      )}
      {status === "error" && errorMessage && (
        <p className="text-xs text-red-400">{errorMessage}</p>
      )}
      {usingEvmTip && status !== "error" && isUsdcTransactionError && (
        <p className="text-xs text-red-400">{getErrorMessage(usdcTransactionError)}</p>
      )}
    </div>
  );
}


