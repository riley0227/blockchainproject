pragma solidity ^0.5.16;

contract VotingContract {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Vote {
        address voter;
        uint candidateId;
    }

    mapping(address => bool) public hasVoted;
    mapping(uint => Candidate) public candidates;
    mapping(address => Vote) public votes;
    mapping(uint => address) public studentIdToAddress; // Maps student IDs to addresses
    uint public candidatesCount;

    uint public startTime;
    uint public votingDuration;

    event Voted(address indexed _voter, uint indexed _studentId, uint indexed _candidateId);
    event CandidateAdded(address indexed _adder, uint indexed _studentId, uint indexed _candidateId, string _name);

    constructor(uint _votingDuration) public {
        startTime = now; // 'now' is an alias for 'block.timestamp', which gets the current block timestamp
        votingDuration = _votingDuration; // Set the voting duration in seconds

        addCandidate("Candidate 1", 10001);
        addCandidate("Candidate 2", 10002);
    }

    modifier withinVotingPeriod() {
        require(now <= startTime + votingDuration, "Voting period has ended.");
        _;
    }

    function addCandidate(string memory _name, uint _studentId) public withinVotingPeriod {
        require(studentIdToAddress[_studentId] == address(0) || studentIdToAddress[_studentId] == msg.sender, "This student ID is already used with a different address.");
        if (studentIdToAddress[_studentId] == address(0)) {
            studentIdToAddress[_studentId] = msg.sender;
        }
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(msg.sender, _studentId, candidatesCount, _name);
    }

    function vote(uint _candidateId, uint _studentId) public withinVotingPeriod {
        require(studentIdToAddress[_studentId] == address(0) || studentIdToAddress[_studentId] == msg.sender, "This student ID is already used with a different address.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate.");
        require(!hasVoted[msg.sender], "You have already voted.");

        if (studentIdToAddress[_studentId] == address(0)) {
            studentIdToAddress[_studentId] = msg.sender;
        }

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        votes[msg.sender] = Vote(msg.sender, _candidateId);

        emit Voted(msg.sender, _studentId, _candidateId);
    }
}
