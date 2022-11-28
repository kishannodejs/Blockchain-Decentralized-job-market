// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import './jobs/Jobs.sol';
import './workers/Workers.sol';

contract JobMarket is Jobs, Workers{

    constructor() Jobs() Workers(){}
}