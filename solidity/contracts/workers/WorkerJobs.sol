// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "../Accountable.sol";

abstract contract WorkerJobs is Accountable {
    using EnumerableSet for EnumerableSet.UintSet;

    function bidJob(uint256 _jobId, uint256 _bidAmount)
        external
        notOwner(_jobId)
        validJob(_jobId)
        newJob(_jobId)
    {
        if (!_validWorkers[msg.sender]) revert("InvalidWorker");

        for (uint256 i = 0; i < _bidersDetails[_jobId].length; i++) {
            if (_bidersDetails[_jobId][i].biderAddress == msg.sender)
                revert("AlreadyBided");
        }

        Worker memory _worker = _workers[msg.sender];
        if (_worker.isWorking) revert("AlreadyWorking");

        Job storage _job = _jobs[_jobId];
        if (_bidAmount > _job.jobBudget) revert("OverBudget");
        

        _bidersDetails[_jobId].push(Bider(_jobId, msg.sender, _bidAmount));

        emit SuccessfullyBid(msg.sender, _jobId, _bidAmount);
    }

    function modifyBid(uint256 _jobId, uint256 _bidAmount)
        external
        notOwner(_jobId)
        validJob(_jobId)
        newJob(_jobId)
        returns (bool)
    {
        require(_jobId <= _jobIds, "Job does not exist.");

        if (!_validWorkers[msg.sender]) revert("InvalidWorker");

        for (uint256 i = 0; i < _bidersDetails[_jobId].length; i++) {
            if (_bidersDetails[_jobId][i].biderAddress != msg.sender) {
                continue;
            } else {
                if (_bidAmount >= _bidersDetails[_jobId][i].bidAmount)
                    revert("GreaterThanPreviousBid");

                uint256 _prevBidAmount = _bidersDetails[_jobId][i].bidAmount;

                _bidersDetails[_jobId][i].bidAmount = _bidAmount;
                emit BidModifiedSuccessfully(
                    msg.sender,
                    _jobId,
                    _bidAmount,
                    _prevBidAmount
                );
                return true;
            }
        }
        revert("NotBided");
    }

    function jobDone(uint256 _jobId) external onlyJobWorker(_jobId) {
        require(isJobActive(_jobId), "Job already completed.");
        uint32 timeNow = uint32(block.timestamp);

        Job storage _job = _jobs[_jobId];
        _job.isCompleted = true;
        _job.jobCompletedDate = timeNow;

        uint256 _amountToBePaid;
        for (uint256 i = 0; i < _bidersDetails[_jobId].length; i++) {
            if (_bidersDetails[_jobId][i].biderAddress == msg.sender)
                _amountToBePaid = _bidersDetails[_jobId][i].bidAmount;
        }
        _jobOwnerFundLocked[_job.jobOwner] -= _amountToBePaid;
        _fundByJobOwner[_job.jobOwner] -= _amountToBePaid;

        Worker storage _worker = _workers[msg.sender];
        _worker.isWorking = false;
        _worker.jobsCompleted++;
        _worker.totalEarned += _amountToBePaid;

        _liveJobs.remove(_jobId);
        payable(msg.sender).transfer(_amountToBePaid);
        emit jobCompleted(msg.sender, _jobId, _amountToBePaid);
    }
}
