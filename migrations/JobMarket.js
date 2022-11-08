const JobMarket = artifacts.require("JobMarket");

module.exports = function (deployer) {
  deployer.deploy(JobMarket);
};