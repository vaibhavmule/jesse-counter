// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {JesseCounter} from "../contracts/JesseCounter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract WithdrawTokensScript is Script {
    using SafeERC20 for IERC20;
    
    // Contract address on Base
    address constant JESSE_COUNTER = 0xbA5502536ad555eD625397872EA09Cd4A39ea014;
    
    // JESSE token address on Base
    address constant JESSE_TOKEN = 0x50F88fe97f72CD3E75b9Eb4f747F59BcEBA80d59;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("=== Token Withdrawal Script ===");
        console.log("Contract:", JESSE_COUNTER);
        console.log("Token:", JESSE_TOKEN);
        console.log("Owner:", deployer);
        
        // Get the contract instance
        JesseCounter counter = JesseCounter(JESSE_COUNTER);
        
        // Verify ownership
        address owner = counter.owner();
        console.log("Contract owner:", owner);
        
        if (owner != deployer) {
            console.log("ERROR: You are not the owner of this contract!");
            vm.stopBroadcast();
            return;
        }
        
        // Get token balance
        uint256 balance = counter.getContractTokenBalance();
        console.log("\nContract JESSE balance:", balance);
        console.log("Contract JESSE balance (formatted):", balance / 1e18, "JESSE");
        
        if (balance == 0) {
            console.log("\nNo tokens to withdraw.");
            vm.stopBroadcast();
            return;
        }
        
        // Get the token instance
        IERC20 token = IERC20(JESSE_TOKEN);
        
        console.log("\n=== WARNING ===");
        console.log("The JesseCounter contract does not have a withdraw function.");
        console.log("The contract is not upgradeable, so we cannot add one.");
        console.log("\nOptions:");
        console.log("1. Deploy a new version of the contract with withdraw functionality");
        console.log("2. Use the workaround: Set tokenAmount to full balance and claim via incrementCounter");
        console.log("   (This requires calling updateTokenAmount and then incrementCounter)");
        console.log("\nCurrent tokenAmount setting:", counter.tokenAmount() / 1e18, "JESSE");
        
        vm.stopBroadcast();
    }
}
