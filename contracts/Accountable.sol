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

    uint256 public _jobIds;

    mapping(uint256 => Job) public _jobs;

    mapping(address => uint256) public _fundByJobOwner;

    mapping(address => uint256) public _jobOwnerFundLocked;

    uint256 public _workerIds;

    mapping(address => Worker) public _workers;

    mapping(address => bool) public _validWorkers;

    mapping(uint256 => Bider) public _biders;

    mapping(uint256 => mapping(address => uint256)) internal _jobBiddersAmount;

    function allBider(uint256 _jobId)external view returns(address [] memory){
        Job memory _job = _jobs[_jobId];
        return(_job.jobAllBiders);

    }
}