// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "../Accountable.sol";

abstract contract JobWorkers is Accountable {
    function acceptBid(uint256 _jobId, address _workerAdd)
        external
        validJob(_jobId)
        onlyJobOwner(_jobId)
        newJob(_jobId)
    {
        if (!_validWorkers[_workerAdd]) revert("InvalidWorker");

        Worker memory __worker = _workers[_workerAdd];

        if (__worker.isWorking) revert("AlreadyWorking");

        uint32 timeNow = uint32(block.timestamp);

        Job storage _job = _jobs[_jobId];
        _job.jobWorker = _workerAdd;
        _job.jobStartedDate = timeNow;
        for (uint256 i = 0; i < _bidersDetails[_jobId].length; i++) {
            if (_bidersDetails[_jobId][i].biderAddress == _workerAdd)
                _job.jobSettledAmount = _bidersDetails[_jobId][i].bidAmount;
        }


        uint256 _amountToBeUnlock = (_job.jobBudget - _job.jobSettledAmount);
        _jobOwnerFundLocked[msg.sender] -= _amountToBeUnlock;

        Worker storage _worker = _workers[_workerAdd];
        _worker.isWorking = true;

        emit BidAccepted(msg.sender, _workerAdd, _jobId, _job.jobSettledAmount);
    }

    function withdrawExtraFund() external {
        uint256 _amount = extraFund();
        require(_amount > 0, "No extra Fund.");

        _fundByJobOwner[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit FundWithdrawSuccessfully(msg.sender, _amount);
    }
}
