// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import '../Accountable.sol';

abstract contract JobManager is Accountable{
    event JobRegistered(address indexed _jobOwner, uint256 indexed _jobBudget, string indexed _jobName, uint256 _jobId);

    function registerJob(string memory _jobName, string memory _jobDescription, uint256 _jobBudge)external payable{
        uint256 _jobBudget = _jobBudge * 10**18;
        require(_fundByJobOwner[msg.sender] + msg.value >= _jobBudget, "Insufficient Balance.");

        uint32 timeNow =  uint32(block.timestamp);
        _jobIds++;
        Job storage _job = _jobs[_jobIds];
            _job.jobId = _jobIds;
            _job.jobName =_jobName;
            _job.jobDescription = _jobDescription;
            _job.jobOwner = payable(msg.sender);
            _job.jobWorker = payable(0x0);
            _job.isCompleted = false;
            _job.isJobValid = true;
            _job.jobRegisteredDate = timeNow;
            _job.jobStartedDate = 0;
            _job.jobCompletedDate = 0;
            _job.jobBudget = _jobBudget;
        
        _fundByJobOwner[msg.sender] += msg.value;
        emit JobRegistered(msg.sender, msg.value, _jobName ,_jobIds);
    }
}