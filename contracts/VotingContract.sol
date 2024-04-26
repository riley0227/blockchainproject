pragma solidity ^0.5.16;

contract VotingContract {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    uint public votingStartTime;
    uint public votingEndTime;
    mapping(address => bool) public hasVoted;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    event CandidateAdded(uint indexed _candidateId, string _name);
    event Voted(address indexed _voter, uint indexed _candidateId);

    constructor() public {
        votingStartTime = now; // 'now' is an alias for block.timestamp
        votingEndTime = now + 2 days; // Sets the end time to 2 days from now
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function vote(uint _candidateId) public {
        require(now >= votingStartTime && now <= votingEndTime, "Voting is not active.");
        require(!hasVoted[msg.sender], "Already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate.");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit Voted(msg.sender, _candidateId);
    }

    // Helper function to check if voting is active
    function isVotingActive() public view returns (bool) {
        return now >= votingStartTime && now <= votingEndTime;
    }
}
