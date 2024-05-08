//2_deploy_contracts
// Assuming VotingContract.sol is your contract file name
const VotingContract = artifacts.require("VotingContract");

module.exports = function(deployer) {
  const votingPeriodInSeconds = 90;
  deployer.deploy(VotingContract, votingPeriodInSeconds)
    .then(() => {
        // If you need to perform actions after deployment, do them here.
        console.log("VotingContract deployed to:", VotingContract.address);
        // Note: Logging the address here might not work as expected because deployment is asynchronous.
        // You might need to access the deployed instance differently if you need the address immediately.
    });
};