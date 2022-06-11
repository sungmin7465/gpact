import * as fs from 'fs';
import Web3 from 'web3';
import execSync from 'child_process';
import { MsgStore } from "./msgstore.js"
import { Executor } from "./executor.js"
import { ChainAPManager } from "./chainmgr.js";
import { Simulator, CrosschainCall } from "./simulator.js"

// Pre-set key and addr
const signerKey = "c96e489ac9cc2211144d4e428d6cfbe29aa7822e38ea7721ad9f6ed920b203bb";
const signerAddr = "0xfBdfD9c515c4b696D5133bE894A674b61f84229B";
const sellerKey = "98f2a9ea4797679231a1771fe8475e947b80e31fb4dd0289e6475a8e4ca9fbc3";
const sellerAddr = "0xBB7C00f1dd65bCE0e10a6B6228Dff430C9c1C871";
const buyerKey = "c4e8789cac69d6d962ce279812fdf06a194801beef6d35ab062d1b3972c0d384";
const buyerAddr = "0x9F2758f2e0e9A5c4Ba389035C4c2895232d84b46";
let chainA;
let chainB;
let gpactAddrA;
let gpactAddrB;
let bridgeAddrA;
let bridgeAddrB;
let nftAddrA;
let tokenAddrB;

  // Get ABI & Bin for register, verifier, gpact and application.

  // MessagingRegistrar
  let regABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        }
      ],
      "name": "addSigner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newSigningThreshold",
          "type": "uint256"
        }
      ],
      "name": "addSignerSetThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bcId",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "_signers",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "_newSigningThreshold",
          "type": "uint256"
        }
      ],
      "name": "addSignersSetThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "_signers",
          "type": "address[]"
        }
      ],
      "name": "checkThreshold",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        }
      ],
      "name": "getSigningThreshold",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_mightBeSigner",
          "type": "address"
        }
      ],
      "name": "isSigner",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        }
      ],
      "name": "numSigners",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        }
      ],
      "name": "removeSigner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newSigningThreshold",
          "type": "uint256"
        }
      ],
      "name": "removeSignerSetThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bcId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_newSigningThreshold",
          "type": "uint256"
        }
      ],
      "name": "setThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "_signers",
          "type": "address[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_sigR",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_sigS",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint8[]",
          "name": "_sigV",
          "type": "uint8[]"
        },
        {
          "internalType": "bytes",
          "name": "_plainText",
          "type": "bytes"
        }
      ],
      "name": "verify",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "_signers",
          "type": "address[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_sigR",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_sigS",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint8[]",
          "name": "_sigV",
          "type": "uint8[]"
        },
        {
          "internalType": "bytes",
          "name": "_plainText",
          "type": "bytes"
        }
      ],
      "name": "verifyAndCheckThreshold",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
let regBIN = "0x608060405234801561001057600080fd5b50600080546001600160a01b031916339081178255604051909182917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a350611177806100616000396000f3fe608060405234801561001057600080fd5b50600436106100f45760003560e01c80638da5cb5b11610097578063d4c0d34d11610066578063d4c0d34d14610223578063ea13ec8b14610236578063f2fde38b14610249578063f5e232ea1461025c57600080fd5b80638da5cb5b146101b4578063a64ce199146101cf578063ad107bb4146101fd578063b9c362091461021057600080fd5b806348bcbd2d116100d357806348bcbd2d14610134578063715018a6146101865780638bd6ac821461018e5780638d7678fd146101a157600080fd5b8062ab2414146100f957806315a098251461010e5780633156d37c14610121575b600080fd5b61010c610107366004610d78565b610280565b005b61010c61011c366004610dad565b610301565b61010c61012f366004610dad565b6103d4565b610171610142366004610dad565b60008281526001602090815260408083206001600160a01b038516845260020190915290205460ff1692915050565b60405190151581526020015b60405180910390f35b61010c6104bf565b61017161019c366004610e25565b610533565b61010c6101af366004610e71565b610593565b6000546040516001600160a01b03909116815260200161017d565b6101ef6101dd366004610ec4565b60009081526001602052604090205490565b60405190815260200161017d565b61017161020b366004610f1f565b610651565b61010c61021e36600461101f565b610682565b61010c610231366004610d78565b6106d1565b610171610244366004610f1f565b610722565b61010c610257366004611041565b6109ae565b6101ef61026a366004610ec4565b6000908152600160208190526040909120015490565b6000546001600160a01b031633146102b35760405162461bcd60e51b81526004016102aa90611063565b60405180910390fd5b6102bd8383610a98565b600083815260016020819052604082208101546102d9916110ae565b60008581526001602081905260409091200181905590506102fb848284610b3a565b50505050565b6000546001600160a01b0316331461032b5760405162461bcd60e51b81526004016102aa90611063565b6000828152600160205260409020546103a45760405162461bcd60e51b815260206004820152603560248201527f43616e206e6f7420616464207369676e657220666f7220626c6f636b636861696044820152741b881dda5d1a081e995c9bc81d1a1c995cda1bdb19605a1b60648201526084016102aa565b6103ae8282610a98565b60008281526001602081905260408220018054916103cb836110c6565b91905055505050565b6000546001600160a01b031633146103fe5760405162461bcd60e51b81526004016102aa90611063565b6104088282610bfb565b6000828152600160208190526040822081015461042591906110e1565b6000848152600160205260409020549091508110156104a45760405162461bcd60e51b815260206004820152603560248201527f50726f706f736564206e6577206e756d626572206f66207369676e65727320696044820152741cc81b195cdcc81d1a185b881d1a1c995cda1bdb19605a1b60648201526084016102aa565b60009283526001602081905260409093209092019190915550565b6000546001600160a01b031633146104e95760405162461bcd60e51b81526004016102aa90611063565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b60008381526001602052604081205482908110156105885760405162461bcd60e51b81526020600482015260126024820152714e6f7420656e6f756768207369676e65727360701b60448201526064016102aa565b506001949350505050565b6000546001600160a01b031633146105bd5760405162461bcd60e51b81526004016102aa90611063565b60005b8281101561060a576105f8858585848181106105de576105de6110f8565b90506020020160208101906105f39190611041565b610a98565b80610602816110c6565b9150506105c0565b506000848152600160208190526040822001546106289084906110ae565b600086815260016020819052604090912001819055905061064a858284610b3a565b5050505050565b600061065e8c8c8c610533565b506106728c8c8c8c8c8c8c8c8c8c8c610722565b9c9b505050505050505050505050565b6000546001600160a01b031633146106ac5760405162461bcd60e51b81526004016102aa90611063565b6106cd82600160008581526020019081526020016000206001015483610b3a565b5050565b6000546001600160a01b031633146106fb5760405162461bcd60e51b81526004016102aa90611063565b6107058383610bfb565b600083815260016020819052604082208101546102d991906110e1565b60008988811461076b5760405162461bcd60e51b81526020600482015260146024820152730e6d2cea440d8cadccee8d040dad2e6dac2e8c6d60631b60448201526064016102aa565b8087146107b15760405162461bcd60e51b81526020600482015260146024820152730e6d2cea640d8cadccee8d040dad2e6dac2e8c6d60631b60448201526064016102aa565b8085146107f75760405162461bcd60e51b81526020600482015260146024820152730e6d2ceac40d8cadccee8d040dad2e6dac2e8c6d60631b60448201526064016102aa565b60005b8181101561099a5760008e8152600160205260408120600201908e8e84818110610826576108266110f8565b905060200201602081019061083b9190611041565b6001600160a01b0316815260208101919091526040016000205460ff166108b25760405162461bcd60e51b815260206004820152602560248201527f5369676e6572206e6f74207369676e657220666f72207468697320626c6f636b60448201526431b430b4b760d91b60648201526084016102aa565b61093c8d8d838181106108c7576108c76110f8565b90506020020160208101906108dc9190611041565b86868e8e868181106108f0576108f06110f8565b905060200201358d8d87818110610909576109096110f8565b905060200201358c8c88818110610922576109226110f8565b9050602002016020810190610937919061110e565b610c99565b6109885760405162461bcd60e51b815260206004820152601860248201527f5369676e617475726520646964206e6f7420766572696679000000000000000060448201526064016102aa565b80610992816110c6565b9150506107fa565b5060019d9c50505050505050505050505050565b6000546001600160a01b031633146109d85760405162461bcd60e51b81526004016102aa90611063565b6001600160a01b038116610a3d5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016102aa565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b60008281526001602090815260408083206001600160a01b038516845260020190915290205460ff1615610b065760405162461bcd60e51b81526020600482015260156024820152745369676e657220616c72656164792065786973747360581b60448201526064016102aa565b60009182526001602081815260408085206001600160a01b039094168552600290930190529120805460ff19169091179055565b80821015610b985760405162461bcd60e51b815260206004820152602560248201527f4e756d626572206f66207369676e657273206c657373207468616e20746872656044820152641cda1bdb1960da1b60648201526084016102aa565b80610be55760405162461bcd60e51b815260206004820152601960248201527f5468726573686f6c642063616e206e6f74206265207a65726f0000000000000060448201526064016102aa565b6000928352600160205260409092209190915550565b60008281526001602090815260408083206001600160a01b038516845260020190915290205460ff16610c685760405162461bcd60e51b815260206004820152601560248201527414da59db995c88191bd95cc81b9bdd08195e1a5cdd605a1b60448201526064016102aa565b60009182526001602090815260408084206001600160a01b039093168452600290920190529020805460ff19169055565b6000808686604051610cac929190611131565b604051809103902090508260ff16601b14158015610cce57508260ff16601c14155b15610cdd576000915050610d52565b60408051600081526020810180835283905260ff851691810191909152606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610d30573d6000803e3d6000fd5b505050602060405103516001600160a01b0316886001600160a01b0316149150505b9695505050505050565b80356001600160a01b0381168114610d7357600080fd5b919050565b600080600060608486031215610d8d57600080fd5b83359250610d9d60208501610d5c565b9150604084013590509250925092565b60008060408385031215610dc057600080fd5b82359150610dd060208401610d5c565b90509250929050565b60008083601f840112610deb57600080fd5b50813567ffffffffffffffff811115610e0357600080fd5b6020830191508360208260051b8501011115610e1e57600080fd5b9250929050565b600080600060408486031215610e3a57600080fd5b83359250602084013567ffffffffffffffff811115610e5857600080fd5b610e6486828701610dd9565b9497909650939450505050565b60008060008060608587031215610e8757600080fd5b84359350602085013567ffffffffffffffff811115610ea557600080fd5b610eb187828801610dd9565b9598909750949560400135949350505050565b600060208284031215610ed657600080fd5b5035919050565b60008083601f840112610eef57600080fd5b50813567ffffffffffffffff811115610f0757600080fd5b602083019150836020828501011115610e1e57600080fd5b600080600080600080600080600080600060c08c8e031215610f4057600080fd5b8b359a5067ffffffffffffffff8060208e01351115610f5e57600080fd5b610f6e8e60208f01358f01610dd9565b909b50995060408d0135811015610f8457600080fd5b610f948e60408f01358f01610dd9565b909950975060608d0135811015610faa57600080fd5b610fba8e60608f01358f01610dd9565b909750955060808d0135811015610fd057600080fd5b610fe08e60808f01358f01610dd9565b909550935060a08d0135811015610ff657600080fd5b506110078d60a08e01358e01610edd565b81935080925050509295989b509295989b9093969950565b6000806040838503121561103257600080fd5b50508035926020909101359150565b60006020828403121561105357600080fd5b61105c82610d5c565b9392505050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b634e487b7160e01b600052601160045260246000fd5b600082198211156110c1576110c1611098565b500190565b60006000198214156110da576110da611098565b5060010190565b6000828210156110f3576110f3611098565b500390565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561112057600080fd5b813560ff8116811461105c57600080fd5b818382376000910190815291905056fea2646970667358221220370b6c45a48cf209e4d9d67adc17ff379509e6dd9da7e4a091dc2aa0064e8e8064736f6c634300080b0033"

// EventAttestationVerifier
let vefABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_registrar",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_encodedEvent",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "_signature",
          "type": "bytes"
        }
      ],
      "name": "decodeAndVerifyEvent",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    }
  ]
let vefBIN = "0x608060405234801561001057600080fd5b5060405161097d38038061097d83398101604081905261002f91610054565b600080546001600160a01b0319166001600160a01b0392909216919091179055610084565b60006020828403121561006657600080fd5b81516001600160a01b038116811461007d57600080fd5b9392505050565b6108ea806100936000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80634c1ce90214610030575b600080fd5b61004361003e366004610632565b610045565b005b606080606080600061008c87878080601f016020809104026020016040519081016040528093929190818152602001838380828437600092018290525092506104b0915050565b905061009f605563ffffffff83166106cb565b6100aa9060046106ea565b86146100fd5760405162461bcd60e51b815260206004820152601a60248201527f5369676e617475726520696e636f7272656374206c656e67746800000000000060448201526064015b60405180910390fd5b8063ffffffff1667ffffffffffffffff81111561011c5761011c610702565b604051908082528060200260200182016040528015610145578160200160208202803683370190505b5094508063ffffffff1667ffffffffffffffff81111561016757610167610702565b604051908082528060200260200182016040528015610190578160200160208202803683370190505b5093508063ffffffff1667ffffffffffffffff8111156101b2576101b2610702565b6040519080825280602002602001820160405280156101db578160200160208202803683370190505b5092508063ffffffff1667ffffffffffffffff8111156101fd576101fd610702565b604051908082528060200260200182016040528015610226578160200160208202803683370190505b509150600460005b8263ffffffff168110156104145761027d89898080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250869250610516915050565b87828151811061028f5761028f610718565b6001600160a01b03909216602092830291909101909101526102b26014836106ea565b91506102f589898080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525086925061051e915050565b86828151811061030757610307610718565b60200260200101818152505060208261032091906106ea565b915061036389898080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525086925061051e915050565b85828151811061037557610375610718565b60200260200101818152505060208261038e91906106ea565b91506103d189898080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250869250610583915050565b8482815181106103e3576103e3610718565b60ff909216602092830291909101909101526104006001836106ea565b91508061040c8161072e565b91505061022e565b50505060008054906101000a90046001600160a01b03166001600160a01b031663ad107bb48b868686868e8e6040518863ffffffff1660e01b815260040161046297969594939291906107e0565b602060405180830381865afa15801561047f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104a3919061088b565b5050505050505050505050565b60006104bd8260046106ea565b8351101561050d5760405162461bcd60e51b815260206004820152601d60248201527f736c6963696e67206f7574206f662072616e6765202875696e7433322900000060448201526064016100f4565b50016004015190565b016014015190565b60008060005b602081101561057b576105388160086106cb565b8561054383876106ea565b8151811061055357610553610718565b01602001516001600160f81b031916901c9190911790806105738161072e565b915050610524565b509392505050565b60006105908260016106ea565b835110156105e05760405162461bcd60e51b815260206004820152601c60248201527f736c6963696e67206f7574206f662072616e6765202875696e7438290000000060448201526064016100f4565b50016001015190565b60008083601f8401126105fb57600080fd5b50813567ffffffffffffffff81111561061357600080fd5b60208301915083602082850101111561062b57600080fd5b9250929050565b6000806000806000806080878903121561064b57600080fd5b8635955060208701359450604087013567ffffffffffffffff8082111561067157600080fd5b61067d8a838b016105e9565b9096509450606089013591508082111561069657600080fd5b506106a389828a016105e9565b979a9699509497509295939492505050565b634e487b7160e01b600052601160045260246000fd5b60008160001904831182151516156106e5576106e56106b5565b500290565b600082198211156106fd576106fd6106b5565b500190565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b6000600019821415610742576107426106b5565b5060010190565b600081518084526020808501945080840160005b838110156107795781518752958201959082019060010161075d565b509495945050505050565b600081518084526020808501945080840160005b8381101561077957815160ff1687529582019590820190600101610798565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b600060c08201898352602060c081850152818a5180845260e086019150828c01935060005b8181101561082a5784516001600160a01b031683529383019391830191600101610805565b5050848103604086015261083e818b610749565b9250505082810360608401526108548188610749565b905082810360808401526108688187610784565b905082810360a084015261087d8185876107b7565b9a9950505050505050505050565b60006020828403121561089d57600080fd5b815180151581146108ad57600080fd5b939250505056fea2646970667358221220add0f304412513afbdbd5b06eb9017d3c4cc76153f041f7808a5a2b5b0ee45e764736f6c634300080b0033"

