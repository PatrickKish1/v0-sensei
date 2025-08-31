// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {SenseiRegistry} from "../src/SenseiRegistry.sol";
import {SenseiToken} from "../src/SenseiToken.sol";
import {LessonNFT} from "../src/LessonNFT.sol";
import {BookingSystem} from "../src/BookingSystem.sol";
import {SensayAI} from "../src/SensayAI.sol";
import {SenseiGateway} from "../src/SenseiGateway.sol";
import {PrivacyManager} from "../src/PrivacyManager.sol";
import {SenseiCrossChain} from "../src/SenseiCrossChain.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying Sensei Knowledge Economy Platform...");
        console.log("Deployer address:", deployer);
        
        // 1. Deploy SenseiRegistry
        console.log("Deploying SenseiRegistry...");
        SenseiRegistry senseiRegistry = new SenseiRegistry();
        console.log("SenseiRegistry deployed at:", address(senseiRegistry));
        
        // 2. Deploy SenseiToken
        console.log("Deploying SenseiToken (Floating Stablecoin)...");
        SenseiToken senseiToken = new SenseiToken();
        console.log("SenseiToken deployed at:", address(senseiToken));
        
        // 3. Deploy LessonNFT
        console.log("Deploying LessonNFT...");
        LessonNFT lessonNFT = new LessonNFT(address(senseiToken));
        console.log("LessonNFT deployed at:", address(lessonNFT));
        
        // 4. Deploy BookingSystem
        console.log("Deploying BookingSystem...");
        BookingSystem bookingSystem = new BookingSystem(
            address(senseiRegistry),
            address(senseiToken),
            address(lessonNFT)
        );
        console.log("BookingSystem deployed at:", address(bookingSystem));
        
        // 5. Deploy SensayAI
        console.log("Deploying SensayAI (Personal AI Assistants)...");
        SensayAI sensayAI = new SensayAI(address(senseiRegistry));
        console.log("SensayAI deployed at:", address(sensayAI));
        
        // 6. Deploy PrivacyManager
        console.log("Deploying PrivacyManager (Zama FHEVM Integration)...");
        PrivacyManager privacyManager = new PrivacyManager();
        console.log("PrivacyManager deployed at:", address(privacyManager));
        
        // 7. Deploy CrossChain (LayerZero Integration)
        console.log("Deploying SenseiCrossChain (LayerZero Integration)...");
        // Note: In production, use actual LayerZero endpoint addresses
        address layerZeroEndpoint = address(0x1a44076050125825900e736c501f859c50fE728c); // Example endpoint
        SenseiCrossChain crossChain = new SenseiCrossChain(
            layerZeroEndpoint,
            deployer,
            address(0), // Will set gateway address after deployment
            true // isMainChain = true for Ethereum
        );
        console.log("SenseiCrossChain deployed at:", address(crossChain));
        
        // 8. Deploy Gateway (Central Access Control)
        console.log("Deploying SenseiGateway...");
        SenseiGateway gateway = new SenseiGateway();
        console.log("SenseiGateway deployed at:", address(gateway));
        
        // 8. Initialize Gateway with all contracts
        console.log("Initializing Gateway with contracts...");
        gateway.setContractAddresses(
            address(senseiRegistry),
            address(senseiToken),
            address(bookingSystem),
            address(lessonNFT),
            address(sensayAI),
            address(privacyManager)
        );
        
        gateway.initializeAuthorizations();
        
        // Set up cross-chain integration
        crossChain.setSenseiGateway(address(gateway));
        gateway.setCrossChainContract(address(crossChain));
        
        // 8. Set up permissions and ownership
        console.log("Setting up permissions and access control...");
        
        // Transfer ownership of SenseiToken to Gateway
        senseiToken.transferOwnership(address(gateway));
        console.log("SenseiToken ownership transferred to Gateway");
        
        // Transfer ownership of LessonNFT to Gateway
        lessonNFT.transferOwnership(address(gateway));
        console.log("LessonNFT ownership transferred to Gateway");
        
        // Transfer ownership of KnowledgeSession to Gateway
        bookingSystem.transferOwnership(address(gateway));
        console.log("KnowledgeSession ownership transferred to Gateway");
        
        // Transfer ownership of SenseiRegistry to Gateway
        senseiRegistry.transferOwnership(address(gateway));
        console.log("SenseiRegistry ownership transferred to Gateway");
        
        // Set AI Agent contract in SenseiRegistry
        senseiRegistry.setAIAgentContract(address(sensayAI));
        console.log("SensayAI contract set in SenseiRegistry");
        
        // Transfer ownership of SensayAI to Gateway
        sensayAI.transferOwnership(address(gateway));
        console.log("SensayAI ownership transferred to Gateway");
        
        // Transfer ownership of PrivacyManager to Gateway
        privacyManager.transferOwnership(address(gateway));
        console.log("PrivacyManager ownership transferred to Gateway");
        
        // Gateway ownership stays with deployer for platform management
        console.log("Gateway ownership remains with deployer for platform management");
        
        vm.stopBroadcast();
        
        console.log("\n=== Sensei Knowledge Economy Platform Deployment ===");
        console.log("SenseiGateway (Main Interface):", address(gateway));
        console.log("SenseiRegistry:", address(senseiRegistry));
        console.log("SenseiToken (Floating Stablecoin):", address(senseiToken));
        console.log("LessonNFT:", address(lessonNFT));
        console.log("BookingSystem:", address(bookingSystem));
        console.log("SensayAI (Personal Assistants):", address(sensayAI));
        console.log("PrivacyManager (FHEVM):", address(privacyManager));
        console.log("Deployer:", deployer);
        console.log("=============================================\n");
        
        // Save deployment addresses to a file
        string memory deploymentInfo = string(abi.encodePacked(
            "# Sensei Knowledge Economy Platform\n",
            "SENSEI_GATEWAY=", vm.toString(address(gateway)), "\n",
            "SENSEI_REGISTRY=", vm.toString(address(senseiRegistry)), "\n",
            "SENSEI_TOKEN=", vm.toString(address(senseiToken)), "\n",
            "LESSON_NFT=", vm.toString(address(lessonNFT)), "\n",
            "BOOKING_SYSTEM=", vm.toString(address(bookingSystem)), "\n",
            "SENSAY_AI=", vm.toString(address(sensayAI)), "\n",
            "PRIVACY_MANAGER=", vm.toString(address(privacyManager)), "\n",
            "DEPLOYER=", vm.toString(deployer), "\n"
        ));
        
        vm.writeFile("deployment.env", deploymentInfo);
        console.log("Deployment addresses saved to deployment.env");
        
        console.log("\n=== Platform Usage Instructions ===");
        console.log("ALL interactions must go through SenseiGateway at:", address(gateway));
        console.log("");
        console.log("For Retirees/Experts (Become a Sensei):");
        console.log("   1. Call registerAsSensei() with your expertise");
        console.log("   2. Personal Sensay AI will be created automatically");
        console.log("   3. Accept session bookings from students");
        console.log("   4. Complete sessions and earn SenseiTokens");
        console.log("");
        console.log("For Learners (Students):");
        console.log("   1. Call registerAsStudent() or mint tokens to auto-register");
        console.log("   2. Use mintTokensWithETH() to get SenseiTokens");
        console.log("   3. Book sessions with bookKnowledgeSession()");
        console.log("   4. Mint lesson NFTs to earn 50% revenue split");
        console.log("");
        console.log("Key Features:");
        console.log("   - Knowledge backs the SenseiToken floating stablecoin");
        console.log("   - Single NFT per session with 50/50 revenue split");
        console.log("   - Personal Sensay AI for each Sensei");
        console.log("   - Inclusive platform for all knowledge sharers");
        console.log("==============================================\n");
    }
}
