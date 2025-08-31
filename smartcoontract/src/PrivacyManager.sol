// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {TFHE, euint64, ebytes256} from "@fhevm/solidity/lib/TFHE.sol";
import {SepoliaZamaFHEVMConfig} from "@fhevm/solidity/config/ZamaFHEVMConfig.sol";
import {Constants} from "./libraries/Constants.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";
import {DataTypes} from "./libraries/DataTypes.sol";

/**
 * @title PrivacyManager - Zama FHEVM Integration for Sensei Knowledge Protection
 * @notice Manages encrypted knowledge data uploads using FHEVM for AI replica training
 * @dev Protects sensitive knowledge data that senseis feed to their AI replicas
 * Uses FHEVM to encrypt knowledge data while allowing AI to process it without revealing content
 */
contract PrivacyManager is Ownable, ReentrancyGuard, SepoliaZamaFHEVMConfig {
    
    // Data contribution states
    enum DataState {
        UPLOADED,       // Data uploaded and encrypted with FHEVM
        VERIFIED,       // Data verified by TEE/Zama network
        PROCESSED,      // Data processed by AI replica
        REJECTED        // Data rejected due to verification failure
    }
    
    // Encrypted knowledge contribution record
    struct EncryptedKnowledgeContribution {
        uint256 contributionId;
        uint256 senseiId;
        address contributor;
        string dataType; // Type of knowledge (e.g., "cooking_recipes", "business_strategies")
        ebytes256 encryptedData; // FHEVM encrypted knowledge data
        string metadataUri; // IPFS URI for additional metadata
        DataState state;
        uint256 uploadTimestamp;
        uint256 verificationTimestamp;
        bool isPrivacySensitive;
        string[] tags;
        uint256 replicaId; // Which AI replica this data is for
        uint256 knowledgeValue; // Encrypted knowledge value (1-100)
    }
    
    // Contract references
    address public senseiRegistryContract;
    address public sensayAIContract;
    
    // State variables
    uint256 private _nextContributionId = 1;
    mapping(uint256 => EncryptedKnowledgeContribution) public dataContributions;
    mapping(uint256 => uint256[]) public senseiContributions; // senseiId => contributionIds
    mapping(uint256 => uint256[]) public replicaContributions; // replicaId => contributionIds
    mapping(address => bool) public authorizedVerifiers;
    
    // Privacy settings
    uint256 public maxDataSizeBytes = 10 * 1024 * 1024; // 10MB max
    uint256 public dataRetentionPeriod = 365 days; // 1 year retention
    bool public privacyProtectionEnabled = true;
    
    // FHEVM encrypted knowledge tracking
    euint64 private encryptedTotalKnowledgeValue; // Total encrypted knowledge value
    euint64 private encryptedAverageKnowledgeQuality; // Average encrypted knowledge quality
    
    // Events
    event EncryptedKnowledgeUploaded(
        uint256 indexed contributionId,
        uint256 indexed senseiId,
        uint256 indexed replicaId,
        string dataType,
        bool isPrivacySensitive
    );
    event KnowledgeVerified(
        uint256 indexed contributionId,
        address indexed verifier,
        bool approved
    );
    event KnowledgeProcessedByAI(
        uint256 indexed contributionId,
        uint256 indexed replicaId,
        uint256 knowledgeIncrease
    );
    event VerifierAuthorized(address indexed verifier, bool authorized);
    event PrivacySettingsUpdated(uint256 maxSize, uint256 retentionPeriod);

    
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    modifier onlySenseiOrOwner(uint256 senseiId) {
        // This would need integration with SenseiRegistry to verify ownership
        require(msg.sender == owner(), "Only sensei or owner can access"); // Simplified for now
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Initialize FHEVM encrypted values
        encryptedTotalKnowledgeValue = TFHE.asEuint64(0);
        encryptedAverageKnowledgeQuality = TFHE.asEuint64(0);
        
        // Allow this contract to handle encrypted values
        TFHE.allowThis(encryptedTotalKnowledgeValue);
        TFHE.allowThis(encryptedAverageKnowledgeQuality);
    }
    
    /**
     * @dev Uploads encrypted knowledge data for a sensei's AI replica using FHEVM
     * @param senseiId ID of the sensei
     * @param replicaId ID of the specific AI replica
     * @param dataType Type of knowledge data
     * @param encryptedData FHEVM encrypted knowledge data (ebytes256)
     * @param metadataUri IPFS URI for additional metadata
     * @param isPrivacySensitive Whether data contains sensitive information
     * @param tags Tags for categorization
     * @param knowledgeValue Encrypted knowledge value assessment (1-100)
     */
    function uploadEncryptedKnowledge(
        uint256 senseiId,
        uint256 replicaId,
        string memory dataType,
        ebytes256 encryptedData,
        string memory metadataUri,
        bool isPrivacySensitive,
        string[] memory tags,
        euint64 knowledgeValue
    ) external nonReentrant returns (uint256) {
        require(senseiId > 0, "Invalid sensei ID");
        require(replicaId > 0, "Invalid replica ID");
        require(bytes(dataType).length > 0, "Data type cannot be empty");
        require(bytes(metadataUri).length > 0, "Metadata URI cannot be empty");
        require(privacyProtectionEnabled, "Privacy protection is disabled");
        
        uint256 contributionId = _nextContributionId++;
        
        dataContributions[contributionId] = EncryptedKnowledgeContribution({
            contributionId: contributionId,
            senseiId: senseiId,
            contributor: msg.sender,
            dataType: dataType,
            encryptedData: encryptedData,
            metadataUri: metadataUri,
            state: DataState.UPLOADED,
            uploadTimestamp: block.timestamp,
            verificationTimestamp: 0,
            isPrivacySensitive: isPrivacySensitive,
            tags: tags,
            replicaId: replicaId,
            knowledgeValue: 0 // Will be set after decryption
        });
        
        // Track contributions
        senseiContributions[senseiId].push(contributionId);
        replicaContributions[replicaId].push(contributionId);
        
        // Update encrypted total knowledge value
        encryptedTotalKnowledgeValue = TFHE.add(encryptedTotalKnowledgeValue, knowledgeValue);
        TFHE.allowThis(encryptedTotalKnowledgeValue);
        
        emit EncryptedKnowledgeUploaded(contributionId, senseiId, replicaId, dataType, isPrivacySensitive);
        
        return contributionId;
    }
    
    /**
     * @dev Verifies encrypted knowledge data using Zama's confidential verification
     * @param contributionId ID of the data contribution
     * @param approved Whether the data is approved
     */
    function verifyEncryptedKnowledge(uint256 contributionId, bool approved) 
        external 
        onlyAuthorizedVerifier 
        nonReentrant 
    {
        require(contributionId > 0 && contributionId < _nextContributionId, "Invalid contribution ID");
        
        EncryptedKnowledgeContribution storage contribution = dataContributions[contributionId];
        require(contribution.state == DataState.UPLOADED, "Data not in uploaded state");
        
        contribution.verificationTimestamp = block.timestamp;
        
        if (approved) {
            contribution.state = DataState.VERIFIED;
            
            // FHEVM confidential verification - the encrypted data can now be processed
            // by authorized AI replicas without revealing the plaintext to anyone on-chain
            
        } else {
            contribution.state = DataState.REJECTED;
        }
        
        emit KnowledgeVerified(contributionId, msg.sender, approved);
    }
    
    /**
     * @dev Processes verified knowledge data for AI replica training
     * @param contributionId ID of the data contribution
     * @param knowledgeIncrease How much this data increases the replica's knowledge (1-20)
     */
    function processKnowledgeForAI(uint256 contributionId, uint256 knowledgeIncrease) 
        external 
        onlyAuthorizedVerifier 
        nonReentrant 
    {
        require(contributionId > 0 && contributionId < _nextContributionId, "Invalid contribution ID");
        require(knowledgeIncrease > 0 && knowledgeIncrease <= 20, "Knowledge increase must be 1-20");
        
        EncryptedKnowledgeContribution storage contribution = dataContributions[contributionId];
        require(contribution.state == DataState.VERIFIED, "Data not verified");
        
        contribution.state = DataState.PROCESSED;
        
        // Update encrypted average knowledge quality
        // This calculation happens on encrypted data without revealing individual values
        euint64 currentQuality = TFHE.asEuint64(knowledgeIncrease);
        encryptedAverageKnowledgeQuality = TFHE.div(
            TFHE.add(encryptedAverageKnowledgeQuality, currentQuality),
            2
        );
        TFHE.allowThis(encryptedAverageKnowledgeQuality);
        
        emit KnowledgeProcessedByAI(contributionId, contribution.replicaId, knowledgeIncrease);
    }
    
    /**
     * @dev Gets the encrypted data as bytes32 for external processing
     * @param contributionId ID of the contribution
     * @return Encrypted data as bytes32
     */
    function getEncryptedDataAsBytes32(uint256 contributionId) external view returns (uint256) {
        require(contributionId > 0 && contributionId < _nextContributionId, "Invalid contribution ID");
        
        EncryptedKnowledgeContribution storage contribution = dataContributions[contributionId];
        require(
            msg.sender == contribution.contributor || 
            authorizedVerifiers[msg.sender] || 
            msg.sender == owner(),
            "Not authorized to access this knowledge"
        );
        
        // Return the encrypted data as uint256 for external decryption
        return ebytes256.unwrap(contribution.encryptedData);
    }
    
    /**
     * @dev Gets encrypted knowledge data for authorized access
     * @param contributionId ID of the data contribution
     * @return encryptedData FHEVM encrypted data
     * @return metadataUri IPFS URI for metadata
     * @return state Current state of the data
     * @return isPrivacySensitive Whether data is privacy sensitive
     */
    function getEncryptedKnowledge(uint256 contributionId) 
        external 
        view 
        returns (
            ebytes256 encryptedData,
            string memory metadataUri,
            DataState state,
            bool isPrivacySensitive
        ) 
    {
        require(contributionId > 0 && contributionId < _nextContributionId, "Invalid contribution ID");
        
        EncryptedKnowledgeContribution memory contribution = dataContributions[contributionId];
        
        // Access control - only authorized parties can access
        require(
            msg.sender == contribution.contributor || 
            authorizedVerifiers[msg.sender] || 
            msg.sender == owner(),
            "Not authorized to access this knowledge"
        );
        
        return (
            contribution.encryptedData,
            contribution.metadataUri,
            contribution.state,
            contribution.isPrivacySensitive
        );
    }
    
    /**
     * @dev Gets all knowledge contributions for a sensei
     * @param senseiId ID of the sensei
     * @return Array of contribution IDs
     */
    function getSenseiContributions(uint256 senseiId) external view returns (uint256[] memory) {
        return senseiContributions[senseiId];
    }
    
    /**
     * @dev Gets all knowledge contributions for an AI replica
     * @param replicaId ID of the AI replica
     * @return Array of contribution IDs
     */
    function getReplicaContributions(uint256 replicaId) external view returns (uint256[] memory) {
        return replicaContributions[replicaId];
    }
    
    /**
     * @dev Gets contribution details
     * @param contributionId ID of the contribution
     * @return EncryptedKnowledgeContribution struct
     */
    function getContributionDetails(uint256 contributionId) 
        external 
        view 
        returns (EncryptedKnowledgeContribution memory) 
    {
        require(contributionId > 0 && contributionId < _nextContributionId, "Invalid contribution ID");
        return dataContributions[contributionId];
    }
    
    /**
     * @dev Gets knowledge contributions by state
     * @param state State to filter by
     * @return Array of contribution IDs
     */
    function getContributionsByState(DataState state) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count contributions with the specified state
        for (uint256 i = 1; i < _nextContributionId; i++) {
            if (dataContributions[i].state == state) {
                count++;
            }
        }
        
        // Collect contribution IDs
        uint256[] memory contributionIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < _nextContributionId; i++) {
            if (dataContributions[i].state == state) {
                contributionIds[index] = i;
                index++;
            }
        }
        
        return contributionIds;
    }
    
    /**
     * @dev Gets encrypted total knowledge value (only encrypted, never decrypted)
     * @return Encrypted total knowledge value as uint256
     */
    function getEncryptedTotalKnowledgeValue() external view returns (uint256) {
        return euint64.unwrap(encryptedTotalKnowledgeValue);
    }
    
    /**
     * @dev Gets encrypted average knowledge quality (only encrypted, never decrypted)
     * @return Encrypted average knowledge quality as uint256
     */
    function getEncryptedAverageKnowledgeQuality() external view returns (uint256) {
        return euint64.unwrap(encryptedAverageKnowledgeQuality);
    }
    
    /**
     * @dev Cleans up old knowledge contributions (privacy compliance)
     * @param contributionIds Array of contribution IDs to clean up
     */
    function cleanupOldKnowledge(uint256[] memory contributionIds) external onlyOwner {
        for (uint256 i = 0; i < contributionIds.length; i++) {
            uint256 contributionId = contributionIds[i];
            require(contributionId > 0 && contributionId < _nextContributionId, "Invalid contribution ID");
            
            EncryptedKnowledgeContribution storage contribution = dataContributions[contributionId];
            
            // Only allow cleanup of old, processed contributions
            require(
                contribution.state == DataState.PROCESSED &&
                block.timestamp >= contribution.uploadTimestamp + dataRetentionPeriod,
                "Cannot cleanup this contribution yet"
            );
            
            // Remove from tracking arrays
            _removeFromArray(senseiContributions[contribution.senseiId], contributionId);
            _removeFromArray(replicaContributions[contribution.replicaId], contributionId);
            
            // Clear the contribution data
            delete dataContributions[contributionId];
        }
    }
    
    /**
     * @dev Authorizes or deauthorizes a verifier
     * @param verifier Address of the verifier
     * @param authorized Whether to authorize
     */
    function setVerifierAuthorization(address verifier, bool authorized) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
        emit VerifierAuthorized(verifier, authorized);
    }
    
    /**
     * @dev Updates privacy settings
     * @param newMaxSize New maximum data size in bytes
     * @param newRetentionPeriod New retention period in seconds
     */
    function updatePrivacySettings(uint256 newMaxSize, uint256 newRetentionPeriod) external onlyOwner {
        maxDataSizeBytes = newMaxSize;
        dataRetentionPeriod = newRetentionPeriod;
        emit PrivacySettingsUpdated(newMaxSize, newRetentionPeriod);
    }
    
    /**
     * @dev Sets contract references
     * @param _senseiRegistry Address of SenseiRegistry contract
     * @param _sensayAI Address of SensayAI contract
     */
    function setContractReferences(address _senseiRegistry, address _sensayAI) external onlyOwner {
        senseiRegistryContract = _senseiRegistry;
        sensayAIContract = _sensayAI;
    }
    
    /**
     * @dev Emergency function to disable privacy protection
     */
    function emergencyDisablePrivacy() external onlyOwner {
        privacyProtectionEnabled = false;
    }
    
    /**
     * @dev Helper function to remove an element from an array
     */
    function _removeFromArray(uint256[] storage array, uint256 element) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Allows contract to receive ETH (for potential future features)
     */
    receive() external payable {}
}