// CrosschainControl
let gpactABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_myBlockchainId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_expectedBlockchainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_actualBlockchainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_expectedContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_actualContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "_expectedFunctionCall",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "_actualFunctionCall",
          "type": "bytes"
        }
      ],
      "name": "BadCall",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "_revertReason",
          "type": "string"
        }
      ],
      "name": "CallFailure",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_contract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "_functionCall",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "_result",
          "type": "bytes"
        }
      ],
      "name": "CallResult",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_val1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_val2",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_val3",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "_val4",
          "type": "bytes"
        }
      ],
      "name": "Dump",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_expectedNumberOfCalls",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_actualNumberOfCalls",
          "type": "uint256"
        }
      ],
      "name": "NotEnoughCalls",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_crossBlockchainTransactionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "_success",
          "type": "bool"
        }
      ],
      "name": "Root",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_crossBlockchainTransactionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_hashOfCallGraph",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "_callPath",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "address[]",
          "name": "_lockedContracts",
          "type": "address[]"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "_success",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "_returnValue",
          "type": "bytes"
        }
      ],
      "name": "Segment",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_rootBcId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_crossBlockchainTransactionId",
          "type": "uint256"
        }
      ],
      "name": "Signalling",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_crossBlockchainTransactionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_caller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_timeout",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "_callGraph",
          "type": "bytes"
        }
      ],
      "name": "Start",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "activeCallCrosschainRootTxId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_cbc",
          "type": "address"
        }
      ],
      "name": "addRemoteCrosschainControl",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_contractToLock",
          "type": "address"
        }
      ],
      "name": "addToListOfLockedContracts",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_verifier",
          "type": "address"
        }
      ],
      "name": "addVerifier",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_contract",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_functionCallData",
          "type": "bytes"
        }
      ],
      "name": "crossBlockchainCall",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_blockchainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_contract",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_functionCallData",
          "type": "bytes"
        }
      ],
      "name": "crossBlockchainCallReturnsUint256",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveCallCrosschainRootTxId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isSingleBlockchainCall",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "myBlockchainId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "_blockchainIds",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "_cbcAddresses",
          "type": "address[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_eventFunctionSignatures",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes[]",
          "name": "_eventData",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes[]",
          "name": "_signatures",
          "type": "bytes[]"
        }
      ],
      "name": "root",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "rootTransactionInformation",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "_blockchainIds",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "_cbcAddresses",
          "type": "address[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_eventFunctionSignatures",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes[]",
          "name": "_eventData",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes[]",
          "name": "_signatures",
          "type": "bytes[]"
        },
        {
          "internalType": "uint256[]",
          "name": "_callPath",
          "type": "uint256[]"
        }
      ],
      "name": "segment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "segmentTransactionExecuted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "_blockchainIds",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "_cbcAddresses",
          "type": "address[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_eventFunctionSignatures",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes[]",
          "name": "_eventData",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes[]",
          "name": "_signatures",
          "type": "bytes[]"
        }
      ],
      "name": "signalling",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_crossBlockchainTransactionId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_timeout",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_callGraph",
          "type": "bytes"
        }
      ],
      "name": "start",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
