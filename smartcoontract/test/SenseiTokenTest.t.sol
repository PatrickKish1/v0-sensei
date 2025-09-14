// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {SenseiToken} from "../src/SenseiToken.sol";
import "../src/libraries/Constants.sol";
import "../src/libraries/Errors.sol";

/**
 * @title SenseiTokenTest - Comprehensive Unit Tests for SenseiToken
 * @notice Tests the floating stablecoin mechanics and knowledge-backed economy
 * @dev Every function gets tested here - no stone left unturned
 * This is where we make sure the token economics work perfectly
 */
contract SenseiTokenTest is Test {
    
    SenseiToken public token;
    
    address public owner;
    address public sensei1;
    address public sensei2;
    address public student1;
    address public student2;
    address public minter;
    address public burner;
    
    function setUp() public {
        owner = address(this);
        sensei1 = makeAddr("sensei1");
        sensei2 = makeAddr("sensei2");
        student1 = makeAddr("student1");
        student2 = makeAddr("student2");
        minter = makeAddr("minter");
        burner = makeAddr("burner");
        
        // Deploy token
        token = new SenseiToken();
        
        // Set up authorizations
        token.setAuthorizedMinter(minter, true);
        token.setAuthorizedBurner(burner, true);
        
        // Fund addresses
        vm.deal(sensei1, 100 ether);
        vm.deal(sensei2, 100 ether);
        vm.deal(student1, 100 ether);
        vm.deal(student2, 100 ether);
    }
    
    // ============ INITIALIZATION TESTS ============
    
    function testInitialState() public {
        assertEq(token.name(), "Sensei Token");
        assertEq(token.symbol(), "SENSEI");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
        assertEq(token.totalKnowledgeValue(), 0);
        assertEq(token.totalBackingValue(), 0);
        assertEq(token.getCurrentMintRate(), Constants.MIN_MINT_RATE);
    }
    
    function testOwnershipAndAuthorizations() public {
        assertEq(token.owner(), owner);
        assertTrue(token.authorizedMinters(minter));
        assertTrue(token.authorizedBurners(burner));
        assertFalse(token.authorizedMinters(sensei1));
        assertFalse(token.authorizedBurners(student1));
    }
    
    // ============ MINTING TESTS ============
    
    function testMintWithETH() public {
        uint256 ethAmount = 1 ether;
        uint256 expectedTokens = Constants.MIN_MINT_RATE; // 100 tokens per ETH initially
        
        vm.prank(student1);
        uint256 tokensMinted = token.mintWithETH{value: ethAmount}();
        
        assertEq(tokensMinted, expectedTokens);
        assertEq(token.balanceOf(student1), expectedTokens);
        assertEq(token.totalSupply(), expectedTokens);
        assertEq(address(token).balance, ethAmount);
        assertEq(token.totalBackingValue(), ethAmount);
    }
    
    function testMintWithETHZeroValue() public {
        vm.prank(student1);
        vm.expectRevert();
        token.mintWithETH{value: 0}();
    }
    
    function testMintForNFT() public {
        uint256 nftValue = 100 * 10**18; // 100 tokens
        
        vm.prank(minter);
        token.mintForNFT(student1, sensei1, nftValue);
        
        // Check 50/50 split minus 5% platform fee
        uint256 platformFee = (nftValue * Constants.PLATFORM_FEE_BASIS_POINTS) / Constants.BASIS_POINTS_DENOMINATOR;
        uint256 studentShare = (nftValue / 2) - platformFee;
        uint256 senseiShare = nftValue / 2;
        
        assertEq(token.balanceOf(student1), studentShare);
        assertEq(token.balanceOf(sensei1), senseiShare);
        assertEq(token.balanceOf(owner), platformFee);
        assertEq(token.senseiEarnings(sensei1), senseiShare);
    }
    
    function testMintForNFTInvalidInputs() public {
        vm.startPrank(minter);
        
        // Test invalid student address
        vm.expectRevert();
        token.mintForNFT(address(0), sensei1, 100 * 10**18);
        
        // Test invalid sensei address
        vm.expectRevert();
        token.mintForNFT(student1, address(0), 100 * 10**18);
        
        // Test zero NFT value
        vm.expectRevert();
        token.mintForNFT(student1, sensei1, 0);
        
        vm.stopPrank();
    }
    
    // ============ KNOWLEDGE SESSION TESTS ============
    
    function testCompleteKnowledgeSession() public {
        uint256 sessionValue = 2 ether;
        
        vm.prank(minter);
        token.completeKnowledgeSession(1, sensei1, student1, sessionValue);
        
        // Distribute earnings to sensei (this mints tokens)
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, sessionValue / 2);
        
        // Verify session was recorded
        (uint256 knowledgeValue, uint256 backingValue) = token.getSessionInfo(1);
        assertEq(knowledgeValue, sessionValue); // sessionValue as recorded
        assertEq(backingValue, sessionValue);   // sessionValue as recorded
        
        // Verify sensei earnings increased and tokens were minted
        assertTrue(token.senseiEarnings(sensei1) > 0);
        assertTrue(token.senseiContributions(sensei1) > 0);
        assertTrue(token.balanceOf(sensei1) > 0);
    }
    
    function testCompleteKnowledgeSessionUnauthorized() public {
        vm.prank(student1); // Not authorized
        vm.expectRevert();
        token.completeKnowledgeSession(2, sensei1, student2, 1 ether);
    }
    
    // ============ WITHDRAWAL TESTS ============
    
    function testWithdrawEarningsByBurning() public {
        // First, create some earnings for sensei
        vm.prank(minter);
        token.completeKnowledgeSession(3, sensei1, student1, 2 ether);
        
        // Distribute earnings to sensei (this mints tokens)
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, 1 ether);
        
        // Add ETH backing to contract
        vm.deal(address(token), 5 ether);
        (bool success, ) = address(token).call{value: 5 ether}("");
        assertTrue(success);
        
        uint256 senseiEarnings = token.senseiEarnings(sensei1);
        uint256 senseiTokens = token.balanceOf(sensei1);
        uint256 initialETH = sensei1.balance;
        
        assertTrue(senseiEarnings > 0);
        assertTrue(senseiTokens >= senseiEarnings);
        
        // Withdraw half the earnings
        uint256 withdrawAmount = senseiEarnings / 2;
        
        vm.prank(sensei1);
        token.withdrawEarningsByBurning(withdrawAmount);
        
        // Verify tokens were burned and ETH received
        assertEq(token.balanceOf(sensei1), senseiTokens - withdrawAmount);
        assertTrue(sensei1.balance > initialETH);
        assertEq(token.senseiEarnings(sensei1), senseiEarnings - withdrawAmount);
    }
    
    function testWithdrawEarningsByBurningInsufficientBalance() public {
        vm.prank(sensei1);
        vm.expectRevert();
        token.withdrawEarningsByBurning(1000 * 10**18); // Don't have any tokens
    }
    
    function testWithdrawEarningsByBurningExceedsEarnings() public {
        // Give sensei some tokens but no earnings
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, 100 * 10**18);
        
        vm.prank(sensei1);
        vm.expectRevert();
        token.withdrawEarningsByBurning(200 * 10**18); // More than earned
    }
    
    // ============ BURNING TESTS ============
    
    function testBurnFrom() public {
        // First mint some tokens
        vm.prank(student1);
        token.mintWithETH{value: 1 ether}();
        
        uint256 burnAmount = 50 * 10**18;
        uint256 initialSupply = token.totalSupply();
        uint256 initialBacking = token.totalBackingValue();
        
        // Approve burner
        vm.prank(student1);
        token.approve(burner, burnAmount);
        
        // Burn tokens
        vm.prank(burner);
        token.burnFrom(student1, burnAmount);
        
        // Verify tokens were burned and backing reduced proportionally
        assertEq(token.totalSupply(), initialSupply - burnAmount);
        
        // Calculate expected backing reduction based on proportion of tokens burned
        uint256 expectedBackingReduction = (burnAmount * initialBacking) / initialSupply;
        assertEq(token.totalBackingValue(), initialBacking - expectedBackingReduction);
    }
    
    function testBurnFromUnauthorized() public {
        vm.prank(student1);
        token.mintWithETH{value: 1 ether}();
        
        vm.prank(student1); // Not authorized burner
        vm.expectRevert();
        token.burnFrom(student1, 10 * 10**18);
    }
    
    // ============ DYNAMIC RATE TESTS ============
    
    function testDynamicMintRateIncrease() public {
        // Complete multiple knowledge sessions to increase demand
        for (uint i = 0; i < 10; i++) {
            vm.prank(minter);
            token.completeKnowledgeSession(10 + i, sensei1, student1, 1 ether);
        }
        
        // Force rebase
        vm.warp(block.timestamp + Constants.REBASE_INTERVAL);
        
        vm.prank(student1);
        token.mintWithETH{value: 1 ether}();
        
        // Rate should have increased due to high demand
        uint256 newRate = token.getCurrentMintRate();
        assertTrue(newRate > Constants.MIN_MINT_RATE);
    }
    
    function testRebaseCalculation() public {
        // Add knowledge value and backing
        vm.prank(minter);
        token.completeKnowledgeSession(20, sensei1, student1, 5 ether);
        
        // Distribute earnings to sensei
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, 2.5 ether);
        
        // Add more backing through direct minting
        vm.prank(student1);
        token.mintWithETH{value: 3 ether}();
        
        uint256 oldRate = token.getCurrentMintRate();
        
        // Force rebase
        vm.warp(block.timestamp + Constants.REBASE_INTERVAL);
        vm.prank(student1);
        token.mintWithETH{value: 1 ether}();
        
        uint256 newRate = token.getCurrentMintRate();
        
        // Verify rebase happened
        assertTrue(newRate != oldRate);
    }
    
    // ============ AUTHORIZATION TESTS ============
    
    function testSetAuthorizedMinter() public {
        address newMinter = makeAddr("newMinter");
        
        assertFalse(token.authorizedMinters(newMinter));
        
        token.setAuthorizedMinter(newMinter, true);
        assertTrue(token.authorizedMinters(newMinter));
        
        token.setAuthorizedMinter(newMinter, false);
        assertFalse(token.authorizedMinters(newMinter));
    }
    
    function testSetAuthorizedMinterOnlyOwner() public {
        vm.prank(student1);
        vm.expectRevert();
        token.setAuthorizedMinter(minter, true);
    }
    
    function testSetAuthorizedBurner() public {
        address newBurner = makeAddr("newBurner");
        
        assertFalse(token.authorizedBurners(newBurner));
        
        token.setAuthorizedBurner(newBurner, true);
        assertTrue(token.authorizedBurners(newBurner));
        
        token.setAuthorizedBurner(newBurner, false);
        assertFalse(token.authorizedBurners(newBurner));
    }
    
    // ============ VIEW FUNCTION TESTS ============
    
    function testGetSenseiMetrics() public {
        // Create some activity
        vm.prank(minter);
        token.completeKnowledgeSession(21, sensei1, student1, 2 ether);
        
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, 100 * 10**18);
        
        (uint256 earnings, uint256 contributions) = token.getSenseiMetrics(sensei1);
        
        assertTrue(contributions > 0);
        assertTrue(earnings > 0);
    }
    
    function testGetEconomyMetrics() public {
        // Create some economic activity
        vm.prank(student1);
        token.mintWithETH{value: 2 ether}();
        
        vm.prank(minter);
        token.completeKnowledgeSession(22, sensei1, student1, 1 ether);
        
        (
            uint256 totalSupplyValue,
            uint256 knowledgeValue,
            uint256 backingValue,
            uint256 mintRate,
            uint256 totalEarnings
        ) = token.getEconomyMetrics();
        
        assertTrue(totalSupplyValue > 0);
        assertTrue(knowledgeValue > 0);
        assertTrue(backingValue > 0);
        assertEq(mintRate, token.getCurrentMintRate());
        assertTrue(totalEarnings >= 0);
    }
    
    // ============ EDGE CASE TESTS ============
    
    function testReceiveETH() public {
        uint256 initialBacking = token.totalBackingValue();
        
        // Send ETH directly to contract
        (bool success, ) = address(token).call{value: 1 ether}("");
        assertTrue(success);
        
        assertEq(token.totalBackingValue(), initialBacking + 1 ether);
    }
    
    function testEmergencyTokenWithdrawal() public {
        // Create mock ERC20 and send to contract
        MockERC20 mockToken = new MockERC20("MOCK", "MOCK", 18);
        mockToken.mint(address(token), 1000 * 10**18);
        
        uint256 initialBalance = mockToken.balanceOf(owner);
        
        token.emergencyTokenWithdrawal(address(mockToken), 500 * 10**18);
        
        assertEq(mockToken.balanceOf(owner), initialBalance + 500 * 10**18);
    }
    
    function testEmergencyTokenWithdrawalSenseiTokens() public {
        // Should not be able to withdraw SenseiTokens
        vm.expectRevert();
        token.emergencyTokenWithdrawal(address(token), 100);
    }
    
    // ============ STRESS TESTS ============
    
    function testHighVolumeOperations() public {
        // Test with many users and sessions
        address[] memory users = new address[](20);
        for (uint i = 0; i < 20; i++) {
            users[i] = makeAddr(string(abi.encodePacked("user", i)));
            vm.deal(users[i], 10 ether);
        }
        
        // Have all users mint tokens
        for (uint i = 0; i < 20; i++) {
            vm.prank(users[i]);
            token.mintWithETH{value: 1 ether}();
        }
        
        // Verify total supply
        assertEq(token.totalSupply(), 20 * Constants.MIN_MINT_RATE);
        assertEq(token.totalBackingValue(), 20 ether);
        
        // Complete many knowledge sessions
        for (uint i = 0; i < 20; i++) {
            vm.prank(minter);
            token.completeKnowledgeSession(30 + i, sensei1, users[i], 0.5 ether);
        }
        
        // Distribute earnings to sensei
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, 5 ether); // 20 * 0.5 / 2 = 5 ether
        
        // Verify sensei earnings accumulated
        assertTrue(token.senseiEarnings(sensei1) > 0);
        assertTrue(token.senseiContributions(sensei1) > 0);
    }
    
    function testTokenEconomicsUnderStress() public {
        // Create extreme demand scenario
        for (uint i = 0; i < 100; i++) {
            vm.prank(minter);
            token.completeKnowledgeSession(50 + i, sensei1, student1, 1 ether);
        }
        
        // Distribute earnings to sensei
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, 50 ether); // 100 * 1 / 2 = 50 ether
        
        // Force multiple rebases
        for (uint i = 0; i < 10; i++) {
            vm.warp(block.timestamp + Constants.REBASE_INTERVAL);
            vm.prank(student1);
            token.mintWithETH{value: 1 ether}();
        }
        
        // Verify rate increased significantly
        uint256 finalRate = token.getCurrentMintRate();
        assertTrue(finalRate > Constants.MIN_MINT_RATE);
        
        // Verify backing ratio is maintained
        uint256 backingRatio = (token.totalBackingValue() * 100) / token.totalSupply();
        assertTrue(backingRatio >= Constants.MINIMUM_BACKING_RATIO);
    }
    
    // ============ FUZZ TESTS ============
    
    function testFuzzMintWithETH(uint256 ethAmount) public {
        // Bound the input to reasonable values
        ethAmount = bound(ethAmount, 0.001 ether, 100 ether);
        
        vm.deal(student1, ethAmount);
        vm.prank(student1);
        
        if (ethAmount == 0) {
            vm.expectRevert();
            token.mintWithETH{value: ethAmount}();
        } else {
            uint256 tokensMinted = token.mintWithETH{value: ethAmount}();
            assertTrue(tokensMinted > 0);
            assertEq(token.totalBackingValue(), ethAmount);
        }
    }
    
    function testFuzzCompleteKnowledgeSession(
        uint256 sessionValue,
        address senseiAddr,
        address studentAddr
    ) public {
        // Bound inputs
        sessionValue = bound(sessionValue, 0.001 ether, 50 ether);
        vm.assume(senseiAddr != address(0) && studentAddr != address(0));
        vm.assume(senseiAddr != studentAddr);
        
        vm.prank(minter);
        token.completeKnowledgeSession(150, senseiAddr, studentAddr, sessionValue);
        
        // Distribute earnings to sensei
        vm.prank(minter);
        token.distributeSenseiEarnings(senseiAddr, sessionValue / 2);
        
        // Verify session was processed
        assertTrue(token.senseiEarnings(senseiAddr) > 0);
        assertTrue(token.senseiContributions(senseiAddr) > 0);
    }
    
    function testFuzzWithdrawEarningsByBurning(uint256 withdrawAmount) public {
        // Setup sensei with earnings
        vm.prank(minter);
        token.completeKnowledgeSession(151, sensei1, student1, 5 ether);
        
        // Distribute earnings to sensei (this mints tokens)
        vm.prank(minter);
        token.distributeSenseiEarnings(sensei1, 2.5 ether);
        
        // Add backing
        vm.deal(address(token), 10 ether);
        
        uint256 maxWithdraw = token.senseiEarnings(sensei1);
        withdrawAmount = bound(withdrawAmount, 0, maxWithdraw);
        
        if (withdrawAmount == 0) {
            vm.prank(sensei1);
            vm.expectRevert();
            token.withdrawEarningsByBurning(withdrawAmount);
        } else {
            uint256 initialETH = sensei1.balance;
            
            vm.prank(sensei1);
            token.withdrawEarningsByBurning(withdrawAmount);
            
            assertTrue(sensei1.balance > initialETH);
        }
    }
}

/**
 * @title MockERC20 - Simple ERC20 for testing
 */
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount);
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount);
        require(allowance[from][msg.sender] >= amount);
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}
