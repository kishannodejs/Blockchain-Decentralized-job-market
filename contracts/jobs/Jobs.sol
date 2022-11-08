// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import './JobManager.sol';
import './JobWorkers.sol';

abstract contract Jobs is JobManager, JobWorkers{}