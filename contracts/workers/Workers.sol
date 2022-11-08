// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import './WorkerManager.sol';
import './WorkerJobs.sol';

abstract contract Workers is WorkerManager, WorkerJobs{}