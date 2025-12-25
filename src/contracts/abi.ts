/**
 * ABI for the $jesse Counter Contract
 * 
 * TODO: Update with actual contract ABI once available.
 * The contract address is: 0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59
 * 
 * Based on the degen-counter pattern, the function is likely:
 * - incrementCounter() - to increment the counter
 * - getTotalCount() - to get total count
 * - getUserCount(address) - to get user's count
 * - getLastIncrementTimestamp(address) - to get last increment time
 */

export const jesseCounterAbi = [
  {
    inputs: [],
    name: "incrementCounter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getUserCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getLastIncrementTimestamp",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

