// @ts-check

/// <reference types='jQuery' />
/// <reference types='web3' />


console.log('App started');

const rinkeby = '4';
const ganache = '5777'; // 5777
const data = '0x6164646974696f6e616c2064617461';

let ethereum = window['ethereum'];
let web3, actualAccount, json, contractInstance, shows, contractAddress;


/**
 * reads json file and returns promise
 * @param {string} file path
 * @returns {Promise<any>}} json file parsed
 */
async function getJson(file) {
  const response = $.getJSON(file).done(d => d);
  return response;
}

$(async (doument) => {
  json = await getJson('./contracts/TicketContract.json');
  await init();
  $('.createButton').on('click', createToken);
});

async function init() {
  $('#ownerView').hide();
  $('#buyerView').hide();
  $('#noWallet').hide();
  $('#walletData').hide();
  if (!await getWeb3()) {
    $('#noWallet').show();
  } else {
    if (isAllowedNetwork(ethereum.networkVersion)) {
      contractInstance = new web3.eth.Contract(json.abi, contractAddress);
      contractInstance.setProvider(ethereum);
      $('#walletData').show();
      await loadAccountData();
      await togglePanels();
    } else {
      alert('Please connect to the Rinkeby or localhost node');
    }
  }
}

/**
 * logic for showirng right panel according to account
 */
async function togglePanels() {
  const contractOwner = await contractInstance.methods.owner().call();
  if (actualAccount.toLowerCase() === contractOwner.toLowerCase()) {
    $('#ownerView').show();
    $('#buyerView').hide();
  } else {
    const tokens = await getTokens();
    const table = makeTableHtmlActions(tokens);
    document.getElementById('tokentList').innerHTML = table;
    bindActions();

    const bal = await getBalance(tokens, actualAccount);
    const tableBalance = makeTableHtmlBalance( bal);
    document.getElementById('balance').innerHTML = tableBalance;

    $('#ownerView').hide();
    $('#buyerView').show();
  }
}

/**
 * Gets the current account and balance from the ethereum node
 */
async function loadAccountData() {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  actualAccount = accounts[0];
  $('.accountLabel').text(actualAccount);
  const balance = await web3.eth.getBalance(actualAccount);
  $('.accountBalance').text(formatEth(balance));
}

/**
 * Creates a tocken when address is owner
 */
async function createToken() {
  const showName = $('#showName').val();
  const showPriceWei = $('#showPriceWei').val();
  const initialSupply = $('#initialSupply').val();
  const maxSellPerPerson = $('#maxSellPerPerson').val();
  const infoUrl = $('#infoUrl').val();
  const price = web3.utils.toWei(showPriceWei);
  try {
    const tx = await contractInstance.methods.create(showName, price, initialSupply, maxSellPerPerson, infoUrl, data).send({ from: actualAccount });
    window.alert('Transaction OK: ' + tx.transactionHash);
  } catch (error) {
    console.log(error);
    window.alert('Error: ' + getErrorMessage(error));
  }
  $('#contactForm').trigger('reset');
}

/**
 * Buys a token for registered address
 * @param {number} id 
 * @param {number} amount 
 * @param {number} price 
 */
async function buyToken(id, amount, price) {
  try {
    const total = amount * price;
    const tx = await contractInstance.methods
      .buy(id, amount, data)
      .send({ from: actualAccount, value: web3.utils.toWei(total.toString()) });
      window.alert('Transaction OK: ' + tx.transactionHash);
      window.location.reload();
  } catch (error) {
    console.log(error);
    window.alert('Error: ' + getErrorMessage(error));
  }
}

/**
 * Retrieves available tokens stored on chain
 * @returns {Promise<any[]>} list of tokens as stored on chain
 */
