// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

abstract contract Accountable {
    error InvalidWorker();

    struct Worker{
        uint256 workerId;
        string workerName;
        bool isWorking;
        uint32 workerRegisteredDate;
        uint256 jobCompleted;
    }

    struct Job{
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
        address [] jobAllBiders;
    }

    struct Bider {
        uint256 bidAmount;
        address biderAddress;
    }

    uint256 internal _jobIds;

    mapping(uint256 => Job) public _jobs;

    mapping(address => uint256) internal _fundByJobOwner;

    mapping(address => uint256) internal _jobOwnerFundLocked;

    uint256 internal _workerIds;

    mapping(address => Worker) public _workers;

    mapping(address => bool) internal _validWorkers;

    mapping(uint256 => Bider) internal _biders;

    mapping(uint256 => mapping(address => uint256)) internal _jobBiddersAmount;

}