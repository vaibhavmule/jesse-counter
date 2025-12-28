// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {JesseCounter} from "../contracts/JesseCounter.sol";

contract UpdateIncrementCooldownScript is Script {
    // Contract address on Base
    address constant JESSE_COUNTER_ADDRESS = 0xbA5502536ad555eD625397872EA09Cd4A39ea014;
    
    // New cooldown period: 24 hours (86400 seconds)
    uint256 constant NEW_COOLDOWN = 1 days; // 86400 seconds

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address deployer = vm.addr(deployerPrivateKey);
        console.log("Updating incrementCooldown for JesseCounter contract...");
        console.log("Deployer/Owner:", deployer);
        console.log("Contract Address:", JESSE_COUNTER_ADDRESS);
        
        JesseCounter jesseCounter = JesseCounter(JESSE_COUNTER_ADDRESS);
        
        // Get current cooldown
        uint256 currentCooldown = jesseCounter.incrementCooldown();
        console.log("Current incrementCooldown:", currentCooldown, "seconds");
        console.log("Current incrementCooldown:", currentCooldown / 3600, "hours");
        
        // Update to new cooldown (24 hours)
        console.log("\nUpdating incrementCooldown to:", NEW_COOLDOWN, "seconds");
        console.log("New incrementCooldown:", NEW_COOLDOWN / 3600, "hours (24 hours)");
        
        jesseCounter.updateIncrementCooldown(NEW_COOLDOWN);
        
        // Verify the update
        uint256 updatedCooldown = jesseCounter.incrementCooldown();
        console.log("\nUpdate successful!");
        console.log("Updated incrementCooldown:", updatedCooldown, "seconds");
        console.log("Updated incrementCooldown:", updatedCooldown / 3600, "hours");
        
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

