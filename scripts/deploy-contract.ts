import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying JesseCounter contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy the contract
  const JesseCounter = await ethers.getContractFactory("JesseCounter");
  console.log("📦 Deploying JesseCounter...");
  
  const jesseCounter = await JesseCounter.deploy();
  await jesseCounter.waitForDeployment();

  const address = await jesseCounter.getAddress();
  console.log("✅ JesseCounter deployed to:", address);
  console.log("\n📋 Contract Details:");
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("   Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("   Deployer:", deployer.address);
  console.log("\n💡 Next steps:");
  console.log("   1. Update the contract address in src/contracts/abi.ts");
  console.log("   2. Update the JESSE_CONTRACT constant in src/components/SimpleCounterPage.tsx");
  console.log("   3. Verify the contract on BaseScan (if on mainnet)");
  console.log("\n🔗 BaseScan URL:", `https://basescan.org/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

