// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "../Accountable.sol";

abstract contract JobWorkers is Accountable {
    event BidAccepted(
        address indexed _jobOwner,
        address indexed _jobWorker,
        uint256 _jobId,
        uint256 _bidAmount
    );

    event AmountWithdrawSuccessfully(address indexed _jobOwner, uint256 _amount);

    modifier onlyJobOwner(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(
            msg.sender == _job.jobOwner,
            "Only owner of the job will accept the bid."
        );
        _;
    }

    modifier newJob(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(
            _job.jobWorker == address(0x0),
            "Worker already selected for this job."
        );
        _;
    }

    modifier onlyJobWorker(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(msg.sender == _job.jobWorker, "Only job worker allowed.");
        _;
    }

    modifier jobCompleted(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(!_job.isCompleted, "Job already completed.");
        _;
    }

    function acceptBid(uint256 _jobId, address _workerAdd)
        external
        onlyJobOwner(_jobId)
        newJob(_jobId)
    {
        if (!_validWorkers[_workerAdd]) revert InvalidWorker();

        uint32 timeNow = uint32(block.timestamp);
        Job storage _job = _jobs[_jobId];
        _job.jobWorker = _workerAdd;
        _job.jobStartedDate = timeNow;

        _jobOwnerFundLocked[msg.sender] += _jobBiddersAmount[_jobId][
            _workerAdd
        ];
        _fundByJobOwner[msg.sender] -= _jobBiddersAmount[_jobId][_workerAdd];

        Worker storage _worker = _workers[_workerAdd];
        _worker.isWorking = true;

        emit BidAccepted(
            msg.sender,
            _workerAdd,
            _jobId,
            _jobBiddersAmount[_jobId][_workerAdd]
        );
    }

    function jobDone(uint256 _jobId)
        external
        onlyJobWorker(_jobId)
        jobCompleted(_jobId)
    {
        uint32 timeNow = uint32(block.timestamp);

        Job storage _job = _jobs[_jobId];
        _job.isCompleted = true;
        _job.jobCompletedDate = timeNow;

        Worker storage _worker = _workers[msg.sender];
        _worker.isWorking = false;
        _worker.jobCompleted++;

        _jobOwnerFundLocked[_job.jobOwner] -= _jobBiddersAmount[_jobId][
            msg.sender
        ];
        payable(msg.sender).transfer(_jobBiddersAmount[_jobId][msg.sender]);
    }

    function withdrawExtraAmount()external {
        require(_fundByJobOwner[msg.sender] > 0, "No extra amount."); 
        uint256 _amount = _fundByJobOwner[msg.sender];
        _fundByJobOwner[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit AmountWithdrawSuccessfully(msg.sender, _amount);
    }
}
