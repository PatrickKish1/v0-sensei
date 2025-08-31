// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Constants} from "./libraries/Constants.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

/**
 * @title SenseiToken - Floating Stablecoin Backed by Knowledge
 * @notice A revolutionary token that derives value from knowledge sharing and learning
 * @dev Implements a floating stablecoin mechanism where token value is backed by knowledge transactions
 */
contract SenseiToken is ERC20, Ownable, ReentrancyGuard {
    
    // Knowledge economy parameters
    uint256 public constant KNOWLEDGE_MULTIPLIER = 100; // 100x multiplier for knowledge backing
    uint256 public constant MINIMUM_BACKING_RATIO = 80; // 80% minimum backing ratio
    uint256 public constant MAX_MINT_RATE = 1000 * 10**18; // Maximum tokens per ETH when demand is high
    uint256 public constant MIN_MINT_RATE = 100 * 10**18; // Minimum tokens per ETH when demand is low
    uint256 public constant PLATFORM_FEE_BASIS_POINTS = 500; // 5% platform fee
    
    // State variables
    uint256 public totalKnowledgeValue; // Total value of all knowledge sessions
    uint256 public totalBackingValue; // Total ETH backing the tokens
    uint256 public lastRebaseTime;
    uint256 public rebaseInterval = 1 days;
    uint256 public currentMintRate; // Dynamic minting rate based on demand
    
    // Authorized contracts
    mapping(address => bool) public authorizedMinters; // Contracts that can mint tokens
    mapping(address => bool) public authorizedBurners; // Contracts that can burn tokens
    
    // Knowledge session tracking
    uint256 private _nextSessionId = 1;
    mapping(uint256 => uint256) public sessionKnowledgeValue;
    mapping(uint256 => uint256) public sessionBackingValue;
    mapping(uint256 => bool) public sessionProcessed;
    
    // Sensei economy tracking
    mapping(address => uint256) public senseiEarnings; // Total earnings per sensei
    mapping(address => uint256) public senseiContributions; // Knowledge contributions per sensei
    uint256 public totalSenseiEarnings;
    
    // Events
    event KnowledgeSessionCompleted(uint256 indexed sessionId, uint256 knowledgeValue, uint256 backingValue);
    event TokensMinted(address indexed to, uint256 amount, uint256 ethPaid, uint256 mintRate);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensMintedForNFT(address indexed to, uint256 amount, uint256 nftValue);
    event RebaseExecuted(uint256 newTotalSupply, uint256 newBackingRatio, uint256 newMintRate);
    event MintRateUpdated(uint256 oldRate, uint256 newRate);
    event SenseiEarningsDistributed(address indexed sensei, uint256 amount);
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);
    event AuthorizedBurnerUpdated(address indexed burner, bool authorized);
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    modifier onlyAuthorizedBurner() {
        require(authorizedBurners[msg.sender] || msg.sender == owner(), "Not authorized to burn");
        _;
    }
    
    constructor() ERC20("Sensei Token", "SENSEI") Ownable(msg.sender) {
        // Start with 0 supply - no pre-mint!
        totalKnowledgeValue = 0;
        totalBackingValue = 0;
        currentMintRate = MIN_MINT_RATE; // Start with minimum rate
        lastRebaseTime = block.timestamp;
    }
    
    /**
     * @dev Called when a knowledge session is completed and payment is processed
     * @param sessionId Unique identifier for the session
     * @param senseiAddress Address of the sensei
     * @param studentAddress Address of the student  
     * @param sessionValue Value of the session payment
     */
    function completeKnowledgeSession(
        uint256 sessionId,
        address senseiAddress,
        address studentAddress,
        uint256 sessionValue
    ) external onlyAuthorizedMinter {
        require(sessionId > 0, "Invalid session ID");
        require(senseiAddress != address(0), "Invalid sensei address");
        require(studentAddress != address(0), "Invalid student address");
        require(sessionValue > 0, "Session value must be positive");
        require(!sessionProcessed[sessionId], "Session already processed");
        
        sessionProcessed[sessionId] = true;
        sessionKnowledgeValue[sessionId] = sessionValue;
        sessionBackingValue[sessionId] = sessionValue;
        
        totalKnowledgeValue += sessionValue;
        totalBackingValue += sessionValue;
        
        // Track sensei contributions and earnings
        senseiContributions[senseiAddress] += sessionValue;
        senseiEarnings[senseiAddress] += sessionValue / 2; // Sensei gets 50% base
        totalSenseiEarnings += sessionValue / 2;
        
        // Mint tokens equivalent to session value for the economy
        uint256 tokensToMint = sessionValue; // 1:1 ratio for knowledge backing
        _mint(address(this), tokensToMint); // Mint to contract for distribution
        
        emit KnowledgeSessionCompleted(sessionId, sessionValue, sessionValue);
        
        // Check if rebase is needed
        if (block.timestamp >= lastRebaseTime + rebaseInterval) {
            _executeRebase();
        }
    }
    
    /**
     * @dev Mints tokens by paying ETH - anyone can mint!
     * The minting rate adjusts based on knowledge demand
     * @return tokensMinted Amount of tokens minted
     */
    function mintWithETH() external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Must send ETH to mint");
        
        // Calculate tokens to mint based on current rate
        uint256 tokensToMint = (msg.value * currentMintRate) / 1e18;
        require(tokensToMint > 0, "Minting rate too low");
        
        // Mint tokens to the caller
        _mint(msg.sender, tokensToMint);
        
        // Add ETH to backing
        totalBackingValue += msg.value;
        
        emit TokensMinted(msg.sender, tokensToMint, msg.value, currentMintRate);
        
        return tokensToMint;
    }
    
    /**
     * @dev Mints tokens for NFT purchases - implements 50/50 split with 5% to platform
     * @param student Address of the student (gets 50% - 5% platform fee)
     * @param sensei Address of the sensei (gets 50%)
     * @param nftValue Value of the NFT being minted
     */
    function mintForNFT(address student, address sensei, uint256 nftValue) external onlyAuthorizedMinter {
        require(student != address(0), "Invalid student address");
        require(sensei != address(0), "Invalid sensei address");
        require(nftValue > 0, "NFT value must be positive");
        
        // Calculate splits
        uint256 platformFee = (nftValue * PLATFORM_FEE_BASIS_POINTS) / 10000; // 5%
        uint256 studentShare = (nftValue / 2) - platformFee; // 50% - 5% platform fee
        uint256 senseiShare = nftValue / 2; // 50%
        
        // Mint tokens for each party
        _mint(student, studentShare);
        _mint(sensei, senseiShare);
        _mint(owner(), platformFee); // Platform fee to owner
        
        // Update sensei earnings
        senseiEarnings[sensei] += senseiShare;
        totalSenseiEarnings += senseiShare;
        
        emit TokensMintedForNFT(student, studentShare, nftValue);
        emit TokensMintedForNFT(sensei, senseiShare, nftValue);
    }
    
    /**
     * @dev Burns tokens and reduces backing
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        
        // Reduce backing proportionally
        uint256 backingToReduce = (amount * totalBackingValue) / totalSupply();
        totalBackingValue -= backingToReduce;
        
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Burns tokens from a specific address (called by authorized contracts)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyAuthorizedBurner {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        
        // Reduce backing proportionally
        if (totalSupply() > amount) {
            uint256 backingToReduce = (amount * totalBackingValue) / totalSupply();
            totalBackingValue = totalBackingValue > backingToReduce ? totalBackingValue - backingToReduce : 0;
        }
        
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Authorize/deauthorize minter contracts
     * @param minter Address to authorize/deauthorize
     * @param authorized Whether to authorize or deauthorize
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "Invalid address");
        authorizedMinters[minter] = authorized;
        emit AuthorizedMinterUpdated(minter, authorized);
    }
    
    /**
     * @dev Authorize/deauthorize burner contracts
     * @param burner Address to authorize/deauthorize
     * @param authorized Whether to authorize or deauthorize
     */
    function setAuthorizedBurner(address burner, bool authorized) external onlyOwner {
        require(burner != address(0), "Invalid address");
        authorizedBurners[burner] = authorized;
        emit AuthorizedBurnerUpdated(burner, authorized);
    }
    
    /**
     * @dev Executes rebase to maintain stablecoin properties and adjust minting rate
     */
    function _executeRebase() internal {
        uint256 currentBackingRatio = totalSupply() > 0 ? (totalBackingValue * 100) / totalSupply() : 100;
        
        // Calculate new minting rate based on knowledge demand
        uint256 newMintRate = _calculateNewMintRate();
        
        // Update minting rate
        uint256 oldRate = currentMintRate;
        currentMintRate = newMintRate;
        
        // Adjust backing if needed
        if (currentBackingRatio < MINIMUM_BACKING_RATIO && totalSupply() > 0) {
            uint256 requiredBacking = (totalSupply() * MINIMUM_BACKING_RATIO) / 100;
            totalBackingValue = requiredBacking;
        }
        
        lastRebaseTime = block.timestamp;
        
        emit RebaseExecuted(totalSupply(), (totalBackingValue * 100) / totalSupply(), newMintRate);
        emit MintRateUpdated(oldRate, newMintRate);
    }
    
    /**
     * @dev Calculates new minting rate based on knowledge demand
     * Higher demand = higher minting rate (more tokens per ETH)
     * Lower demand = lower minting rate (fewer tokens per ETH)
     * @return New minting rate
     */
    function _calculateNewMintRate() internal view returns (uint256) {
        if (totalKnowledgeValue == 0) {
            return MIN_MINT_RATE;
        }
        
        // Calculate demand ratio (knowledge value vs backing)
        uint256 demandRatio = (totalKnowledgeValue * 100) / (totalBackingValue > 0 ? totalBackingValue : 1);
        
        // Higher demand ratio = higher minting rate
        if (demandRatio >= 200) { // Very high demand
            return MAX_MINT_RATE;
        } else if (demandRatio >= 150) { // High demand
            return (MAX_MINT_RATE * 3) / 4;
        } else if (demandRatio >= 120) { // Moderate demand
            return (MAX_MINT_RATE + MIN_MINT_RATE) / 2;
        } else if (demandRatio >= 100) { // Balanced
            return MIN_MINT_RATE;
        } else { // Low demand
            return MIN_MINT_RATE / 2;
        }
    }
    
    /**
     * @dev Gets current backing ratio
     * @return Current backing ratio as percentage
     */
    function getBackingRatio() external view returns (uint256) {
        if (totalSupply() == 0) return 100;
        return (totalBackingValue * 100) / totalSupply();
    }
    
    /**
     * @dev Gets knowledge economy metrics
     * @return knowledgeValue Total knowledge value in the system
     * @return backingValue Total backing value
     * @return backingRatio Current backing ratio
     * @return mintRate Current minting rate
     */
    function getKnowledgeEconomyMetrics() external view returns (
        uint256 knowledgeValue,
        uint256 backingValue,
        uint256 backingRatio,
        uint256 mintRate
    ) {
        knowledgeValue = totalKnowledgeValue;
        backingValue = totalBackingValue;
        backingRatio = totalSupply() > 0 ? (totalBackingValue * 100) / totalSupply() : 100;
        mintRate = currentMintRate;
    }
    
    /**
     * @dev Gets session information
     * @param sessionId ID of the session
     * @return knowledgeValue Knowledge value of the session
     * @return backingValue Backing value of the session
     */
    function getSessionInfo(uint256 sessionId) external view returns (uint256 knowledgeValue, uint256 backingValue) {
        knowledgeValue = sessionKnowledgeValue[sessionId];
        backingValue = sessionBackingValue[sessionId];
    }
    
    /**
     * @dev Gets total session count
     * @return Total number of completed sessions
     */
    function getTotalSessions() external view returns (uint256) {
        return _nextSessionId - 1;
    }
    
    /**
     * @dev Gets current minting rate
     * @return Current tokens per ETH minting rate
     */
    function getCurrentMintRate() external view returns (uint256) {
        return currentMintRate;
    }
    
    /**
     * @dev Gets minting rate for a specific amount of ETH
     * @param ethAmount Amount of ETH to calculate tokens for
     * @return tokensToMint Tokens that would be minted
     */
    function getTokensForETH(uint256 ethAmount) external view returns (uint256) {
        return (ethAmount * currentMintRate) / 1e18;
    }
    
    /**
     * @dev Updates rebase interval (only owner)
     * @param newInterval New rebase interval in seconds
     */
    function setRebaseInterval(uint256 newInterval) external onlyOwner {
        require(newInterval > 0, "Interval must be positive");
        rebaseInterval = newInterval;
    }
    
    /**
     * @dev Emergency function to adjust backing (only owner)
     * @param newBackingValue New backing value
     */
    function emergencyAdjustBacking(uint256 newBackingValue) external onlyOwner {
        totalBackingValue = newBackingValue;
        emit RebaseExecuted(totalSupply(), (totalBackingValue * 100) / totalSupply(), currentMintRate);
    }
    
    /**
     * @dev Withdraws ETH backing (only owner, emergency use)
     * @param amount Amount of ETH to withdraw
     */
    function emergencyWithdrawETH(uint256 amount) external onlyOwner {
        require(amount <= totalBackingValue, "Cannot withdraw more than backing");
        require(amount <= address(this).balance, "Insufficient ETH balance");
        
        totalBackingValue -= amount;
        payable(owner()).transfer(amount);
        
        emit RebaseExecuted(totalSupply(), (totalBackingValue * 100) / totalSupply(), currentMintRate);
    }
    
    /**
     * @dev Gets sensei economy metrics
     * @param senseiAddress Address of the sensei
     * @return earnings Total earnings of the sensei
     * @return contributions Total knowledge contributions
     */
    function getSenseiMetrics(address senseiAddress) external view returns (uint256 earnings, uint256 contributions) {
        earnings = senseiEarnings[senseiAddress];
        contributions = senseiContributions[senseiAddress];
    }
    
    /**
     * @dev Gets total economy metrics
     * @return totalSupplyValue Total token supply
     * @return knowledgeValue Total knowledge value in the system
     * @return backingValue Total ETH backing
     * @return mintRate Current minting rate
     * @return totalEarnings Total earnings across all senseis
     */
    function getEconomyMetrics() external view returns (
        uint256 totalSupplyValue,
        uint256 knowledgeValue,
        uint256 backingValue,
        uint256 mintRate,
        uint256 totalEarnings
    ) {
        totalSupplyValue = totalSupply();
        knowledgeValue = totalKnowledgeValue;
        backingValue = totalBackingValue;
        mintRate = currentMintRate;
        totalEarnings = totalSenseiEarnings;
    }
    
    /**
     * @dev Distributes earnings to senseis based on their contributions (can be called by authorized contracts)
     * @param senseiAddress Address of the sensei
     * @param additionalEarnings Additional earnings to distribute
     */
    function distributeSenseiEarnings(address senseiAddress, uint256 additionalEarnings) external onlyAuthorizedMinter {
        require(senseiAddress != address(0), "Invalid sensei address");
        require(additionalEarnings > 0, "Earnings must be positive");
        
        senseiEarnings[senseiAddress] += additionalEarnings;
        totalSenseiEarnings += additionalEarnings;
        
        // Mint tokens to sensei as earnings
        _mint(senseiAddress, additionalEarnings);
        
        emit SenseiEarningsDistributed(senseiAddress, additionalEarnings);
    }
    
    /**
     * @dev Allows senseis to withdraw their earnings by burning tokens
     * @param tokenAmount Amount of tokens to burn for ETH withdrawal
     * This is how senseis get paid - they burn their earned tokens for ETH
     */
    function withdrawEarningsByBurning(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        require(senseiEarnings[msg.sender] >= tokenAmount, "Cannot withdraw more than earned");
        
        // Calculate ETH amount based on current backing ratio
        uint256 ethAmount = (tokenAmount * totalBackingValue) / totalSupply();
        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");
        
        // Burn tokens and reduce backing
        _burn(msg.sender, tokenAmount);
        totalBackingValue -= ethAmount;
        senseiEarnings[msg.sender] -= tokenAmount;
        totalSenseiEarnings -= tokenAmount;
        
        // Transfer ETH to sensei
        payable(msg.sender).transfer(ethAmount);
        
        emit TokensBurned(msg.sender, tokenAmount);
    }
    
    /**
     * @dev Emergency withdrawal function for any ERC20 tokens sent to contract
     * @param tokenAddress Address of the ERC20 token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyTokenWithdrawal(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(this), "Cannot withdraw SenseiTokens");
        IERC20(tokenAddress).transfer(owner(), amount);
    }
    
    /**
     * @dev Allows contract to receive ETH and update backing value
     * This is how the floating stablecoin gets its backing - through lesson payments
     */
    receive() external payable {
        totalBackingValue += msg.value;
    }
}