let gpactBIN = "0x60806040523480156200001157600080fd5b5060405162003f2e38038062003f2e83398101604081905262000034916200007e565b600080546001600160a01b031916339081178255604051909182917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a35060035562000098565b6000602082840312156200009157600080fd5b5051919050565b613e8680620000a86000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c806392b2c335116100a2578063df1bba0111610071578063df1bba011461021b578063f0f67af21461022e578063f2fde38b14610241578063f830b7b414610254578063fb11639e1461027457600080fd5b806392b2c335146101d95780639efabd34146101ec578063b2832096146101ff578063b4c3b7561461021257600080fd5b8063715018a6116100e9578063715018a6146101685780637bf37a0914610170578063877ba01d146101785780638da5cb5b146101ab5780638e22d534146101c657600080fd5b806319836dc71461011b5780633193c08b1461013057806339ce107e1461014c578063439160df1461015f575b600080fd5b61012e610129366004612f3c565b610287565b005b61013960065481565b6040519081526020015b60405180910390f35b61012e61015a366004612f6c565b6102e8565b61013960035481565b61012e610396565b600654610139565b61019b610186366004612f89565b60056020526000908152604090205460ff1681565b6040519015158152602001610143565b6000546040516001600160a01b039091168152602001610143565b6101396101d4366004612fea565b61040a565b61012e6101e7366004612fea565b610449565b61012e6101fa366004613089565b610519565b61012e61020d366004612f3c565b61072d565b6006541561019b565b61012e610229366004613179565b610820565b61012e61023c366004613089565b610932565b61012e61024f366004612f6c565b610e26565b610139610262366004612f89565b60046020526000908152604090205481565b61012e6102823660046131b3565b610f10565b6000546001600160a01b031633146102ba5760405162461bcd60e51b81526004016102b1906132f0565b60405180910390fd5b60009182526002602052604090912080546001600160a01b0319166001600160a01b03909216919091179055565b60005b600c5481101561034357816001600160a01b0316600c828154811061031257610312613325565b6000918252602090912001546001600160a01b03161415610331575050565b8061033b81613351565b9150506102eb565b50600c80546001810182556000919091527fdf6966c971051c3d54ec59162606531493a51404a002842f56009d7e5cf4a8c70180546001600160a01b0319166001600160a01b0392909216919091179055565b6000546001600160a01b031633146103c05760405162461bcd60e51b81526004016102b1906132f0565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b600080606061041b87878787611290565b9092509050811561043157600092505050610441565b61043c8160006115c3565b925050505b949350505050565b6000606061045986868686611290565b9092509050816105115761047c816040518060200160405280600081525061162f565b610511577f38e7ccc4b02b2da681f96e62aef89b5c6d4115f501f8d42430bb2f5f2fa981a66040516104fb9060208082526033908201527f43726f737320426c6f636b636861696e2043616c6c207769746820756e65787060408201527265637465642072657475726e2076616c75657360681b606082015260800190565b60405180910390a1600d805460ff191660011790555b505050505050565b61052d8a8a8a8a8a8a8a8a8a8a600061165a565b6000808585600081811061054357610543613325565b9050602002810190610555919061336c565b81019061056291906133d0565b909250905060006105b08d8d838161057c5761057c613325565b9050602002013584604080516020808201949094528082019290925280518083038201815260609092019052805191012090565b905060015b868110156106c257600060608989848181106105d3576105d3613325565b90506020028101906105e5919061336c565b8101906105f2919061354a565b5093955093505050868314905061060857600080fd5b60005b81518110156106ac57600082828151811061062857610628613325565b602090810291909101015160405163267ad75360e21b81528815156004820152602481018890529091506001600160a01b038216906399eb5d4c90604401600060405180830381600087803b15801561068057600080fd5b505af1158015610694573d6000803e3d6000fd5b505050505080806106a490613351565b91505061060b565b50505080806106ba90613351565b9150506105b5565b507f8426029537c24c21c8056ae94a666a5e448f1080699c70b9bf691cfeb9d5feec8d8d60008181106106f7576106f7613325565b9050602002013584604051610716929190918252602082015260400190565b60405180910390a150505050505050505050505050565b6000546001600160a01b031633146107575760405162461bcd60e51b81526004016102b1906132f0565b8161079c5760405162461bcd60e51b8152602060048201526015602482015274125b9d985b1a5908189b1bd8dad8da185a5b881a59605a1b60448201526064016102b1565b6001600160a01b0381166107f25760405162461bcd60e51b815260206004820152601860248201527f496e76616c69642076657269666965722061646472657373000000000000000060448201526064016102b1565b60009182526001602052604090912080546001600160a01b0319166001600160a01b03909216919091179055565b32331461086f5760405162461bcd60e51b815260206004820181905260248201527f5374617274206d7573742062652063616c6c65642066726f6d20616e20454f4160448201526064016102b1565b600084815260046020526040902054156108cb5760405162461bcd60e51b815260206004820152601e60248201527f5472616e73616374696f6e20616c72656164792072656769737465726564000060448201526064016102b1565b60006108d7428561364b565b60008681526004602052604090819020829055519091507f77dab611ad9a24b763e2742f57749a0227393e0da76212d74fceb326b066142490610923908790339085908890889061368c565b60405180910390a15050505050565b6109468a8a8a8a8a8a8a8a8a8a600161165a565b60008a8a600081811061095b5761095b613325565b60200291909101359150503233146109c65760405162461bcd60e51b815260206004820152602860248201527f5472616e73616374696f6e206d75737420626520696e737469676174656420626044820152677920616e20454f4160c01b60648201526084016102b1565b8060035414610a175760405162461bcd60e51b815260206004820152601f60248201527f54686973206973206e6f742074686520726f6f7420626c6f636b636861696e0060448201526064016102b1565b88886000818110610a2a57610a2a613325565b9050602002016020810190610a3f9190612f6c565b6001600160a01b0316306001600160a01b031614610ab55760405162461bcd60e51b815260206004820152602d60248201527f526f6f7420626c6f636b636861696e2043424320636f6e74726163742077617360448201526c206e6f742074686973206f6e6560981b60648201526084016102b1565b6000806000606088886000818110610acf57610acf613325565b9050602002810190610ae1919061336c565b810190610aee91906136c5565b6000848152600460205260409020549397509195509350915080610b465760405162461bcd60e51b815260206004820152600f60248201526e43616c6c206e6f742061637469766560881b60448201526064016102b1565b6001811415610b8e5760405162461bcd60e51b815260206004820152601460248201527343616c6c20656e6465642028737563636573732960601b60448201526064016102b1565b6002811415610bd65760405162461bcd60e51b815260206004820152601460248201527343616c6c20656e64656420286661696c7572652960601b60448201526064016102b1565b80421115610bfa57610be785611a9e565b610bef611aed565b505050505050610e1a565b6001600160a01b0384163214610c525760405162461bcd60e51b815260206004820152601e60248201527f454f4120646f6573206e6f74206d61746368207374617274206576656e74000060448201526064016102b1565b81516020830120604080516001808252818301909252600091816020016020820280368337019050509050610c94610c8a8c8e613727565b82848a6001611b4e565b15610ca6575050505050505050610e1a565b610cbb8482610cb660018f61379a565b61201d565b6040805160208082018b90528183018a90528251808303840181526060909201909252805191012060068190556000610cf586848c6121de565b50905060005b600c54811015610da0576000600c8281548110610d1a57610d1a613325565b60009182526020909120015460405163267ad75360e21b81528415156004820152602481018690526001600160a01b03909116915081906399eb5d4c90604401600060405180830381600087803b158015610d7457600080fd5b505af1158015610d88573d6000803e3d6000fd5b50505050508080610d9890613351565b915050610cfb565b5080610dad576002610db0565b60015b60008a8152600460205260409081902091909155517fe6763dd99bf894d72f3499dd572aa42876eae7ae028c32fff21654e1bbc4c80790610dff908b9084909182521515602082015260400190565b60405180910390a1610e0f611aed565b505050505050505050505b50505050505050505050565b6000546001600160a01b03163314610e505760405162461bcd60e51b81526004016102b1906132f0565b6001600160a01b038116610eb55760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016102b1565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b610f248c8c8c8c8c8c8c8c8c8c600161165a565b60008c8c6000818110610f3957610f39613325565b6020029190910135915050323314610f9e5760405162461bcd60e51b815260206004820152602260248201527f5365676d656e74206d7573742062652063616c6c65642066726f6d20616e20456044820152614f4160f01b60648201526084016102b1565b600080606089896000818110610fb657610fb6613325565b9050602002810190610fc8919061336c565b810190610fd591906136c5565b929550909350909150506001600160a01b03821632146110375760405162461bcd60e51b815260206004820152601e60248201527f454f4120646f6573206e6f74206d61746368207374617274206576656e74000060448201526064016102b1565b60008484888860405160200161105094939291906137b1565b60408051601f1981840301815291815281516020928301206000818152600590935291205490915060ff16156110d45760405162461bcd60e51b8152602060048201526024808201527f5365676d656e74207472616e73616374696f6e20616c726561647920657865636044820152631d5d195960e21b60648201526084016102b1565b6000908152600560209081526040909120805460ff19166001908117909155825191830191909120908a11156111a15761114d6111118b8d613727565b88888080602002602001604051908101604052809392919081815260200183836020028082843760009201829052508793508a92509050611b4e565b1561115c575050505050611282565b6111a182888880806020026020016040519081016040528093929190818152602001838360200280828437600092019190915250610cb69250600191508f905061379a565b6040805160208082018890528183018790528251808303840181526060909201909252805191012060068190555060006060611212848a8a808060200260200160405190810160405280939291908181526020018383602002808284376000920191909152508c92506121de915050565b60405191935091507fb01557f1f634b7c5072ab5e36d07a2355ef819faca5a3d321430d71987155b8f9061125490889086908d908d90600c908990899061384b565b60405180910390a160018c11156112725761126d6123ed565b61127a565b61127a61244d565b505050505050505b505050505050505050505050565b600b54600a5460009160609181106112cb575050600d805460ff191660019081179091556040805160208101909152600081529091506115ba565b6000600782815481106112e0576112e0613325565b9060005260206000200154905060006008838154811061130257611302613325565b6000918252602082200154600980546001600160a01b039092169350908590811061132f5761132f613325565b906000526020600020018054611344906138ff565b80601f0160208091040260200160405190810160405280929190818152602001828054611370906138ff565b80156113bd5780601f10611392576101008083540402835291602001916113bd565b820191906000526020600020905b8154815290600101906020018083116113a057829003601f168201915b50505050509050828a1415806113e55750816001600160a01b0316896001600160a01b031614155b8061142e575061142c88888080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525085925061162f915050565b155b156114b457600d805460ff1916600190811790915561144e90859061364b565b600b556040517f8b5fc485a070cefca43e0a1d8cc72cf38dc31d5bf14f58cedcc59c73cac84e159061148d9085908d9086908e9087908f908f9061393a565b60405180910390a160016040518060200160405280600081525095509550505050506115ba565b6000600a856114c281613351565b9650815481106114d4576114d4613325565b9060005260206000200180546114e9906138ff565b80601f0160208091040260200160405190810160405280929190818152602001828054611515906138ff565b80156115625780601f1061153757610100808354040283529160200191611562565b820191906000526020600020905b81548152906001019060200180831161154557829003601f168201915b5050505050905084600b819055507f971a379ee339d51e370a4733845f31c68e234014c8494ecedb867ae2cdc1ef688b8b8b8b856040516115a7959493929190613994565b60405180910390a1600096509450505050505b94509492505050565b60006115d082602061364b565b835110156116205760405162461bcd60e51b815260206004820152601e60248201527f736c6963696e67206f7574206f662072616e6765202875696e7432353629000060448201526064016102b1565b50818101602001515b92915050565b6000815183511461164257506000611629565b81805190602001208380519060200120149050611629565b89806116a85760405162461bcd60e51b815260206004820152601a60248201527f4d757374206265206174206c65617374206f6e65206576656e7400000000000060448201526064016102b1565b8089146117145760405162461bcd60e51b815260206004820152603460248201527f4e756d626572206f6620626c6f636b636861696e2049647320616e6420636263604482015273082c8c8e4cae6e6cae640daeae6e840dac2e8c6d60631b60648201526084016102b1565b8087146117935760405162461bcd60e51b815260206004820152604160248201527f4e756d626572206f6620626c6f636b636861696e2049647320616e642065766560448201527f6e742066756e6374696f6e207369676e617475726573206d757374206d6174636064820152600d60fb1b608482015260a4016102b1565b8085146117fd5760405162461bcd60e51b815260206004820152603260248201527f4e756d626572206f6620626c6f636b636861696e2049647320616e64206576656044820152710dce840c8c2e8c240daeae6e840dac2e8c6d60731b60648201526084016102b1565b80831461185a5760405162461bcd60e51b815260206004820152602560248201527f4e756d626572206f66206576656e747320616e64207369676e617475726573206044820152640dac2e8c6d60db1b60648201526084016102b1565b60005b81811015611a8f578061193a57600083611897577fe6763dd99bf894d72f3499dd572aa42876eae7ae028c32fff21654e1bbc4c8076118b9565b7f77dab611ad9a24b763e2742f57749a0227393e0da76212d74fceb326b06614245b90508989838181106118cd576118cd613325565b9050602002013581146119345760405162461bcd60e51b815260206004820152602960248201527f556e6578706563746564206669727374206576656e742066756e6374696f6e206044820152687369676e617475726560b81b60648201526084016102b1565b506119d4565b88888281811061194c5761194c613325565b905060200201357fb01557f1f634b7c5072ab5e36d07a2355ef819faca5a3d321430d71987155b8f146119d45760405162461bcd60e51b815260206004820152602a60248201527f4576656e742066756e6374696f6e207369676e6174757265206e6f7420666f726044820152690818481cd959db595b9d60b21b60648201526084016102b1565b611a7d8d8d838181106119e9576119e9613325565b905060200201358c8c84818110611a0257611a02613325565b9050602002016020810190611a179190612f6c565b8b8b85818110611a2957611a29613325565b905060200201358a8a86818110611a4257611a42613325565b9050602002810190611a54919061336c565b8a8a88818110611a6657611a66613325565b9050602002810190611a78919061336c565b612476565b80611a8781613351565b91505061185d565b50505050505050505050505050565b6000818152600460209081526040808320600290558051848152918201929092527fe6763dd99bf894d72f3499dd572aa42876eae7ae028c32fff21654e1bbc4c807910160405180910390a150565b611af960076000612df8565b611b0560086000612df8565b611b1160096000612e19565b611b1d600a6000612e19565b6000600b55600d5460ff1615611b3857600d805460ff191690555b600660009055600c6000611b4c9190612df8565b565b60008460018651611b5f919061379a565b81518110611b6f57611b6f613325565b6020026020010151600014611bb75760405162461bcd60e51b815260206004820152600e60248201526d24b73b30b634b21031b0b63632b960911b60448201526064016102b1565b60015b865181101561200e57600080606080600060608c8781518110611bdf57611bdf613325565b6020026020010151806020019051810190611bfa9190613a9c565b949a50929850909650945092509050898614611c725760405162461bcd60e51b815260206004820152603160248201527f5472616e73616374696f6e2069642066726f6d207365676d656e7420616e64206044820152700e4dedee840c8de40dcdee840dac2e8c6d607b1b60648201526084016102b1565b848b14611cd75760405162461bcd60e51b815260206004820152602d60248201527f43616c6c2067726170682066726f6d207365676d656e7420616e6420726f6f7460448201526c040c8de40dcdee840dac2e8c6d609b1b60648201526084016102b1565b8b5184511480611cf357508b51611cef90600161364b565b8451145b611d3f5760405162461bcd60e51b815260206004820181905260248201527f4261642063616c6c2070617468206c656e67746820666f72207365676d656e7460448201526064016102b1565b8b51611d4c90600161364b565b84511415611dca578360018551611d63919061379a565b81518110611d7357611d73613325565b6020026020010151600014611dca5760405162461bcd60e51b815260206004820181905260248201527f46696e616c2063616c6c207061746820656c656d656e74206e6f74207a65726f60448201526064016102b1565b60005b60018d51611ddb919061379a565b811015611e85578c8181518110611df457611df4613325565b6020026020010151858281518110611e0e57611e0e613325565b602002602001015114611e735760405162461bcd60e51b815260206004820152602760248201527f5365676d656e742063616c6c207061746820646f6573206e6f74206d617463686044820152661031b0b63632b960c91b60648201526084016102b1565b80611e7d81613351565b915050611dcd565b50868460018e51611e96919061379a565b81518110611ea657611ea6613325565b602002602001015114611f055760405162461bcd60e51b815260206004820152602160248201527f5365676d656e74206576656e7473206172726179206f7574206f66206f7264656044820152603960f91b60648201526084016102b1565b81611fb1578815611f1e57611f198a611a9e565b611f99565b7fb01557f1f634b7c5072ab5e36d07a2355ef819faca5a3d321430d71987155b8f8a8c8e6000604051908082528060200260200182016040528015611f6d578160200160208202803683370190505b5060408051600080825260208201909252604051611f9096959493929190613b91565b60405180910390a15b611fa16123ed565b6001975050505050505050612014565b600a80546001810182556000919091528151611ff4917fc65a7bb8d6351c1cf70c95a316cc6a92839c986682d98bc35f958f4883f9d2a801906020840190612e37565b50505050505050808061200690613351565b915050611bba565b50600090505b95945050505050565b81516000816001600160401b03811115612039576120396133f5565b604051908082528060200260200182016040528015612062578160200160208202803683370190505b50905060005b61207360018461379a565b8110156120c35784818151811061208c5761208c613325565b60200260200101518282815181106120a6576120a6613325565b6020908102919091010152806120bb81613351565b915050612068565b5060015b8381116105115780826120db60018661379a565b815181106120eb576120eb613325565b6020026020010181815250506000806000612108898660016125eb565b6007805460018082019092557fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c68801849055600880548083019091557ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30180546001600160a01b0319166001600160a01b038516179055600980549182018155600052815193965091945092506121c7917f6e1540171b6c0c960b71a7020d9f60077f6af931a8bbf590da0223dacf75c7af909101906020840190612e37565b5050505080806121d690613351565b9150506120c7565b6000606060008060006121f3888860016125eb565b92509250925060035483146122675760405162461bcd60e51b815260206004820152603460248201527f54617267657420626c6f636b636861696e20696420646f6573206e6f74206d616044820152731d18da081b5e48189b1bd8dad8da185a5b881a5960621b60648201526084016102b1565b6000808851600114801561229557508860008151811061228957612289613325565b60200260200101516000145b6122ba5760006122a48a612810565b90506122b28b8260006125eb565b509093509150505b60006122c8848a85856129f3565b905060006060866001600160a01b0316836040516122e69190613c43565b6000604051808303816000865af19150503d8060008114612323576040519150601f19603f3d011682016040523d82523d6000602084013e612328565b606091505b50909250905081612373577f38e7ccc4b02b2da681f96e62aef89b5c6d4115f501f8d42430bb2f5f2fa981a661235d82612a59565b60405161236a9190613c5f565b60405180910390a15b600b54600a54146123c857600a54600b546040517fce3bac95f99adf24dc6d7d8a7264b6c40b211c40e0f79a78482298c0867fae9b926123bb92908252602082015260400190565b60405180910390a1600091505b600d5460ff166123d857816123db565b60005b9d909c509a5050505050505050505050565b6123f960076000612df8565b61240560086000612df8565b61241160096000612e19565b600660009055600c60006124259190612df8565b612431600a6000612e19565b6000600b55600d5460ff1615611b4c57600d805460ff19169055565b600d5460ff1615611b3857600d805460ff19169055600660009055600c6000611b4c9190612df8565b6000878152600160205260409020546001600160a01b0316806124e95760405162461bcd60e51b815260206004820152602560248201527f4e6f207265676973746572656420766572696669657220666f7220626c6f636b60448201526431b430b4b760d91b60648201526084016102b1565b6000888152600260205260409020546001600160a01b038881169116146125605760405162461bcd60e51b815260206004820152602560248201527f44617461206e6f7420656d697474656420627920617070726f76656420636f6e6044820152641d1c9858dd60da1b60648201526084016102b1565b6000888888888860405160200161257b959493929190613c72565b60408051601f198184030181529082905263260e748160e11b825291506001600160a01b03831690634c1ce902906125bf908c908b9086908a908a90600401613cac565b60006040518083038186803b1580156125d757600080fd5b505afa158015611a8f573d6000803e3d6000fd5b60008060606000805b86518110156127055760008061260a8a85612b0a565b905060ff81166126905760018951612622919061379a565b831461268b5760405162461bcd60e51b815260206004820152603260248201527f52656163686564206c6561662066756e6374696f6e206275742074686572652060448201527134b99036b7b9329031b0b636103830ba341760711b60648201526084016102b1565b6126e4565b60008984815181106126a4576126a4613325565b602002602001015190506126da8b60016004846126c19190613cde565b6126cb908961364b565b6126d5919061364b565b612b70565b63ffffffff169250505b6126ee828561364b565b9350505080806126fd90613351565b9150506125f4565b508560018751612715919061379a565b8151811061272557612725613325565b60200260200101516000146127865760006127408883612b0a565b905060ff81161561277657600061275c896126d560018661364b565b63ffffffff16905061276e818461364b565b925050612784565b61278160018361364b565b91505b505b61279087826115c3565b935061279d60208261364b565b90506127ac8782016014015190565b925084156127f3576127bf60148261364b565b905060006127cd8883612bd6565b90506127da60028361364b565b91506127eb88838361ffff16612c3c565b925050612806565b6040518060200160405280600081525091505b5093509350939050565b805160609081908361282360018361379a565b8151811061283357612833613325565b602002602001015160001461291457806001600160401b0381111561285a5761285a6133f5565b604051908082528060200260200182016040528015612883578160200160208202803683370190505b50915060005b61289460018361379a565b8110156128e4578481815181106128ad576128ad613325565b60200260200101518382815181106128c7576128c7613325565b6020908102919091010152806128dc81613351565b915050612889565b506000826128f360018461379a565b8151811061290357612903613325565b6020026020010181815250506129ec565b61291f60018261379a565b6001600160401b03811115612936576129366133f5565b60405190808252806020026020018201604052801561295f578160200160208202803683370190505b50915060005b61297060028361379a565b8110156129c05784818151811061298957612989613325565b60200260200101518382815181106129a3576129a3613325565b6020908102919091010152806129b881613351565b915050612965565b506000826129cf60028461379a565b815181106129df576129df613325565b6020026020010181815250505b5092915050565b6040805160208101859052908101839052606082811b6bffffffffffffffffffffffff19168183015290859060740160408051601f1981840301815290829052612a409291602001613cfd565b6040516020818303038152906040529050949350505050565b6060602482511015612a9557612a6f8251612cfb565b604051602001612a7f9190613d2c565b6040516020818303038152906040529050919050565b81516004909201916044118015612aef57600083806020019051810190612abc9190613d82565b9050612ac781612cfb565b604051602001612ad79190613d9b565b60405160208183030381529060405292505050919050565b82806020019051810190612b039190613dca565b9392505050565b6000612b1782600161364b565b83511015612b675760405162461bcd60e51b815260206004820152601c60248201527f736c6963696e67206f7574206f662072616e6765202875696e7438290000000060448201526064016102b1565b50016001015190565b6000612b7d82600461364b565b83511015612bcd5760405162461bcd60e51b815260206004820152601d60248201527f736c6963696e67206f7574206f662072616e6765202875696e7433322900000060448201526064016102b1565b50016004015190565b6000612be382600261364b565b83511015612c335760405162461bcd60e51b815260206004820152601d60248201527f736c6963696e67206f7574206f662072616e6765202875696e7431362900000060448201526064016102b1565b50016002015190565b6060612c48828461364b565b84511015612c8d5760405162461bcd60e51b815260206004820152601260248201527152656164206f7574206f6620626f756e647360701b60448201526064016102b1565b606082158015612ca857604051915060208201604052612cf2565b6040519150601f8416801560200281840101858101878315602002848b0101015b81831015612ce1578051835260209283019201612cc9565b5050858452601f01601f1916604052505b50949350505050565b606081612d1f5750506040805180820190915260018152600360fc1b602082015290565b8160005b8115612d495780612d3381613351565b9150612d429050600a83613e28565b9150612d23565b6000816001600160401b03811115612d6357612d636133f5565b6040519080825280601f01601f191660200182016040528015612d8d576020820181803683370190505b5090505b841561044157612da260018361379a565b9150612daf600a86613e3c565b612dba90603061364b565b60f81b818381518110612dcf57612dcf613325565b60200101906001600160f81b031916908160001a905350612df1600a86613e28565b9450612d91565b5080546000825590600052602060002090810190612e169190612ebb565b50565b5080546000825590600052602060002090810190612e169190612ed0565b828054612e43906138ff565b90600052602060002090601f016020900481019282612e655760008555612eab565b82601f10612e7e57805160ff1916838001178555612eab565b82800160010185558215612eab579182015b82811115612eab578251825591602001919060010190612e90565b50612eb7929150612ebb565b5090565b5b80821115612eb75760008155600101612ebc565b80821115612eb7576000612ee48282612eed565b50600101612ed0565b508054612ef9906138ff565b6000825580601f10612f09575050565b601f016020900490600052602060002090810190612e169190612ebb565b6001600160a01b0381168114612e1657600080fd5b60008060408385031215612f4f57600080fd5b823591506020830135612f6181612f27565b809150509250929050565b600060208284031215612f7e57600080fd5b8135612b0381612f27565b600060208284031215612f9b57600080fd5b5035919050565b60008083601f840112612fb457600080fd5b5081356001600160401b03811115612fcb57600080fd5b602083019150836020828501011115612fe357600080fd5b9250929050565b6000806000806060858703121561300057600080fd5b84359350602085013561301281612f27565b925060408501356001600160401b0381111561302d57600080fd5b61303987828801612fa2565b95989497509550505050565b60008083601f84011261305757600080fd5b5081356001600160401b0381111561306e57600080fd5b6020830191508360208260051b8501011115612fe357600080fd5b60008060008060008060008060008060a08b8d0312156130a857600080fd5b8a356001600160401b03808211156130bf57600080fd5b6130cb8e838f01613045565b909c509a5060208d01359150808211156130e457600080fd5b6130f08e838f01613045565b909a50985060408d013591508082111561310957600080fd5b6131158e838f01613045565b909850965060608d013591508082111561312e57600080fd5b61313a8e838f01613045565b909650945060808d013591508082111561315357600080fd5b506131608d828e01613045565b915080935050809150509295989b9194979a5092959850565b6000806000806060858703121561318f57600080fd5b843593506020850135925060408501356001600160401b0381111561302d57600080fd5b60008060008060008060008060008060008060c08d8f0312156131d557600080fd5b6001600160401b038d3511156131ea57600080fd5b6131f78e8e358f01613045565b909c509a506001600160401b0360208e0135111561321457600080fd5b6132248e60208f01358f01613045565b909a5098506001600160401b0360408e0135111561324157600080fd5b6132518e60408f01358f01613045565b90985096506001600160401b0360608e0135111561326e57600080fd5b61327e8e60608f01358f01613045565b90965094506001600160401b0360808e0135111561329b57600080fd5b6132ab8e60808f01358f01613045565b90945092506001600160401b0360a08e013511156132c857600080fd5b6132d88e60a08f01358f01613045565b81935080925050509295989b509295989b509295989b565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b60006000198214156133655761336561333b565b5060010190565b6000808335601e1984360301811261338357600080fd5b8301803591506001600160401b0382111561339d57600080fd5b602001915036819003821315612fe357600080fd5b8015158114612e1657600080fd5b80356133cb816133b2565b919050565b600080604083850312156133e357600080fd5b823591506020830135612f61816133b2565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b0381118282101715613433576134336133f5565b604052919050565b60006001600160401b03821115613454576134546133f5565b5060051b60200190565b600082601f83011261346f57600080fd5b8135602061348461347f8361343b565b61340b565b82815260059290921b840181019181810190868411156134a357600080fd5b8286015b848110156134c75780356134ba81612f27565b83529183019183016134a7565b509695505050505050565b60006001600160401b038211156134eb576134eb6133f5565b50601f01601f191660200190565b600082601f83011261350a57600080fd5b813561351861347f826134d2565b81815284602083860101111561352d57600080fd5b816020850160208301376000918101602001919091529392505050565b60008060008060008060c0878903121561356357600080fd5b86359550602080880135955060408801356001600160401b038082111561358957600080fd5b818a0191508a601f83011261359d57600080fd5b81356135ab61347f8261343b565b81815260059190911b8301840190848101908d8311156135ca57600080fd5b938501935b828510156135e8578435825293850193908501906135cf565b9850505060608a013592508083111561360057600080fd5b61360c8b848c0161345e565b955061361a60808b016133c0565b945060a08a013592508083111561363057600080fd5b505061363e89828a016134f9565b9150509295509295509295565b6000821982111561365e5761365e61333b565b500190565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b85815260018060a01b03851660208201528360408201526080606082015260006136ba608083018486613663565b979650505050505050565b600080600080608085870312156136db57600080fd5b8435935060208501356136ed81612f27565b92506040850135915060608501356001600160401b0381111561370f57600080fd5b61371b878288016134f9565b91505092959194509250565b600061373561347f8461343b565b80848252602080830192508560051b85013681111561375357600080fd5b855b8181101561378e5780356001600160401b038111156137745760008081fd5b61378036828a016134f9565b865250938201938201613755565b50919695505050505050565b6000828210156137ac576137ac61333b565b500390565b8481526020810184905260006001600160fb1b038311156137d157600080fd5b8260051b808560408501376000920160400191825250949350505050565b60005b8381101561380a5781810151838201526020016137f2565b83811115613819576000848401525b50505050565b600081518084526138378160208601602086016137ef565b601f01601f19169290920160200192915050565b87815260006020888184015260c060408401528660c084015260018060fb1b0387111561387757600080fd5b8660051b808960e086013760e0908401848103820160608601528754918101829052600088815283812092909161010001905b808310156138d35783546001600160a01b031682526001938401939290920191908401906138aa565b50871515608087015285810360a08701526138ee818861381f565b9d9c50505050505050505050505050565b600181811c9082168061391357607f821691505b6020821081141561393457634e487b7160e01b600052602260045260246000fd5b50919050565b878152602081018790526001600160a01b0386811660408301528516606082015260c0608082018190526000906139739083018661381f565b82810360a0840152613986818587613663565b9a9950505050505050505050565b8581526001600160a01b03851660208201526080604082018190526000906139bf9083018587613663565b82810360608401526139d1818561381f565b98975050505050505050565b600082601f8301126139ee57600080fd5b815160206139fe61347f8361343b565b82815260059290921b84018101918181019086841115613a1d57600080fd5b8286015b848110156134c7578051613a3481612f27565b8352918301918301613a21565b80516133cb816133b2565b6000613a5a61347f846134d2565b9050828152838383011115613a6e57600080fd5b612b038360208301846137ef565b600082601f830112613a8d57600080fd5b612b0383835160208501613a4c565b60008060008060008060c08789031215613ab557600080fd5b86519550602080880151955060408801516001600160401b0380821115613adb57600080fd5b818a0191508a601f830112613aef57600080fd5b8151613afd61347f8261343b565b81815260059190911b8301840190848101908d831115613b1c57600080fd5b938501935b82851015613b3a57845182529385019390850190613b21565b60608d01519099509450505080831115613b5357600080fd5b613b5f8b848c016139dd565b9550613b6d60808b01613a41565b945060a08a0151925080831115613b8357600080fd5b505061363e89828a01613a7c565b600060c082018883526020888185015260c0604085015281885180845260e086019150828a01935060005b81811015613bd857845183529383019391830191600101613bbc565b50508481036060860152875180825290820192508188019060005b81811015613c185782516001600160a01b031685529383019391830191600101613bf3565b50505050841515608084015282810360a0840152613c36818561381f565b9998505050505050505050565b60008251613c558184602087016137ef565b9190910192915050565b602081526000612b03602083018461381f565b8581526bffffffffffffffffffffffff198560601b1660208201528360348201528183605483013760009101605401908152949350505050565b858152846020820152608060408201526000613ccb608083018661381f565b82810360608401526139d1818587613663565b6000816000190483118215151615613cf857613cf861333b565b500290565b60008351613d0f8184602088016137ef565b835190830190613d238183602088016137ef565b01949350505050565b7f52657665727420666f7220756e6b6e6f776e206572726f722e204572726f722081526703632b733ba341d160c51b602082015260008251613d758160288501602087016137ef565b9190910160280192915050565b600060208284031215613d9457600080fd5b5051919050565b6602830b734b19d160cd1b815260008251613dbd8160078501602087016137ef565b9190910160070192915050565b600060208284031215613ddc57600080fd5b81516001600160401b03811115613df257600080fd5b8201601f81018413613e0357600080fd5b61044184825160208401613a4c565b634e487b7160e01b600052601260045260246000fd5b600082613e3757613e37613e12565b500490565b600082613e4b57613e4b613e12565b50069056fea26469706673582212203fcfb1ea371501925f5de7979ae486c3fcad01aaa570812bcf0623d57c3f988f64736f6c634300080b0033"

