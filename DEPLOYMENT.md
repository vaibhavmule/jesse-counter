# Smart Contract Deployment Guide

This guide will walk you through deploying the JesseCounter smart contract to Base network.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **A wallet with ETH on Base** for gas fees (you'll need your private key)
4. **Private key** of the deployment account (keep this secure!)

## Step 1: Install Dependencies

Install Hardhat and required dependencies:

```bash
npm install
```

This will install Hardhat and all required packages.

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```

2. Add your private key and RPC URL to `.env`:
   ```env
   # Your private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here
   
   # Base Mainnet RPC URL
   BASE_RPC_URL=https://mainnet.base.org
   ```

   **⚠️ SECURITY WARNING:**
   - Never commit your `.env` file to version control (it's already in .gitignore)
   - Use a dedicated deployment account with minimal funds
   - Consider using a hardware wallet or a secure key management service

3. (Optional) For better reliability, use an RPC provider:
   - **Alchemy**: Get a free API key at https://www.alchemy.com/
   - **Infura**: Get a free API key at https://www.infura.io/
   - **QuickNode**: Get a free API key at https://www.quicknode.com/

   Then update your `.env`:
   ```env
   BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   ```

## Step 3: Verify Contract Code

The contract is located at `contracts/JesseCounter.sol`. It includes:
- `incrementCounter()` - Increments the counter
- `getTotalCount()` - Returns total count
- `getUserCount(address)` - Returns user's count
- `getLastIncrementTimestamp(address)` - Returns last increment timestamp

## Step 4: Compile the Contract

Before deploying, compile the contract:

```bash
npm run compile
```

## Step 5: Deploy to Base Mainnet

**⚠️ IMPORTANT: Make sure you have enough ETH in your deployment account for gas fees!**

Deploy to Base mainnet:

```bash
npm run deploy:contract
```

This will:
1. Deploy the contract
2. Display the contract address
3. Show you the BaseScan URL

## Step 6: Deploy to Base Sepolia (Testnet - Recommended First)

For testing, deploy to Base Sepolia first:

```bash
npm run deploy:contract:testnet
```

You'll need Sepolia ETH (testnet tokens). Get them from:
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Step 7: Update Your Application

After deployment, you'll get a contract address. Update your application:

1. **Update the contract address in `src/components/SimpleCounterPage.tsx`:**
   ```typescript
   const JESSE_CONTRACT = 'YOUR_NEW_CONTRACT_ADDRESS' as const;
   ```

2. **Update the ABI comment in `src/contracts/abi.ts`:**
   ```typescript
   /**
    * ABI for the $jesse Counter Contract
    * Contract address: YOUR_NEW_CONTRACT_ADDRESS
    */
   ```

## Step 8: Verify Contract on BaseScan (Optional but Recommended)

1. Get an API key from [BaseScan](https://basescan.org/apis)
2. Add to `.env`:
   ```env
   ETHERSCAN_API_KEY=your_basescan_api_key
   ```
3. Verify:
   ```bash
   npx hardhat verify --network base YOUR_CONTRACT_ADDRESS
   ```

## Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with your PRIVATE_KEY and BASE_RPC_URL

# 3. Compile contract
npm run compile

# 4. Deploy to Base mainnet
npm run deploy:contract

# 5. Update contract address in your code
# 6. Test your application!
```

## Troubleshooting

### "Insufficient funds" error
- Make sure your deployment account has enough ETH for gas fees
- Check your account balance on [BaseScan](https://basescan.org)
- Base gas fees are typically very low (< $0.01)

### "Nonce too high" error
- Wait a few seconds and try again
- Or manually set a nonce in the deployment script

### RPC connection issues
- Try using a different RPC provider (Alchemy, Infura, QuickNode)
- Check your internet connection
- Verify your RPC URL is correct

### "Cannot find module" errors
- Run `npm install` again
- Make sure you're in the project root directory

## Security Best Practices

1. ✅ Use a dedicated deployment account
2. ✅ Never commit private keys to version control
3. ✅ Use environment variables for sensitive data
4. ✅ Test on testnet before mainnet deployment
5. ✅ Verify contracts on block explorers
6. ✅ Keep deployment account funds minimal

## Need Help?

- Base Documentation: https://docs.base.org/
- Hardhat Documentation: https://hardhat.org/docs
- BaseScan: https://basescan.org/
- Base Discord: https://discord.gg/buildonbase
