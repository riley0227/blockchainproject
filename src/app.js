const contractAddress = '0x54E9DFD9fF276B30ce82e8A7797236DEb2645aDA';

let contract; // Global contract instance
let signer; // Global signer

document.addEventListener('DOMContentLoaded', async () => {
    await initWeb3();
    setupEventListeners();
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

    // Call displayResults at the end of init to ensure contract is set up
    if (contract) await displayResults();
}

async function addCandidate(name) {
  try {
      const addCandidateTx = await contract.addCandidate(name);
      const receipt = await addCandidateTx.wait();
      console.log(`${name} added as a candidate. Transaction receipt:`, receipt);
      await displayResults(); // Refresh the candidates list
  } catch (error) {
      console.error('Error adding candidate:', error);
      
      // Check for a transaction hash on the error object
      if (error.transactionHash) {
          console.log(`Transaction Hash: ${error.transactionHash}`);
          try {
              // Retrieve the transaction receipt using the hash
              const failedTransactionReceipt = await signer.provider.getTransactionReceipt(error.transactionHash);
              console.error('Failed transaction receipt:', failedTransactionReceipt);
          } catch (receiptError) {
              console.error('Error fetching transaction receipt:', receiptError);
          }
      }
      
      alert(`Failed to add candidate. Error: ${error.message}`);
  }
}


async function voteForCandidate(candidateId) {
    try {
        const voteTx = await contract.vote(candidateId);
        await voteTx.wait();
        console.log('Vote cast successfully.');
        await displayResults(); // Refresh the results after voting
    } catch (error) {
        console.error('Error casting vote:', error);
        alert('Failed to cast vote.');
    }
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