async function getTokens() {
  try {
    const tokenIdsLength = await contractInstance.methods.tokenIdsLength().call();
    const indexes = [...Array(parseInt(tokenIdsLength)).keys()];
    const ids = await Promise.all(indexes.map((_, i) => contractInstance.methods.tokenIds(i).call()));
    const arr = await Promise.all(ids.map((id) => contractInstance.methods.tickets(id).call()));
    shows = arr.map((t) => {
      delete t['0'];
      delete t['1'];
      delete t['2'];
      delete t['3'];
      delete t['4'];
      t.price = formatEth(t.price);
      return t;
    });
    return shows;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Given an array of objects, return a html table
 * @param {any[]} arr array of objects
 * @returns {string} html table
 *  */
function makeTableHtmlActions(arr) {
  let table = [];
  let top_row = [];
  let rows = [];
  for (let i = 0; i < arr.length; i++) {
    let cells = [];
    for (let property in arr[i]) {
      if (top_row.length < Object.keys(arr[i]).length) {
        top_row.push(`<th scope="col">${property}</th>`);
      }
      if (arr[i][property] === null) {
        cells.push(`<td>${null}</td>`);
      } else {
        cells.push(`<td>${arr[i][property]}</td>`);
      }
    }
    cells.push(`<td><input type="number" id="amount-${arr[i]['id']}" class="form-control" placeholder="amount"></input></td>`);
    cells.push(`<td><button id="buy-${arr[i]['id']}" class="btn btn-primary">Buy</button></td>`);
    rows.push(`<tr>${cells.join("")}</tr>`);
  }
  table.push(`<table class="table card-table table-striped" id="table-tokens">`);
  table.push(`<thead>${top_row.join("")}</thead>`);
  table.push(`<tbody>${rows.join("")}<tbody>`);
  table.push("</table>");
  return table.join("");
}

/**
 * Given an array of objects, return a html table
 * @param {any[]} arr array of objects
 * @returns {string} html table
 *  */
 function makeTableHtmlBalance(arr) {
  let table = [];
  let top_row = [];
  let rows = [];
  for (let i = 0; i < arr.length; i++) {
    let cells = [];
    for (let property in arr[i]) {
      if (top_row.length < Object.keys(arr[i]).length) {
        top_row.push(`<th scope="col">${property}</th>`);
      }
      if (arr[i][property] === null) {
        cells.push(`<td>${null}</td>`);
      } else {
        cells.push(`<td>${arr[i][property]}</td>`);
      }
    }
    cells.push(`<td><button id="" class="btn btn-primary" onclick="window.alert('Not implemented')">Burn</button></td>`);
    cells.push(`<td><button id="" class="btn btn-primary" onclick="window.alert('Not implemented')">Transfer</button></td>`);
    rows.push(`<tr>${cells.join("")}</tr>`);
  }
  table.push(`<table class="table card-table table-striped" id="table-tokens">`);
  table.push(`<thead>${top_row.join("")}</thead>`);
  table.push(`<tbody>${rows.join("")}<tbody>`);
  table.push("</table>");
  return table.join("");
}


/**
 * binds actions to buttons on buy table
 */
function bindActions() {
  for (const show of shows) {
    $('#buy-' + show.id).on('click', function () {
      var ammount = $(this).closest('tr').find('#amount-' + show.id).val();
      // @ts-ignore
      buyToken(show.id, ammount, show.price);
    })
  }
}

/**
 * Converts and format wei to ether
 * @param {number} value 
 * @returns float number with 4 decimal places
 */
const formatEth = (value) => {
  return parseFloat(web3.utils.fromWei(value)).toFixed(4);
}

/**
 * Gets the web3 object from the ethereum node
 * @returns {Promise<boolean>} true if web3 is available
 */
const getWeb3 = async () => {
  if (typeof ethereum !== 'undefined') {
    // Instance web3 with the provided information
    // @ts-ignore
    web3 = new Web3(window.ethereum);
    try {
      ethereum.on('accountsChanged', handleAccountChange);
      ethereum.on('chainChanged', handleNetworkChange);
      await loadAccountData();
      await loadContractData();
      return true;
    } catch (e) {
      // User denied access
      return false
    }
  }
  return false;
}

let isAllowedNetwork = (/** @type {string} */ networkId) => {
  return [rinkeby, ganache].includes(networkId);
}

function handleNetworkChange(networkId) {
  window.location.reload();
}

async function handleAccountChange(accounts) {
  await loadAccountData();
  togglePanels();
}

/**
 * Parses error from Web3 call
 * @param {any} error 
 * @returns {string} error message
 */
const getErrorMessage = (error) => {
  if (error?.code === 4001) {
    return error.message;
  }
  if (error?.code === -32603 ) { 
    const b = error.message.replace('[ethjs-query] while formatting outputs from RPC ', '');
    const c = b.replaceAll('\'', '');
    return JSON.parse(c)?.value?.data?.message;
  }
  return JSON.stringify(error);
}

async function loadContractData() {
  try {
    contractAddress = json.networks[ethereum.networkVersion].address;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves balance of a given account
 * @param {any[]} tokens
 * @param {string} address
 */
async function getBalance(tokens, address) {
  try {
    const balance = tokens.map(async (token) => {
      const i = {
        name: token.name,
        amount: await contractInstance.methods.balanceOf(address, token.id).call()
      }
      return i;
    });
    return Promise.all(balance);  
  } catch (error) {
    console.log(error);
  }
}