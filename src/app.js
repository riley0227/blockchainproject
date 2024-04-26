const contractAddress = '0xB05AdA7716d64f1EC8f5e143e49546030Bb7acF2';
let contract;
let signer;

async function displayVotingTimes() {
  const votingStartTime = await contract.getVotingStartTime();
  const votingEndTime = await contract.getVotingEndTime();
  
  const startTime = new Date(votingStartTime * 1000).toLocaleString();
  const endTime = new Date(votingEndTime * 1000).toLocaleString();
  
  document.getElementById('votingStartTime').textContent = `Voting starts at: ${startTime}`;
  document.getElementById('votingEndTime').textContent = `Voting ends at: ${endTime}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await initWeb3();
  setupEventListeners();
  displayVotingPeriod();
});

async function initWeb3() {
  try {
      if (typeof ethereum !== 'undefined') {
          await ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          signer = provider.getSigner();
          contract = new ethers.Contract(contractAddress, votingABI, signer);
          console.log("Contract initialized");
          await displayResults();
          await checkIfVoted();
      } else {
          console.error("Ethereum object doesn't exist!");
      }
  } catch (error) {
      console.error("initWeb3 error:", error);
  }
}

function setupEventListeners() {
  document.getElementById('voteButton').addEventListener('click', vote);
  document.getElementById('addCandidateButton').addEventListener('click', addCandidate);
}

async function vote() {
  const redID = document.getElementById('redIDInput').value;
  if (!isValidRedID(redID)) {
      alert("Invalid RedID.");
      return;
  }
  const selectedCandidateId = parseInt(document.getElementById('voteOption').value);
  document.getElementById('voteButton').disabled = true; // Disable the button immediately after click

  try {
    // First, check if the user has already voted
    const alreadyVoted = await contract.hasVoted(signer.getAddress());
    if (alreadyVoted) {
      alert("You have already voted.");
      document.getElementById('voteButton').disabled = false; // Re-enable the button
      return;
    }

    const transaction = await contract.vote(selectedCandidateId);
    await transaction.wait();
    console.log('Vote successfully cast.');
    await displayResults();
  } catch (error) {
    console.error("Vote button error:", error);
    alert("Failed to cast vote: " + error.message); // Provide error feedback
  } finally {
    document.getElementById('voteButton').disabled = false; // Re-enable the button
  }
}

async function addCandidate() {
  const redID = document.getElementById('redIDInput').value;
  if (!isValidRedID(redID)) {
      alert("Invalid RedID.");
      return;
  }
  const candidateName = document.getElementById('newCandidateName').value.trim();
  document.getElementById('addCandidateButton').disabled = true;
  if (!candidateName) {
      alert("Please enter a candidate name.");
      return;
  }
  try {
      const transaction = await contract.addCandidate(candidateName);
      await transaction.wait();
      console.log(`${candidateName} added as a candidate.`);
      await displayResults();
  } catch (error) {
      console.error("Add candidate button error:", error);
  } finally {
      document.getElementById('addCandidateButton').disabled = false;
  }
}

function isValidRedID(redID) {
  return redID.length === 9 && (redID.startsWith('1') || redID.startsWith('8'));
}

async function displayResults() {
  try {
      const resultsElement = document.getElementById('votingResults');
      const voteOptionElement = document.getElementById('voteOption');
      resultsElement.innerHTML = '';  // Clear previous results
      voteOptionElement.innerHTML = '';  // Clear previous vote options

      const candidatesCount = await contract.candidatesCount();
      console.log(`Displaying results for ${candidatesCount} candidates.`);

      for (let i = 1; i <= candidatesCount; i++) {
          const candidate = await contract.candidates(i);
          const resultItem = document.createElement('li');
          resultItem.textContent = `${candidate.name}: ${candidate.voteCount.toString()} votes`;
          resultsElement.appendChild(resultItem);

          // Create new option element for each candidate and add to the dropdown
          const optionElement = new Option(candidate.name, candidate.id);
          voteOptionElement.appendChild(optionElement);
      }
  } catch (error) {
      console.error("displayResults error:", error);
  }
}

async function checkIfVoted() {
  try {
    const hasVoted = await contract.hasVoted(signer.getAddress());
    document.getElementById('voteButton').disabled = hasVoted;
  } catch (error) {
    console.error("Error checking voting status", error);
  }
}

async function displayVotingPeriod() {
  const startTime = await contract.votingStartTime();
  const endTime = await contract.votingEndTime();

  document.getElementById('votingStartTime').innerText = `Voting starts at: ${new Date(startTime * 1000).toLocaleString()}`;
  document.getElementById('votingEndTime').innerText = `Voting ends at: ${new Date(endTime * 1000).toLocaleString()}`;
}


// Update this with your voting contract's ABI
const votingABI = [
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "candidatesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "votes",
    "outputs": [
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];