// AtomicBridge
let bridgeABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_gpactContract",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenRecipient",
          "type": "address"
        }
      ],
      "name": "CommitTokenTransfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "ProcessTokenTransfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        }
      ],
      "name": "RemoveAsking",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenRecipient",
          "type": "address"
        }
      ],
      "name": "RevertTokenTransfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "StartListing",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "StopListing",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenRecipient",
          "type": "address"
        }
      ],
      "name": "SuccessfulPurchase",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_otherTokenRecipient",
          "type": "address"
        }
      ],
      "name": "UpsertAsking",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_buyer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        }
      ],
      "name": "buyNFTUsingRemoteFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_commit",
          "type": "bool"
        },
        {
          "internalType": "bytes32",
          "name": "_crossRootTxId",
          "type": "bytes32"
        }
      ],
      "name": "finalise",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProvisionalUpdatesCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStorageAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "_storageAddress",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "listingStorage",
      "outputs": [
        {
          "internalType": "contract ListingStorage",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "processTokenTransfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "provisionalUpdates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tokenContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "provisionalUpdatesKeys",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "_otherBcIds",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "_otherBridgeAddrs",
          "type": "address[]"
        }
      ],
      "name": "registerRemoteBridges",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "remoteBridges",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        }
      ],
      "name": "removeAsking",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "_otherBcIds",
          "type": "uint256[]"
        }
      ],
      "name": "removeRemoteBridges",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "startListingNFT",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenRecipient",
          "type": "address"
        }
      ],
      "name": "startListingNFTWithAsking",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "stopListingNFT",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenRecipient",
          "type": "address"
        }
      ],
      "name": "upsertAsking",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
