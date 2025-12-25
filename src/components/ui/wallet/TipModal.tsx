"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TipUsdc } from "./TipUsdc";

type TipModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientFid?: number;
  username?: string;
  recipientAddress?: `0x${string}`;
};

const PREDEFINED_AMOUNTS = [1, 5, 10, 25];

export function TipModal({
  isOpen,
  onClose,
  recipientFid,
  username,
  recipientAddress,
}: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useCustomAmount, setUseCustomAmount] = useState<boolean>(false);
  const [finalAmount, setFinalAmount] = useState<number>(5);

  // Update final amount when selection changes
  useEffect(() => {
    if (useCustomAmount && customAmount) {
      const parsed = parseFloat(customAmount);
      if (!isNaN(parsed) && parsed > 0) {
        setFinalAmount(parsed);
      }
    } else {
      setFinalAmount(selectedAmount);
    }
  }, [selectedAmount, customAmount, useCustomAmount]);

  const handleAmountSelect = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setUseCustomAmount(false);
    setCustomAmount("");
  }, []);

  const handleCustomAmountChange = useCallback((value: string) => {
    setCustomAmount(value);
    if (value) {
      setUseCustomAmount(true);
    }
  }, []);

  const handleCustomAmountFocus = useCallback(() => {
    setUseCustomAmount(true);
  }, []);

  // Close on escape key and prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent body scroll when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, onClose]);

  // Portal the modal to document.body to avoid z-index and overflow issues
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - centered both horizontally and vertically */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-gray-900/95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">❤️</span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Support Developer
            </h2>
          </div>

          {/* Description */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Help keep $JESSE Counter running! Your support helps pay for servers, development, and improving the app.
          </p>

          {/* Predefined amounts */}
          <div className="grid grid-cols-4 gap-2">
            {PREDEFINED_AMOUNTS.map((amount) => {
              const isSelected = !useCustomAmount && selectedAmount === amount;
              return (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-red-500 to-green-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  ${amount}
                </button>
              );
            })}
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Or enter custom amount
            </p>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              onFocus={handleCustomAmountFocus}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Payment info */}
          <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Payment
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {finalAmount} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Network
              </span>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Base
                </span>
              </div>
            </div>
          </div>

          {/* Send button */}
          <TipUsdc
            recipientFid={recipientFid}
            username={username}
            recipientAddress={recipientAddress}
            amount={finalAmount}
            variant="primary"
            size="lg"
            className="w-full"
            onSuccess={onClose}
          />

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Payments are made in USDC on Base network
          </p>
        </div>
      </div>
    </div>
  ) : null;

  // Use portal to render modal at document.body level
  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
}

