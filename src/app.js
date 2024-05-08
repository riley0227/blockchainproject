const contractAddress = '0xF273449365a3963fb948F5A3262906809e6F1CE9';

let contract; // Global contract instance
let signer; // Global signer

document.addEventListener('DOMContentLoaded', async () => {
  await initWeb3();
  setupEventListeners();
  await displayVotingEndTime(); // Initialize the timer display
  await displayResults();
});

async function initWeb3() {
  if (typeof ethereum !== 'undefined') {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, votingABI, signer);
  } else {
      console.error("Ethereum object doesn't exist!");
  }
}

async function setupEventListeners() {
  document.getElementById('voteButton').addEventListener('click', async () => {
      const selectedCandidateId = parseInt(document.getElementById('voteOption').value);
      await voteForCandidate(selectedCandidateId);
  });

  document.getElementById('addCandidateButton').addEventListener('click', async () => {
      const candidateName = document.getElementById('newCandidateName').value.trim();
      if (candidateName) {
          await addCandidate(candidateName);
      } else {
          alert("Please enter a candidate name.");
      }
  });
}

async function addCandidate(name) {
  const studentId = document.getElementById('studentID').value.trim();
  if (studentId.length !== 9 || isNaN(parseInt(studentId))) {
      alert("Please enter a valid 9-digit Student ID.");
      return;
  }
  console.log('Adding candidate with name:', name);
  console.log('Student ID:', studentId);
  try {
      const addCandidateTx = await contract.addCandidate(name, studentId);
      await addCandidateTx.wait();
      console.log(`${name} added as a candidate.`);
      await displayResults(); // Refresh the candidates list
  } catch (error) {
      console.error('Error adding candidate:', error);
      handleAddCandidateError(error);
  }
}

function handleAddCandidateError(error) {
  console.error('Error adding candidate:', error);
  let errorMessage = error.data && error.data.message ? error.data.message : error.message;

  if (/revert/.test(errorMessage)) {
      let match = errorMessage.match(/revert (.*)/);
      let reason = match ? match[1] : 'Transaction failed. Please try again.';

      if (/This student ID is already used with a different address/.test(reason)) {
          alert("Failed to add candidate: This student ID is already associated with a different address.");
      } else {
          alert(`Failed to add candidate: ${reason}`);
      }
  } else {
      // Generic error handling if the revert reason can't be extracted
      alert('Failed to add candidate. Please ensure your inputs are correct and try again.');
  }
}



async function voteForCandidate(candidateId) {
  const studentId = document.getElementById('studentID').value.trim();
  if (studentId.length !== 9 || isNaN(parseInt(studentId))) {
      alert("Please enter a valid 9-digit Student ID.");
      return;
  }
  console.log('Voting for candidate ID:', candidateId);
  console.log('Student ID:', studentId);
  try {
      const voteTx = await contract.vote(candidateId, studentId);
      await voteTx.wait();
      console.log('Vote cast successfully.');
      await displayResults(); // Refresh the results after voting
  } catch (error) {
      console.error('Error casting vote:', error);
      handleVoteError(error); // Recommended to refactor error handling into its own function
  }
}

function handleVoteError(error) {
  console.error('Vote error:', error);
  
  // Check if the error message is available in error.data for RPC errors
  let errorMessage = error.data && error.data.message ? error.data.message : error.message;
  
  // Use regular expressions to check for known revert reasons and map them to user-friendly messages
  if (/revert/.test(errorMessage)) {
      let match = errorMessage.match(/revert (.*)/);
      let reason = match ? match[1] : 'Transaction failed. Please try again.';
      
      if (/This student ID is already used with a different address./.test(reason)) {
          alert("Failed to vote: This student ID is already associated with a different address.");
      } else if (/Invalid candidate./.test(reason)) {
          alert("Failed to vote: The selected candidate is invalid.");
      } else if (/You have already voted./.test(reason)) {
          alert("Failed to vote: You have already cast your vote.");
      } else {
          alert(`Failed to vote: ${reason}`);
      }
  } else {
      // Generic error handling if the revert reason can't be extracted
      alert('Failed to vote. Please ensure your inputs are correct and try again.');
  }
}


async function displayVotingEndTime() {
  try {
      const startTime = await contract.startTime(); // Fetch the start time from the contract
      const votingDuration = await contract.votingDuration(); // Fetch the voting duration from the contract
      const endTime = Number(startTime) + Number(votingDuration);

      // Log start time and end time to the console
      console.log(`Start Time: ${startTime}`);
      console.log(`End Time: ${endTime}`);

      // Update countdown on the webpage
      updateCountdown(endTime); // Pass endTime in seconds
  } catch (error) {
      console.error("Failed to fetch voting times:", error);
      document.getElementById('timeRemaining').innerText = "Failed to load voting end time.";
  }
}




function updateCountdown(endTime) {
  const timer = setInterval(() => {
      const now = Math.floor(new Date().getTime() / 1000); // current time in seconds
      const timeLeft = endTime - now;

      if (timeLeft >= 0) {
          const hours = Math.floor(timeLeft / 3600);
          const minutes = Math.floor((timeLeft % 3600) / 60);
          const seconds = timeLeft % 60;

          document.getElementById('timeRemaining').innerText = `${hours}h ${minutes}m ${seconds}s`;
      } else {
          clearInterval(timer);
          document.getElementById('timeRemaining').innerText = "Voting has ended.";
      }
  }, 1000);
}

async function displayResults() {
  const resultsElement = document.getElementById('votingResults');
  const voteOptionElement = document.getElementById('voteOption'); // Get the dropdown menu element
  resultsElement.innerHTML = ''; // Clear previous results
  voteOptionElement.innerHTML = ''; // Clear existing options in the dropdown

  const candidatesCount = await contract.candidatesCount();

  for (let i = 1; i <= candidatesCount; i++) {
      const candidate = await contract.candidates(i);
      const resultItem = document.createElement('li');
      resultItem.textContent = `${candidate.name}: ${candidate.voteCount.toString()} votes`;
      resultsElement.appendChild(resultItem);

      // Create new option element for each candidate and add to the dropdown
      const optionElement = document.createElement('option');
      optionElement.value = candidate.id.toString();
      optionElement.textContent = candidate.name;
      voteOptionElement.appendChild(optionElement);
  }
}


const votingABI = [
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_studentId",
        "type": "uint256"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "startTime",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "votingDuration",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
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
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_studentId",
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
