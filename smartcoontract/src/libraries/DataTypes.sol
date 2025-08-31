// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TFHE, euint64, ebytes256} from "@fhevm/solidity/lib/TFHE.sol";
import "./Constants.sol";

/**
 * @title DataTypes - Comprehensive data structures for the Sensei platform
 * @notice All the structs, enums, and data types used across the platform
 * @dev This is where we define how all our data looks - the blueprint of everything
 * Now with proper FHEVM v0.7 encrypted types for privacy, ya know?
 */
library DataTypes {
    
    // ============ ENUMS (the categories and states) ============
    
    // Session states - the journey of a lesson booking
    enum SessionState {
        PENDING,        // "Waiting for sensei to respond"
        ACCEPTED,       // "Sensei said yes, let's do this"
        DECLINED,       // "Sensei said no, try someone else"
        IN_PROGRESS,    // "Currently learning"
        COMPLETED,      // "All done, mission accomplished"
        CANCELLED,      // "Never mind, changed my mind"
        DISPUTED        // "Something went wrong, need admin help"
    }
    
    // Payment methods - how people pay for lessons
    enum PaymentMethod {
        ETH,            // "Good old Ethereum"
        ERC20_TOKEN     // "Any ERC20 token they want"
    }
    
    // AI model types - the brains behind the operation
    enum AIModel {
        GPT4,           // "OpenAI's flagship"
        CLAUDE3,        // "Anthropic's best"
        GEMINI_PRO,     // "Google's answer"
        LLAMA3,         // "Meta's open source"
        CUSTOM_SENSAY   // "Our own special sauce"
    }
    
    // Lesson quality levels - 1-9 scale because 10 is too perfect
    enum LessonQuality {
        POOR,           // 1-2: "That was rough"
        FAIR,           // 3-4: "Meh, could be better"
        GOOD,           // 5-6: "Pretty solid lesson"
        EXCELLENT,      // 7-8: "Really good stuff"
        OUTSTANDING     // 9: "Absolutely legendary"
    }
    
    // Data privacy states for FHEVM integration
    enum DataPrivacyLevel {
        PUBLIC,         // "Everyone can see this"
        ENCRYPTED,      // "Locked up with FHEVM"
        CONFIDENTIAL,   // "Super secret, TEE only"
        PRIVATE         // "Just between us"
    }
    
    // Data contribution states for privacy manager
    enum DataState {
        UPLOADED,       // "Data is uploaded and encrypted"
        VERIFYING,      // "TEE is checking it out"
        VERIFIED,       // "All good, data is legit"
        PROCESSED,      // "AI has absorbed the knowledge"
        REJECTED        // "Something's wrong with this data"
    }
    
    // ============ CORE STRUCTURES ============
    
    // Sensei profile - the heart of every teacher
    struct SenseiProfile {
        address senseiAddress;          // "Who they are"
        string name;                    // "What to call them"
        string expertise;               // "What they're good at"
        string description;             // "Their story"
        uint256 hourlyRate;             // "What they charge"
        bool isActive;                  // "Are they available?"
        uint256 totalSessions;          // "How many lessons taught"
        uint256 rating;                 // "Average rating (1-9)"
        uint256 totalRating;            // "Sum of all ratings"
        uint256 registrationDate;       // "When they joined"
        bool hasPersonalAI;             // "Do they have an AI clone?"
        string personalAIPrompt;        // "How their AI talks"
        uint256 knowledgeContributions; // "How much knowledge shared"
        uint256 totalEarnings;          // "Money made on platform"
        bool isRetiredSensei;           // "Are they retired?"
        string[] skills;                // "List of their skills"
        uint256 replicaCount;           // "How many AI replicas"
    }
    
    // Session structure - every lesson booking
    struct Session {
        uint256 sessionId;              // "Unique session ID"
        uint256 senseiId;               // "Which sensei"
        address studentAddress;         // "Who's learning"
        string subject;                 // "What they're learning"
        string sessionTitle;            // "Lesson title"
        string sessionDescription;      // "What they want to learn"
        uint256 duration;               // "How long (minutes)"
        uint256 price;                  // "How much it costs"
        PaymentMethod paymentMethod;    // "How they're paying"
        address paymentToken;           // "Which token (if ERC20)"
        SessionState state;             // "Current status"
        uint256 bookingTime;            // "When it was booked"
        uint256 startTime;              // "When it started"
        uint256 endTime;                // "When it ended"
        uint256 knowledgeValue;         // "Knowledge assessment (1-100)"
        bool isPaid;                    // "Has payment been processed?"
        bool isRated;                   // "Has student rated it?"
        uint256 studentRating;          // "Student's rating (1-9)"
        uint256 senseiRating;           // "Sensei's rating of student"
        bool nftMintable;               // "Can others mint this as NFT?"
        uint256 lessonNFTId;            // "Associated NFT ID"
    }
    
    // AI Replica structure - the digital clones
    struct AIReplica {
        uint256 replicaId;              // "Unique replica ID"
        uint256 senseiId;               // "Which sensei it belongs to"
        string replicaName;             // "What to call this replica"
        uint256 knowledgeLevel;         // "How much it knows (0-100%)"
        bool isActive;                  // "Is it working?"
        uint256 creationDate;           // "When it was born"
        string specialization;          // "What it specializes in"
    }
    
    // Lesson NFT metadata - the collectible lessons
    struct LessonMetadata {
        uint256 sessionId;              // "Which session this represents"
        address senseiAddress;          // "Who taught it"
        address studentAddress;         // "Who learned it"
        string subject;                 // "What subject"
        string lessonTitle;             // "Lesson title"
        string lessonDescription;       // "What was taught"
        uint256 sessionDuration;        // "How long it took"
        uint256 sessionPrice;           // "Original price"
        uint256 knowledgeValue;         // "Knowledge assessment"
        uint256 mintPrice;              // "Price to mint NFT"
        bool isMinted;                  // "Has someone minted it?"
        uint256 mintTimestamp;          // "When it was minted"
        bool isPublicMintable;          // "Can anyone mint it?"
        uint256 lessonQuality;          // "Quality score"
        address minter;                 // "Who minted it"
    }
    
    // ============ ENCRYPTED STRUCTURES (FHEVM integration planned) ============
    
    // Data contribution for privacy (will be encrypted with FHEVM)
    struct EncryptedDataContribution {
        uint256 contributionId;         // "Unique contribution ID"
        uint256 senseiId;               // "Which sensei contributed"
        address contributor;            // "Who uploaded it"
        string dataType;                // "Type of knowledge"
        ebytes256 encryptedData;        // "Encrypted data using FHEVM v0.7"
        bytes32 dataHash;               // "Hash of original data"
        DataPrivacyLevel privacyLevel;  // "How private is this?"
        DataState state;                // "Current processing state"
        uint256 uploadTimestamp;        // "When it was uploaded"
        uint256 verificationTimestamp;  // "When it was verified"
        bool isPrivacySensitive;        // "Contains sensitive info?"
        string[] tags;                  // "Tags for categorization"
        uint256 replicaId;              // "Which replica this feeds"
    }
    
    // Quality assessment (will be encrypted with FHEVM)
    struct EncryptedQualityAssessment {
        euint64 qualityScore;           // "Quality score (1-9) using FHEVM v0.7"
        euint64 knowledgeDepth;         // "Knowledge depth using FHEVM v0.7"
        euint64 practicalValue;         // "Practical value using FHEVM v0.7"
        bool isVerified;                // "Is this assessment verified?"
        uint256 assessmentTimestamp;    // "When it was assessed"
    }
    
    // ============ AI CONFIGURATION STRUCTURES ============
    
    // AI Agent configuration
    struct AIAgentConfig {
        string basePrompt;              // "Base personality prompt"
        string personalityTraits;       // "How the AI behaves"
        string teachingStyle;           // "How it teaches"
        uint256 maxResponseLength;      // "Max response length"
        bool isActive;                  // "Is the AI working?"
    }
    
    // Personal AI structure
    struct PersonalAI {
        uint256 senseiId;               // "Which sensei this belongs to"
        string personalizedPrompt;      // "Custom prompt for this AI"
        string aiModel;                 // "Which AI model to use"
        uint256 creationTimestamp;      // "When it was created"
        uint256 interactionCount;       // "How many conversations"
        bool isActive;                  // "Is it active?"
        string[] conversationHistory;   // "Recent conversations"
        uint256 maxHistoryLength;       // "Max conversations to keep"
    }
    
    // ============ ECONOMIC STRUCTURES ============
    
    // Knowledge economy metrics
    struct EconomyMetrics {
        uint256 totalSupply;            // "Total tokens in circulation"
        uint256 totalKnowledgeValue;    // "Total knowledge value"
        uint256 totalBackingValue;      // "Total ETH backing"
        uint256 backingRatio;           // "Backing ratio percentage"
        uint256 currentMintRate;        // "Current minting rate"
        uint256 totalSessions;          // "Total sessions completed"
        uint256 totalSenseis;           // "Total registered senseis"
        uint256 totalNFTsMinted;        // "Total NFTs minted"
    }
    
    // Platform statistics
    struct PlatformStats {
        uint256 totalSenseis;           // "Total senseis registered"
        uint256 totalSessions;          // "Total sessions booked"
        uint256 totalNFTsMinted;        // "Total NFTs minted"
        uint256 totalTokensCirculating; // "Total tokens in circulation"
        uint256 totalKnowledgeValue;    // "Total knowledge value"
        uint256 totalEarnings;          // "Total platform earnings"
        uint256 activeUsers;            // "Active users this month"
        uint256 averageSessionRating;   // "Average session rating"
    }
    
    // ============ VALIDATION FUNCTIONS ============
    
    // Address validation - "Is this a real address?"
    function isValidAddress(address addr) internal pure returns (bool) {
        return addr != Constants.ZERO_ADDRESS;
    }
    
    // String validation - "Is this string actually useful?"
    function isValidString(string memory str) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        return strBytes.length > 0 && strBytes.length <= Constants.MAX_STRING_LENGTH;
    }
    
    // Rating validation - "Is this rating in the 1-9 range?"
    function isValidRating(uint256 rating) internal pure returns (bool) {
        return rating >= Constants.MIN_RATING && rating <= Constants.MAX_RATING;
    }
    
    // Duration validation - "Is this a reasonable lesson length?"
    function isValidDuration(uint256 duration) internal pure returns (bool) {
        return duration >= Constants.MIN_SESSION_DURATION && duration <= Constants.MAX_SESSION_DURATION;
    }
    
    // Price validation - "Is this price reasonable?"
    function isValidPrice(uint256 price) internal pure returns (bool) {
        return price > 0 && price <= Constants.MAX_HOURLY_RATE;
    }
    
    // Knowledge value validation - "Is this knowledge assessment valid?"
    function isValidKnowledgeValue(uint256 knowledgeValue) internal pure returns (bool) {
        return knowledgeValue > 0 && knowledgeValue <= Constants.FULL_KNOWLEDGE_LEVEL;
    }
    
    // ============ CONVERSION FUNCTIONS ============
    
    // Convert quality enum to numeric rating
    function qualityToRating(LessonQuality quality) internal pure returns (uint256) {
        if (quality == LessonQuality.POOR) return 2;         // "That was rough"
        if (quality == LessonQuality.FAIR) return 4;         // "Could be better"
        if (quality == LessonQuality.GOOD) return 6;         // "Pretty solid"
        if (quality == LessonQuality.EXCELLENT) return 8;    // "Really good"
        if (quality == LessonQuality.OUTSTANDING) return 9;  // "Legendary"
        return 5; // Default to middle ground
    }
    
    // Convert numeric rating to quality enum
    function ratingToQuality(uint256 rating) internal pure returns (LessonQuality) {
        if (rating <= 2) return LessonQuality.POOR;
        if (rating <= 4) return LessonQuality.FAIR;
        if (rating <= 6) return LessonQuality.GOOD;
        if (rating <= 8) return LessonQuality.EXCELLENT;
        return LessonQuality.OUTSTANDING;
    }
    
    // Convert AI model enum to string
    function aiModelToString(AIModel model) internal pure returns (string memory) {
        if (model == AIModel.GPT4) return "GPT-4";
        if (model == AIModel.CLAUDE3) return "Claude-3";
        if (model == AIModel.GEMINI_PRO) return "Gemini-Pro";
        if (model == AIModel.LLAMA3) return "Llama-3";
        if (model == AIModel.CUSTOM_SENSAY) return "Custom-Sensay";
        return "Unknown"; // Shouldn't happen but just in case
    }
    
    // Calculate average rating from total and count
    function calculateAverageRating(uint256 totalRating, uint256 sessionCount) internal pure returns (uint256) {
        if (sessionCount == 0) return Constants.DEFAULT_SENSEI_RATING;
        return totalRating / sessionCount;
    }
    
    // Calculate NFT mint price based on knowledge value
    function calculateNFTPrice(uint256 sessionPrice, uint256 knowledgeValue) internal pure returns (uint256) {
        uint256 basePrice = sessionPrice / Constants.NFT_BASE_PRICE_DIVISOR;
        uint256 knowledgeMultiplier = (knowledgeValue * Constants.KNOWLEDGE_MULTIPLIER_SCALE) / 10 + Constants.MIN_KNOWLEDGE_MULTIPLIER;
        uint256 finalPrice = (basePrice * knowledgeMultiplier) / 100;
        
        // Ensure it's within reasonable bounds
        if (finalPrice < Constants.MIN_NFT_PRICE) finalPrice = Constants.MIN_NFT_PRICE;
        if (finalPrice > sessionPrice) finalPrice = sessionPrice;
        
        return finalPrice;
    }
}