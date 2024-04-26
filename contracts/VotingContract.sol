pragma solidity ^0.5.16;

contract VotingContract {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Define the Vote struct here
    struct Vote {
        address voter;
        uint candidateId;
    }

    mapping(address => bool) public hasVoted;
    mapping(uint => Candidate) public candidates;
    mapping(address => Vote) public votes; // Now the compiler knows what a Vote is
    uint public candidatesCount;

    event Voted(address indexed _voter, uint indexed _candidateId);
    event CandidateAdded(uint indexed _candidateId, string _name);

    constructor() public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender], "Already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate.");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        // Record the vote with a new Vote struct instance
        votes[msg.sender] = Vote(msg.sender, _candidateId);

        emit Voted(msg.sender, _candidateId);
    }
}