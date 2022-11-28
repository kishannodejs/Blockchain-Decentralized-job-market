// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import '../Accountable.sol';

abstract contract WorkerManager is Accountable{

    function registerWorker(string memory _workerName)external {
        if(_validWorkers[msg.sender]) revert("AlreadyWorker");

        uint32 timeNow = uint32(block.timestamp);
        _workerIds++;

        _workers[msg.sender] = Worker(
            _workerIds,
            _workerName,
            false,
            timeNow,
            0,
            0
        );

        _validWorkers[msg.sender] = true;
        emit WorkerRegisterSuccessfully(msg.sender, _workerName, _workerIds);
    }
}