# TicketService: Smart Contract based ticket sell point

Author: Javier Fernando Rojo @javierlinked


# [The idea](./idea.md)

## Live Site

[TicketChain](https://javierlinked-consensys.vercel.app/)


## Walkthrough Video

[Walkthrough video](https://www.loom.com/share/876847b0e0ee43a9a0fff76a269703c1?sharedAppSource=personal_library)


## To Run Locally

### Prerequisites

- Node.js >= v16
- Yarn
- `git clone git@github.com:javierlinked/blockchain-developer-bootcamp-final-project.git`


### Contract

Start [Ganache ui](https://www.trufflesuite.com/ganache) and execute the following commands:

- Run `yarn` in project root to install Truffle build and smart contract dependencies
- Create a new profile in Ganache ui using `truffle-config.js` provided.
- `truffle migrate --network development`
- Run tests in Truffle console: `truffle test`
- development network id is 1337, remember to change it in Metamask as well (add http://localhost:7545 as RPC URL and chainId 1337)

### Frontend
- change to `client`.
- `yarn`
- `yarn start`
- Then navigate to [http://127.0.0.1:8080](http://127.0.0.1:8080)

Application will ask to sign with your wallet.
The first account in the wallet is the **contract owner** and it's allowed to create **ticket tockens** by filling the form, and setting the price and rest of the data.

![create screeen](./create.png)

Hit create and signt with your wallet. Then wait for the transaction to be shown as an alert.

When created at least one set of tokens you can switch to another account and buy them.
Set a number to buy (it has to be less or equal to the max allowed per person) and hit buy. 
Sign the trasnaction. Payment will be performed and tokens transfered.
Balance is managed by ERC1155 contract and displayed in the UI.


**NOTE:** If you receive transaction error and you are using MetaMask, please reset your account and try again.


### Not implemented

- Owner can pause the contract. [SECURITY]
- Owner can unpause the contract. [SECURITY]
- Owner can see balance of already created tokens.
- Other account can see balance of already bought tokens.
- Owner can burn a token. This is the case when token is used for the show.


### Tests

```
truffle test
```


### Directory structure

```
????????? client/                  # Dapp
????????? contracts/               # Truffle contracts (alternatively `contracts`)
????????? migrations/              # Truffle migrations (alternatively `migrations`)
????????? test/                    # Automated tests (alternatively `tests`)
????????? truffle-config.js        # Truffle config
????????? README.md

```


## Public Ethereum wallet for certification

`0x23db5E49544C5A5104316E6eE9734120F3eec357`


## TODO

- [ ] Migrate to ethers.js
- [ ] Migrate metadata of a token to a json file in infura or some other offchain solution
- [ ] Use SafeMath.sol for arithmetic operations
- [ ] Move Ownable to roles approach
- [ ] Evaluate `ERC1155PresetMinterPauser`
- [ ] evaluate gas optimizations
- [ ] Change UI to React
- [ ] Add UI for pausable
- [ ] Add a list for minted tokens and balance for contract owner.

