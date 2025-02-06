 // SPDX-License-Identifier: UNLICENSED
 pragma solidity ^0.8.28;

 import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

 contract DBank is AutomationCompatibleInterface {
    
    struct Account {
        uint256 balance;
        bool exist;
        uint256 lastActivity; // Track last deposit/withdrawal
       }

    mapping(address => Account) public accounts;
    address[] public accountList;

    uint256 public constant AUTO_WITHDRAW_THRESHOLD = 10 ether; // Example threshold
    uint256 public immutable interval;
    uint256 public lastCheckedTime;

    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event Transferred(address indexed from, address indexed to, uint256 amount);
    event AutoWithdraw(address indexed account, uint256 amount);

    constructor(uint256 _interval) {
        interval = _interval;
        lastCheckedTime = block.timestamp;
      }

    function createAccount() external {
        require(!accounts[msg.sender].exist, "Account already exists");
        accounts[msg.sender] = Account({balance: 0, exist: true, lastActivity: block.timestamp});
        accountList.push(msg.sender);
     }

    function deposit() external payable {
        require(accounts[msg.sender].exist, "Account does not exist");
        require(msg.value > 0, "Invalid amount");
        accounts[msg.sender].balance += msg.value;
        accounts[msg.sender].lastActivity = block.timestamp;

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) external {
        require(accounts[msg.sender].exist, "Account does not exist");
        require(accounts[msg.sender].balance >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount should be greater than zero");

        accounts[msg.sender].balance -= _amount;
        payable(msg.sender).transfer(_amount);
        accounts[msg.sender].lastActivity = block.timestamp;

        emit Withdrawn(msg.sender, _amount);
    }

    function transfer(address _to, uint256 _amount) external {
        require(accounts[msg.sender].exist, "Sender account does not exist");
        require(accounts[msg.sender].balance >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount should be greater than zero");

        accounts[msg.sender].balance -= _amount;
        accounts[_to].balance += _amount;
        accounts[msg.sender].lastActivity = block.timestamp;

        emit Transferred(msg.sender, _to, _amount);
    }

    function getAccountBalance(address _account) public view returns (uint256) {
        require(accounts[_account].exist, "Account does not exist");
        return accounts[_account].balance;
    }

    // **🔹 Chainlink Automation Functions**
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
         upkeepNeeded = false;
         address[] memory eligibleAccounts = new address[](accountList.length);
         uint256 count = 0;

       if ((block.timestamp - lastCheckedTime) > interval) {
           for (uint256 i = 0; i < accountList.length; i++) {
            address accountAddress = accountList[i];
               if (accounts[accountAddress].exist && accounts[accountAddress].balance >= AUTO_WITHDRAW_THRESHOLD) {
                eligibleAccounts[count] = accountAddress;
                count++;
                upkeepNeeded = true;
            }
          }
        }

          if (upkeepNeeded) {
          performData = abi.encode(eligibleAccounts, count);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
           (address[] memory eligibleAccounts, uint256 count) = abi.decode(performData, (address[], uint256));

    for (uint256 i = 0; i < count; i++) {
            address accountAddress = eligibleAccounts[i];
          if (accounts[accountAddress].exist && accounts[accountAddress].balance >= AUTO_WITHDRAW_THRESHOLD) {
                 uint256 amount = AUTO_WITHDRAW_THRESHOLD;
                 accounts[accountAddress].balance -= amount;
                 payable(accountAddress).transfer(amount);
                 emit AutoWithdraw(accountAddress, amount);
               }
      }

      lastCheckedTime = block.timestamp;
     }

 }
