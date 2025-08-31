// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SenseiToken} from "./SenseiToken.sol";

contract LessonNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    
    uint256 private _nextTokenId = 1;
    
    // SenseiToken contract reference
    SenseiToken public senseiToken;
    
    // NFT metadata structure
    struct LessonMetadata {
        uint256 sessionId;
        address senseiAddress;
        address studentAddress;
        string subject;
        string lessonTitle;
        string lessonDescription;
        uint256 sessionDuration; // in minutes
        uint256 sessionPrice;
        uint256 knowledgeValue;
        uint256 mintPrice; // Price in SenseiTokens
        bool isMinted;
        uint256 mintTimestamp;
        bool isPublicMintable; // Whether others can mint this NFT
        uint256 lessonQuality; // 1-100 knowledge value assessment
        address minter; // Address that minted the NFT (if minted)
    }
    
    // Mapping from token ID to lesson metadata
    mapping(uint256 => LessonMetadata) public lessonMetadata;
    
    // Mapping from session ID to token IDs (student and public versions)
    mapping(uint256 => uint256[]) public sessionToTokens;
    
    // Events
    event LessonNFTCreated(uint256 indexed tokenId, uint256 indexed sessionId, address indexed senseiAddress, bool isStudentNFT);
    event LessonNFTMinted(uint256 indexed tokenId, address indexed minter, uint256 mintPrice, uint256 tokensBurned);
    event LessonMetadataUpdated(uint256 indexed tokenId, string newURI);
    event LessonQualityUpdated(uint256 indexed tokenId, uint256 newQuality);
    
    modifier onlyKnowledgeContract() {
        require(msg.sender == owner(), "Only knowledge contract can call");
        _;
    }
    
    modifier onlySensei(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(lessonMetadata[tokenId].senseiAddress == msg.sender, "Only the sensei can update this NFT");
        _;
    }
    
    constructor(address _senseiToken) ERC721("Sensei Lesson NFT", "SENSEI-LESSON") Ownable(msg.sender) {
        senseiToken = SenseiToken(payable(_senseiToken));
    }
    
    /**
     * @dev Creates a single lesson NFT for a completed knowledge session
     * The NFT can be minted by anyone if isPublicMintable is true, with 50/50 revenue split
     * @param sessionId ID of the completed session
     * @param senseiAddress Address of the sensei
     * @param studentAddress Address of the student
     * @param subject Subject of the lesson
     * @param lessonTitle Title of the lesson
     * @param lessonDescription Description of the lesson
     * @param sessionDuration Duration of the session in minutes
     * @param sessionPrice Price paid for the session
     * @param knowledgeValue Value of knowledge imparted (1-100)
     * @param isPublicMintable Whether others can mint this NFT
     */
    function createSessionNFT(
        uint256 sessionId,
        address senseiAddress,
        address studentAddress,
        string memory subject,
        string memory lessonTitle,
        string memory lessonDescription,
        uint256 sessionDuration,
        uint256 sessionPrice,
        uint256 knowledgeValue,
        bool isPublicMintable
    ) external onlyKnowledgeContract returns (uint256) {
        require(sessionId > 0, "Invalid session ID");
        require(senseiAddress != address(0), "Invalid sensei address");
        require(studentAddress != address(0), "Invalid student address");
        require(bytes(subject).length > 0, "Subject cannot be empty");
        require(bytes(lessonTitle).length > 0, "Lesson title cannot be empty");
        require(sessionDuration > 0, "Session duration must be positive");
        require(sessionPrice > 0, "Session price must be positive");
        require(knowledgeValue > 0, "Knowledge value must be positive");
        require(knowledgeValue <= 100, "Knowledge value must be 1-100");
        
        // Calculate mint price based on knowledge value and session price
        uint256 mintPrice = _calculateMintPrice(knowledgeValue, sessionPrice);
        
        uint256 tokenId = _nextTokenId++;
        lessonMetadata[tokenId] = LessonMetadata({
            sessionId: sessionId,
            senseiAddress: senseiAddress,
            studentAddress: studentAddress,
            subject: subject,
            lessonTitle: lessonTitle,
            lessonDescription: lessonDescription,
            sessionDuration: sessionDuration,
            sessionPrice: sessionPrice,
            knowledgeValue: knowledgeValue,
            mintPrice: mintPrice,
            isMinted: false,
            mintTimestamp: 0,
            isPublicMintable: isPublicMintable,
            lessonQuality: knowledgeValue,
            minter: address(0)
        });
        
        // Initially owned by the contract (not minted to anyone yet)
        _safeMint(address(this), tokenId);
        
        // Add token to session mapping
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = tokenId;
        sessionToTokens[sessionId] = tokenIds;
        
        emit LessonNFTCreated(tokenId, sessionId, senseiAddress, isPublicMintable);
        
        return tokenId;
    }
    
    /**
     * @dev Calculates mint price based on knowledge value and session price
     * Higher knowledge value and session price = higher NFT price
     * @param knowledgeValue Knowledge value assessment (1-100)
     * @param sessionPrice Original price paid for the session
     * @return Mint price in SenseiTokens
     */
    function _calculateMintPrice(uint256 knowledgeValue, uint256 sessionPrice) internal pure returns (uint256) {
        // Base price is 10% of session price
        uint256 basePrice = sessionPrice / 10;
        
        // Knowledge multiplier: 0.5x to 2.0x based on knowledge value
        uint256 knowledgeMultiplier = (knowledgeValue * 15) / 10 + 50; // 50-200 (0.5x to 2.0x)
        
        // Calculate final price
        uint256 finalPrice = (basePrice * knowledgeMultiplier) / 100;
        
        // Ensure minimum price of 0.1 tokens and reasonable maximum
        uint256 minPrice = 1 * 10**17; // 0.1 tokens
        uint256 maxPrice = sessionPrice; // Maximum is the original session price
        
        if (finalPrice < minPrice) finalPrice = minPrice;
        if (finalPrice > maxPrice) finalPrice = maxPrice;
        
        return finalPrice;
    }
    
    /**
     * @dev Allows anyone to mint a public lesson NFT by paying SenseiTokens
     * Implements 50/50 split between student and sensei, with 5% platform fee from student share
     * @param tokenId ID of the NFT to mint
     */
    function mintLessonNFT(uint256 tokenId) external nonReentrant {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        LessonMetadata storage metadata = lessonMetadata[tokenId];
        require(!metadata.isMinted, "NFT already minted");
        require(metadata.isPublicMintable, "NFT is not publicly mintable");
        require(senseiToken.balanceOf(msg.sender) >= metadata.mintPrice, "Insufficient token balance");
        
        // Transfer payment from minter to contract
        senseiToken.transferFrom(msg.sender, address(this), metadata.mintPrice);
        
        // Mark as minted
        metadata.isMinted = true;
        metadata.mintTimestamp = block.timestamp;
        metadata.minter = msg.sender;
        
        // Transfer NFT to minter
        _transfer(address(this), msg.sender, tokenId);
        
        // Process 50/50 split with 5% platform fee
        senseiToken.mintForNFT(metadata.studentAddress, metadata.senseiAddress, metadata.mintPrice);
        
        emit LessonNFTMinted(tokenId, msg.sender, metadata.mintPrice, metadata.mintPrice);
    }
    
    /**
     * @dev Mint a lesson NFT to a specific user (called by Gateway for 50/50 split)
     * @param tokenId ID of the NFT to mint
     * @param to Address to mint the NFT to
     */
    function mintToUser(uint256 tokenId, address to) external onlyKnowledgeContract {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(!lessonMetadata[tokenId].isMinted, "NFT already minted");
        require(to != address(0), "Cannot mint to zero address");
        
        LessonMetadata storage metadata = lessonMetadata[tokenId];
        metadata.isMinted = true;
        metadata.mintTimestamp = block.timestamp;
        
        // Transfer NFT from contract to user
        _transfer(address(this), to, tokenId);
        
        emit LessonNFTMinted(tokenId, to, metadata.mintPrice, 0);
    }
    
    /**
     * @dev Legacy function for backward compatibility (now redirects to Gateway)
     * @param tokenId ID of the NFT to mint
     */
    function mintLessonNFTLegacy(uint256 tokenId) external {
        revert("Use Gateway contract to mint NFTs");
    }
    
    /**
     * @dev Updates lesson quality (only sensei can do this)
     * @param tokenId ID of the NFT
     * @param newQuality New quality rating (1-10)
     */
    function updateLessonQuality(uint256 tokenId, uint256 newQuality) external onlySensei(tokenId) {
        require(newQuality >= 1 && newQuality <= 10, "Quality must be 1-10");
        
        LessonMetadata storage metadata = lessonMetadata[tokenId];
        uint256 oldQuality = metadata.lessonQuality;
        metadata.lessonQuality = newQuality;
        
        // Recalculate mint price for public NFTs
        if (!metadata.isMinted) {
            metadata.mintPrice = _calculateMintPrice(newQuality, metadata.knowledgeValue);
        }
        
        emit LessonQualityUpdated(tokenId, newQuality);
    }
    
    /**
     * @dev Updates the token URI for a lesson NFT
     * @param tokenId ID of the NFT
     * @param newURI New URI for the token metadata
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) external {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can update URI");
        require(bytes(newURI).length > 0, "URI cannot be empty");
        
        _setTokenURI(tokenId, newURI);
        emit LessonMetadataUpdated(tokenId, newURI);
    }
    
    /**
     * @dev Gets lesson metadata for a token
     * @param tokenId ID of the NFT
     * @return Complete lesson metadata
     */
    function getLessonMetadata(uint256 tokenId) external view returns (LessonMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        return lessonMetadata[tokenId];
    }
    
    /**
     * @dev Gets token IDs for a session
     * @param sessionId ID of the session
     * @return Array of token IDs (student NFT first, public NFT second)
     */
    function getTokenIdsForSession(uint256 sessionId) external view returns (uint256[] memory) {
        return sessionToTokens[sessionId];
    }
    
    /**
     * @dev Gets total number of lesson NFTs
     * @return Total count of lesson NFTs
     */
    function getTotalLessonNFTs() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Gets all lesson NFTs for a sensei
     * @param senseiAddress Address of the sensei
     * @return Array of token IDs owned by the sensei
     */
    function getSenseiLessonNFTs(address senseiAddress) external view returns (uint256[] memory) {
        uint256 totalCount = _nextTokenId - 1;
        uint256 senseiCount = 0;
        
        // First pass: count NFTs owned by sensei
        for (uint256 i = 1; i <= totalCount; i++) {
            if (lessonMetadata[i].senseiAddress == senseiAddress) {
                senseiCount++;
            }
        }
        
        // Second pass: collect token IDs
        uint256[] memory tokenIds = new uint256[](senseiCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalCount; i++) {
            if (lessonMetadata[i].senseiAddress == senseiAddress) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Gets all lesson NFTs for a student
     * @param studentAddress Address of the student
     * @return Array of token IDs for lessons taken by the student
     */
    function getStudentLessonNFTs(address studentAddress) external view returns (uint256[] memory) {
        uint256 totalCount = _nextTokenId - 1;
        uint256 studentCount = 0;
        
        // First pass: count NFTs for student
        for (uint256 i = 1; i <= totalCount; i++) {
            if (lessonMetadata[i].studentAddress == studentAddress) {
                studentCount++;
            }
        }
        
        // Second pass: collect token IDs
        uint256[] memory tokenIds = new uint256[](studentCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalCount; i++) {
            if (lessonMetadata[i].studentAddress == studentAddress) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Gets all public minting NFTs for a student
     * @param studentAddress Address of the student
     * @return Array of token IDs for public minting NFTs
     */
    function getStudentPublicMintingNFTs(address studentAddress) external view returns (uint256[] memory) {
        uint256 totalCount = _nextTokenId - 1;
        uint256 publicCount = 0;
        
        // First pass: count public NFTs for student
        for (uint256 i = 1; i <= totalCount; i++) {
            if (lessonMetadata[i].studentAddress == studentAddress && lessonMetadata[i].isPublicMintable) {
                publicCount++;
            }
        }
        
        // Second pass: collect token IDs
        uint256[] memory tokenIds = new uint256[](publicCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalCount; i++) {
            if (lessonMetadata[i].studentAddress == studentAddress && lessonMetadata[i].isPublicMintable) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Gets estimated mint price for a lesson
     * @param lessonQuality Quality rating (1-10)
     * @param knowledgeValue Value of knowledge
     * @return Estimated mint price in SenseiTokens
     */
    function getEstimatedMintPrice(uint256 lessonQuality, uint256 knowledgeValue) external view returns (uint256) {
        return _calculateMintPrice(lessonQuality, knowledgeValue);
    }
    
    /**
     * @dev Updates the SenseiToken contract reference (only owner)
     * @param newSenseiToken New SenseiToken contract address
     */
    function setSenseiToken(address newSenseiToken) external onlyOwner {
        require(newSenseiToken != address(0), "Invalid contract address");
        senseiToken = SenseiToken(payable(newSenseiToken));
    }
    
    // No need to override these functions as ERC721URIStorage handles them
}
