// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Constants} from "./libraries/Constants.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";
import {DataTypes} from "./libraries/DataTypes.sol";

/**
 * @title SenseiCrossChain - LayerZero Integration for Multi-Chain Sensei Platform
 * @notice Enables cross-chain interactions: Ethereum (senseis) ↔ Lisk/Base (students)
 * @dev Ethereum = main chain with all senseis, Lisk/Base = where students book from
 * Students on Lisk/Base can book lessons and mint NFTs from Ethereum senseis seamlessly
 * This is the bridge that connects the knowledge economy across chains, ya know?
 */
contract SenseiCrossChain is OApp, ReentrancyGuard {
    
    // ============ CHAIN CONFIGURATION ============
    uint32 public constant ETHEREUM_EID = 30101; // LayerZero Ethereum Mainnet endpoint ID
    uint32 public constant BASE_EID = 30184; // LayerZero Base endpoint ID  
    uint32 public constant LISK_EID = 30222; // LayerZero Lisk endpoint ID
    
    // ============ MESSAGE TYPES ============
    uint8 public constant MSG_BOOK_LESSON = 1;        // "Book a lesson from another chain"
    uint8 public constant MSG_LESSON_STATUS = 2;      // "Update lesson status"
    uint8 public constant MSG_MINT_NFT = 3;           // "Mint NFT from another chain"
    uint8 public constant MSG_PAYMENT_CONFIRM = 4;    // "Confirm payment received"
    uint8 public constant MSG_REFUND = 5;             // "Process refund"
    
    // ============ STATE VARIABLES ============
    address public senseiGateway; // Main gateway contract on Ethereum
    bool public isMainChain; // True if this is Ethereum (main chain)
    
    // Supported chains mapping
    mapping(uint32 => bool) public supportedChains;
    mapping(uint32 => address) public crossChainContracts; // Contract addresses on other chains
    
    // Cross-chain message tracking
    mapping(bytes32 => bool) public processedMessages; // Prevent replay attacks
    mapping(bytes32 => CrossChainOperation) public operations;
    
    // Cross-chain operation tracking
    struct CrossChainOperation {
        uint256 operationId;
        uint32 sourceChain;
        uint32 destinationChain;
        address initiator;
        uint8 operationType;
        uint256 amount;
        address token;
        bytes data;
        bool completed;
        uint256 timestamp;
    }
    
    uint256 private nextOperationId = 1;
    
    // ============ EVENTS ============
    event CrossChainLessonBooked(
        bytes32 indexed messageId,
        uint32 indexed sourceChain,
        address indexed student,
        uint256 senseiId,
        uint256 amount,
        address paymentToken
    );
    
    event CrossChainNFTMinted(
        bytes32 indexed messageId,
        uint32 indexed sourceChain,
        address indexed minter,
        uint256 tokenId,
        uint256 amount
    );
    
    event CrossChainOperationCompleted(
        bytes32 indexed messageId,
        uint256 indexed operationId,
        bool success,
        string result
    );
    
    event ChainConfigUpdated(uint32 indexed chainId, bool supported, address contractAddress);
    event GatewayUpdated(address indexed oldGateway, address indexed newGateway);
    
    // ============ CONSTRUCTOR ============
    constructor(
        address _endpoint,
        address _delegate,
        address _senseiGateway,
        bool _isMainChain
    ) OApp(_endpoint, _delegate) Ownable(_delegate) {
        senseiGateway = _senseiGateway;
        isMainChain = _isMainChain;
        
        if (_isMainChain) {
            // Ethereum - support incoming from Lisk and Base
            supportedChains[BASE_EID] = true;
            supportedChains[LISK_EID] = true;
        } else {
            // Lisk/Base - support outgoing to Ethereum
            supportedChains[ETHEREUM_EID] = true;
        }
    }
    
    // ============ CROSS-CHAIN LESSON BOOKING ============
    
    /**
     * @dev Book a lesson on Ethereum from Lisk/Base
     * @param senseiId ID of the sensei on Ethereum
     * @param subject Lesson subject
     * @param sessionTitle Title of the session
     * @param sessionDescription Description of what to learn
     * @param duration Duration in minutes
     * @param paymentToken Token address for payment (on source chain)
     * @param nftMintable Whether others can mint this as NFT
     */
    function bookCrossChainLesson(
        uint256 senseiId,
        string calldata subject,
        string calldata sessionTitle, 
        string calldata sessionDescription,
        uint256 duration,
        address paymentToken,
        bool nftMintable
    ) external payable nonReentrant returns (bytes32 messageId) {
        if (isMainChain) revert Errors.InvalidState(); // Can't book from main chain
        if (senseiId == 0) revert Errors.InvalidId();
        if (msg.value == 0) revert Errors.InvalidAmount();
        
        // Create operation record
        uint256 operationId = nextOperationId++;
        
        // Create message payload
        bytes memory payload = abi.encode(
            MSG_BOOK_LESSON,
            operationId,
            msg.sender, // student address on source chain
            senseiId,
            subject,
            sessionTitle,
            sessionDescription,
            duration,
            msg.value,
            paymentToken,
            nftMintable,
            block.chainid
        );
        
        // Send cross-chain message to Ethereum
        messageId = _sendMessage(ETHEREUM_EID, payload, msg.value);
        
        // Store operation
        operations[messageId] = CrossChainOperation({
            operationId: operationId,
            sourceChain: uint32(block.chainid),
            destinationChain: ETHEREUM_EID,
            initiator: msg.sender,
            operationType: MSG_BOOK_LESSON,
            amount: msg.value,
            token: paymentToken,
            data: payload,
            completed: false,
            timestamp: block.timestamp
        });
        
        emit CrossChainLessonBooked(
            messageId,
            uint32(block.chainid),
            msg.sender,
            senseiId,
            msg.value,
            paymentToken
        );
        
        return messageId;
    }
    
    /**
     * @dev Mint an NFT on Ethereum from Lisk/Base
     * @param tokenId ID of the NFT to mint
     * @param paymentToken Token to pay with
     */
    function mintCrossChainNFT(
        uint256 tokenId,
        address paymentToken
    ) external payable nonReentrant returns (bytes32 messageId) {
        if (isMainChain) revert Errors.InvalidState(); // Can't mint from main chain
        if (tokenId == 0) revert Errors.InvalidId();
        if (msg.value == 0) revert Errors.InvalidAmount();
        
        uint256 operationId = nextOperationId++;
        
        bytes memory payload = abi.encode(
            MSG_MINT_NFT,
            operationId,
            msg.sender, // minter address on source chain
            tokenId,
            msg.value,
            paymentToken,
            block.chainid
        );
        
        messageId = _sendMessage(ETHEREUM_EID, payload, msg.value);
        
        operations[messageId] = CrossChainOperation({
            operationId: operationId,
            sourceChain: uint32(block.chainid),
            destinationChain: ETHEREUM_EID,
            initiator: msg.sender,
            operationType: MSG_MINT_NFT,
            amount: msg.value,
            token: paymentToken,
            data: payload,
            completed: false,
            timestamp: block.timestamp
        });
        
        emit CrossChainNFTMinted(
            messageId,
            uint32(block.chainid),
            msg.sender,
            tokenId,
            msg.value
        );
        
        return messageId;
    }
    
    // ============ LAYERZERO MESSAGE HANDLING ============
    
    /**
     * @dev Handle incoming LayerZero messages
     * @param _origin Message origin information
     * @param _guid Message GUID
     * @param payload Message payload
     * @param _executor Executor address
     * @param _extraData Extra data
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload,
        address _executor,
        bytes calldata _extraData
    ) internal override {
        // Prevent replay attacks
        if (processedMessages[_guid]) revert Errors.AlreadyExists();
        processedMessages[_guid] = true;
        
        // Decode message type
        (uint8 msgType, uint256 operationId) = abi.decode(payload, (uint8, uint256));
        
        if (msgType == MSG_BOOK_LESSON) {
            _handleCrossChainBooking(_origin, _guid, payload);
        } else if (msgType == MSG_MINT_NFT) {
            _handleCrossChainNFTMint(_origin, _guid, payload);
        } else if (msgType == MSG_LESSON_STATUS) {
            _handleLessonStatusUpdate(_origin, _guid, payload);
        } else if (msgType == MSG_PAYMENT_CONFIRM) {
            _handlePaymentConfirmation(_origin, _guid, payload);
        } else if (msgType == MSG_REFUND) {
            _handleRefundRequest(_origin, _guid, payload);
        }
    }
    
    /**
     * @dev Handle cross-chain lesson booking (on Ethereum)
     * @param _origin Message origin
     * @param _guid Message GUID  
     * @param payload Message payload
     */
    function _handleCrossChainBooking(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload
    ) internal {
        if (!isMainChain) revert Errors.InvalidState(); // Only process on Ethereum
        
        (
            , // msgType
            uint256 operationId,
            address studentAddress,
            uint256 senseiId,
            string memory subject,
            string memory sessionTitle,
            string memory sessionDescription,
            uint256 duration,
            uint256 amount,
            address paymentToken,
            bool nftMintable,
            uint256 sourceChainId
        ) = abi.decode(payload, (uint8, uint256, address, uint256, string, string, string, uint256, uint256, address, bool, uint256));
        
        // Call the gateway to book session on Ethereum
        try ISenseiGateway(senseiGateway).bookLessonWithETH{value: amount}(
            senseiId,
            subject,
            sessionTitle,
            sessionDescription,
            duration,
            nftMintable
        ) returns (uint256 sessionId) {
            
            // Send success confirmation back to source chain
            _sendStatusUpdate(_origin.srcEid, operationId, true, sessionId, "Lesson booked successfully");
            
            emit CrossChainOperationCompleted(_guid, operationId, true, "Lesson booked");
            
        } catch Error(string memory reason) {
            
            // Send failure confirmation and process refund
            _sendStatusUpdate(_origin.srcEid, operationId, false, 0, reason);
            _processRefund(_origin.srcEid, studentAddress, amount, paymentToken);
            
            emit CrossChainOperationCompleted(_guid, operationId, false, reason);
        }
    }
    
    /**
     * @dev Handle cross-chain NFT minting (on Ethereum)
     * @param _origin Message origin
     * @param _guid Message GUID
     * @param payload Message payload
     */
    function _handleCrossChainNFTMint(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload
    ) internal {
        if (!isMainChain) revert Errors.InvalidState(); // Only process on Ethereum
        
        (
            , // msgType
            uint256 operationId,
            address minterAddress,
            uint256 tokenId,
            uint256 amount,
            address paymentToken,
            uint256 sourceChainId
        ) = abi.decode(payload, (uint8, uint256, address, uint256, uint256, address, uint256));
        
        // First, transfer the NFT to this contract temporarily
        // Then call the gateway to mint the NFT
        try ISenseiGateway(senseiGateway).mintLessonNFT(tokenId) {
            
            // Send success confirmation
            _sendStatusUpdate(_origin.srcEid, operationId, true, tokenId, "NFT minted successfully");
            
            emit CrossChainOperationCompleted(_guid, operationId, true, "NFT minted");
            
        } catch Error(string memory reason) {
            
            // Send failure confirmation and process refund
            _sendStatusUpdate(_origin.srcEid, operationId, false, 0, reason);
            _processRefund(_origin.srcEid, minterAddress, amount, paymentToken);
            
            emit CrossChainOperationCompleted(_guid, operationId, false, reason);
        }
    }
    
    /**
     * @dev Handle lesson status updates (on Lisk/Base)
     * @param _origin Message origin
     * @param _guid Message GUID
     * @param payload Message payload
     */
    function _handleLessonStatusUpdate(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload
    ) internal {
        if (isMainChain) return; // Only process on side chains
        
        (
            , // msgType
            uint256 operationId,
            bool success,
            uint256 resultId,
            string memory message
        ) = abi.decode(payload, (uint8, uint256, bool, uint256, string));
        
        // Update local operation status
        bytes32 operationKey = keccak256(abi.encodePacked(operationId, _origin.srcEid));
        if (operations[operationKey].operationId == operationId) {
            operations[operationKey].completed = true;
        }
        
        emit CrossChainOperationCompleted(_guid, operationId, success, message);
    }
    
    /**
     * @dev Handle payment confirmations
     * @param _origin Message origin
     * @param _guid Message GUID
     * @param payload Message payload
     */
    function _handlePaymentConfirmation(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload
    ) internal {
        // Implementation for payment confirmation handling
        emit CrossChainOperationCompleted(_guid, 0, true, "Payment confirmed");
    }
    
    /**
     * @dev Handle refund requests
     * @param _origin Message origin
     * @param _guid Message GUID
     * @param payload Message payload
     */
    function _handleRefundRequest(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload
    ) internal {
        // Implementation for refund processing
        emit CrossChainOperationCompleted(_guid, 0, true, "Refund processed");
    }
    
    // ============ INTERNAL HELPER FUNCTIONS ============
    
    /**
     * @dev Send a LayerZero message
     * @param destinationEid Destination chain endpoint ID
     * @param payload Message payload
     * @param nativeAmount Native token amount to send
     * @return messageId Generated message ID
     */
    function _sendMessage(
        uint32 destinationEid,
        bytes memory payload,
        uint256 nativeAmount
    ) internal returns (bytes32 messageId) {
        // Calculate messaging fee
        MessagingFee memory fee = _quote(destinationEid, payload, "", false);
        
        if (nativeAmount < fee.nativeFee) revert Errors.InsufficientETH();
        
        // Send message with remaining amount for the operation
        MessagingReceipt memory receipt = _lzSend(
            destinationEid,
            payload,
            "",
            MessagingFee(nativeAmount, 0),
            payable(msg.sender)
        );
        messageId = receipt.guid;
        
        return messageId;
    }
    
    /**
     * @dev Send status update back to source chain
     * @param destinationEid Destination chain endpoint ID
     * @param operationId Operation ID
     * @param success Whether operation succeeded
     * @param resultId Result ID (session ID or token ID)
     * @param message Status message
     */
    function _sendStatusUpdate(
        uint32 destinationEid,
        uint256 operationId,
        bool success,
        uint256 resultId,
        string memory message
    ) internal {
        bytes memory payload = abi.encode(
            MSG_LESSON_STATUS,
            operationId,
            success,
            resultId,
            message
        );
        
        MessagingFee memory fee = _quote(destinationEid, payload, "", false);
        
        _lzSend(
            destinationEid,
            payload,
            "",
            fee,
            payable(address(this))
        );
    }
    
    /**
     * @dev Process refund to user on source chain
     * @param destinationEid Destination chain endpoint ID
     * @param user User address to refund
     * @param amount Amount to refund
     * @param token Token address
     */
    function _processRefund(
        uint32 destinationEid,
        address user,
        uint256 amount,
        address token
    ) internal {
        bytes memory payload = abi.encode(
            MSG_REFUND,
            user,
            amount,
            token
        );
        
        MessagingFee memory fee = _quote(destinationEid, payload, "", false);
        
        _lzSend(
            destinationEid,
            payload,
            "",
            fee,
            payable(address(this))
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set supported chain and contract address
     * @param chainEid LayerZero endpoint ID
     * @param supported Whether chain is supported
     * @param contractAddress Contract address on that chain
     */
    function setChainConfig(
        uint32 chainEid,
        bool supported,
        address contractAddress
    ) external onlyOwner {
        supportedChains[chainEid] = supported;
        crossChainContracts[chainEid] = contractAddress;
        
        emit ChainConfigUpdated(chainEid, supported, contractAddress);
    }
    
    /**
     * @dev Update sensei gateway address
     * @param _newGateway New gateway address
     */
    function setSenseiGateway(address _newGateway) external onlyOwner {
        if (_newGateway == Constants.ZERO_ADDRESS) revert Errors.InvalidAddress();
        
        address oldGateway = senseiGateway;
        senseiGateway = _newGateway;
        
        emit GatewayUpdated(oldGateway, _newGateway);
    }
    
    /**
     * @dev Emergency withdrawal of stuck funds
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        if (amount > address(this).balance) revert Errors.InsufficientBalance();
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Emergency withdrawal of stuck ERC20 tokens
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Quote cross-chain operation fee
     * @param destinationEid Destination chain endpoint ID
     * @param operationType Type of operation
     * @param dataSize Estimated data size
     * @return fee Messaging fee
     */
    function quoteCrossChainFee(
        uint32 destinationEid,
        uint8 operationType,
        uint256 dataSize
    ) external view returns (MessagingFee memory fee) {
        bytes memory payload = new bytes(dataSize);
        return _quote(destinationEid, payload, "", false);
    }
    
    /**
     * @dev Check if a chain is supported
     * @param chainEid LayerZero endpoint ID
     * @return supported Whether chain is supported
     */
    function isChainSupported(uint32 chainEid) external view returns (bool supported) {
        return supportedChains[chainEid];
    }
    
    /**
     * @dev Get cross-chain operation details
     * @param messageId Message ID
     * @return operation Operation details
     */
    function getOperation(bytes32 messageId) external view returns (CrossChainOperation memory operation) {
        return operations[messageId];
    }
    
    // ============ RECEIVE FUNCTION ============
    receive() external payable {
        // Accept ETH for cross-chain operations
    }
}

/**
 * @title ISenseiGateway - Interface for gateway interactions
 * @notice Interface to interact with main gateway contract
 */
interface ISenseiGateway {
    function bookLessonWithETH(
        uint256 senseiId,
        string calldata subject,
        string calldata sessionTitle,
        string calldata sessionDescription,
        uint256 duration,
        bool nftMintable
    ) external payable returns (uint256);
    
    function bookLessonWithToken(
        uint256 senseiId,
        string calldata subject,
        string calldata sessionTitle,
        string calldata sessionDescription,
        uint256 duration,
        uint256 tokenAmount,
        address paymentToken,
        bool nftMintable
    ) external returns (uint256);
    
    function mintLessonNFT(uint256 tokenId) external;
}

