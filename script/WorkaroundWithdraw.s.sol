// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {JesseCounter} from "../contracts/JesseCounter.sol";

/**
 * @title WorkaroundWithdrawScript
 * @dev Workaround to withdraw tokens from JesseCounter by setting tokenAmount to full balance
 *      and then calling incrementCounter. This is a workaround since the contract doesn't have
 *      a direct withdraw function.
 * 
 * WARNING: This will increment the counter and give you the tokens, but it's not ideal.
 *          Better to deploy JesseCounterV2 with proper withdraw functionality.
 */
contract WorkaroundWithdrawScript is Script {
    // Contract address on Base
    address constant JESSE_COUNTER = 0xbA5502536ad555eD625397872EA09Cd4A39ea014;
    
    // JESSE token address on Base
    address constant JESSE_TOKEN = 0x50F88fe97f72CD3E75b9Eb4f747F59BcEBA80d59;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("=== Workaround Withdraw Script ===");
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
        
        // Get current tokenAmount
        uint256 currentTokenAmount = counter.tokenAmount();
        console.log("Current tokenAmount:", currentTokenAmount / 1e18, "JESSE");
        
        // Set tokenAmount to full balance (in wei, 18 decimals)
        console.log("\nSetting tokenAmount to full balance...");
        counter.updateTokenAmount(balance);
        console.log("Updated tokenAmount to:", balance / 1e18, "JESSE");
        
        // Now call incrementCounter to claim the tokens
        // Note: This requires the cooldown to have passed
        console.log("\nCalling incrementCounter to withdraw tokens...");
        console.log("WARNING: This will increment the counter!");
        console.log("Make sure cooldown has passed for your address.");
        
        counter.incrementCounter();
        
        console.log("\nTokens withdrawn successfully!");
        console.log("New balance:", counter.getContractTokenBalance() / 1e18, "JESSE");
        
        vm.stopBroadcast();
    }
}