let bridgeBIN = "0x60806040523480156200001157600080fd5b50604051620044bf380380620044bf83398101604081905262000034916200017d565b62000041600033620000bf565b600180546001600160a01b0383166001600160a01b031991821681179092556002805490911690911790556040516200007a906200016f565b604051809103906000f08015801562000097573d6000803e3d6000fd5b50600380546001600160a01b0319166001600160a01b039290921691909117905550620001af565b620000cb8282620000cf565b5050565b6000828152602081815260408083206001600160a01b038516845290915290205460ff16620000cb576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556200012b3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b611fae806200251183390190565b6000602082840312156200019057600080fd5b81516001600160a01b0381168114620001a857600080fd5b9392505050565b61235280620001bf6000396000f3fe608060405234801561001057600080fd5b506004361061014d5760003560e01c80636ac3b00a116100c357806399eb5d4c1161007c57806399eb5d4c1461033d578063a217fddf14610350578063b0dd5dfb14610358578063c0c5162a14610381578063d547741f14610394578063f5e3d06c146103a757600080fd5b80636ac3b00a146102d65780638085346e146102e957806385380b47146102fc57806385c7e0d51461030f57806388bf1a531461032257806391d148541461032a57600080fd5b80632f2ff15d116101155780632f2ff15d1461025257806336568abe14610265578063393a4d34146102785780635d1b41fd1461029d57806362e393fb146102b057806369f36dcf146102c357600080fd5b806301ffc9a7146101525780630b33ac011461017a578063123756cd1461018f578063248a9ca3146101a257806327eef79e146101d3575b600080fd5b610165610160366004611a61565b6103ba565b60405190151581526020015b60405180910390f35b61018d610188366004611ade565b6103f1565b005b61018d61019d366004611b62565b610537565b6101c56101b0366004611bb5565b60009081526020819052604090206001015490565b604051908152602001610171565b6102206101e1366004611bb5565b60046020819052600091825260409091208054600182015460028301546003840154939094015491936001600160a01b03918216939092908216911685565b604080519586526001600160a01b0394851660208701528501929092528216606084015216608082015260a001610171565b61018d610260366004611bce565b6108a6565b61018d610273366004611bce565b610935565b6003546001600160a01b03165b6040516001600160a01b039091168152602001610171565b61018d6102ab366004611bfe565b6109af565b61018d6102be366004611c2a565b610b54565b61018d6102d1366004611c91565b610b74565b6101c56102e4366004611bb5565b610f38565b600354610285906001600160a01b031681565b61018d61030a366004611cf0565b610f59565b61018d61031d366004611bfe565b611148565b6005546101c5565b610165610338366004611bce565b6112bb565b61018d61034b366004611d3d565b6112e4565b6101c5600081565b610285610366366004611bb5565b6006602052600090815260409020546001600160a01b031681565b61018d61038f366004611c2a565b611630565b61018d6103a2366004611bce565b611788565b61018d6103b5366004611d5b565b611808565b60006001600160e01b03198216637965db0b60e01b14806103eb57506301ffc9a760e01b6001600160e01b03198316145b92915050565b6103fc6000336112bb565b61044d5760405162461bcd60e51b815260206004820152601c60248201527f4272696467653a206d75737420686176652061646d696e20726f6c650000000060448201526064015b60405180910390fd5b82811461049c5760405162461bcd60e51b815260206004820152601f60248201527f4272696467653a20706172616d73206c656e677468206e6f74206d61746368006044820152606401610444565b60005b83811015610530578282828181106104b9576104b9611d9d565b90506020020160208101906104ce9190611db3565b600660008787858181106104e4576104e4611d9d565b90506020020135815260200190815260200160002060006101000a8154816001600160a01b0302191690836001600160a01b03160217905550808061052890611de6565b91505061049f565b5050505050565b60015433906001600160a01b031681146105635760405162461bcd60e51b815260040161044490611e01565b60008061056e6118be565b60008281526006602052604090205491945092506001600160a01b0380841691161490506105de5760405162461bcd60e51b815260206004820152601f60248201527f4272696467653a20436f6e747261637420646f6573206e6f74206d61746368006044820152606401610444565b60025460408051637bf37a0960e01b815290516000926001600160a01b031691637bf37a099160048083019260209291908290030181865afa158015610628573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061064c9190611e38565b600254604051631ce7083f60e11b81523060048201529192506001600160a01b0316906339ce107e90602401600060405180830381600087803b15801561069257600080fd5b505af11580156106a6573d6000803e3d6000fd5b50506040516323b872dd60e01b81526001600160a01b038981166004830152306024830152604482018b90528b1692506323b872dd91506064016020604051808303816000875af11580156106ff573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107239190611e51565b506005805490506004600083815260200190815260200160002060000181905550876004600083815260200190815260200160002060010160006101000a8154816001600160a01b0302191690836001600160a01b03160217905550866004600083815260200190815260200160002060020181905550856004600083815260200190815260200160002060030160006101000a8154816001600160a01b0302191690836001600160a01b03160217905550846004600083815260200190815260200160002060040160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060058190806001815401808255809150506001900390600052602060002001600090919091909150557f818436b8a70215f0416d0c3ba07f0c8aad88ba0434e3fa3a28e74085fe3511418888888860405161089494939291906001600160a01b03948516815260208101939093529083166040830152909116606082015260800190565b60405180910390a15050505050505050565b6000828152602081905260409020600101546108c3905b336112bb565b6109275760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e60448201526e0818591b5a5b881d1bc819dc985b9d608a1b6064820152608401610444565b61093182826118f6565b5050565b6001600160a01b03811633146109a55760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b6064820152608401610444565b610931828261197a565b336109b86119df565b60035460405163946531c160e01b81526001600160a01b039091169063946531c1906109ea9087908790600401611e6e565b600060405180830381865afa925050508015610a2857506040513d6000823e601f3d908101601f19168201604052610a259190810190611f20565b60015b610a7a57610a346120a1565b806308c379a01415610a6e5750610a496120bd565b80610a545750610a70565b8060405162461bcd60e51b81526004016104449190612173565b505b3d6000803e3d6000fd5b905080606001516001600160a01b0316826001600160a01b031614610ab15760405162461bcd60e51b815260040161044490612186565b600354604051634fe5d98560e01b81526001600160a01b0390911690634fe5d98590610ae39087908790600401611e6e565b600060405180830381600087803b158015610afd57600080fd5b505af1158015610b11573d6000803e3d6000fd5b505050507faefaaa6f47b7bbab9b5de74bf36906f29879aca35aa79f178f9fed8d10ae34a98484604051610b46929190611e6e565b60405180910390a150505050565b610b5e8686611148565b610b6c868686868686611630565b505050505050565b60015433906001600160a01b03168114610ba05760405162461bcd60e51b815260040161044490611e01565b6000838152600660205260409020546001600160a01b031680610c055760405162461bcd60e51b815260206004820181905260248201527f4272696467653a206465737420636861696e206e6f7420737570706f727465646044820152606401610444565b610c0d6119df565b60035460405163946531c160e01b81526001600160a01b039091169063946531c190610c3f908a908a90600401611e6e565b600060405180830381865afa925050508015610c7d57506040513d6000823e601f3d908101601f19168201604052610c7a9190810190611f20565b60015b610c8957610a346120a1565b9050610c93611a20565b60035460405163613be39360e11b81526001600160a01b039091169063c277c72690610cc9908b908b908b908b906004016121bd565b60a060405180830381865afa925050508015610d02575060408051601f3d908101601f19168201909252610cff918101906121e8565b60015b610d0e57610a346120a1565b60608101516080820151604080516001600160a01b038a8116602483015260448201949094528d841660648201529183166084808401919091528151808403909101815260a490920181526020820180516001600160e01b031663123756cd60e01b17905260015490516392b2c33560e01b815293945090929116906392b2c33590610da2908a9088908690600401612267565b600060405180830381600087803b158015610dbc57600080fd5b505af1158015610dd0573d6000803e3d6000fd5b5050505060608301516040516323b872dd60e01b81526001600160a01b0391821660048201528b82166024820152604481018a9052908a16906323b872dd90606401600060405180830381600087803b158015610e2c57600080fd5b505af1158015610e40573d6000803e3d6000fd5b5050600354604051634fe5d98560e01b81526001600160a01b039091169250634fe5d9859150610e76908c908c90600401611e6e565b600060405180830381600087803b158015610e9057600080fd5b505af1158015610ea4573d6000803e3d6000fd5b505050606083015160808401516040517f0b274616b8014c7e49597cfa2fc276a8f97695e02714c9b50b822705f8e62eca9350610f24928e928e928e928e928e926001600160a01b0397881681529587166020870152604086019490945260608501929092528416608084015260a083015290911660c082015260e00190565b60405180910390a150505050505050505050565b60058181548110610f4857600080fd5b600091825260209091200154905081565b33610f626119df565b60035460405163946531c160e01b81526001600160a01b039091169063946531c190610f949089908990600401611e6e565b600060405180830381865afa925050508015610fd257506040513d6000823e601f3d908101601f19168201604052610fcf9190810190611f20565b60015b610fde57610a346120a1565b9050610fe8611a20565b60035460405163613be39360e11b81526001600160a01b039091169063c277c7269061101e908a908a908a908a906004016121bd565b60a060405180830381865afa925050508015611057575060408051601f3d908101601f19168201909252611054918101906121e8565b60015b61106357610a346120a1565b905081606001516001600160a01b0316836001600160a01b03161461109a5760405162461bcd60e51b815260040161044490612186565b6003546040516375a728b560e01b81526001600160a01b03909116906375a728b5906110d0908a908a908a908a906004016121bd565b600060405180830381600087803b1580156110ea57600080fd5b505af11580156110fe573d6000803e3d6000fd5b505050507f392602760072cc168a003e4aca874001fab91194cfa8eab6f7005fff21619c6b8787878760405161113794939291906121bd565b60405180910390a150505050505050565b60003360405163020604bf60e21b81526004810184905290915030906001600160a01b0385169063081812fc90602401602060405180830381865afa158015611195573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111b9919061229a565b6001600160a01b03161461120f5760405162461bcd60e51b815260206004820152601860248201527f4272696467653a206e6674206e6f7420617070726f76656400000000000000006044820152606401610444565b600354604051630894ffe160e01b81526001600160a01b03858116600483015260248201859052838116604483015290911690630894ffe190606401600060405180830381600087803b15801561126557600080fd5b505af1158015611279573d6000803e3d6000fd5b505050507f0b95d95c732cd6a034bbaa6e067d7a3c047b5cd7e2987e90721134d5daeb662b83836040516112ae929190611e6e565b60405180910390a1505050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b60015433906001600160a01b031681146113105760405162461bcd60e51b815260040161044490611e01565b600082815260046020818152604092839020835160a0810185528154815260018201546001600160a01b039081169382019390935260028201549481019490945260038101548216606085015290910154166080820152831561144a5780602001516001600160a01b031663a9059cbb826080015183604001516040518363ffffffff1660e01b81526004016113a7929190611e6e565b6020604051808303816000875af11580156113c6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113ea9190611e51565b50602081810151604080840151608085015182516001600160a01b039485168152948501919091529190911682820152517f6b33bc6f13bbfe7ccf13da82d80c668359cb475270373bf4856b8943558307ad9181900360600190a1611522565b80602001516001600160a01b031663a9059cbb826060015183604001516040518363ffffffff1660e01b8152600401611484929190611e6e565b6020604051808303816000875af11580156114a3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114c79190611e51565b5060208082015160408084015160608086015183516001600160a01b039586168152958601929092529216908301527f0e9ee498dfb746578b20c94c5fdd1243eaa4870bc6883a21d912fadcbb25af2c910160405180910390a15b60008381526004602081905260408220828155600180820180546001600160a01b03199081169091556002830194909455600382018054851690559101805490921690915560055411156116035780516005805482916004916000919061158b906001906122b7565b8154811061159b5761159b611d9d565b60009182526020808320909101548352820192909252604001902055600580546115c7906001906122b7565b815481106115d7576115d7611d9d565b9060005260206000200154600582815481106115f5576115f5611d9d565b600091825260209091200155505b6005805480611614576116146122ce565b6001900381819060005260206000200160009055905550505050565b60035460405163946531c160e01b815233916000916001600160a01b039091169063946531c190611667908b908b90600401611e6e565b600060405180830381865afa158015611684573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526116ac9190810190611f20565b905080606001516001600160a01b0316826001600160a01b0316146116e35760405162461bcd60e51b815260040161044490612186565b6003546040516360628b1560e11b81526001600160a01b039091169063c0c5162a9061171d908b908b908b908b908b908b906004016122e4565b600060405180830381600087803b15801561173757600080fd5b505af115801561174b573d6000803e3d6000fd5b505050507f122f8b85645f2f812d4383f23b314cfac7d92976e55458bdfee1fcd81e709846888888888888604051610894969594939291906122e4565b6000828152602081905260409020600101546117a3906108bd565b6109a55760405162461bcd60e51b815260206004820152603060248201527f416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e60448201526f2061646d696e20746f207265766f6b6560801b6064820152608401610444565b6118136000336112bb565b61185f5760405162461bcd60e51b815260206004820152601c60248201527f4272696467653a206d75737420686176652061646d696e20726f6c65000000006044820152606401610444565b60005b818110156118b9576006600084848481811061188057611880611d9d565b6020908102929092013583525081019190915260400160002080546001600160a01b0319169055806118b181611de6565b915050611862565b505050565b60008080803680602060531982018437600051955060206034820360003760005194506014808203600c376000519350505050909192565b61190082826112bb565b610931576000828152602081815260408083206001600160a01b03851684529091529020805460ff191660011790556119363390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b61198482826112bb565b15610931576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b6040518060a001604052806000815260200160006001600160a01b031681526020016000815260200160006001600160a01b03168152602001606081525090565b6040518060a00160405280600081526020016000815260200160006001600160a01b031681526020016000815260200160006001600160a01b031681525090565b600060208284031215611a7357600080fd5b81356001600160e01b031981168114611a8b57600080fd5b9392505050565b60008083601f840112611aa457600080fd5b50813567ffffffffffffffff811115611abc57600080fd5b6020830191508360208260051b8501011115611ad757600080fd5b9250929050565b60008060008060408587031215611af457600080fd5b843567ffffffffffffffff80821115611b0c57600080fd5b611b1888838901611a92565b90965094506020870135915080821115611b3157600080fd5b50611b3e87828801611a92565b95989497509550505050565b6001600160a01b0381168114611b5f57600080fd5b50565b60008060008060808587031215611b7857600080fd5b8435611b8381611b4a565b9350602085013592506040850135611b9a81611b4a565b91506060850135611baa81611b4a565b939692955090935050565b600060208284031215611bc757600080fd5b5035919050565b60008060408385031215611be157600080fd5b823591506020830135611bf381611b4a565b809150509250929050565b60008060408385031215611c1157600080fd5b8235611c1c81611b4a565b946020939093013593505050565b60008060008060008060c08789031215611c4357600080fd5b8635611c4e81611b4a565b955060208701359450604087013593506060870135611c6c81611b4a565b92506080870135915060a0870135611c8381611b4a565b809150509295509295509295565b600080600080600060a08688031215611ca957600080fd5b8535611cb481611b4a565b94506020860135611cc481611b4a565b935060408601359250606086013591506080860135611ce281611b4a565b809150509295509295909350565b60008060008060808587031215611d0657600080fd5b8435611d1181611b4a565b935060208501359250604085013591506060850135611baa81611b4a565b8015158114611b5f57600080fd5b60008060408385031215611d5057600080fd5b8235611c1c81611d2f565b60008060208385031215611d6e57600080fd5b823567ffffffffffffffff811115611d8557600080fd5b611d9185828601611a92565b90969095509350505050565b634e487b7160e01b600052603260045260246000fd5b600060208284031215611dc557600080fd5b8135611a8b81611b4a565b634e487b7160e01b600052601160045260246000fd5b6000600019821415611dfa57611dfa611dd0565b5060010190565b60208082526018908201527f4f6e6c79206c696e6b6564206362632063616e2063616c6c0000000000000000604082015260600190565b600060208284031215611e4a57600080fd5b5051919050565b600060208284031215611e6357600080fd5b8151611a8b81611d2f565b6001600160a01b03929092168252602082015260400190565b634e487b7160e01b600052604160045260246000fd5b60a0810181811067ffffffffffffffff82111715611ebd57611ebd611e87565b60405250565b601f8201601f1916810167ffffffffffffffff81118282101715611ee957611ee9611e87565b6040525050565b60005b83811015611f0b578181015183820152602001611ef3565b83811115611f1a576000848401525b50505050565b60006020808385031215611f3357600080fd5b825167ffffffffffffffff80821115611f4b57600080fd5b9084019060a08287031215611f5f57600080fd5b60408051611f6c81611e9d565b8351815284840151611f7d81611b4a565b8186015283820151828201526060840151611f9781611b4a565b6060820152608084015183811115611fae57600080fd5b808501945050601f8881860112611fc457600080fd5b845184811115611fd657611fd6611e87565b8060051b8451611fe889830182611ec3565b9182528681018801918881018c84111561200157600080fd5b89890192505b8383101561208c5782518881111561201f5760008081fd5b8901603f81018e136120315760008081fd5b8a8101518981111561204557612045611e87565b8851612059828901601f19168e0182611ec3565b8181528f8a83850101111561206e5760008081fd5b61207d828e83018c8601611ef0565b83525050918901918901612007565b50608085015250919998505050505050505050565b600060033d11156120ba5760046000803e5060005160e01c5b90565b600060443d10156120cb5790565b6040516003193d81016004833e81513d67ffffffffffffffff81602484011181841117156120fb57505050505090565b82850191508151818111156121135750505050505090565b843d870101602082850101111561212d5750505050505090565b61213c60208286010187611ec3565b509095945050505050565b6000815180845261215f816020860160208601611ef0565b601f01601f19169290920160200192915050565b602081526000611a8b6020830184612147565b6020808252601b908201527f4272696467653a206f6e6c79206f776e65722063616e2063616c6c0000000000604082015260600190565b6001600160a01b03948516815260208101939093526040830191909152909116606082015260800190565b600060a082840312156121fa57600080fd5b60405160a0810181811067ffffffffffffffff8211171561221d5761221d611e87565b80604052508251815260208301516020820152604083015161223e81611b4a565b604082015260608381015190820152608083015161225b81611b4a565b60808201529392505050565b8381526001600160a01b038316602082015260606040820181905260009061229190830184612147565b95945050505050565b6000602082840312156122ac57600080fd5b8151611a8b81611b4a565b6000828210156122c9576122c9611dd0565b500390565b634e487b7160e01b600052603160045260246000fd5b6001600160a01b039687168152602081019590955260408501939093529084166060840152608083015290911660a082015260c0019056fea264697066735822122062643b3b1c8befe48c6a8e53eb8d45b17384995989c4756d3f9ae3217b286c4164736f6c634300080b0033608060405234801561001057600080fd5b50600080546001600160a01b031916339081178255604051909182917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a350611f4d806100616000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c8063af3158d8116100a2578063cbaa068f11610071578063cbaa068f146102f2578063e4ca46bc14610303578063f193a6cf1461037f578063f2fde38b14610392578063faaa8374146103a557600080fd5b8063af3158d814610215578063b2a5f37e14610235578063c0c5162a146102bf578063c277c726146102d257600080fd5b806375a728b5116100e957806375a728b5146101695780638da5cb5b1461017c57806393ec1d0614610197578063946531c1146101d5578063a26d2053146101f557600080fd5b80630894ffe11461011b5780630df62114146101305780634fe5d9851461014e578063715018a614610161575b600080fd5b61012e61012936600461195c565b6103d3565b005b6101386105c8565b6040516101459190611a90565b60405180910390f35b61012e61015c366004611af2565b6107b1565b61012e610abb565b61012e610177366004611b1c565b610b2f565b6000546040516001600160a01b039091168152602001610145565b6101c56101a5366004611b78565b805160208183018101805160028252928201919093012091525460ff1681565b6040519015158152602001610145565b6101e86101e3366004611af2565b610b7b565b6040516101459190611c29565b610208610203366004611af2565b610d30565b6040516101459190611c7f565b610228610223366004611ccd565b610e67565b6040516101459190611ce6565b61028b610243366004611b78565b80516020818301810180516004808352938301929094019190912092905281546001830154600284015460038501549490930154919390926001600160a01b03908116921685565b6040805195865260208601949094526001600160a01b0392831693850193909352606084015216608082015260a001610145565b61012e6102cd366004611cf9565b610f13565b6102e56102e0366004611b1c565b611150565b6040516101459190611d58565b600354604051908152602001610145565b610354610311366004611b78565b805160208183018101805160018083529383019290940191909120929052815490820154600283015460039093015491926001600160a01b039182169290911684565b604080519485526001600160a01b039384166020860152840191909152166060820152608001610145565b61022861038d366004611ccd565b61123f565b61012e6103a0366004611d66565b61124f565b6101c56103b3366004611b78565b805160208183018101805160058252928201919093012091525460ff1681565b6000546001600160a01b031633146104065760405162461bcd60e51b81526004016103fd90611d81565b60405180910390fd5b60006104128484611339565b90506002816040516104249190611db6565b9081526040519081900360200190205460ff16156104795760405162461bcd60e51b81526020600482015260126024820152714475706c696361746564206c697374696e6760701b60448201526064016103fd565b60035460405160019061048d908490611db6565b9081526040519081900360200181209190915584906001906104b0908490611db6565b908152602001604051809103902060010160006101000a8154816001600160a01b0302191690836001600160a01b03160217905550826001826040516104f69190611db6565b9081526020016040518091039020600201819055508160018260405161051c9190611db6565b90815260405160209181900382019020600390810180546001600160a01b0319166001600160a01b0394909416939093179092558154600181018355600092909252825161058f927fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b0191840190611732565b5060016002826040516105a29190611db6565b908152604051908190036020019020805491151560ff1990921691909117905550505050565b60035460609060009067ffffffffffffffff8111156105e9576105e9611b62565b60405190808252806020026020018201604052801561062257816020015b61060f6117b6565b8152602001906001900390816106075790505b50905060005b6003548110156107ab5760016003828154811061064757610647611dd2565b9060005260206000200160405161065e9190611e1d565b90815260408051918290036020908101832060a0840183528054845260018101546001600160a01b039081168584015260028201548585015260038201541660608501526004810180548451818502810185019095528085529193608086019390929060009084015b828210156107735783829060005260206000200180546106e690611de8565b80601f016020809104026020016040519081016040528092919081815260200182805461071290611de8565b801561075f5780601f106107345761010080835404028352916020019161075f565b820191906000526020600020905b81548152906001019060200180831161074257829003601f168201915b5050505050815260200190600101906106c7565b505050508152505082828151811061078d5761078d611dd2565b602002602001018190525080806107a390611ecf565b915050610628565b50919050565b6000546001600160a01b031633146107db5760405162461bcd60e51b81526004016103fd90611d81565b60006107e78383611339565b90506002816040516107f99190611db6565b9081526040519081900360200190205460ff1661084c5760405162461bcd60e51b8152602060048201526011602482015270131a5cdd1a5b99c81b9bdd08199bdd5b99607a1b60448201526064016103fd565b600060018260405161085e9190611db6565b9081526020016040518091039020905060005b60048201548110156109415761092f858584600401848154811061089757610897611dd2565b9060005260206000200180546108ac90611de8565b80601f01602080910402602001604051908101604052809291908181526020018280546108d890611de8565b80156109255780601f106108fa57610100808354040283529160200191610925565b820191906000526020600020905b81548152906001019060200180831161090857829003601f168201915b5050505050611368565b8061093981611ecf565b915050610871565b50600354600110156109fb578054600380548291600191610963908390611eea565b8154811061097357610973611dd2565b9060005260206000200160405161098a9190611e1d565b90815260405190819003602001902055600380546109aa90600190611eea565b815481106109ba576109ba611dd2565b90600052602060002001600382815481106109d7576109d7611dd2565b906000526020600020019080546109ed90611de8565b6109f89291906117f7565b50505b6003805480610a0c57610a0c611f01565b600190038181906000526020600020016000610a289190611872565b90556000600283604051610a3c9190611db6565b908152604051908190036020018120805492151560ff1990931692909217909155600190610a6b908490611db6565b90815260405190819003602001902060008082556001820180546001600160a01b0319908116909155600283018290556003830180549091169055610ab360048301826118af565b505050505050565b6000546001600160a01b03163314610ae55760405162461bcd60e51b81526004016103fd90611d81565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6000546001600160a01b03163314610b595760405162461bcd60e51b81526004016103fd90611d81565b6000610b67858585856116ec565b9050610b74858583611368565b5050505050565b610b836117b6565b6000610b8f8484611339565b9050600281604051610ba19190611db6565b9081526040519081900360200190205460ff1615610cee57600181604051610bc99190611db6565b90815260408051918290036020908101832060a0840183528054845260018101546001600160a01b039081168584015260028201548585015260038201541660608501526004810180548451818502810185019095528085529193608086019390929060009084015b82821015610cde578382906000526020600020018054610c5190611de8565b80601f0160208091040260200160405190810160405280929190818152602001828054610c7d90611de8565b8015610cca5780601f10610c9f57610100808354040283529160200191610cca565b820191906000526020600020905b815481529060010190602001808311610cad57829003601f168201915b505050505081526020019060010190610c32565b5050505081525050915050610d2a565b60405162461bcd60e51b8152602060048201526011602482015270131a5cdd1a5b99c81b9bdd08199bdd5b99607a1b60448201526064016103fd565b92915050565b60606000610d3e8484610b7b565b9050600081608001515167ffffffffffffffff811115610d6057610d60611b62565b604051908082528060200260200182016040528015610d9957816020015b610d866118cd565b815260200190600190039081610d7e5790505b50905060005b826080015151811015610e5e57600483608001518281518110610dc457610dc4611dd2565b6020026020010151604051610dd99190611db6565b90815260408051918290036020908101832060a0840183528054845260018101549184019190915260028101546001600160a01b039081169284019290925260038101546060840152600401541660808201528251839083908110610e4057610e40611dd2565b60200260200101819052508080610e5690611ecf565b915050610d9f565b50949350505050565b60068181548110610e7757600080fd5b906000526020600020016000915090508054610e9290611de8565b80601f0160208091040260200160405190810160405280929190818152602001828054610ebe90611de8565b8015610f0b5780601f10610ee057610100808354040283529160200191610f0b565b820191906000526020600020905b815481529060010190602001808311610eee57829003601f168201915b505050505081565b6000546001600160a01b03163314610f3d5760405162461bcd60e51b81526004016103fd90611d81565b6000610f498787611339565b90506000610f59888888886116ec565b90506000600183604051610f6d9190611db6565b9081526020016040518091039020905086600483604051610f8e9190611db6565b90815260200160405180910390206001018190555085600483604051610fb49190611db6565b908152602001604051809103902060020160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555084600483604051610ffa9190611db6565b908152602001604051809103902060030181905550836004836040516110209190611db6565b90815260405190819003602001812060040180546001600160a01b03939093166001600160a01b031990931692909217909155600590611061908490611db6565b9081526040519081900360200190205460ff166111455780600401805490506004836040516110909190611db6565b90815260405160209181900382019020919091556006805460018101825560009190915283516110e7927ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f90920191850190611732565b5060016005836040516110fa9190611db6565b90815260405160209181900382019020805460ff191692151592909217909155600482018054600181018255600091825290829020845161114393919092019190850190611732565b505b505050505050505050565b6111586118cd565b6000611166868686866116ec565b90506005816040516111789190611db6565b9081526040519081900360200190205460ff16156111fc576004816040516111a09190611db6565b90815260408051918290036020908101832060a0840183528054845260018101549184019190915260028101546001600160a01b0390811692840192909252600381015460608401526004015416608082015291506112379050565b60405162461bcd60e51b815260206004820152601060248201526f105cdada5b99c81b9bdd08199bdd5b9960821b60448201526064016103fd565b949350505050565b60038181548110610e7757600080fd5b6000546001600160a01b031633146112795760405162461bcd60e51b81526004016103fd90611d81565b6001600160a01b0381166112de5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016103fd565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b604080516001600160a01b03939093166020840152828101919091528051808303820181526060909201905290565b6000546001600160a01b031633146113925760405162461bcd60e51b81526004016103fd90611d81565b600061139e8484611339565b90506005826040516113b09190611db6565b9081526040519081900360200190205460ff166114025760405162461bcd60e51b815260206004820152601060248201526f105cdada5b99c81b9bdd08199bdd5b9960821b60448201526064016103fd565b6002816040516114129190611db6565b9081526040519081900360200190205460ff166114645760405162461bcd60e51b815260206004820152601060248201526f139bc81b1a5cdd1a5b99c8199bdd5b9960821b60448201526064016103fd565b60006001826040516114769190611db6565b908152602001604051809103902090506001816004018054905011156115215760006004846040516114a89190611db6565b90815260405190819003602001902054600483018054919250906114ce90600190611eea565b815481106114de576114de611dd2565b906000526020600020018260040182815481106114fd576114fd611dd2565b9060005260206000200190805461151390611de8565b61151e9291906117f7565b50505b8060040180548061153457611534611f01565b6001900381819060005260206000200160006115509190611872565b905560018351111561163157600060048460405161156e9190611db6565b9081526020016040518091039020600001549050806004600660016006805490506115999190611eea565b815481106115a9576115a9611dd2565b906000526020600020016040516115c09190611e1d565b90815260405190819003602001902055600680546115e090600190611eea565b815481106115f0576115f0611dd2565b906000526020600020016006828154811061160d5761160d611dd2565b9060005260206000200190805461162390611de8565b61162e9291906117f7565b50505b600680548061164257611642611f01565b60019003818190600052602060002001600061165e9190611872565b905560006005846040516116729190611db6565b908152604051908190036020018120805492151560ff19909316929092179091556004906116a1908590611db6565b9081526040519081900360200190206000808255600182018190556002820180546001600160a01b031990811690915560038301919091556004909101805490911690555050505050565b604080516001600160a01b0380871660208301529181018590526060818101859052918316608082015260a0016040516020818303038152906040529050949350505050565b82805461173e90611de8565b90600052602060002090601f01602090048101928261176057600085556117a6565b82601f1061177957805160ff19168380011785556117a6565b828001600101855582156117a6579182015b828111156117a657825182559160200191906001019061178b565b506117b292915061190e565b5090565b6040518060a001604052806000815260200160006001600160a01b031681526020016000815260200160006001600160a01b03168152602001606081525090565b82805461180390611de8565b90600052602060002090601f01602090048101928261182557600085556117a6565b82601f1061183657805485556117a6565b828001600101855582156117a657600052602060002091601f016020900482015b828111156117a6578254825591600101919060010190611857565b50805461187e90611de8565b6000825580601f1061188e575050565b601f0160209004906000526020600020908101906118ac919061190e565b50565b50805460008255906000526020600020908101906118ac9190611923565b6040518060a00160405280600081526020016000815260200160006001600160a01b031681526020016000815260200160006001600160a01b031681525090565b5b808211156117b2576000815560010161190f565b808211156117b25760006119378282611872565b50600101611923565b80356001600160a01b038116811461195757600080fd5b919050565b60008060006060848603121561197157600080fd5b61197a84611940565b92506020840135915061198f60408501611940565b90509250925092565b60005b838110156119b357818101518382015260200161199b565b838111156119c2576000848401525b50505050565b600081518084526119e0816020860160208601611998565b601f01601f19169290920160200192915050565b600060a083018251845260208084015160018060a01b0380821683880152604086015160408801528060608701511660608801525050608084015160a0608087015282815180855260c08801915060c08160051b8901019450838301925060005b81811015611a835760bf19898703018352611a718685516119c8565b95509284019291840191600101611a55565b5093979650505050505050565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015611ae557603f19888603018452611ad38583516119f4565b94509285019290850190600101611ab7565b5092979650505050505050565b60008060408385031215611b0557600080fd5b611b0e83611940565b946020939093013593505050565b60008060008060808587031215611b3257600080fd5b611b3b85611940565b93506020850135925060408501359150611b5760608601611940565b905092959194509250565b634e487b7160e01b600052604160045260246000fd5b600060208284031215611b8a57600080fd5b813567ffffffffffffffff80821115611ba257600080fd5b818401915084601f830112611bb657600080fd5b813581811115611bc857611bc8611b62565b604051601f8201601f19908116603f01168101908382118183101715611bf057611bf0611b62565b81604052828152876020848701011115611c0957600080fd5b826020860160208301376000928101602001929092525095945050505050565b602081526000611c3c60208301846119f4565b9392505050565b80518252602080820151908301526040808201516001600160a01b03908116918401919091526060808301519084015260809182015116910152565b6020808252825182820181905260009190848201906040850190845b81811015611cc157611cae838551611c43565b9284019260a09290920191600101611c9b565b50909695505050505050565b600060208284031215611cdf57600080fd5b5035919050565b602081526000611c3c60208301846119c8565b60008060008060008060c08789031215611d1257600080fd5b611d1b87611940565b95506020870135945060408701359350611d3760608801611940565b925060808701359150611d4c60a08801611940565b90509295509295509295565b60a08101610d2a8284611c43565b600060208284031215611d7857600080fd5b611c3c82611940565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b60008251611dc8818460208701611998565b9190910192915050565b634e487b7160e01b600052603260045260246000fd5b600181811c90821680611dfc57607f821691505b602082108114156107ab57634e487b7160e01b600052602260045260246000fd5b600080835481600182811c915080831680611e3957607f831692505b6020808410821415611e5957634e487b7160e01b86526022600452602486fd5b818015611e6d5760018114611e7e57611eab565b60ff19861689528489019650611eab565b60008a81526020902060005b86811015611ea35781548b820152908501908301611e8a565b505084890196505b509498975050505050505050565b634e487b7160e01b600052601160045260246000fd5b6000600019821415611ee357611ee3611eb9565b5060010190565b600082821015611efc57611efc611eb9565b500390565b634e487b7160e01b600052603160045260246000fdfea264697066735822122042bba6262ae0fb84d7b7c1d73e309586786f34b65222fc1f675e761c152e711364736f6c634300080b0033"

