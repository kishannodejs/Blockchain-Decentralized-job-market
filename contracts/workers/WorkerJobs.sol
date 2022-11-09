// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "../Accountable.sol";

abstract contract WorkerJobs is Accountable {
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
    error OverBudget();
    error AlreadyBided();
    error NotBided();
    error GreaterThanPreviousBid();
    error AlreadyWorking();

    modifier validJob(uint256 _jobId) {
        Job memory _job = _jobs[_jobId];
        require(_job.isJobValid, "Job does not exists.");
        require(_job.jobWorker == address(0x0), "Worker already assigned.");
        _;
    }


    modifier notOwner(uint256 _jobId){
        Job memory _job = _jobs[_jobId];
        require(msg.sender !=_job.jobOwner, "Job owner not allowed to place bid.");
        _;
    }

    function bidJob(uint256 _jobId, uint256 _bidAmoun)
        external
        notOwner(_jobId)
        validJob(_jobId)
    {
        uint256 _bidAmount = _bidAmoun * 10**18;
        if(!_validWorkers[msg.sender]) revert InvalidWorker();
        if (_jobBiddersAmount[_jobId][msg.sender] != 0) revert AlreadyBided();

        Worker memory _worker = _workers[msg.sender];
        if(_worker.isWorking) revert AlreadyWorking();

        Job storage _job = _jobs[_jobId];
        if (_bidAmount > _job.jobBudget) revert OverBudget();
        _job.jobAllBiders.push(msg.sender);

        _jobBiddersAmount[_jobId][msg.sender] = _bidAmount;

        Bider storage _bider = _biders[_jobId];
        if (
            _bider.biderAddress != address(0x0) && _bidAmount < _bider.bidAmount
        ) {
            _bider.bidAmount = _bidAmount;
            _bider.biderAddress = msg.sender;
        } else {
            _bider.bidAmount = _bidAmount;
            _bider.biderAddress = msg.sender;
        }

        emit SuccessfullyBid(msg.sender, _jobId, _bidAmount);
    }

    function modifyBid(uint256 _jobId, uint256 _bidAmoun)
        external
        notOwner(_jobId)
        validJob(_jobId)
    {
        uint256 _bidAmount = _bidAmoun * 10**18;
        if(!_validWorkers[msg.sender]) revert InvalidWorker();
        if (_jobBiddersAmount[_jobId][msg.sender] == 0) revert NotBided();

        if (_bidAmount >= _jobBiddersAmount[_jobId][msg.sender])
            revert GreaterThanPreviousBid();
        uint256 _prevBidAmount = _jobBiddersAmount[_jobId][msg.sender];

        Bider storage _bider = _biders[_jobId];
        if (
            msg.sender == _bider.biderAddress && _bidAmount < _bider.bidAmount
        ) {
            _bider.bidAmount = _bidAmount;
        } else if(_bidAmount < _bider.bidAmount){
            _bider.bidAmount = _bidAmount;
            _bider.biderAddress = msg.sender;
        }

        _jobBiddersAmount[_jobId][msg.sender] = _bidAmount;
        emit BidModifiedSuccessfully(
            msg.sender,
            _jobId,
            _bidAmount,
            _prevBidAmount
        );
    }
}
