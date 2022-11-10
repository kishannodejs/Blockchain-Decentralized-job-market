// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "../Accountable.sol";

abstract contract JobManager is Accountable {
    
    function registerJob(
        string memory _jobName,
        string memory _jobDescription,
        uint256 _jobBudget
    ) external payable {
        require(extraFund() + msg.value >= _jobBudget, "Insufficient Balance.");

        uint32 timeNow = uint32(block.timestamp);
        _jobIds++;

        Job storage _job = _jobs[_jobIds];
        _job.jobId = _jobIds;
        _job.jobName = _jobName;
        _job.jobDescription = _jobDescription;
        _job.jobOwner = payable(msg.sender);
        _job.jobWorker = payable(0x0);
        _job.isCompleted = false;
        _job.isJobValid = true;
        _job.jobRegisteredDate = timeNow;
        _job.jobStartedDate = 0;
        _job.jobCompletedDate = 0;
        _job.jobBudget = _jobBudget;
        _job.jobSettledAmount = 0;

        _fundByJobOwner[msg.sender] += msg.value;
        _jobOwnerFundLocked[msg.sender] += _jobBudget;
        emit JobRegistered(msg.sender, _jobBudget, _jobName, _jobIds);
    }
}
