const JobMarket = artifacts.require("JobMarket");

contract('JobMarket', accounts => {
    let [jobOwner, jobWorker1, jobWorker2, jobWorker3, jobWorker4, jobWorker5] = [...accounts]
    let _JobMarket;
    before(async () => {
        _JobMarket = await JobMarket.deployed();
        console.log("JobMarket ", _JobMarket.address);
    });

    it("Should deployed contract properly.", async () => {
        assert(_JobMarket.address !== '');
    });

    describe('Job Owner register jobs.',  () => {

        it("should give an error \"Insufficient Balance\". without passing any ETH to JobMarket contract.", async () => {
            let _error;
            let _jobBudget = web3.utils.toWei("11", "ether");
            await _JobMarket.registerJob("Food Delivery", "A to B", _jobBudget, { value: web3.utils.toWei("10", "ether"), from: jobOwner }).then().catch(err => _error = err);
            // console.log(_error.reason);
            assert(_error.reason === 'Insufficient Balance.');
        });

        it("should emit event \"JobRegistered\" with jobBudget of 10ETH but passing 12ETH to JobMarket contract.", async () => {
            let _jobBudget = web3.utils.toWei("10", "ether");
            const _event = await _JobMarket.registerJob("Food Delivery", "A to B", _jobBudget, { value: web3.utils.toWei("12", "ether"), from: jobOwner });
            // console.log(_event.logs[0].event);
            assert(_event.logs[0].event === 'JobRegistered');
        });

        it("job Owner should have 2ETH extra fund in JobMarket contract.", async () => {
            let _extraFund = await _JobMarket.extraFund({ from: jobOwner });
            assert(_extraFund == web3.utils.toWei("2", "ether"));
        });

        it("should give an error \"Insufficient Balance\" with extra fund.", async () => {
            let _error;
            let _jobBudget = web3.utils.toWei("3", "ether");
            await _JobMarket.registerJob("Food Delivery 1", "B to C", _jobBudget, { from: jobOwner }).then().catch(err => _error = err);
            assert(_error.reason === 'Insufficient Balance.');
        });

        it("should emit event \"JobRegistered\" with extra fund.", async () => {
            let _jobBudget = web3.utils.toWei("2", "ether");
            const _event = await _JobMarket.registerJob("Food Delivery 1", "B to C", _jobBudget, { from: jobOwner });
            assert(_event.logs[0].event === 'JobRegistered');
        });

        it("job Owner extra fund should be 0ETH now.", async () => {
            let _extraFund = await _JobMarket.extraFund({ from: jobOwner });
            assert(_extraFund == web3.utils.toWei("0", "ether"));
        });

        it("job with Ids 1 & 2 should be valid.", async () => {
            const _registerJob1 = await _JobMarket._jobs(1);
            assert(_registerJob1.isJobValid == true, "Job1");
            const _registerJob2 = await _JobMarket._jobs(2);
            assert(_registerJob2.isJobValid == true, "Job2");
        });

        it("job with Id 3 should be invalid.", async () => {
            const _registerJob = await _JobMarket._jobs(3);
            assert(_registerJob.isJobValid == false);
        });

        it("JobMarket contract should have 12 ETH balance.", async () => {
            let _beforeBalance = await web3.eth.getBalance(_JobMarket.address);
            assert(_beforeBalance == (web3.utils.toWei("12", "ether")));
            // await _JobMarket.withdrawExtraAmount({ from: jobOwner });
            // let _afterBalance = await web3.eth.getBalance(_JobMarket.address);
            // assert(_beforeBalance !=_afterBalance);
        });
    });

    describe('Worker register themselves and place bid.',  () => {

        it("should emit event \"WorkerRegisterSuccessfully\".", async () => {
            const _event = await _JobMarket.registerWorker("Shubham", { from: jobWorker1 });
            // console.log(_event.logs[0].event);
            assert(_event.logs[0].event === 'WorkerRegisterSuccessfully');
        });

        it("should give an error \"AlreadyWorker\".", async () => {
            let _error
            // web3.eth.handleRevert = true;
            await _JobMarket.registerWorker("Shubham", { from: jobWorker1 }).then().catch(err => _error = err);
            // console.log(_error.data.message);
            // console.log(_error);
            // assert(_error.data.message === 'revert');
            assert(_error.data.reason === 'AlreadyWorker');
        });

        it("should give an error \"InvalidWorker\".", async () => {
            let _error;
            let _jobBudget = web3.utils.toWei("7", "ether");
            await _JobMarket.bidJob(1, _jobBudget, { from: jobWorker2 }).then().catch(err => _error = err);
            // assert(_error.data.message === 'revert');
            assert(_error.data.reason === 'InvalidWorker');
        });

        it("should give an error \"NotBided\".", async () => {
            let _error;
            let _jobBudget = web3.utils.toWei("6", "ether");
            await _JobMarket.modifyBid(1, _jobBudget, { from: jobWorker1 }).then().catch(err => _error = err);
            // assert(_error.data.message === 'revert');
            assert(_error.data.reason === 'NotBided');
        });

        it("should give an error \"OverBudget\".", async () => {
            let _error;
            let _jobBudget = web3.utils.toWei("11", "ether");
            await _JobMarket.bidJob(1, _jobBudget, { from: jobWorker1 }).then().catch(err => _error = err);
            // assert(_error.data.message === 'revert');
            assert(_error.data.reason === 'OverBudget');
        });

        it("should emit event \"SuccessfullyBid\" for job Id 1 by jobWorker1.", async () => {
            let _jobBudget = web3.utils.toWei("6", "ether");
            const _event = await _JobMarket.bidJob(1, _jobBudget, { from: jobWorker1 });
            // console.log(_event);
            assert(_event.logs[0].event === 'SuccessfullyBid');
        });

        it("should give an error \"GreaterThanPreviousBid\" for job Id 1 by jobWorker 1.", async () => {
            let _error;
            let _jobBudget = web3.utils.toWei("7", "ether");
            await _JobMarket.modifyBid(1, _jobBudget, { from: jobWorker1 }).then().catch(err => _error = err);
            // assert(_error.data.message === 'revert');
            assert(_error.data.reason === 'GreaterThanPreviousBid');
        });

        it("should emit event \"BidModifiedSuccessfully\" for job Id 1 by jobWorker 1.", async () => {
            let _jobBudget = web3.utils.toWei("5", "ether");
            const _event = await _JobMarket.modifyBid(1, _jobBudget, { from: jobWorker1 });
            assert(_event.logs[0].event === 'BidModifiedSuccessfully');
        });

        it("should revert with \"Only job worker allowed\".", async () => {
            let _error
            await _JobMarket.jobDone(1, { from: jobWorker1 }).then().catch(err => _error = err);
            // console.log(_error.data.reason);
            assert(_error.data.reason === 'Only job worker allowed.');
        });

        it("register multiple workers and place bid", async () => {
            let _event;
            _event = await _JobMarket.registerWorker("Mohit", { from: jobWorker2 });
            assert(_event.logs[0].event === 'WorkerRegisterSuccessfully', "register jobWorker2");

            _event = await _JobMarket.bidJob(2, web3.utils.toWei("1", "ether"), { from: jobWorker2 });
            assert(_event.logs[0].event === 'SuccessfullyBid', "place bid jobWorker2");

            _event = await _JobMarket.registerWorker("Prajakta", { from: jobWorker3 });
            assert(_event.logs[0].event === 'WorkerRegisterSuccessfully', "register jobWorker3");

            _event = await _JobMarket.bidJob(1, web3.utils.toWei("7", "ether"), { from: jobWorker3 });
            assert(_event.logs[0].event === 'SuccessfullyBid', "place bid jobWorker2");

            _event = await _JobMarket.registerWorker("Sahil", { from: jobWorker4 });
            assert(_event.logs[0].event === 'WorkerRegisterSuccessfully', "register jobWorker4");

            _event = await _JobMarket.bidJob(2, web3.utils.toWei("2", "ether"), { from: jobWorker4 });
            assert(_event.logs[0].event === 'SuccessfullyBid', "place bid jobWorker2");
        });
    });

    describe('JobOwner accept bid.',  () => {
        it("job should be invalid.", async () => {
            let _error;
            await _JobMarket.acceptBid(3, jobWorker2, { from: jobWorker1 }).then().catch(err => _error = err);
            assert(_error.data.reason === 'Job does not exists.');
        });

        it("bid should not be accepted by anyone except job owner.", async () => {
            let _error;
            await _JobMarket.acceptBid(1, jobWorker2, { from: jobWorker1 }).then().catch(err => _error = err);
            // console.log(_error);
            assert(_error.data.reason === 'Only owner of the job will accept the bid.');

        });

        it("worker should be Invalid.", async () => {
            let _error;
            await _JobMarket.acceptBid(1, jobWorker5, { from: jobOwner }).then().catch(err => _error = err);
            assert(_error.data.reason === 'InvalidWorker');
        });

        it("should valid worker & emit event \"BidAccepted\" for job Id 1 - jobWorker1.", async () => {
            let _event = await _JobMarket.acceptBid(1, jobWorker1, { from: jobOwner });
            assert(_event.logs[0].event === 'BidAccepted');
        });

        it("job Id 1 should not be re-assign.", async () => {
            let _error;
            await _JobMarket.acceptBid(1, jobWorker2, { from: jobOwner }).then().catch(err => _error = err);
            assert(_error.data.reason === 'Worker already assigned.');
        });

        it("job should not assign to already working worker(jobWorker1).", async () => {
            let _error;
            await _JobMarket.acceptBid(2, jobWorker1, { from: jobOwner }).then().catch(err => _error = err);
            assert(_error.data.reason === 'AlreadyWorking');
        });

        it("should valid worker & emit event \"BidAccepted\" for job Id 2 - jobWorker2.", async () => {
            let _event = await _JobMarket.acceptBid(2, jobWorker2, { from: jobOwner });
            assert(_event.logs[0].event === 'BidAccepted');
        });

        it("job owner extra fund should be 6ETH after accept bid's.", async () => {
            let _extraFund = await _JobMarket.extraFund({ from: jobOwner });
            assert(_extraFund == web3.utils.toWei("6", "ether"));
        });

        it("job owner should withdraw extra fund.", async () => {
            let _beforeBalanceJobOwner = await web3.eth.getBalance(jobOwner);
            let _event = await _JobMarket.withdrawExtraFund({ from: jobOwner });
            assert(_event.logs[0].event === 'FundWithdrawSuccessfully');
            let _afterBalanceJobOwner = await web3.eth.getBalance(jobOwner);
            assert(_beforeBalanceJobOwner != _afterBalanceJobOwner);
        });

        it("should return array of all bider by jobId", async () => {
            let _allBidersJob1Array = [jobWorker1, jobWorker3];
            let _allBidersJob2Array = [jobWorker2, jobWorker4];
            let _allBidersJob1 = await _JobMarket.allBiders(1, { from: jobOwner });
            assert(_allBidersJob1[0] == _allBidersJob1Array[0]);
            assert(_allBidersJob1[1] == _allBidersJob1Array[1]);
            let _allBidersJob2 = await _JobMarket.allBiders(2, { from: jobOwner });
            assert(_allBidersJob2[0] == _allBidersJob2Array[0]);
            assert(_allBidersJob2[1] == _allBidersJob2Array[1]);
            // console.log(_allBidersJob1Array, _allBidersJob2Array)
        });
    });

    describe('Worker after bid accepted.',  () => {
        it("job should not be complete by anyone except jobWorker.", async () => {
            let _error; 
            await _JobMarket.jobDone(1, { from: jobWorker2 }).then().catch(err => _error = err);
            assert(_error.data.reason === 'Only job worker allowed.');
        });

        it("job should be complete by jobWorker and get paid.", async () => {
            let _beforeBalanceJobWorker1 = web3.eth.getBalance(jobWorker1);
            let _event1 = await _JobMarket.jobDone(1, { from: jobWorker1 });
            let _afterBalanceJobWorker1 = web3.eth.getBalance(jobWorker1);
            assert(_event1.logs[0].event === 'jobCompleted', "Job Not Completed jobWorker1");
            assert(_beforeBalanceJobWorker1 != _afterBalanceJobWorker1, "Not get paid jobWorker1");

            let _beforeBalanceJobWorker2 = web3.eth.getBalance(jobWorker1);
            let _event2 = await _JobMarket.jobDone(2, { from: jobWorker2 });
            let _afterBalanceJobWorker2 = web3.eth.getBalance(jobWorker2);
            assert(_event2.logs[0].event === 'jobCompleted', "Job Not Completed jobWorker2");
            assert(_beforeBalanceJobWorker2 != _afterBalanceJobWorker2, "Not get paid jobWorker2");
        });

        it("job should not be completed again by jobWorker.", async () => {
            let _error; 
            await _JobMarket.jobDone(1, { from: jobWorker1 }).then().catch(err => _error = err);
            assert(_error.data.reason === 'Job already completed.');
        });

        it("JobMarket contract balance should be 0ETH.", async () => {
            assert(web3.utils.toWei("0", "ether") == await web3.eth.getBalance(_JobMarket.address));
        });
    });
});