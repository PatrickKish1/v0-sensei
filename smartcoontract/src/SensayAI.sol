// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "./libraries/Errors.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";
import {Constants} from "./libraries/Constants.sol";
import {SenseiRegistry} from "./SenseiRegistry.sol";

contract SensayAI is Ownable, ReentrancyGuard {
    
    // SenseiRegistry contract reference
    SenseiRegistry public senseiRegistry;
    
    // Global AI configuration
    DataTypes.AIAgentConfig public globalConfig;
    
    // Mapping from senseiId to PersonalAI
    mapping(uint256 => DataTypes.PersonalAI) public personalAIs;
    
    // AI model options
    string[] public availableAIModels;
    
    // Secure data sources (DAT token integration)
    mapping(uint256 => uint256[]) public senseiDataSources; // senseiId => DAT token IDs
    mapping(uint256 => mapping(uint256 => bool)) public authorizedDataSources; // senseiId => tokenId => authorized
    
    // Note: Events are now defined in Events library
    
    modifier onlyRegisteredSensei(uint256 senseiId) {
        if (!senseiRegistry.isRegisteredSensei(msg.sender)) {
            revert Errors.Unauthorized();
        }
        if (senseiRegistry.addressToSenseiId(msg.sender) != senseiId) {
            revert Errors.InvalidId();
        }
        _;
    }
    
    modifier personalAIExists(uint256 senseiId) {
        if (personalAIs[senseiId].senseiId == 0) {
            revert Errors.PersonalAINotFound();
        }
        _;
    }
    
    modifier validAIModel(string memory model) {
        if (!_isValidAIModel(model)) {
            revert Errors.InvalidAIModel();
        }
        _;
    }
    
    constructor(address _senseiRegistry) Ownable(msg.sender) {
        if (!DataTypes.isValidAddress(_senseiRegistry)) {
            revert Errors.InvalidAddress();
        }
        
        senseiRegistry = SenseiRegistry(_senseiRegistry);
        
        // Initialize global AI configuration
        globalConfig = DataTypes.AIAgentConfig({
            basePrompt: "You are a knowledgeable Sensei, a wise teacher and mentor. Your role is to guide students with patience, wisdom, and deep understanding of your subject matter.",
            personalityTraits: "Patient, Wise, Encouraging, Knowledgeable, Adaptable",
            teachingStyle: "Interactive, Personalized, Step-by-step, Practical examples",
            maxResponseLength: Constants.DEFAULT_AI_RESPONSE_LENGTH,
            isActive: true
        });
        
        // Initialize available AI models
        availableAIModels = [
            "GPT-4",
            "Claude-3",
            "Gemini-Pro",
            "Llama-3",
            "Custom-Sensay"
        ];
    }
    
    /**
     * @dev Creates a personal Sensay AI for a newly registered Sensei
     * Called automatically when a Sensei registers
     * @param senseiId ID of the Sensei
     * @param name Name of the Sensei
     * @param expertise Expertise area
     * @param description Personal description
     */
    function createPersonalAI(
        uint256 senseiId,
        string memory name,
        string memory expertise,
        string memory description
    ) external onlyOwner {
        if (senseiId == 0) revert Errors.InvalidId();
        if (!DataTypes.isValidString(name)) revert Errors.EmptyString();
        if (!DataTypes.isValidString(expertise)) revert Errors.EmptyString();
        
        // Generate personalized AI prompt
        string memory personalizedPrompt = _generatePersonalizedPrompt(name, expertise, description);
        
        // Select AI model (default to first available)
        string memory selectedModel = availableAIModels[0];
        
        personalAIs[senseiId] = DataTypes.PersonalAI({
            senseiId: senseiId,
            personalizedPrompt: personalizedPrompt,
            aiModel: selectedModel,
            creationTimestamp: block.timestamp,
            interactionCount: 0,
            isActive: true,
            conversationHistory: new string[](0),
            maxHistoryLength: Constants.DEFAULT_CONVERSATION_HISTORY
        });
        
        emit Events.PersonalAICreated(senseiId, msg.sender, selectedModel, personalizedPrompt, block.timestamp);
    }
    
    /**
     * @dev Generates a personalized AI prompt for a Sensei
     * @param name Name of the Sensei
     * @param expertise Expertise area
     * @param description Personal description
     * @return Personalized AI prompt
     */
    function _generatePersonalizedPrompt(
        string memory name,
        string memory expertise,
        string memory description
    ) internal view returns (string memory) {
        return string(abi.encodePacked(
            globalConfig.basePrompt, " ",
            "You are ", name, ", a Sensei specializing in ", expertise, ". ",
            description, ". ",
            "Your personality traits: ", globalConfig.personalityTraits, ". ",
            "Your teaching style: ", globalConfig.teachingStyle, ". ",
            "Always maintain the wisdom and patience of a true Sensei while sharing your knowledge. ",
            "You are powered by Sensay AI, the most advanced AI system for personalized education."
        ));
    }
    
    /**
     * @dev Interacts with a Sensei's personal Sensay AI
     * @param senseiId ID of the Sensei
     * @param query User's question or request
     * @return AI response
     */
    function interactWithSensayAI(uint256 senseiId, string memory query) external returns (string memory) {
        if (!personalAIs[senseiId].isActive) {
            revert Errors.PersonalAIInactive();
        }
        if (!DataTypes.isValidString(query)) {
            revert Errors.InvalidQuery();
        }
        if (bytes(query).length > globalConfig.maxResponseLength) {
            revert Errors.QueryTooLong();
        }
        
        DataTypes.PersonalAI storage ai = personalAIs[senseiId];
        
        // Generate AI response (in a real implementation, this would call an external AI service)
        string memory response = _generateSensayAIResponse(ai, query);
        
        // Update interaction count
        ai.interactionCount++;
        
        // Add to conversation history
        _addToConversationHistory(senseiId, query, response);
        
        emit Events.AIInteraction(senseiId, msg.sender, _hashString(query), _hashString(response), false, block.timestamp);
        
        return response;
    }
    
    /**
     * @dev Generates Sensay AI response (placeholder for external AI integration)
     * @param ai PersonalAI struct
     * @param query User's query
     * @return AI response
     */
    function _generateSensayAIResponse(DataTypes.PersonalAI storage ai, string memory query) internal view returns (string memory) {
        // This is a placeholder response
        // In a real implementation, this would call an external AI API
        return string(abi.encodePacked(
            "As your personal Sensay AI Sensei, I understand your question about '", query, "'. ",
            "Based on my knowledge and your learning style, here's my guidance: ",
            "This is a personalized response from your Sensay AI. ",
            "In the full implementation, this would integrate with advanced AI models like GPT-4, Claude-3, or our custom Sensay AI model. ",
            "Your personal AI is designed to adapt to your specific needs and provide the most relevant guidance."
        ));
    }
    
    /**
     * @dev Adds interaction to conversation history
     * @param senseiId ID of the Sensei
     * @param query User's query
     * @param response AI's response
     */
    function _addToConversationHistory(uint256 senseiId, string memory query, string memory response) internal {
        DataTypes.PersonalAI storage ai = personalAIs[senseiId];
        
        // Create conversation entry
        string memory conversationEntry = string(abi.encodePacked(
            "Q: ", query, " | A: ", response
        ));
        
        // Add to history
        ai.conversationHistory.push(conversationEntry);
        
        // Maintain max history length
        if (ai.conversationHistory.length > ai.maxHistoryLength) {
            // Remove oldest entry
            for (uint256 i = 0; i < ai.conversationHistory.length - 1; i++) {
                ai.conversationHistory[i] = ai.conversationHistory[i + 1];
            }
            ai.conversationHistory.pop();
        }
    }
    
    /**
     * @dev Updates personal AI configuration
     * @param senseiId ID of the Sensei
     * @param newPrompt New personalized prompt
     * @param newModel New AI model
     */
    function updatePersonalAIConfig(
        uint256 senseiId,
        string memory newPrompt,
        string memory newModel
    ) external onlyRegisteredSensei(senseiId) personalAIExists(senseiId) validAIModel(newModel) {
        if (!DataTypes.isValidString(newPrompt)) {
            revert Errors.EmptyString();
        }
        
        DataTypes.PersonalAI storage ai = personalAIs[senseiId];
        ai.personalizedPrompt = newPrompt;
        ai.aiModel = newModel;
        
        emit Events.AIConfigUpdated(senseiId, newPrompt, newModel, block.timestamp);
    }
    
    /**
     * @dev Checks if AI model is valid
     * @param model AI model name
     * @return True if valid
     */
    function _isValidAIModel(string memory model) internal view returns (bool) {
        for (uint256 i = 0; i < availableAIModels.length; i++) {
            if (keccak256(bytes(availableAIModels[i])) == keccak256(bytes(model))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Gets personal AI information
     * @param senseiId ID of the Sensei
     * @return PersonalAI struct
     */
    function getPersonalAI(uint256 senseiId) external view returns (DataTypes.PersonalAI memory) {
        if (personalAIs[senseiId].senseiId == 0) {
            revert Errors.PersonalAINotFound();
        }
        return personalAIs[senseiId];
    }
    
    /**
     * @dev Gets conversation history for a Sensei
     * @param senseiId ID of the Sensei
     * @return Array of conversation entries
     */
    function getConversationHistory(uint256 senseiId) external view returns (string[] memory) {
        if (personalAIs[senseiId].senseiId == 0) {
            revert Errors.PersonalAINotFound();
        }
        return personalAIs[senseiId].conversationHistory;
    }
    
    /**
     * @dev Updates global AI configuration (only owner)
     * @param basePrompt New base prompt
     * @param personalityTraits New personality traits
     * @param teachingStyle New teaching style
     * @param maxResponseLength New max response length
     */
    function updateGlobalConfig(
        string memory basePrompt,
        string memory personalityTraits,
        string memory teachingStyle,
        uint256 maxResponseLength
    ) external onlyOwner {
        if (!DataTypes.isValidString(basePrompt)) {
            revert Errors.EmptyString();
        }
        if (maxResponseLength < Constants.MIN_AI_RESPONSE_LENGTH || maxResponseLength > Constants.MAX_AI_RESPONSE_LENGTH) {
            revert Errors.InvalidAmount();
        }
        
        globalConfig.basePrompt = basePrompt;
        globalConfig.personalityTraits = personalityTraits;
        globalConfig.teachingStyle = teachingStyle;
        globalConfig.maxResponseLength = maxResponseLength;
        
        emit Events.GlobalConfigUpdated(basePrompt, personalityTraits, block.timestamp);
    }
    
    /**
     * @dev Adds new AI model to available models (only owner)
     * @param newModel New AI model name
     */
    function addSensayAIModel(string memory newModel) external onlyOwner {
        if (!DataTypes.isValidString(newModel)) {
            revert Errors.EmptyString();
        }
        if (_isValidAIModel(newModel)) {
            revert Errors.InvalidAIModel();
        }
        
        availableAIModels.push(newModel);
        emit Events.AIModelAdded(newModel, "Added to available models", block.timestamp);
    }
    
    /**
     * @dev Removes AI model from available models (only owner)
     * @param modelToRemove AI model name to remove
     */
    function removeSensayAIModel(string memory modelToRemove) external onlyOwner {
        if (!DataTypes.isValidString(modelToRemove)) {
            revert Errors.EmptyString();
        }
        
        for (uint256 i = 0; i < availableAIModels.length; i++) {
            if (keccak256(bytes(availableAIModels[i])) == keccak256(bytes(modelToRemove))) {
                // Remove by shifting elements
                for (uint256 j = i; j < availableAIModels.length - 1; j++) {
                    availableAIModels[j] = availableAIModels[j + 1];
                }
                availableAIModels.pop();
                emit Events.AIModelRemoved(modelToRemove, block.timestamp);
                return;
            }
        }
        revert Errors.InvalidAIModel();
    }
    
    /**
     * @dev Sets SenseiRegistry contract reference (only owner)
     * @param _senseiRegistry New SenseiRegistry address
     */
    function setSenseiRegistry(address _senseiRegistry) external onlyOwner {
        if (!DataTypes.isValidAddress(_senseiRegistry)) {
            revert Errors.InvalidAddress();
        }
        senseiRegistry = SenseiRegistry(_senseiRegistry);
    }
    
    /**
     * @dev Gets available AI models
     * @return Array of available AI model names
     */
    function getAvailableAIModels() external view returns (string[] memory) {
        return availableAIModels;
    }
    
    /**
     * @dev Gets global AI configuration
     * @return AIAgentConfig struct
     */
    function getGlobalConfig() external view returns (DataTypes.AIAgentConfig memory) {
        return globalConfig;
    }
    
    /**
     * @dev Gets total number of personal AIs
     * @return Total count of personal AIs
     */
    function getTotalPersonalAIs() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= 1000; i++) { // Reasonable upper limit
            if (personalAIs[i].senseiId > 0) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Gets all sensei IDs that have personal AIs
     * @return Array of sensei IDs with personal AIs
     */
    function getSenseiIdsWithAI() external view returns (uint256[] memory) {
        uint256 totalCount = this.getTotalPersonalAIs();
        uint256[] memory senseiIds = new uint256[](totalCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= 1000; i++) {
            if (personalAIs[i].senseiId > 0) {
                senseiIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return senseiIds;
    }
    
    // ============ SECURE DATA SOURCE MANAGEMENT ============
    
    /**
     * @dev Register a new data source (DAT token) for a Sensei's AI
     * @param senseiId Sensei ID
     * @param datTokenId DAT token ID
     * @param dataType Type of data being registered
     */
    function registerDataSource(
        uint256 senseiId,
        uint256 datTokenId,
        string memory dataType
    ) external onlyOwner {
        if (senseiId == 0) revert Errors.InvalidId();
        if (datTokenId == 0) revert Errors.InvalidId();
        if (!DataTypes.isValidString(dataType)) revert Errors.EmptyString();
        
        // Add to data sources if not already present
        bool alreadyExists = false;
        uint256[] storage dataSources = senseiDataSources[senseiId];
        for (uint256 i = 0; i < dataSources.length; i++) {
            if (dataSources[i] == datTokenId) {
                alreadyExists = true;
                break;
            }
        }
        
        if (!alreadyExists) {
            senseiDataSources[senseiId].push(datTokenId);
        }
        
        // Authorize the data source
        authorizedDataSources[senseiId][datTokenId] = true;
        
        emit Events.DataSourceRegistered(senseiId, datTokenId, dataType, block.timestamp);
    }
    
    /**
     * @dev Authorize/deauthorize a data source for a Sensei's AI
     * @param senseiId Sensei ID
     * @param datTokenId DAT token ID
     * @param authorized Whether to authorize or deauthorize
     */
    function authorizeDataSource(
        uint256 senseiId,
        uint256 datTokenId,
        bool authorized
    ) external onlyRegisteredSensei(senseiId) {
        if (datTokenId == 0) revert Errors.InvalidId();
        
        authorizedDataSources[senseiId][datTokenId] = authorized;
        
        emit Events.DataSourceAuthorized(senseiId, datTokenId, authorized, block.timestamp);
    }
    
    /**
     * @dev Get all data sources for a Sensei
     * @param senseiId Sensei ID
     * @return Array of DAT token IDs
     */
    function getSenseiDataSources(uint256 senseiId) external view returns (uint256[] memory) {
        return senseiDataSources[senseiId];
    }
    
    /**
     * @dev Check if a data source is authorized for a Sensei's AI
     * @param senseiId Sensei ID
     * @param datTokenId DAT token ID
     * @return Whether the data source is authorized
     */
    function isDataSourceAuthorized(uint256 senseiId, uint256 datTokenId) external view returns (bool) {
        return authorizedDataSources[senseiId][datTokenId];
    }
    
    // ============ INTERNAL HELPER FUNCTIONS ============
    
    /**
     * @dev Hash a string for privacy (used in events)
     * @param input String to hash
     * @return Hash of the input string
     */
    function _hashString(string memory input) internal pure returns (string memory) {
        return Strings.toHexString(uint256(keccak256(bytes(input))));
    }
}
