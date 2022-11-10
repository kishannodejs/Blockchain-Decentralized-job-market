// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "../Accountable.sol";

abstract contract WorkerJobs is Accountable {

    function bidJob(uint256 _jobId, uint256 _bidAmount)
        external
        notOwner(_jobId)
        validJob(_jobId)
    {
        // if(!_validWorkers[msg.sender]) revert InvalidWorker();
        // if (_jobBiddersAmount[_jobId][msg.sender] != 0) revert AlreadyBided();

        if(!_validWorkers[msg.sender]) revert ("InvalidWorker");
        if (_jobBiddersAmount[_jobId][msg.sender] != 0) revert ("AlreadyBided");

        Worker memory _worker = _workers[msg.sender];
        // if(_worker.isWorking) revert AlreadyWorking();
        if(_worker.isWorking) revert ("AlreadyWorking");

        Job storage _job = _jobs[_jobId];
        // if (_bidAmount > _job.jobBudget) revert OverBudget();
        if (_bidAmount > _job.jobBudget) revert ("OverBudget");

        _job.jobAllBiders.push(msg.sender);
        _jobBiddersAmount[_jobId][msg.sender] = _bidAmount;

        Bider storage _bider = _biders[_jobId];
        if (
            _bider.biderAddress == address(0x0)
        ) {
            _bider.bidAmount = _bidAmount;
            _bider.biderAddress = msg.sender;
        } else if(msg.sender == _bider.biderAddress && _bidAmount < _bider.bidAmount) {
            _bider.bidAmount = _bidAmount;
        } else if(msg.sender != _bider.biderAddress && _bidAmount < _bider.bidAmount){
            _bider.bidAmount = _bidAmount;
            _bider.biderAddress = msg.sender;
        }

        emit SuccessfullyBid(msg.sender, _jobId, _bidAmount);
    }

    function modifyBid(uint256 _jobId, uint256 _bidAmount)
        external
        notOwner(_jobId)
        validJob(_jobId)
    {
        // if(!_validWorkers[msg.sender]) revert InvalidWorker();
        // if (_jobBiddersAmount[_jobId][msg.sender] == 0) revert NotBided();

        if(!_validWorkers[msg.sender]) revert ("InvalidWorker");
        if (_jobBiddersAmount[_jobId][msg.sender] == 0) revert ("NotBided");

        // if (_bidAmount >= _jobBiddersAmount[_jobId][msg.sender])
        //     revert GreaterThanPreviousBid();

        if (_bidAmount >= _jobBiddersAmount[_jobId][msg.sender])
            revert ("GreaterThanPreviousBid");

        uint256 _prevBidAmount = _jobBiddersAmount[_jobId][msg.sender];

        Bider storage _bider = _biders[_jobId];
        if (
            msg.sender != _bider.biderAddress && _bidAmount < _bider.bidAmount
        ) {
            _bider.bidAmount = _bidAmount;
            _bider.biderAddress = msg.sender;
        } else {
            _bider.bidAmount = _bidAmount;
        }

        _jobBiddersAmount[_jobId][msg.sender] = _bidAmount;
        emit BidModifiedSuccessfully(
            msg.sender,
            _jobId,
            _bidAmount,
            _prevBidAmount
        );
    }

    function jobDone(uint256 _jobId)
        external
        onlyJobWorker(_jobId)
        isJobCompleted(_jobId)
    {
        uint32 timeNow = uint32(block.timestamp);

        Job storage _job = _jobs[_jobId];
        _job.isCompleted = true;
        _job.jobCompletedDate = timeNow;

        Worker storage _worker = _workers[msg.sender];
        _worker.isWorking = false;
        _worker.jobsCompleted++;

        uint256 _amountToBePaid = _jobBiddersAmount[_jobId][msg.sender];
        _jobOwnerFundLocked[_job.jobOwner] -= _amountToBePaid;
        _fundByJobOwner[_job.jobOwner] -= _amountToBePaid;
        
        payable(msg.sender).transfer(_amountToBePaid);
        emit jobCompleted(msg.sender, _jobId, _amountToBePaid);
    }
}
