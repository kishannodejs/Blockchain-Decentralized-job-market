const JobMarket = artifacts.require("JobMarket");

contract('JobMarket', address => {
    let _JobMarket;
    // before(async () => {
    //     _JobMarket = await JobMarket.deployed();
    //     console.log("JobMarket ", _JobMarket.address);
    // });
    
    it("Should deployed all contract properly.", async () => {
        _JobMarket = await JobMarket.deployed();
        console.log("JobMarket ", _JobMarket.address);
        assert(_JobMarket.address !== '');
    })
});