// CoinToken
let tokenABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "initialSupply",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
let tokenBIN = "0x60806040523480156200001157600080fd5b5060405162000bb838038062000bb883398101604081905262000034916200023a565b604080518082018252600481526321b7b4b760e11b60208083019182528351808501909452600284526110c960f21b9084015281519192916200007a9160039162000194565b5080516200009090600490602084019062000194565b505050620000a53382620000ac60201b60201c565b50620002b8565b6001600160a01b038216620001075760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015260640160405180910390fd5b80600260008282546200011b919062000254565b90915550506001600160a01b038216600090815260208190526040812080548392906200014a90849062000254565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b828054620001a2906200027b565b90600052602060002090601f016020900481019282620001c6576000855562000211565b82601f10620001e157805160ff191683800117855562000211565b8280016001018555821562000211579182015b8281111562000211578251825591602001919060010190620001f4565b506200021f92915062000223565b5090565b5b808211156200021f576000815560010162000224565b6000602082840312156200024d57600080fd5b5051919050565b600082198211156200027657634e487b7160e01b600052601160045260246000fd5b500190565b600181811c908216806200029057607f821691505b60208210811415620002b257634e487b7160e01b600052602260045260246000fd5b50919050565b6108f080620002c86000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461012357806370a082311461013657806395d89b411461015f578063a457c2d714610167578063a9059cbb1461017a578063dd62ed3e1461018d57600080fd5b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100ef57806323b872dd14610101578063313ce56714610114575b600080fd5b6100b66101c6565b6040516100c3919061070e565b60405180910390f35b6100df6100da36600461077f565b610258565b60405190151581526020016100c3565b6002545b6040519081526020016100c3565b6100df61010f3660046107a9565b61026e565b604051601281526020016100c3565b6100df61013136600461077f565b610324565b6100f36101443660046107e5565b6001600160a01b031660009081526020819052604090205490565b6100b661035b565b6100df61017536600461077f565b61036a565b6100df61018836600461077f565b610405565b6100f361019b366004610807565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6060600380546101d59061083a565b80601f01602080910402602001604051908101604052809291908181526020018280546102019061083a565b801561024e5780601f106102235761010080835404028352916020019161024e565b820191906000526020600020905b81548152906001019060200180831161023157829003601f168201915b5050505050905090565b6000610265338484610412565b50600192915050565b600061027b848484610536565b6001600160a01b0384166000908152600160209081526040808320338452909152902054828110156103055760405162461bcd60e51b815260206004820152602860248201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616044820152676c6c6f77616e636560c01b60648201526084015b60405180910390fd5b6103198533610314868561088b565b610412565b506001949350505050565b3360008181526001602090815260408083206001600160a01b038716845290915281205490916102659185906103149086906108a2565b6060600480546101d59061083a565b3360009081526001602090815260408083206001600160a01b0386168452909152812054828110156103ec5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084016102fc565b6103fb3385610314868561088b565b5060019392505050565b6000610265338484610536565b6001600160a01b0383166104745760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b60648201526084016102fc565b6001600160a01b0382166104d55760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b60648201526084016102fc565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b03831661059a5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b60648201526084016102fc565b6001600160a01b0382166105fc5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b60648201526084016102fc565b6001600160a01b038316600090815260208190526040902054818110156106745760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b60648201526084016102fc565b61067e828261088b565b6001600160a01b0380861660009081526020819052604080822093909355908516815290812080548492906106b49084906108a2565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161070091815260200190565b60405180910390a350505050565b600060208083528351808285015260005b8181101561073b5785810183015185820160400152820161071f565b8181111561074d576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b038116811461077a57600080fd5b919050565b6000806040838503121561079257600080fd5b61079b83610763565b946020939093013593505050565b6000806000606084860312156107be57600080fd5b6107c784610763565b92506107d560208501610763565b9150604084013590509250925092565b6000602082840312156107f757600080fd5b61080082610763565b9392505050565b6000806040838503121561081a57600080fd5b61082383610763565b915061083160208401610763565b90509250929050565b600181811c9082168061084e57607f821691505b6020821081141561086f57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b60008282101561089d5761089d610875565b500390565b600082198211156108b5576108b5610875565b50019056fea26469706673582212203157ce3e581c15e132dcf27d1f450b92ade6c3d5a376fa0aeb5f8feae185320064736f6c634300080b0033"

