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

    describe('Job Owner register job.', async () => {

        it("should give an error \"Insufficient Balance\".", async () => {
            let _error;
            await _JobMarket.registerJob("Food Delivery 1", "B to C", 11, { value: web3.utils.toWei("10", "ether"), from: jobOwner }).then().catch(err => _error = err);
            // console.log(_error.reason);
            assert(_error.reason === 'Insufficient Balance.');
        });

        it("should register a job.", async () => {
            const _event = await _JobMarket.registerJob("Food Delivery", "A to B", 10, { value: web3.utils.toWei("10", "ether"), from: jobOwner });
            // console.log(_event.logs[0].event);
            assert(_event.logs[0].event === 'JobRegistered');
        });

        it("job should be valid.", async () => {
            const _registerJob = await _JobMarket._jobs(1);
            // console.log(_registerJob);
            // console.log(_registerJob.jobOwner);
            assert(_registerJob.isJobValid == true);
        });

        it("job should not valid.", async () => {
            const _registerJob = await _JobMarket._jobs(2);
            // console.log(_registerJob);
            assert(_registerJob.isJobValid == false);
        });

        it("JobMarket contract should have 10 ETH balance.", async () => {
            let _beforeBalance = await web3.eth.getBalance(_JobMarket.address);
            assert(_beforeBalance == (web3.utils.toWei("10", "ether")));
            // await _JobMarket.withdrawExtraAmount({ from: jobOwner });
            // let _afterBalance = await web3.eth.getBalance(_JobMarket.address);
            // assert(_beforeBalance !=_afterBalance);
        });
    });

    describe('Worker register themselves and place bid.', async () => {

        it("should emit event \"WorkerRegisterSuccessfully\".", async () => {
            const _event = await _JobMarket.registerWorker("Shubham", {from: jobWorker1 });
            // console.log(_event.logs[0].event);
            assert(_event.logs[0].event  === 'WorkerRegisterSuccessfully');
        });

        it("should give an error \"AlreadyWorker\".", async () => {
            let _error
            await _JobMarket.registerWorker("Shubham", {from: jobWorker1 }).then().catch(err => _error = err);
            // console.log(_error.data.message);
            assert(_error.data.message === 'revert');
        });

        it("should give an error \"InvalidWorker\".", async () => {
            let _error;
            await _JobMarket.bidJob(1, 7,{from: jobWorker2}).then().catch(err => _error = err);
            assert(_error.data.message === 'revert');
        });

        it("should give an error \"NotBided\".", async () => {
            let _error;
            await _JobMarket.modifyBid(1, 6,{from: jobWorker1}).then().catch(err => _error = err);
            assert(_error.data.message === 'revert');
        });

        it("should give an error \"OverBudget\".", async () => {
            let _error;
            await _JobMarket.bidJob(1, 11,{from: jobWorker1}).then().catch(err => _error = err);
            assert(_error.data.message === 'revert');
        });

        it("should emit \"SuccessfullyBid\.", async () => {
            const _event = await _JobMarket.bidJob(1, 6,{from: jobWorker1});
            // console.log(_event);
            assert(_event.logs[0].event === 'SuccessfullyBid');
        });

        it("should give an error \"GreaterThanPreviousBid\".", async () => {
            let _error;
            await _JobMarket.modifyBid(1, 7,{from: jobWorker1}).then().catch(err => _error = err);
            assert(_error.data.message === 'revert');
        });

        it("should emit \"BidModifiedSuccessfully\".", async () => {
            const _event = await _JobMarket.modifyBid(1, 5,{from: jobWorker1});
            assert(_event.logs[0].event === 'BidModifiedSuccessfully');
        });

        it("should revert with \"Only job worker allowed\".", async () => {
            let _error
            await _JobMarket.jobDone(1,{from: jobWorker1}).then().catch(err => _error = err);
            // console.log(_error.data.reason);
            assert(_error.data.reason === 'Only job worker allowed.');
        });

        it("register multiple workers and place bid", async () => {
            let _event;
            _event = await _JobMarket.registerWorker("Mohit", { from: jobWorker2 });
            assert(_event.logs[0].event === 'WorkerRegisterSuccessfully', "register jobWorker2");
            _event = await _JobMarket.bidJob(1, 4,{from: jobWorker2});
            assert(_event.logs[0].event === 'SuccessfullyBid', "place bid jobWorker2");
            _event = await _JobMarket.registerWorker("Prajakta", {from: jobWorker3 });
            assert(_event.logs[0].event === 'WorkerRegisterSuccessfully', "register jobWorker3");
            _event = await _JobMarket.bidJob(1, 3,{from: jobWorker3});
            assert(_event.logs[0].event === 'SuccessfullyBid', "place bid jobWorker2");
            _event = await _JobMarket.registerWorker("Sahil", {from: jobWorker4 });
            assert(_event.logs[0].event === 'WorkerRegisterSuccessfully', "register jobWorker4");
            _event = await _JobMarket.bidJob(1, 2,{from: jobWorker4});
            assert(_event.logs[0].event === 'SuccessfullyBid', "place bid jobWorker2");
        });

    });

});