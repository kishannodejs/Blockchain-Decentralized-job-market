// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract Accountable {
    using EnumerableSet for EnumerableSet.UintSet;

    //events
    //Job Owner
    event JobRegistered(
        address indexed _jobOwner,
        uint256 indexed _jobBudget,
        string indexed _jobName,
        uint256 _jobId
    );

    event BidAccepted(
        address indexed _jobOwner,
        address indexed _jobWorker,
        uint256 _jobId,
        uint256 _bidAmount
    );

    event FundWithdrawSuccessfully(address indexed _jobOwner, uint256 _amount);

    //Worker
    event WorkerRegisterSuccessfully(
        address indexed _worker,
        string _workerName,
        uint256 _workerId
    );

    event SuccessfullyBid(
        address indexed _workerAdd,
        uint256 indexed _jobId,
        uint256 indexed _bidAmount
    );

    event BidModifiedSuccessfully(
        address indexed _workerAdd,
        uint256 indexed _jobId,
        uint256 indexed _bidAmount,
        uint256 _prevBidAmount
    );

    event jobCompleted(
        address indexed _jobWorker,
        uint256 indexed _jobId,
        uint256 _amount
    );

    struct Worker {
        uint256 workerId;
        string workerName;
        bool isWorking;
        uint32 workerRegisteredDate;
        uint256 jobsCompleted;
        uint256 totalEarned;
    }

    struct Job {
        uint256 jobId;
        string jobName;
        string jobDescription;
        address jobOwner;
        address jobWorker;
        bool isCompleted;
        bool isJobValid;
        uint32 jobRegisteredDate;
        uint32 jobStartedDate;
        uint32 jobCompletedDate;
        uint256 jobBudget;
        uint256 jobSettledAmount;
    }

    struct Bider {
        uint256 jobId;
        address biderAddress;
        uint256 bidAmount;
    }

    uint256 public _jobIds;

    mapping(uint256 => Job) public _jobs;

    EnumerableSet.UintSet internal _liveJobs;

    mapping(address => uint256) public _fundByJobOwner;

    mapping(address => uint256) public _jobOwnerFundLocked;

    uint256 public _workerIds;

    mapping(address => Worker) public _workers;

    mapping(address => bool) public _validWorkers;

    mapping(uint256 => Bider[]) public _bidersDetails;


    //modifiers
    modifier onlyJobOwner(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(
            msg.sender == _job.jobOwner,
            "Only owner of the job will accept the bid."
        );
        _;
    }

    modifier onlyJobWorker(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(msg.sender == _job.jobWorker, "Only job worker allowed.");
        _;
    }

    modifier newJob(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(_job.jobWorker == address(0x0), "Worker already assigned.");
        _;
    }

    modifier validJob(uint256 _jobId) {
        require(_jobId <= _jobIds, "Job does not exists.");
        _;
    }

    modifier notOwner(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(
            msg.sender != _job.jobOwner,
            "Job owner not allowed to place bid."
        );
        _;
    }

    //functions
    function extraFund() public view returns (uint256) {
        return (_fundByJobOwner[msg.sender] - _jobOwnerFundLocked[msg.sender]);
    }

    function seeJob(uint256 _jobId) public view returns (Job memory) {
        return _jobs[_jobId];
    }

    function seeWorker(address _worker) public view returns (Worker memory) {
        return _workers[_worker];
    }

    function isJobActive(uint256 _jobId)
        public
        view
        validJob(_jobId)
        returns (bool)
    {
        return (_liveJobs.contains(_jobId));
    }

    function activeJobsLen() external view returns (uint256) {
        return _liveJobs.length();
    }

    function activeJobs() external view returns (bytes32[] memory) {
        return _liveJobs._inner._values;
    }

    function allBiders(uint256 _jobId) external view validJob(_jobId) returns (Bider[] memory) {
        return _bidersDetails[_jobId];
    }
}
