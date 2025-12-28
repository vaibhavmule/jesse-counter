// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WithdrawHelper
 * @dev Helper contract to withdraw tokens from JesseCounter contract
 * @notice This contract can be used by the owner to withdraw tokens
 *         from the JesseCounter contract if needed
 */
contract WithdrawHelper is Ownable {
    using SafeERC20 for IERC20;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Withdraws tokens from a contract address
     * @param token The token contract address
     * @param from The contract address to withdraw from
     * @param to The address to send tokens to
     * @param amount The amount to withdraw (0 = full balance)
     */
    function withdrawTokens(
        address token,
        address from,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(from);
        
        require(balance > 0, "No tokens to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "Amount exceeds balance");
        
        // Transfer tokens from the contract to the recipient
        tokenContract.safeTransferFrom(from, to, withdrawAmount);
    }
    
    /**
     * @dev Emergency withdraw - transfers tokens directly if this contract has approval
     * @param token The token contract address  
     * @param to The address to send tokens to
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        tokenContract.safeTransfer(to, amount);
    }
}