// GameItem
let nftABI =  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "awardItem",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "awardItem",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "findAllNFTsOwnedBy",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "tokenByIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "tokenOfOwnerByIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
let nftBIN = "0x60806040523480156200001157600080fd5b50604080518082018252600881526747616d654974656d60c01b60208083019182528351808501909452600384526249544d60e81b9084015281519192916200005d916000916200007c565b508051620000739060019060208401906200007c565b5050506200015f565b8280546200008a9062000122565b90600052602060002090601f016020900481019282620000ae5760008555620000f9565b82601f10620000c957805160ff1916838001178555620000f9565b82800160010185558215620000f9579182015b82811115620000f9578251825591602001919060010190620000dc565b50620001079291506200010b565b5090565b5b808211156200010757600081556001016200010c565b600181811c908216806200013757607f821691505b602082108114156200015957634e487b7160e01b600052602260045260246000fd5b50919050565b611c9b806200016f6000396000f3fe608060405234801561001057600080fd5b50600436106101215760003560e01c80636352211e116100ad578063b88d4fde11610071578063b88d4fde14610262578063c87b56dd14610275578063cf37834314610288578063e985e9c51461029b578063f2fb2120146102d757600080fd5b80636352211e1461020157806370a08231146102145780638dfe98c31461022757806395d89b4114610247578063a22cb4651461024f57600080fd5b806318160ddd116100f457806318160ddd146101a357806323b872dd146101b55780632f745c59146101c857806342842e0e146101db5780634f6ccce7146101ee57600080fd5b806301ffc9a71461012657806306fdde031461014e578063081812fc14610163578063095ea7b31461018e575b600080fd5b6101396101343660046116ce565b6102ea565b60405190151581526020015b60405180910390f35b6101566102fb565b6040516101459190611743565b610176610171366004611756565b61038d565b6040516001600160a01b039091168152602001610145565b6101a161019c36600461178b565b61041a565b005b6009545b604051908152602001610145565b6101a16101c33660046117b5565b610530565b6101a76101d636600461178b565b610561565b6101a16101e93660046117b5565b6105f7565b6101a76101fc366004611756565b610612565b61017661020f366004611756565b6106a5565b6101a76102223660046117f1565b61071c565b61023a6102353660046117f1565b6107a3565b604051610145919061180c565b61015661084b565b6101a161025d366004611850565b61085a565b6101a16102703660046118a2565b61091f565b610156610283366004611756565b610957565b6101a761029636600461197e565b610962565b6101396102a9366004611a01565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b6101a76102e53660046117f1565b6109d1565b60006102f5826109f8565b92915050565b60606000805461030a90611a34565b80601f016020809104026020016040519081016040528092919081815260200182805461033690611a34565b80156103835780601f1061035857610100808354040283529160200191610383565b820191906000526020600020905b81548152906001019060200180831161036657829003601f168201915b5050505050905090565b600061039882610a1d565b6103fe5760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201526b34b9ba32b73a103a37b5b2b760a11b60648201526084015b60405180910390fd5b506000908152600460205260409020546001600160a01b031690565b6000610425826106a5565b9050806001600160a01b0316836001600160a01b031614156104935760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084016103f5565b336001600160a01b03821614806104af57506104af81336102a9565b6105215760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c000000000000000060648201526084016103f5565b61052b8383610a3a565b505050565b61053a3382610aa8565b6105565760405162461bcd60e51b81526004016103f590611a6f565b61052b838383610b8e565b600061056c8361071c565b82106105ce5760405162461bcd60e51b815260206004820152602b60248201527f455243373231456e756d657261626c653a206f776e657220696e646578206f7560448201526a74206f6620626f756e647360a81b60648201526084016103f5565b506001600160a01b03919091166000908152600760209081526040808320938352929052205490565b61052b8383836040518060200160405280600081525061091f565b600061061d60095490565b82106106805760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201526b7574206f6620626f756e647360a01b60648201526084016103f5565b6009828154811061069357610693611ac0565b90600052602060002001549050919050565b6000818152600260205260408120546001600160a01b0316806102f55760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201526832b73a103a37b5b2b760b91b60648201526084016103f5565b60006001600160a01b0382166107875760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a65604482015269726f206164647265737360b01b60648201526084016103f5565b506001600160a01b031660009081526003602052604090205490565b606060006107b08361071c565b905060008167ffffffffffffffff8111156107cd576107cd61188c565b6040519080825280602002602001820160405280156107f6578160200160208202803683370190505b50905060005b828110156108435760006108108683610561565b90508083838151811061082557610825611ac0565b6020908102919091010152508061083b81611aec565b9150506107fc565b509392505050565b60606001805461030a90611a34565b6001600160a01b0382163314156108b35760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c65720000000000000060448201526064016103f5565b3360008181526005602090815260408083206001600160a01b03871680855290835292819020805460ff191686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b6109293383610aa8565b6109455760405162461bcd60e51b81526004016103f590611a6f565b61095184848484610d39565b50505050565b60606102f582610d6c565b6000610972600b80546001019055565b600061097d600b5490565b90506109898582610edb565b6109c98185858080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061101a92505050565b949350505050565b60006109e1600b80546001019055565b60006109ec600b5490565b90506102f58382610edb565b60006001600160e01b0319821663780e9d6360e01b14806102f557506102f5826110a5565b6000908152600260205260409020546001600160a01b0316151590565b600081815260046020526040902080546001600160a01b0319166001600160a01b0384169081179091558190610a6f826106a5565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000610ab382610a1d565b610b145760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201526b34b9ba32b73a103a37b5b2b760a11b60648201526084016103f5565b6000610b1f836106a5565b9050806001600160a01b0316846001600160a01b03161480610b5a5750836001600160a01b0316610b4f8461038d565b6001600160a01b0316145b806109c957506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff166109c9565b826001600160a01b0316610ba1826106a5565b6001600160a01b031614610c095760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201526839903737ba1037bbb760b91b60648201526084016103f5565b6001600160a01b038216610c6b5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b60648201526084016103f5565b610c768383836110f5565b610c81600082610a3a565b6001600160a01b0383166000908152600360205260408120805460019290610caa908490611b07565b90915550506001600160a01b0382166000908152600360205260408120805460019290610cd8908490611b1e565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b610d44848484610b8e565b610d5084848484611100565b6109515760405162461bcd60e51b81526004016103f590611b36565b6060610d7782610a1d565b610ddd5760405162461bcd60e51b815260206004820152603160248201527f45524337323155524953746f726167653a2055524920717565727920666f72206044820152703737b732bc34b9ba32b73a103a37b5b2b760791b60648201526084016103f5565b60008281526006602052604081208054610df690611a34565b80601f0160208091040260200160405190810160405280929190818152602001828054610e2290611a34565b8015610e6f5780601f10610e4457610100808354040283529160200191610e6f565b820191906000526020600020905b815481529060010190602001808311610e5257829003601f168201915b505050505090506000610e8d60408051602081019091526000815290565b9050805160001415610ea0575092915050565b815115610ed2578082604051602001610eba929190611b88565b60405160208183030381529060405292505050919050565b6109c9846111fe565b6001600160a01b038216610f315760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016103f5565b610f3a81610a1d565b15610f875760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000060448201526064016103f5565b610f93600083836110f5565b6001600160a01b0382166000908152600360205260408120805460019290610fbc908490611b1e565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b61102382610a1d565b6110865760405162461bcd60e51b815260206004820152602e60248201527f45524337323155524953746f726167653a2055524920736574206f66206e6f6e60448201526d32bc34b9ba32b73a103a37b5b2b760911b60648201526084016103f5565b6000828152600660209081526040909120825161052b9284019061161c565b60006001600160e01b031982166380ac58cd60e01b14806110d657506001600160e01b03198216635b5e139f60e01b145b806102f557506301ffc9a760e01b6001600160e01b03198316146102f5565b61052b8383836112d6565b60006001600160a01b0384163b156111f357604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290611144903390899088908890600401611bb7565b6020604051808303816000875af192505050801561117f575060408051601f3d908101601f1916820190925261117c91810190611bf4565b60015b6111d9573d8080156111ad576040519150601f19603f3d011682016040523d82523d6000602084013e6111b2565b606091505b5080516111d15760405162461bcd60e51b81526004016103f590611b36565b805181602001fd5b6001600160e01b031916630a85bd0160e11b1490506109c9565b506001949350505050565b606061120982610a1d565b61126d5760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201526e3732bc34b9ba32b73a103a37b5b2b760891b60648201526084016103f5565b600061128460408051602081019091526000815290565b905060008151116112a457604051806020016040528060008152506112cf565b806112ae8461138e565b6040516020016112bf929190611b88565b6040516020818303038152906040525b9392505050565b6001600160a01b0383166113315761132c81600980546000838152600a60205260408120829055600182018355919091527f6e1540171b6c0c960b71a7020d9f60077f6af931a8bbf590da0223dacf75c7af0155565b611354565b816001600160a01b0316836001600160a01b03161461135457611354838261148c565b6001600160a01b03821661136b5761052b81611529565b826001600160a01b0316826001600160a01b03161461052b5761052b82826115d8565b6060816113b25750506040805180820190915260018152600360fc1b602082015290565b8160005b81156113dc57806113c681611aec565b91506113d59050600a83611c27565b91506113b6565b60008167ffffffffffffffff8111156113f7576113f761188c565b6040519080825280601f01601f191660200182016040528015611421576020820181803683370190505b5090505b84156109c957611436600183611b07565b9150611443600a86611c3b565b61144e906030611b1e565b60f81b81838151811061146357611463611ac0565b60200101906001600160f81b031916908160001a905350611485600a86611c27565b9450611425565b600060016114998461071c565b6114a39190611b07565b6000838152600860205260409020549091508082146114f6576001600160a01b03841660009081526007602090815260408083208584528252808320548484528184208190558352600890915290208190555b5060009182526008602090815260408084208490556001600160a01b039094168352600781528383209183525290812055565b60095460009061153b90600190611b07565b6000838152600a60205260408120546009805493945090928490811061156357611563611ac0565b90600052602060002001549050806009838154811061158457611584611ac0565b6000918252602080832090910192909255828152600a909152604080822084905585825281205560098054806115bc576115bc611c4f565b6001900381819060005260206000200160009055905550505050565b60006115e38361071c565b6001600160a01b039093166000908152600760209081526040808320868452825280832085905593825260089052919091209190915550565b82805461162890611a34565b90600052602060002090601f01602090048101928261164a5760008555611690565b82601f1061166357805160ff1916838001178555611690565b82800160010185558215611690579182015b82811115611690578251825591602001919060010190611675565b5061169c9291506116a0565b5090565b5b8082111561169c57600081556001016116a1565b6001600160e01b0319811681146116cb57600080fd5b50565b6000602082840312156116e057600080fd5b81356112cf816116b5565b60005b838110156117065781810151838201526020016116ee565b838111156109515750506000910152565b6000815180845261172f8160208601602086016116eb565b601f01601f19169290920160200192915050565b6020815260006112cf6020830184611717565b60006020828403121561176857600080fd5b5035919050565b80356001600160a01b038116811461178657600080fd5b919050565b6000806040838503121561179e57600080fd5b6117a78361176f565b946020939093013593505050565b6000806000606084860312156117ca57600080fd5b6117d38461176f565b92506117e16020850161176f565b9150604084013590509250925092565b60006020828403121561180357600080fd5b6112cf8261176f565b6020808252825182820181905260009190848201906040850190845b8181101561184457835183529284019291840191600101611828565b50909695505050505050565b6000806040838503121561186357600080fd5b61186c8361176f565b91506020830135801515811461188157600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b600080600080608085870312156118b857600080fd5b6118c18561176f565b93506118cf6020860161176f565b925060408501359150606085013567ffffffffffffffff808211156118f357600080fd5b818701915087601f83011261190757600080fd5b8135818111156119195761191961188c565b604051601f8201601f19908116603f011681019083821181831017156119415761194161188c565b816040528281528a602084870101111561195a57600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b60008060006040848603121561199357600080fd5b61199c8461176f565b9250602084013567ffffffffffffffff808211156119b957600080fd5b818601915086601f8301126119cd57600080fd5b8135818111156119dc57600080fd5b8760208285010111156119ee57600080fd5b6020830194508093505050509250925092565b60008060408385031215611a1457600080fd5b611a1d8361176f565b9150611a2b6020840161176f565b90509250929050565b600181811c90821680611a4857607f821691505b60208210811415611a6957634e487b7160e01b600052602260045260246000fd5b50919050565b60208082526031908201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f6040820152701ddb995c881b9bdc88185c1c1c9bdd9959607a1b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600019821415611b0057611b00611ad6565b5060010190565b600082821015611b1957611b19611ad6565b500390565b60008219821115611b3157611b31611ad6565b500190565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b60008351611b9a8184602088016116eb565b835190830190611bae8183602088016116eb565b01949350505050565b6001600160a01b0385811682528416602082015260408101839052608060608201819052600090611bea90830184611717565b9695505050505050565b600060208284031215611c0657600080fd5b81516112cf816116b5565b634e487b7160e01b600052601260045260246000fd5b600082611c3657611c36611c11565b500490565b600082611c4a57611c4a611c11565b500690565b634e487b7160e01b600052603160045260246000fdfea2646970667358221220d48b3b606b4c5fb2bf05a388fab8d816165826a12e65c18f54084fb5b76b35fc64736f6c634300080b0033"

// ListingStorage
let listingABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "askings",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "bcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tokenAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "askingsContains",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "askingsKeys",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_nftOwner",
          "type": "address"
        }
      ],
      "name": "createListing",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        }
      ],
      "name": "deleteAsking",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "deleteListing",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        }
      ],
      "name": "findAsking",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "bcId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "tokenAddr",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            }
          ],
          "internalType": "struct ListingStorage.Ask",
          "name": "_ask",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "findAskings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "bcId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "tokenAddr",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            }
          ],
          "internalType": "struct ListingStorage.Ask[]",
          "name": "_askings",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        }
      ],
      "name": "findListing",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "nftContract",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "nftId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bytes[]",
              "name": "askingsKeys",
              "type": "bytes[]"
            }
          ],
          "internalType": "struct ListingStorage.Listing",
          "name": "_listing",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "findListings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "nftContract",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "nftId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bytes[]",
              "name": "askingsKeys",
              "type": "bytes[]"
            }
          ],
          "internalType": "struct ListingStorage.Listing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getListingsCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "listings",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "nftId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "listingsContains",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "listingsKeys",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nftContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nftId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_otherBcId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_otherTokenRecipient",
          "type": "address"
        }
      ],
      "name": "upsertAsking",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

