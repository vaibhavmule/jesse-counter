// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title JesseCounter
 * @dev A simple counter contract that tracks total increments and per-user counts
 * @notice Users can increment the counter and view their contribution
 */
contract JesseCounter {
    // --- State Variables ---
    uint256 public totalCount;
    mapping(address => uint256) public userCount;
    mapping(address => string) public lastIncrementTimestamp;

    // --- Events ---
    event CounterIncremented(address indexed user, uint256 newTotalCount, uint256 userCount);

    // --- Functions ---
    
    /**
     * @dev Increments the counter for the caller
     * @notice Each call increments both the total count and the user's personal count
     */
    function incrementCounter() external {
        totalCount += 1;
        userCount[msg.sender] += 1;
        lastIncrementTimestamp[msg.sender] = timestampToString(block.timestamp);
        
        emit CounterIncremented(msg.sender, totalCount, userCount[msg.sender]);
    }

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
     * @return A string representation of the timestamp
     */
    function getLastIncrementTimestamp(address _user) external view returns (string memory) {
        return lastIncrementTimestamp[_user];
    }

    // --- Helper Functions ---
    
    /**
     * @dev Converts a timestamp to a string
     * @param _timestamp The timestamp to convert
     * @return A string representation of the timestamp
     */
    function timestampToString(uint256 _timestamp) internal pure returns (string memory) {
        if (_timestamp == 0) {
            return "0";
        }
        
        uint256 temp = _timestamp;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (_timestamp != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (_timestamp % 10)));
            _timestamp /= 10;
        }
        
        return string(buffer);
    }
}

