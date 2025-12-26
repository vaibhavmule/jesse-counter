// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {JesseCounter} from "../contracts/JesseCounter.sol";

contract UpdateTokenAmountScript is Script {
    // Contract address on Base
    address constant JESSE_COUNTER_ADDRESS = 0xbA5502536ad555eD625397872EA09Cd4A39ea014;
    
    // New token amount: 0.2 JESSE (200000000000000000 wei)
    uint256 constant NEW_TOKEN_AMOUNT = 200000000000000000;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address deployer = vm.addr(deployerPrivateKey);
        console.log("Updating tokenAmount for JesseCounter contract...");
        console.log("Deployer/Owner:", deployer);
        console.log("Contract Address:", JESSE_COUNTER_ADDRESS);
        
        JesseCounter jesseCounter = JesseCounter(JESSE_COUNTER_ADDRESS);
        
        // Get current token amount
        uint256 currentAmount = jesseCounter.tokenAmount();
        console.log("Current tokenAmount:", currentAmount, "wei");
        console.log("Current tokenAmount:", currentAmount / 1e18, "JESSE");
        
        // Update to new amount
        console.log("\nUpdating tokenAmount to:", NEW_TOKEN_AMOUNT, "wei");
        console.log("New tokenAmount:", NEW_TOKEN_AMOUNT / 1e18, "JESSE");
        
        jesseCounter.updateTokenAmount(NEW_TOKEN_AMOUNT);
        
        // Verify the update
        uint256 updatedAmount = jesseCounter.tokenAmount();
        console.log("\nUpdate successful!");
        console.log("Updated tokenAmount:", updatedAmount, "wei");
        console.log("Updated tokenAmount:", updatedAmount / 1e18, "JESSE");
        
        console.log("\nTransaction Details:");
        console.log("  Chain ID:", block.chainid);
        if (block.chainid == 8453) {
            console.log("  BaseScan URL: https://basescan.org/address/", JESSE_COUNTER_ADDRESS);
        } else if (block.chainid == 84532) {
            console.log("  BaseScan URL: https://sepolia.basescan.org/address/", JESSE_COUNTER_ADDRESS);
        }

        vm.stopBroadcast();
    }
}