async function config() {
  
    // Get web3 & create accounts.
    let web3A = new Web3('http://127.0.0.1:8111');
    let web3B = new Web3('http://127.0.0.1:8222');
    web3A.eth.accounts.wallet.create(1, web3A.utils.randomHex(32));
    web3B.eth.accounts.wallet.create(1, web3B.utils.randomHex(32));
    let accountA = web3A.eth.accounts.wallet[0].address;
    let accountB = web3B.eth.accounts.wallet[0].address;
    chainA = await web3A.eth.getChainId();
    chainB = await web3B.eth.getChainId();
    
    // Setup
    console.log("Testing environment setup...");
    
    // Deploy registrars
    let regA = new web3A.eth.Contract(regABI);
    let regB = new web3B.eth.Contract(regABI);
    let res;
    res = await regA.deploy({
        data: regBIN
    }).send({
        from: accountA,
        gas: 10000000
    });
    let regAddrA = res.options.address;
    regA.options.address = regAddrA;
    console.log("Registrar A:", regAddrA);
    res = await regB.deploy({
        data: regBIN
    }).send({
        from: accountB,
        gas: 10000000
    });
    let regAddrB = res.options.address;
    regB.options.address = regAddrB;
    console.log("Registrar B:", regAddrB);

    // Add signer
    res = await regA.methods.addSignerSetThreshold(chainA, signerAddr, 1).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status)
    await regA.methods.addSignerSetThreshold(chainB, signerAddr, 1).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status)
    await regB.methods.addSignerSetThreshold(chainA, signerAddr, 1).send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status)
    await regB.methods.addSignerSetThreshold(chainB, signerAddr, 1).send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status)

    // Deploy verifiers
    let vefA = new web3A.eth.Contract(vefABI)
    let vefB = new web3B.eth.Contract(vefABI)
    res = await vefA.deploy({
        data: vefBIN,
        arguments: [regA.options.address]
    }).send({
        from: accountA,
        gas: 10000000
    });
    let vefAddrA = res.options.address;
    vefA.options.address = vefAddrA;
    console.log("Verifier A:", vefAddrA);
    res = await vefB.deploy({
        data: vefBIN,
        arguments: [regB.options.address]
    }).send({
        from: accountB,
        gas: 10000000
    });
    let vefAddrB = res.options.address;
    vefB.options.address = vefAddrB;
    console.log("Verifier B:", vefAddrB);

    // Deploy gpacts
    let gpactA = new web3A.eth.Contract(gpactABI)
    let gpactB = new web3B.eth.Contract(gpactABI)
    res = await gpactA.deploy({
        data: gpactBIN,
        arguments: [chainA]
    }).send({
        from: accountA,           
        gas: 10000000
    });
    gpactAddrA = res.options.address;
    gpactA.options.address = gpactAddrA;
    console.log("Gpact A:", gpactAddrA);
    res = await gpactB.deploy({
        data: gpactBIN,
        arguments: [chainB]
    }).send({
        from: accountB,           
        gas: 10000000
    });
    gpactAddrB = res.options.address;
    gpactB.options.address = gpactAddrB;
    console.log("Gpact B:", gpactAddrB);

    // Add verifiers
    res = await gpactA.methods.addVerifier(chainA, vefA.options.address).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await gpactA.methods.addVerifier(chainB, vefA.options.address).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await gpactB.methods.addVerifier(chainA, vefB.options.address).send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status);
    res = await gpactB.methods.addVerifier(chainB, vefB.options.address).send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status);

    // Add gpact mappings  //// 여기부터 보자
    res = await gpactA.methods.addRemoteCrosschainControl(chainA, gpactA.options.address).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await gpactA.methods.addRemoteCrosschainControl(chainB, gpactB.options.address).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await gpactB.methods.addRemoteCrosschainControl(chainA, gpactA.options.address).send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status);
    res = await gpactB.methods.addRemoteCrosschainControl(chainB, gpactB.options.address).send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status);

    // Deploy bridges.
    let bridgeA = new web3A.eth.Contract(bridgeABI);
    let bridgeB = new web3B.eth.Contract(bridgeABI);
    res = await bridgeA.deploy({
        data: bridgeBIN,
        arguments: [gpactAddrA]
    }).send({
        from: accountA,
        gas: 10000000
    });
    bridgeAddrA = res.options.address;
    bridgeA.options.address = bridgeAddrA;
    console.log("Bridge A:", bridgeAddrA);
    res = await bridgeB.deploy({
        data: bridgeBIN,
        arguments: [gpactAddrB]
    }).send({
        from: accountB,
        gas: 10000000
    });
    bridgeAddrB = res.options.address;
    bridgeB.options.address = bridgeAddrB;
    console.log("Bridge B:", bridgeAddrB);

    // Add bridge mapping
    res = await bridgeA.methods.registerRemoteBridges([chainB], [bridgeAddrB]).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await bridgeB.methods.registerRemoteBridges([chainA], [bridgeAddrA]).send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status);

    // Deploy NFT on chain A and token on chain B
    let nftA = new web3A.eth.Contract(nftABI);
    let tokenB = new web3B.eth.Contract(tokenABI);
    res = await nftA.deploy({
        data: nftBIN
    }).send({
        from: accountA,
        gas: 10000000
    });
    nftAddrA = res.options.address;
    nftA.options.address = nftAddrA;
    console.log("NFT A:", nftAddrA);
    res = await tokenB.deploy({
        data: tokenBIN,
        arguments: ["1000000000000000000000"]
    }).send({
        from: accountB,
        gas: 10000000
    });
    tokenAddrB = res.options.address;
    tokenB.options.address = tokenAddrB;
    console.log("Token B:", tokenAddrB);

    // Send NFT and tokens to test accounts
    res = await nftA.methods.awardItem(sellerAddr).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await nftA.methods.awardItem(sellerAddr).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await nftA.methods.awardItem(sellerAddr).send({
        from: accountA,
        gas: 10000000
    });
    console.log(res.status);
    res = await tokenB.methods.transfer(buyerAddr, "1000000000000000000000").send({
        from: accountB,
        gas: 10000000
    });
    console.log(res.status);

    // Configure relayer components
    let output;
    output = execSync.execSync('docker exec observer1-js /app/build/admin observer start localhost:9425 ' + chainA + " ws://chainA-js:8546 GPACT " + gpactA.options.address);
    console.log(output.toString());
    output = execSync.execSync('docker exec observer2-js /app/build/admin observer start localhost:9425 ' + chainB + " ws://chainB-js:8546 GPACT " + gpactB.options.address);
    console.log(output.toString());
    output = execSync.execSync('docker exec relayer-js /app/build/admin relayer set-key localhost:9425 0 0x0000000000000000000000000000000000000000 ' + signerKey);
    console.log(output.toString());
    output = execSync.execSync('docker exec dispatcher-js /app/build/admin dispatcher set-msgstore localhost:9425 msgstore-js:8080');
    console.log(output.toString());
}
async function test() {
    

    // Get web3 & add accounts.
    let web3A_seller = new Web3('http://127.0.0.1:8111');
    let web3B_seller = new Web3('http://127.0.0.1:8222');
    let web3A_buyer = new Web3('http://127.0.0.1:8111');
    let web3B_buyer = new Web3('http://127.0.0.1:8222');
    web3A_seller.eth.accounts.wallet.add(sellerKey);
    web3B_seller.eth.accounts.wallet.add(sellerKey);
    web3A_buyer.eth.accounts.wallet.add(buyerKey);
    web3B_buyer.eth.accounts.wallet.add(buyerKey);

    // Initialise SDK
    // Create chain manager.
    let chainMgr = new ChainAPManager();
    chainMgr.registerChainAP(chainA, web3A_buyer);
    chainMgr.registerChainAP(chainB, web3B_buyer);
    // Create message store manager.
    let ms = new MsgStore("localhost:8080");
    // Create simulator.
    let simulator = new Simulator(chainMgr);
    simulator.registerABI("bridge", bridgeABI);
    simulator.registerCallLink("bridge", "buyNFTUsingRemoteFunds", async function (cmgr, caller, call) {
        // Parse arguments.
        if (call.params.length != 5) {
            throw new Error("invalid parameters");
        }
        let buyer = call.params[0];
        let _nftContract = call.params[1];
        let nftId = call.params[2];
        let otherBcId = call.params[3];
        let otherTokenContract = call.params[4];
        // Load bridge contract.
        let chain = await cmgr.chainAP(call.chainID);
        let bridge = new chain.eth.Contract(bridgeABI, call.contractAddr);
        // ====== START CONTRACT LOGIC ======
        let destBridge = await bridge.methods.remoteBridges(otherBcId).call();
        if (destBridge == "0x0000000000000000000000000000000000000000") {
            throw new Error("Bridge: dest chain not supported");
        }
        // Find listing.
        let storageContract = new chain.eth.Contract(listingABI, await bridge.methods.listingStorage().call());
        await storageContract.methods.findListing(_nftContract, nftId).call();
        // Find asking.
        let asking = await storageContract.methods.findAsking(_nftContract, nftId, otherBcId, otherTokenContract).call();
        // Perform cross call.
        let subCall = new CrosschainCall(otherBcId, "bridge", destBridge, "processTokenTransfer", otherTokenContract, asking.amount, buyer, asking.recipient);
        await caller.makeCall(subCall);
        return null;
    });
    simulator.registerCallLink("bridge", "processTokenTransfer", async function (cmgr, caller, call) {
        // Parse arguments.
        if (call.params.length != 4) {
            throw new Error("invalid parameters");
        }
        let _tokenContract = call.params[0];
        let amt = call.params[1];
        let from = call.params[2];
        // let to = call.params[3] // Not used.
        // Load bridge contract.
        let chain  = await cmgr.chainAP(call.chainID);
        let bridge = new chain.eth.Contract(bridgeABI, call.contractAddr);
        // ====== START CONTRACT LOGIC ======
        let auth = caller.decodeAtomicAuthParameters();
        let sourceBcId = auth[1];
        let sourceContract = auth[2];
        if (sourceContract != await bridge.methods.remoteBridges(sourceBcId).call()) {
            throw new Error("Bridge: Contract does not match");
        }
        let erc20 = new chain.eth.Contract(tokenABI, _tokenContract);
        if (await erc20.methods.allowance(from, call.contractAddr).call() < amt) {
            throw new Error("ERC20 allowance not enough");
        }
        return null;
    });
    // Create executor
    let executor = new Executor(chainMgr, buyerAddr, ms);
    executor.registerGPACT(chainA, gpactAddrA);
    executor.registerGPACT(chainB, gpactAddrB);

    // Test happy case
    let bridgeContract = new web3A_seller.eth.Contract(bridgeABI, bridgeAddrA);
    let nftContract = new web3A_seller.eth.Contract(nftABI, nftAddrA);
    let tokenContract = new web3B_buyer.eth.Contract(tokenABI, tokenAddrB);

    let res;
    res = await nftContract.methods.approve(bridgeAddrA, 1).send({
        from: sellerAddr,
        gas: 10000000,
    });
    console.log(res.status);

    // Listing은 어떤 주소에 해당하는 NFT contract의 어떤 id의 NFT를 팔건지를 뜻하고 asking은 그것에 대해서 어떤 토큰주소로 얼마에 팔건지랑 수령인주소를 관리
    res = await bridgeContract.methods.startListingNFTWithAsking(nftAddrA, 1, chainB, tokenAddrB, 100, sellerAddr).send({
        from: sellerAddr,
        gas: 10000000,
    });
    console.log(res.status);

    // Get balance before
    let nftOwner = await nftContract.methods.ownerOf(1).call();
    let tokenBalanceBuyer = await tokenContract.methods.balanceOf(buyerAddr).call();
    let tokenBalanceSeller = await tokenContract.methods.balanceOf(sellerAddr).call();
    if (nftOwner != sellerAddr) {
        throw new Error("nft 1 should belong to seller before purchase");
    }
    if (tokenBalanceBuyer != BigInt("1000000000000000000000")) {
        throw new Error("buyer should have 1000000000000000000000 tokens before purchase");
    }
    if (tokenBalanceSeller != BigInt(0)) {
        throw new Error("seller should have 0 tokens before purchase");
    }

    // Approve & do the purchase
    res = await tokenContract.methods.approve(bridgeAddrB, 100).send({
        from: buyerAddr,
        gas: 10000000,
    });
    console.log(res.status);

    let temp = await simulator.simulate(new CrosschainCall(chainA, "bridge", bridgeAddrA, "buyNFTUsingRemoteFunds", buyerAddr, nftAddrA, 1, chainB, tokenAddrB));
    let root = temp[0];
    await executor.crosschainCall(root);

    // Get balance after
    nftOwner = await nftContract.methods.ownerOf(1).call();
    tokenBalanceBuyer = await tokenContract.methods.balanceOf(buyerAddr).call();
    tokenBalanceSeller = await tokenContract.methods.balanceOf(sellerAddr).call();
    if (nftOwner != buyerAddr) {
        throw new Error("nft 1 should belong to buyer after purchase");
    }
    if (tokenBalanceBuyer != BigInt("999999999999999999900")) {
        throw new Error("buyer should have 999999999999999999900 tokens after purchase");
    }
    if (tokenBalanceSeller != BigInt(100)) {
        throw new Error("seller should have 100 tokens after purchase");
    }
    console.log("Testing happy case succeed")

    // Start testing failure cases.
    res = await nftContract.methods.approve(bridgeAddrA, 2).send({
        from: sellerAddr,
        gas: 10000000,
    });
    console.log(res.status);

    res = await bridgeContract.methods.startListingNFTWithAsking(nftAddrA, 2, chainB, tokenAddrB, 100, sellerAddr).send({
        from: sellerAddr,
        gas: 10000000,
    });
    console.log(res.status);

    // Test failure case #1, change approved token amount after simulation.
    res = await tokenContract.methods.approve(bridgeAddrB, 100).send({
        from: buyerAddr,
        gas: 10000000,
    });
    console.log(res.status);

    temp = await simulator.simulate(new CrosschainCall(chainA, "bridge", bridgeAddrA, "buyNFTUsingRemoteFunds", buyerAddr, nftAddrA, 2, chainB, tokenAddrB));
    root = temp[0];
    // Change approved amount.
    res = await tokenContract.methods.approve(bridgeAddrB, 90).send({
        from: buyerAddr,
        gas: 10000000,
    });
    console.log(res.status);
    console.log(res.status);
    await executor.crosschainCall(root);

    // Get balance after, should not change
    nftOwner = await nftContract.methods.ownerOf(2).call();
    tokenBalanceBuyer = await tokenContract.methods.balanceOf(buyerAddr).call();
    tokenBalanceSeller = await tokenContract.methods.balanceOf(sellerAddr).call();
    if (nftOwner != sellerAddr) {
        throw new Error("nft 2 should belong to seller after failed purchase");
    }
    if (tokenBalanceBuyer != BigInt("999999999999999999900")) {
        throw new Error("buyer should still have 999999999999999999900 tokens after failed purchase");
    }
    if (tokenBalanceSeller != BigInt(100)) {
        throw new Error("seller should have still 100 tokens after failed purchase");
    }
    console.log("Testing failure case #1 succeed")

    // // Test failure case #2, update asking with higher price
    // res = await tokenContract.methods.approve(bridgeAddrB, 100).send({
    //     from: buyerAddr,
    //     gas: 10000000,
    // });
    // console.log(res.status);

    // temp = await simulator.simulate(new CrosschainCall(chainA, "bridge", bridgeAddrA, "buyNFTUsingRemoteFunds", buyerAddr, nftAddrA, 2, chainB, tokenAddrB));
    // root = temp[0];
    // // Update asking with higher price.
    // res = await bridgeContract.methods.upsertAsking(nftAddrA, 2, chainB, tokenAddrB, 110, sellerAddr).send({
    //     from: sellerAddr,
    //     gas: 10000000,
    // });
    // console.log(res.status);
    // await executor.crosschainCall(root);

    // // Get balance after, should not change
    // nftOwner = await nftContract.methods.ownerOf(2).call();
    // tokenBalanceBuyer = await tokenContract.methods.balanceOf(buyerAddr).call();
    // tokenBalanceSeller = await tokenContract.methods.balanceOf(sellerAddr).call();
    // if (nftOwner != sellerAddr) {
    //     throw new Error("nft 2 should belong to seller after failed purchase");
    // }
    // if (tokenBalanceBuyer != BigInt("999999999999999999900")) {
    //     throw new Error("buyer should still have 999999999999999999900 tokens after failed purchase");
    // }
    // if (tokenBalanceSeller != BigInt(100)) {
    //     throw new Error("seller should have still 100 tokens after failed purchase");
    // }
    console.log("Testing failure case #2 skipped")

    // Test failure case #3, stop listing after simulation.
    res = await tokenContract.methods.approve(bridgeAddrB, 110).send({
        from: buyerAddr,
        gas: 10000000,
    });
    console.log(res.status);

    temp = await simulator.simulate(new CrosschainCall(chainA, "bridge", bridgeAddrA, "buyNFTUsingRemoteFunds", buyerAddr, nftAddrA, 2, chainB, tokenAddrB));
    root = temp[0];
    // Stop the listing after a simulation is done.
    res = await bridgeContract.methods.stopListingNFT(nftAddrA, 2).send({
        from: sellerAddr,
        gas: 10000000,
    });
    console.log(res.status);
    await executor.crosschainCall(root);

    // Get balance after, should not change
    nftOwner = await nftContract.methods.ownerOf(2).call();
    tokenBalanceBuyer = await tokenContract.methods.balanceOf(buyerAddr).call();
    tokenBalanceSeller = await tokenContract.methods.balanceOf(sellerAddr).call();
    if (nftOwner != sellerAddr) {
        throw new Error("nft 2 should belong to seller after failed purchase");
    }
    if (tokenBalanceBuyer != BigInt("999999999999999999900")) {
        throw new Error("buyer should still have 999999999999999999900 tokens after failed purchase");
    }
    if (tokenBalanceSeller != BigInt(100)) {
        throw new Error("seller should have still 100 tokens after failed purchase");
    }
    console.log("Testing failure case #3 succeed")
}
await config();
await test();