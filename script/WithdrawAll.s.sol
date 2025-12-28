// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {JesseCounter} from "../contracts/JesseCounter.sol";

/**
 * @title WithdrawAllScript
 * @dev Complete script to withdraw all tokens from JesseCounter
 *      Steps:
 *      1. Set incrementCooldown to 1 second (minimum allowed)
 *      2. Set tokenAmount to full balance
 *      3. Call incrementCounter to withdraw
 */
contract WithdrawAllScript is Script {
    // Contract address on Base
    address constant JESSE_COUNTER = 0xbA5502536ad555eD625397872EA09Cd4A39ea014;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("=== Complete Withdraw Script ===");
        console.log("Contract:", JESSE_COUNTER);
        console.log("Owner:", deployer);
        
        // Get the contract instance
        JesseCounter counter = JesseCounter(JESSE_COUNTER);
        
        // Verify ownership
        address owner = counter.owner();
        require(owner == deployer, "Not the owner!");
        
        // Get token balance
        uint256 balance = counter.getContractTokenBalance();
        console.log("Contract balance:", balance / 1e18, "JESSE");
        
        if (balance == 0) {
            console.log("No tokens to withdraw.");
            vm.stopBroadcast();
            return;
        }
        
        // Step 1: Set cooldown to minimum (1 hour = 3600 seconds)
        // Actually, let's check current cooldown first
        uint256 currentCooldown = counter.incrementCooldown();
        console.log("Current cooldown:", currentCooldown, "seconds");
        
        // If cooldown is more than 1 hour, set it to 1 hour
        if (currentCooldown > 1 hours) {
            console.log("\nSetting cooldown to 1 hour...");
            counter.updateIncrementCooldown(1 hours);
            console.log("Cooldown updated to 1 hour");
            
            // Wait 1 hour + 1 second (we can't actually wait in a script, so user needs to run this after waiting)
            console.log("\nWARNING: You need to wait 1 hour before running the withdrawal part!");
            console.log("Or if you've already waited, the cooldown should be ready.");
        }
        
        // Step 2: Set tokenAmount to full balance
        console.log("\nSetting tokenAmount to full balance...");
        counter.updateTokenAmount(balance);
        console.log("Updated tokenAmount to:", balance / 1e18, "JESSE");
        
        // Step 3: Check if cooldown has passed
        uint256 lastIncrement = 0;
        try counter.getLastIncrementTimestamp(deployer) returns (string memory timestampStr) {
            if (keccak256(bytes(timestampStr)) != keccak256(bytes("never"))) {
                lastIncrement = vm.parseUint(timestampStr);
            }
        } catch {}
        
        uint256 cooldown = counter.incrementCooldown();
        uint256 timeSinceLastIncrement = block.timestamp - lastIncrement;
        
        console.log("\nCooldown check:");
        console.log("  Last increment:", lastIncrement == 0 ? "Never" : vm.toString(lastIncrement));
        console.log("  Time since last increment:", timeSinceLastIncrement, "seconds");
        console.log("  Required cooldown:", cooldown, "seconds");
        console.log("  Can withdraw:", timeSinceLastIncrement >= cooldown ? "YES" : "NO");
        
        if (timeSinceLastIncrement >= cooldown || lastIncrement == 0) {
            console.log("\nWithdrawing tokens...");
            counter.incrementCounter();
            console.log("Tokens withdrawn successfully!");
            console.log("New balance:", counter.getContractTokenBalance() / 1e18, "JESSE");
        } else {
            uint256 waitTime = cooldown - timeSinceLastIncrement;
            console.log("Cannot withdraw yet. Wait time (seconds):", waitTime);
            console.log("Wait time (minutes):", waitTime / 60);
            console.log("Then run this script again or just call incrementCounter()");
        }
        
        vm.stopBroadcast();
    }
}

