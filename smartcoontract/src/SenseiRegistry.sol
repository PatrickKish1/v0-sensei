// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SenseiRegistry - Decentralized Platform for Knowledge Sharing
 * @notice Registry for retirees and experts to register as Senseis and create AI clones
 * @dev Manages Sensei profiles, AI replicas, and knowledge contribution tracking
 */
contract SenseiRegistry is Ownable, ReentrancyGuard {
    
    struct SenseiProfile {
        address senseiAddress;
        string name;
        string expertise;
        string description;
        uint256 hourlyRate;
        bool isActive;
        uint256 totalSessions;
        uint256 rating; // Average rating (1-10 scale)
        uint256 totalRating; // Sum of all ratings
        uint256 registrationDate;
        bool hasPersonalAI;
        string personalAIPrompt;
        uint256 knowledgeContributions; // Total knowledge value contributed
        uint256 totalEarnings; // Total earnings from sessions and NFTs
        bool isRetiredSensei; // Whether this is a retired person
        string[] skills; // Array of skills/subjects they can teach
        uint256 replicaCount; // Number of AI replicas created
    }
    
    uint256 private _nextSenseiId = 1;
    
    mapping(uint256 => SenseiProfile) public senseiProfiles;
    mapping(address => uint256) public addressToSenseiId;
    mapping(address => bool) public isRegisteredSensei;
    
    // AI Agent and related contracts
    address public aiAgentContract;
    address public senseiTokenContract;
    address public privacyManagerContract;
    
    // Replica tracking
    struct AIReplica {
        uint256 replicaId;
        uint256 senseiId;
        string replicaName;
        uint256 knowledgeLevel; // 0-100, how much knowledge the replica has absorbed
        bool isActive;
        uint256 creationDate;
        string specialization; // Specific area of expertise for this replica
    }
    
    mapping(uint256 => AIReplica) public aiReplicas; // replicaId => AIReplica
    mapping(uint256 => uint256[]) public senseiReplicas; // senseiId => replicaIds[]
    uint256 private _nextReplicaId = 1;
    
    // Events
    event SenseiRegistered(uint256 indexed senseiId, address indexed senseiAddress, string name, string expertise, bool isRetired);
    event SenseiProfileUpdated(uint256 indexed senseiId, address indexed senseiAddress);
    event SenseiDeactivated(uint256 indexed senseiId, address indexed senseiAddress);
    event PersonalAICreated(uint256 indexed senseiId, address indexed senseiAddress, string personalAIPrompt);
    event AIReplicaCreated(uint256 indexed replicaId, uint256 indexed senseiId, string replicaName, string specialization);
    event ReplicaKnowledgeUpdated(uint256 indexed replicaId, uint256 newKnowledgeLevel);
    event KnowledgeContributionRecorded(uint256 indexed senseiId, uint256 contributionValue);
    event EarningsUpdated(uint256 indexed senseiId, uint256 newTotalEarnings);
    
    modifier onlySensei(uint256 senseiId) {
        require(senseiProfiles[senseiId].senseiAddress == msg.sender, "Only the sensei can perform this action");
        _;
    }
    
    modifier senseiExists(uint256 senseiId) {
        require(senseiProfiles[senseiId].senseiAddress != address(0), "Sensei does not exist");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Initialize the registry
    }
    
    modifier onlyAIAgent() {
        require(msg.sender == aiAgentContract, "Only AI agent can call this function");
        _;
    }
    
    function registerSensei(
        string memory name,
        string memory expertise,
        string memory description,
        uint256 hourlyRate,
        bool isRetired,
        string[] memory skills
    ) external returns (uint256) {
        require(!isRegisteredSensei[msg.sender], "Address already registered as sensei");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(expertise).length > 0, "Expertise cannot be empty");
        require(hourlyRate > 0, "Hourly rate must be greater than 0");
        require(skills.length > 0, "Must specify at least one skill");
        
        uint256 newSenseiId = _nextSenseiId++;
        
        // Create the profile with new fields
        senseiProfiles[newSenseiId] = SenseiProfile({
            senseiAddress: msg.sender,
            name: name,
            expertise: expertise,
            description: description,
            hourlyRate: hourlyRate,
            isActive: true,
            totalSessions: 0,
            rating: 0,
            totalRating: 0,
            registrationDate: block.timestamp,
            hasPersonalAI: false,
            personalAIPrompt: "",
            knowledgeContributions: 0,
            totalEarnings: 0,
            isRetiredSensei: isRetired,
            skills: skills,
            replicaCount: 0
        });
        
        addressToSenseiId[msg.sender] = newSenseiId;
        isRegisteredSensei[msg.sender] = true;
        
        emit SenseiRegistered(newSenseiId, msg.sender, name, expertise, isRetired);
        
        // Automatically create personal AI and initial replica
        if (aiAgentContract != address(0)) {
            _createPersonalAI(newSenseiId, name, expertise, description);
            _createInitialReplica(newSenseiId, name, expertise);
        }
        
        return newSenseiId;
    }
    
    function _createPersonalAI(uint256 senseiId, string memory name, string memory expertise, string memory description) internal {
        // Generate personalized AI prompt based on Sensei's profile
        string memory personalAIPrompt = _generatePersonalAIPrompt(name, expertise, description);
        
        senseiProfiles[senseiId].hasPersonalAI = true;
        senseiProfiles[senseiId].personalAIPrompt = personalAIPrompt;
        
        emit PersonalAICreated(senseiId, senseiProfiles[senseiId].senseiAddress, personalAIPrompt);
    }
    
    /**
     * @dev Creates an initial AI replica for a newly registered Sensei
     * @param senseiId ID of the sensei
     * @param name Name of the sensei
     * @param expertise Primary expertise area
     */
    function _createInitialReplica(uint256 senseiId, string memory name, string memory expertise) internal {
        uint256 replicaId = _nextReplicaId++;
        
        string memory replicaName = string(abi.encodePacked(name, " AI Replica #1"));
        
        aiReplicas[replicaId] = AIReplica({
            replicaId: replicaId,
            senseiId: senseiId,
            replicaName: replicaName,
            knowledgeLevel: 10, // Start with 10% knowledge
            isActive: true,
            creationDate: block.timestamp,
            specialization: expertise
        });
        
        senseiReplicas[senseiId].push(replicaId);
        senseiProfiles[senseiId].replicaCount = 1;
        
        emit AIReplicaCreated(replicaId, senseiId, replicaName, expertise);
    }
    
    /**
     * @dev Creates additional AI replicas for specialized knowledge areas
     * @param senseiId ID of the sensei
     * @param specialization Specific area of expertise for this replica
     * @param replicaName Custom name for the replica
     */
    function createSpecializedReplica(
        uint256 senseiId,
        string memory specialization,
        string memory replicaName
    ) external onlySensei(senseiId) returns (uint256) {
        require(bytes(specialization).length > 0, "Specialization cannot be empty");
        require(bytes(replicaName).length > 0, "Replica name cannot be empty");
        require(senseiProfiles[senseiId].replicaCount < 5, "Maximum 5 replicas per sensei");
        
        uint256 replicaId = _nextReplicaId++;
        
        aiReplicas[replicaId] = AIReplica({
            replicaId: replicaId,
            senseiId: senseiId,
            replicaName: replicaName,
            knowledgeLevel: 5, // New replicas start with 5% knowledge
            isActive: true,
            creationDate: block.timestamp,
            specialization: specialization
        });
        
        senseiReplicas[senseiId].push(replicaId);
        senseiProfiles[senseiId].replicaCount++;
        
        emit AIReplicaCreated(replicaId, senseiId, replicaName, specialization);
        
        return replicaId;
    }
    
    /**
     * @dev Feeds knowledge to a replica, increasing its knowledge level
     * @param replicaId ID of the replica
     * @param knowledgeIncrease Amount to increase knowledge level (0-100)
     */
    function feedKnowledgeToReplica(uint256 replicaId, uint256 knowledgeIncrease) external {
        require(aiReplicas[replicaId].replicaId != 0, "Replica does not exist");
        require(knowledgeIncrease > 0 && knowledgeIncrease <= 20, "Knowledge increase must be 1-20");
        
        uint256 senseiId = aiReplicas[replicaId].senseiId;
        require(senseiProfiles[senseiId].senseiAddress == msg.sender || msg.sender == owner(), "Not authorized");
        
        AIReplica storage replica = aiReplicas[replicaId];
        replica.knowledgeLevel = replica.knowledgeLevel + knowledgeIncrease > 100 ? 100 : replica.knowledgeLevel + knowledgeIncrease;
        
        emit ReplicaKnowledgeUpdated(replicaId, replica.knowledgeLevel);
    }
    
    function _generatePersonalAIPrompt(string memory name, string memory expertise, string memory description) internal pure returns (string memory) {
        // Create a personalized AI prompt for the Sensei
        return string(abi.encodePacked(
            "You are ", name, ", a knowledgeable Sensei specializing in ", expertise, ". ",
            description, ". ",
            "Your role is to assist students in learning ", expertise, " through personalized guidance, ",
            "practical examples, and structured lessons. Always maintain a patient, encouraging approach ",
            "and adapt your teaching style to the student's learning pace and preferences."
        ));
    }
    
    function updateProfile(
        uint256 senseiId,
        string memory name,
        string memory expertise,
        string memory description,
        uint256 hourlyRate
    ) external onlySensei(senseiId) senseiExists(senseiId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(expertise).length > 0, "Expertise cannot be empty");
        require(hourlyRate > 0, "Hourly rate must be greater than 0");
        
        senseiProfiles[senseiId].name = name;
        senseiProfiles[senseiId].expertise = expertise;
        senseiProfiles[senseiId].description = description;
        senseiProfiles[senseiId].hourlyRate = hourlyRate;
        
        // Update personal AI prompt if AI exists
        if (senseiProfiles[senseiId].hasPersonalAI) {
            senseiProfiles[senseiId].personalAIPrompt = _generatePersonalAIPrompt(name, expertise, description);
        }
        
        emit SenseiProfileUpdated(senseiId, msg.sender);
    }
    
    function deactivateSensei(uint256 senseiId) external onlySensei(senseiId) senseiExists(senseiId) {
        senseiProfiles[senseiId].isActive = false;
        emit SenseiDeactivated(senseiId, msg.sender);
    }
    
    function reactivateSensei(uint256 senseiId) external onlySensei(senseiId) senseiExists(senseiId) {
        senseiProfiles[senseiId].isActive = true;
        emit SenseiProfileUpdated(senseiId, msg.sender);
    }
    
    function updateSessionStats(uint256 senseiId, uint256 rating) external onlyOwner {
        require(senseiProfiles[senseiId].senseiAddress != address(0), "Sensei does not exist");
        require(rating >= 1 && rating <= 10, "Rating must be between 1 and 10");
        
        senseiProfiles[senseiId].totalSessions += 1;
        senseiProfiles[senseiId].totalRating += rating;
        senseiProfiles[senseiId].rating = senseiProfiles[senseiId].totalRating / senseiProfiles[senseiId].totalSessions;
    }
    
    /**
     * @dev Records knowledge contribution from a completed session
     * @param senseiId ID of the sensei
     * @param contributionValue Value of the knowledge contribution
     */
    function recordKnowledgeContribution(uint256 senseiId, uint256 contributionValue) external {
        require(msg.sender == senseiTokenContract || msg.sender == owner(), "Only authorized contracts");
        require(senseiProfiles[senseiId].senseiAddress != address(0), "Sensei does not exist");
        require(contributionValue > 0, "Contribution value must be positive");
        
        senseiProfiles[senseiId].knowledgeContributions += contributionValue;
        
        emit KnowledgeContributionRecorded(senseiId, contributionValue);
    }
    
    /**
     * @dev Updates sensei earnings from sessions and NFT sales
     * @param senseiId ID of the sensei
     * @param earningsIncrease Additional earnings to add
     */
    function updateEarnings(uint256 senseiId, uint256 earningsIncrease) external {
        require(msg.sender == senseiTokenContract || msg.sender == owner(), "Only authorized contracts");
        require(senseiProfiles[senseiId].senseiAddress != address(0), "Sensei does not exist");
        require(earningsIncrease > 0, "Earnings increase must be positive");
        
        senseiProfiles[senseiId].totalEarnings += earningsIncrease;
        
        emit EarningsUpdated(senseiId, senseiProfiles[senseiId].totalEarnings);
    }
    
    function getSenseiProfile(uint256 senseiId) external view returns (SenseiProfile memory) {
        return senseiProfiles[senseiId];
    }
    
    function getSenseiId(address senseiAddress) external view returns (uint256) {
        return addressToSenseiId[senseiAddress];
    }
    
    function getTotalSenseiCount() external view returns (uint256) {
        return _nextSenseiId - 1;
    }
    
    function getActiveSenseiIds() external view returns (uint256[] memory) {
        uint256 totalCount = _nextSenseiId - 1;
        uint256 activeCount = 0;
        
        // First pass: count active sensei
        for (uint256 i = 1; i <= totalCount; i++) {
            if (senseiProfiles[i].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: collect active sensei IDs
        uint256[] memory activeIds = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalCount; i++) {
            if (senseiProfiles[i].isActive) {
                activeIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeIds;
    }
    
    function setAIAgentContract(address _aiAgentContract) external onlyOwner {
        aiAgentContract = _aiAgentContract;
    }
    
    /**
     * @dev Sets the SenseiToken contract address
     * @param _senseiTokenContract Address of the SenseiToken contract
     */
    function setSenseiTokenContract(address _senseiTokenContract) external onlyOwner {
        require(_senseiTokenContract != address(0), "Invalid address");
        senseiTokenContract = _senseiTokenContract;
    }
    
    /**
     * @dev Sets the PrivacyManager contract address
     * @param _privacyManagerContract Address of the PrivacyManager contract
     */
    function setPrivacyManagerContract(address _privacyManagerContract) external onlyOwner {
        require(_privacyManagerContract != address(0), "Invalid address");
        privacyManagerContract = _privacyManagerContract;
    }
    
    function getPersonalAIPrompt(uint256 senseiId) external view returns (string memory) {
        require(senseiProfiles[senseiId].hasPersonalAI, "Personal AI not created yet");
        return senseiProfiles[senseiId].personalAIPrompt;
    }
    
    /**
     * @dev Gets all replicas for a sensei
     * @param senseiId ID of the sensei
     * @return Array of replica IDs
     */
    function getSenseiReplicas(uint256 senseiId) external view returns (uint256[] memory) {
        return senseiReplicas[senseiId];
    }
    
    /**
     * @dev Gets replica details
     * @param replicaId ID of the replica
     * @return AIReplica struct
     */
    function getReplicaDetails(uint256 replicaId) external view returns (AIReplica memory) {
        require(aiReplicas[replicaId].replicaId != 0, "Replica does not exist");
        return aiReplicas[replicaId];
    }
    
    /**
     * @dev Gets all retired senseis
     * @return Array of sensei IDs who are retired
     */
    function getRetiredSenseis() external view returns (uint256[] memory) {
        uint256 totalCount = _nextSenseiId - 1;
        uint256 retiredCount = 0;
        
        // First pass: count retired senseis
        for (uint256 i = 1; i <= totalCount; i++) {
            if (senseiProfiles[i].isRetiredSensei && senseiProfiles[i].isActive) {
                retiredCount++;
            }
        }
        
        // Second pass: collect retired sensei IDs
        uint256[] memory retiredIds = new uint256[](retiredCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalCount; i++) {
            if (senseiProfiles[i].isRetiredSensei && senseiProfiles[i].isActive) {
                retiredIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return retiredIds;
    }
    
    /**
     * @dev Gets sensei skills
     * @param senseiId ID of the sensei
     * @return Array of skills
     */
    function getSenseiSkills(uint256 senseiId) external view returns (string[] memory) {
        require(senseiProfiles[senseiId].senseiAddress != address(0), "Sensei does not exist");
        return senseiProfiles[senseiId].skills;
    }
    
    /**
     * @dev Gets total number of replicas in the system
     * @return Total replica count
     */
    function getTotalReplicas() external view returns (uint256) {
        return _nextReplicaId - 1;
    }
}
