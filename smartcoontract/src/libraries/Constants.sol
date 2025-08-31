// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Constants - Platform-wide constants and limits
 * @notice All the magic numbers and limits used across the Sensei platform
 * @dev No more random numbers scattered everywhere - everything's organized here
 * This is where all the important numbers live, ya know? No more guessing what 5 or 10 means
 */
library Constants {
    // ============ RATING SYSTEM (1-9 scale, because 10 is too mainstream) ============
    uint256 public constant MIN_RATING = 1; // Worst rating - "this sensei sucks"
    uint256 public constant MAX_RATING = 9; // Best rating - "this sensei is a legend"
    uint256 public constant DEFAULT_SENSEI_RATING = 4; // Default after each lesson (4 + student rating) / 2 = fair average
    uint256 public constant RATING_SCALE_MULTIPLIER = 100; // For precise calculations without decimals
    
    // ============ SESSION LIMITS (reasonable time boundaries) ============
    uint256 public constant MIN_SESSION_DURATION = 15; // 15 minutes minimum - anything less is just a chat
    uint256 public constant MAX_SESSION_DURATION = 480; // 8 hours max - nobody's got time for more than that
    uint256 public constant SESSION_TIMEOUT = 24 hours; // Auto-decline if sensei doesn't respond in 24h
    
    // ============ PAYMENT & FEES (the money stuff) ============
    uint256 public constant PLATFORM_FEE_BASIS_POINTS = 500; // 5% platform fee - gotta keep the lights on
    uint256 public constant STUDENT_NFT_SHARE_BASIS_POINTS = 5000; // 50% to student when NFT is minted
    uint256 public constant SENSEI_NFT_SHARE_BASIS_POINTS = 5000; // 50% to sensei when NFT is minted
    uint256 public constant STUDENT_PLATFORM_FEE_BASIS_POINTS = 500; // 5% fee from student's share
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000; // 100% = 10000 basis points (standard)
    
    // ============ TOKEN ECONOMICS (the heart of the economy) ============
    uint256 public constant MIN_MINT_RATE = 100 * 10**18; // Minimum tokens per ETH when demand is low
    uint256 public constant MAX_MINT_RATE = 1000 * 10**18; // Maximum tokens per ETH when demand is high
    uint256 public constant MINIMUM_BACKING_RATIO = 80; // 80% minimum backing - keeps token stable
    uint256 public constant KNOWLEDGE_MULTIPLIER = 100; // Knowledge value multiplier for token backing
    uint256 public constant REBASE_INTERVAL = 1 days; // Daily rebase to adjust token economics
    
    // ============ AI SYSTEM (the brain stuff) ============
    uint256 public constant DEFAULT_AI_RESPONSE_LENGTH = 1000; // Default AI response length
    uint256 public constant MIN_AI_RESPONSE_LENGTH = 100; // Minimum response - no one-word answers
    uint256 public constant MAX_AI_RESPONSE_LENGTH = 5000; // Maximum response - don't write a novel
    uint256 public constant DEFAULT_CONVERSATION_HISTORY = 10; // Keep last 10 conversations
    uint256 public constant MAX_REPLICAS_PER_SENSEI = 5; // Max AI replicas per sensei - quality over quantity
    uint256 public constant INITIAL_REPLICA_KNOWLEDGE = 10; // New replicas start with 10% knowledge
    uint256 public constant NEW_REPLICA_KNOWLEDGE = 5; // Specialized replicas start with 5%
    uint256 public constant MAX_KNOWLEDGE_INCREASE = 20; // Max knowledge increase per feeding session
    uint256 public constant FULL_KNOWLEDGE_LEVEL = 100; // 100% = replica equals original sensei
    
    // ============ NFT PRICING (making NFTs affordable but valuable) ============
    uint256 public constant NFT_BASE_PRICE_DIVISOR = 10; // NFT price = 10% of original session price
    uint256 public constant MIN_KNOWLEDGE_MULTIPLIER = 50; // 0.5x multiplier for low knowledge value
    uint256 public constant MAX_KNOWLEDGE_MULTIPLIER = 200; // 2.0x multiplier for high knowledge value
    uint256 public constant KNOWLEDGE_MULTIPLIER_SCALE = 15; // Scale factor for knowledge-based pricing
    uint256 public constant MIN_NFT_PRICE = 1 * 10**17; // 0.1 tokens minimum - can't be free
    
    // ============ PRIVACY & SECURITY (Zama FHEVM integration) ============
    uint256 public constant MAX_DATA_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max - no uploading movies
    uint256 public constant DATA_RETENTION_PERIOD = 365 days; // 1 year retention for privacy compliance
    uint256 public constant MIN_RETENTION_PERIOD = 30 days; // Minimum 30 days - legal requirement
    
    // ============ VALIDATION LIMITS (keeping things sane) ============
    uint256 public constant MAX_STRING_LENGTH = 500; // Max string length for inputs
    uint256 public constant MAX_SKILLS_COUNT = 10; // Max skills per sensei - focus is key
    uint256 public constant MAX_TAGS_COUNT = 5; // Max tags per data contribution
    uint256 public constant MIN_HOURLY_RATE = 0.001 ether; // Minimum hourly rate - $1-2 at current prices
    uint256 public constant MAX_HOURLY_RATE = 10 ether; // Maximum hourly rate - $20k+ is probably too much
    
    // ============ ZAMA FHEVM LIMITS (based on official docs) ============
    uint256 public constant HCU_LIMIT_PER_TRANSACTION = 20_000_000; // Global HCU limit per transaction
    uint256 public constant HCU_DEPTH_LIMIT_PER_TRANSACTION = 5_000_000; // Sequential operations limit
    uint256 public constant ENCRYPTED_OPERATION_BASE_COST = 50_000; // Base HCU cost estimate for operations
    uint256 public constant MAX_ENCRYPTED_OPERATIONS_PER_TX = 50; // Reasonable limit to stay under HCU
    
    // ============ REWARD SYSTEM (incentivizing quality) ============
    uint256 public constant BASE_REWARD_AMOUNT = 100 * 10**18; // Base reward for data contributions
    uint256 public constant QUALITY_MULTIPLIER = 2; // 2x multiplier for high-quality data
    uint256 public constant MIN_QUALITY_SCORE = 70; // Minimum quality score to pass verification
    uint256 public constant MIN_PRIVACY_SCORE = 80; // Minimum privacy score for sensitive data
    uint256 public constant EXCEPTIONAL_QUALITY_THRESHOLD = 95; // 3x reward for exceptional quality
    uint256 public constant HIGH_QUALITY_THRESHOLD = 90; // 2x reward for high quality
    uint256 public constant VERY_GOOD_QUALITY_THRESHOLD = 85; // 1.8x reward for very good quality
    uint256 public constant GOOD_QUALITY_THRESHOLD = 80; // 1.5x reward for good quality
    uint256 public constant ACCEPTABLE_QUALITY_THRESHOLD = 75; // 1.2x reward for acceptable quality
    
    // ============ TIME CONSTANTS (because time is important) ============
    uint256 public constant SECONDS_PER_MINUTE = 60;
    uint256 public constant MINUTES_PER_HOUR = 60;
    uint256 public constant HOURS_PER_DAY = 24;
    uint256 public constant SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
    uint256 public constant SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
    
    // ============ ADDRESS CONSTANTS (the important addresses) ============
    address public constant ZERO_ADDRESS = address(0); // The null address
    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD; // Burn address
    
    // ============ TOKEN CONSTANTS (ERC20 standard stuff) ============
    uint256 public constant TOKEN_DECIMALS = 18; // Standard ERC20 decimals
    uint256 public constant TOKEN_DECIMAL_FACTOR = 10**18; // 1 token = 10^18 wei
    
    // ============ DEMAND THRESHOLDS (for dynamic pricing) ============
    uint256 public constant VERY_HIGH_DEMAND_THRESHOLD = 200; // 200% demand ratio
    uint256 public constant HIGH_DEMAND_THRESHOLD = 150; // 150% demand ratio
    uint256 public constant MODERATE_DEMAND_THRESHOLD = 120; // 120% demand ratio
    uint256 public constant BALANCED_DEMAND_THRESHOLD = 100; // 100% balanced demand
    uint256 public constant LOW_DEMAND_THRESHOLD = 50; // 50% low demand
}