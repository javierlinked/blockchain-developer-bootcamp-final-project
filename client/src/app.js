// @ts-check

/// <reference types='jQuery' />
/// <reference types='web3' />

const contractAddress = '0x6DbC09a28da5d48f04776CEBEB9B01F5ceb2b48c';
const contractOwner = '0x94DCCcDA7409eCec1b244158b98f1Fb9944100B5';

const rinkeby = '4';
const ganache = '5777'; // 5777
let ethereum = window['ethereum'];
let web3, account, data, json, constractInstance, shows, tokens;

/**
 * Extraer error del smart contract y mapear con constantes 
 * tambien las transacciones y limpiar formulario
 * 
 * Mejorar logica de contractAddress y contractOwner
 * 
 * verificar que funcione el cambio de cuenta / pantallas
 * 
 * Falta: mostrar tickets en wallt
 * 
 *    para organizador igual ...
 * 
 */

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
  await init();
  $('.enableEthereumButton').on('click', getAccountData);
  $('.createButton').on('click', createTocken);
});

async function init() {
  $('#ownerView').hide();
  $('#buyerView').hide();
  $('#noWallet').hide();
  $('#walletData').hide();
  if (!await getWeb3()) {
    $('#noWallet').show();
  } else {
    console.log(isAllowedNetwork(ethereum.networkVersion));
    if (isAllowedNetwork(ethereum.networkVersion)) {
      await getJson('./contracts/TicketContract.json').then(data => json = data);
      data = '0x6164646974696f6e616c2064617461';
      constractInstance = new web3.eth.Contract(json.abi, contractAddress);
      constractInstance.setProvider(ethereum);
      $('#walletData').show();
      await getAccountData();
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
  if (account.toLowerCase() === contractOwner.toLowerCase()) {
    $('#ownerView').show();
    $('#buyerView').hide();
  } else {
    tokens = await getTokens();
    const table = makeTableHtml(tokens);
    document.getElementById('tockentList').innerHTML = table;
    bindActions();
    $('#ownerView').hide();
    $('#buyerView').show();
  }
}

/**
 * Gets the current account and balance from the ethereum node
 */
async function getAccountData() {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  account = accounts[0];
  $('.accountLabel').text(account);
  const balance = await web3.eth.getBalance(account);
  $('.accountBalance').text(formatEth(balance));
}

async function createTocken() {
  const showName = $('#showName').val();
  const showPriceWei = $('#showPriceWei').val();
  const initialSupply = $('#initialSupply').val();
  const showTime = $('#showTime').val();
  const maxSellPerPerson = $('#maxSellPerPerson').val();
  const price = web3.utils.toWei(showPriceWei);
  try {
    const tx = await constractInstance.methods.create(showName, price, initialSupply, showTime, maxSellPerPerson, data).send({ from: account });
    console.log(tx.transactionHash);
  } catch (error) {
    console.log(error);
    //  debugger;
  }
}

async function buyTocken(id, amount, price) {
  try {
    const value = amount * price;
    const tx = await constractInstance.methods
      .buy(id, amount, data)
      .send({ from: account, value });
    console.log(tx.transactionHash);
  } catch (error) {
    console.log(error);
    //  debugger;
  }
}

/**
 * Retrieves available tokens stored on chain
 * @returns {Promise<any[]>} list of tokens as stored on chain
 */
async function getTokens() {
  try {
    const tokenIdsLength = await constractInstance.methods.tokenIdsLength().call();
    const indexes = [...Array(parseInt(tokenIdsLength)).keys()];
    const ids = await Promise.all(indexes.map((_, i) => constractInstance.methods.tokenIds(i).call()));
    const arr = await Promise.all(ids.map((id) => constractInstance.methods.tickets(id).call()));
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
    //  debugger;
  }
}

/**
 * Given an array of objects, return a html table
 * @param {any[]} arr array of objects
 * @returns {string} html table
 *  */
function makeTableHtml(arr) {
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
  table.push(`<table class="table card-table table-striped">`);
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
      buyTocken(show.id, ammount, show.price);
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
      await ethereum.request({ method: 'eth_requestAccounts' });
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

  // if (!isAllowedNetwork(web3.utils.hexToNumberString(networkId))) {
   // alert('Please connect to the Rinkeby or localhost node');
    window.location.reload();
 // }
}

async function handleAccountChange(accounts) {
  await getAccountData();
  togglePanels();
}

