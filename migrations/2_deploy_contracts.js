const VotingContract = artifacts.require("VotingContract");

module.exports = function(deployer) {
    deployer.deploy(VotingContract)
        .then(() => {
            return VotingContract.deployed();
        })
        .then(instance => {
            console.log("VotingContract deployed to:", instance.address);
        });
};
