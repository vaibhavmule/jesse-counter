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
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#FFD400]/30 bg-white p-6 shadow-2xl backdrop-blur" style={{ boxShadow: '0 12px 40px rgba(255, 212, 0, 0.2)' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-[#64748B] transition-colors hover:bg-[#FFD400]/20 hover:text-[#0F172A]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">💝</span>
            <h2 className="text-xl font-semibold text-[#0F172A]">
              Support Developer
            </h2>
          </div>

          {/* Description */}
          <p className="text-center text-sm text-[#475569]">
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
                      ? "bg-[#FFD400] hover:bg-[#FACC15] text-[#0F172A] font-bold shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ${amount}
                </button>
              );
            })}
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <p className="text-xs text-[#475569]">
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
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-gray-400 focus:border-[#FFD400] focus:outline-none focus:ring-2 focus:ring-[#FFD400]/20"
            />
          </div>

          {/* Payment info */}
          <div className="space-y-2 rounded-xl border-2 border-[#FFD400]/20 bg-[#FFD400]/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#475569]">
                Payment
              </span>
              <span className="text-sm font-semibold text-[#0F172A]">
                {finalAmount} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#475569]">
                Network
              </span>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#0052FF]"></div>
                <span className="text-sm font-medium text-[#0F172A]">
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
            className="w-full [&_button]:!bg-[#FFD400] [&_button]:hover:!bg-[#FACC15] [&_button]:active:!bg-[#EAB308] [&_button]:!text-[#0F172A] [&_button]:!font-bold [&_button]:!rounded-2xl"
            onSuccess={onClose}
          />

          {/* Disclaimer */}
          <p className="text-center text-xs text-[#64748B]">
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

