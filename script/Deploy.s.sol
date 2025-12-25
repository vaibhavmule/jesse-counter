// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {JesseCounter} from "../contracts/JesseCounter.sol";

contract DeployScript is Script {
    // JESSE token address on Base
    address constant JESSE_TOKEN_ADDRESS = 0x50F88fe97f72CD3E75b9Eb4f747F59BcEBA80d59;

    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deploying JesseCounter contract...");
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance / 1e18, "ETH");
        console.log("Deploying JesseCounter with JESSE token:", JESSE_TOKEN_ADDRESS);

        JesseCounter jesseCounter = new JesseCounter(JESSE_TOKEN_ADDRESS);
        address deployedAddress = address(jesseCounter);

        console.log("JesseCounter deployed to:", deployedAddress);
        console.log("Contract Details:");
        console.log("  Chain ID:", block.chainid);
        console.log("  Deployer:", deployer);
        console.log("  Owner:", deployer);
        console.log("  JESSE Token:", JESSE_TOKEN_ADDRESS);
        console.log("  Initial Reward Amount: 1 JESSE");
        console.log("Next steps:");
        console.log("  1. Deposit JESSE tokens to the contract using depositTokens()");
        console.log("  2. Update the contract address in src/contracts/abi.ts");
        console.log("  3. Update the JESSE_CONTRACT constant in src/components/SimpleCounterPage.tsx");
        console.log("  4. Verify the contract on BaseScan (if on mainnet)");
        console.log("BaseScan URL:");
        if (block.chainid == 8453) {
            console.log("  https://basescan.org/address/", deployedAddress);
        } else if (block.chainid == 84532) {
            console.log("  https://sepolia.basescan.org/address/", deployedAddress);
        }
        console.log("IMPORTANT: Make sure to deposit JESSE tokens to the contract before users can increment!");

        vm.stopBroadcast();
        return deployedAddress;
    }
}

