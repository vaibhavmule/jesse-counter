import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying JesseCounter contract...\n");

  // JESSE token address on Base
  const JESSE_TOKEN_ADDRESS = "0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59";

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy the contract with JESSE token address
  const JesseCounter = await ethers.getContractFactory("JesseCounter");
  console.log("📦 Deploying JesseCounter with JESSE token:", JESSE_TOKEN_ADDRESS);
  
  const jesseCounter = await JesseCounter.deploy(JESSE_TOKEN_ADDRESS);
  await jesseCounter.waitForDeployment();

  const address = await jesseCounter.getAddress();
  console.log("✅ JesseCounter deployed to:", address);
  console.log("\n📋 Contract Details:");
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("   Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("   Deployer:", deployer.address);
  console.log("   Owner:", deployer.address);
  console.log("   JESSE Token:", JESSE_TOKEN_ADDRESS);
  console.log("   Initial Reward Amount: 1 JESSE");
  console.log("\n💡 Next steps:");
  console.log("   1. Deposit JESSE tokens to the contract using depositTokens()");
  console.log("   2. Update the contract address in src/contracts/abi.ts");
  console.log("   3. Update the JESSE_CONTRACT constant in src/components/SimpleCounterPage.tsx");
  console.log("   4. Verify the contract on BaseScan (if on mainnet)");
  console.log("\n🔗 BaseScan URL:", `https://basescan.org/address/${address}`);
  console.log("\n⚠️  IMPORTANT: Make sure to deposit JESSE tokens to the contract before users can increment!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

