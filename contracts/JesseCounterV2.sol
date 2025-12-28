// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JesseCounterV2
 * @dev Updated version with withdraw functionality
 * @notice This is a new version with owner withdraw capability
 */
contract JesseCounterV2 is Ownable {
    using SafeERC20 for IERC20;

    // --- State Variables ---
    IERC20 public immutable token;
    uint256 public totalCount;
    uint256 public tokenAmount = 1000000000000000000; // 1 JESSE (18 decimals) - can be updated by owner
    mapping(address => uint256) public userCount;
    mapping(address => uint256) public lastIncrementTimestamp;
    
    // Share tracking
    mapping(address => uint256) public lastShareTimestamp;
    uint256 public shareCooldown = 1 days; // 24 hours - configurable by owner
    uint256 public totalShares;
    
    // Increment cooldown - configurable by owner
    uint256 public incrementCooldown = 6 hours;

    // --- Events ---
    event CounterIncremented(address indexed user, uint256 newTotalCount, uint256 userCount);
    event TokenAmountUpdated(uint256 newAmount);
    event TokensDeposited(address indexed sender, uint256 amount);
    event AppShared(address indexed user, uint256 totalShares);
    event IncrementCooldownUpdated(uint256 newCooldown);
    event ShareCooldownUpdated(uint256 newCooldown);
    event TokensWithdrawn(address indexed to, uint256 amount);

    // --- Constructor ---
    /**
     * @dev Sets the JESSE token address and initializes owner
     * @param _tokenAddress The address of the JESSE ERC20 token
     */
    constructor(address _tokenAddress) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        token = IERC20(_tokenAddress);
    }

    // --- Main Functions ---
    
    /**
     * @dev Increments the counter for the caller
     * @notice Requires cooldown period and sufficient token balance in contract
     * @notice Rewards the caller with JESSE tokens
     */
    function incrementCounter() external {
        require(
            block.timestamp >= lastIncrementTimestamp[msg.sender] + incrementCooldown,
            "Cooldown period has not passed"
        );
        require(
            token.balanceOf(address(this)) >= tokenAmount,
            "Insufficient token balance in contract"
        );

        totalCount += 1;
        userCount[msg.sender] += 1;
        lastIncrementTimestamp[msg.sender] = block.timestamp;

        // Transfer JESSE tokens to the user
        token.safeTransfer(msg.sender, tokenAmount);

        emit CounterIncremented(msg.sender, totalCount, userCount[msg.sender]);
    }

    // --- Owner Functions ---
    
    /**
     * @dev Updates the token reward amount (owner only)
     * @param _newAmount The new token amount to reward per increment (in wei, 18 decimals)
     */
    function updateTokenAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Amount must be greater than 0");
        tokenAmount = _newAmount;
        emit TokenAmountUpdated(_newAmount);
    }

    /**
     * @dev Updates the increment cooldown period (owner only)
     * @param _newCooldown The new cooldown period in seconds (minimum 1 hour)
     */
    function updateIncrementCooldown(uint256 _newCooldown) external onlyOwner {
        require(_newCooldown >= 1 hours, "Cooldown must be at least 1 hour");
        incrementCooldown = _newCooldown;
        emit IncrementCooldownUpdated(_newCooldown);
    }

    /**
     * @dev Updates the share cooldown period (owner only)
     * @param _newCooldown The new cooldown period in seconds (minimum 1 hour)
     */
    function updateShareCooldown(uint256 _newCooldown) external onlyOwner {
        require(_newCooldown >= 1 hours, "Cooldown must be at least 1 hour");
        shareCooldown = _newCooldown;
        emit ShareCooldownUpdated(_newCooldown);
    }

    /**
     * @dev Withdraws tokens from the contract (owner only)
     * @param _to The address to send tokens to
     * @param _amount The amount of tokens to withdraw (0 = withdraw all)
     */
    function withdrawTokens(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Cannot withdraw to zero address");
        
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        uint256 withdrawAmount = _amount == 0 ? balance : _amount;
        require(withdrawAmount <= balance, "Amount exceeds balance");
        
        token.safeTransfer(_to, withdrawAmount);
        emit TokensWithdrawn(_to, withdrawAmount);
    }

    // --- Public Functions ---
    
    /**
     * @dev Allows anyone to deposit JESSE tokens into the contract
     * @param amount The amount of tokens to deposit (in wei, 18 decimals)
     */
    function depositTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit TokensDeposited(msg.sender, amount);
    }

    /**
     * @dev Rewards user for sharing the app
     * @notice User can claim 1 JESSE token after cooldown period for sharing
     * @notice Requires sufficient token balance in contract
     */
    function shareApp() external {
        require(
            block.timestamp >= lastShareTimestamp[msg.sender] + shareCooldown,
            "Cooldown period has not passed"
        );
        require(
            token.balanceOf(address(this)) >= tokenAmount,
            "Insufficient token balance in contract"
        );

        lastShareTimestamp[msg.sender] = block.timestamp;
        totalShares += 1;

        // Transfer 1 JESSE token to the user
        token.safeTransfer(msg.sender, tokenAmount);

        emit AppShared(msg.sender, totalShares);
    }

    // --- View Functions ---
    
    /**
     * @dev Returns the total count of all increments
     * @return The total number of times the counter has been incremented
     */
    function getTotalCount() external view returns (uint256) {
        return totalCount;
    }

    /**
     * @dev Returns the count for a specific user
     * @param _user The address to query
     * @return The number of times the specified user has incremented the counter
     */
    function getUserCount(address _user) external view returns (uint256) {
        return userCount[_user];
    }

    /**
     * @dev Returns the last increment timestamp for a specific user as a string
     * @param _user The address to query
     * @return A string representation of the timestamp, or "never" if never incremented
     */
    function getLastIncrementTimestamp(address _user) external view returns (string memory) {
        if (lastIncrementTimestamp[_user] == 0) {
            return "never";
        }
        return uintToString(lastIncrementTimestamp[_user]);
    }

    /**
     * @dev Returns the current token balance of the contract
     * @return The balance of JESSE tokens held by the contract
     */
    function getContractTokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /**
     * @dev Returns the total number of shares
     * @return The total number of times users have shared the app
     */
    function getTotalShares() external view returns (uint256) {
        return totalShares;
    }

    /**
     * @dev Returns the last share timestamp for a specific user
     * @param _user The address to query
     * @return The timestamp of the user's last share, or 0 if never shared
     */
    function getLastShareTimestamp(address _user) external view returns (uint256) {
        return lastShareTimestamp[_user];
    }

    /**
     * @dev Checks if a user can share now (cooldown has passed)
     * @param _user The address to check
     * @return true if user can share, false otherwise
     */
    function canShare(address _user) external view returns (bool) {
        if (lastShareTimestamp[_user] == 0) {
            return true; // Never shared before
        }
        return block.timestamp >= lastShareTimestamp[_user] + shareCooldown;
    }

    // --- Helper Functions ---
    
    /**
     * @dev Converts a uint256 to a string
     * @param v The number to convert
     * @return A string representation of the number
     */
    function uintToString(uint256 v) internal pure returns (string memory) {
        if (v == 0) {
            return "0";
        }
        uint256 j = v;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (v != 0) {
            k = k - 1;
            uint8 temp = uint8(48 + (v % 10));
            bstr[k] = bytes1(temp);
            v /= 10;
        }
        return string(bstr);
    }
}

