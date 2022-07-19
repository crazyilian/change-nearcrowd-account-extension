// ==UserScript==
// @name         Change Nearcrowd Account
// @description  Simple panel for switching between accounts on nearcrowd.com
// @version      1.5
// @author       crazyilian
// @match        *://nearcrowd.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nearcrowd.com
// @grant        none
// @source       https://github.com/crazyilian/change-nearcrowd-account-extension
// ==/UserScript==


window.toggleAddAccountMenu = function() {
  document.getElementById("addAccountMenu").classList.toggle('display-none');
  document.getElementById("addAccountMenuButton").classList.toggle('display-none');
  document.getElementById("deleteCurrentAccount").classList.toggle('display-none');
}

window.allAccounts = function() {
  return JSON.parse(window.localStorage.getItem('allAccounts')) || {};
}

window.allAccountsSet = function(username, key) {
  const accounts = window.allAccounts();
  accounts[username] = key;
  window.localStorage.setItem('allAccounts', JSON.stringify(accounts));
  window.updateAccountList();
}

window.chooseAccount = function() {
  const username = document.getElementById('accountList').value;
  window.chooseAccountValues(username);
}

window.chooseAccountValues = function(username) {
  const key = window.allAccounts()[username];
  if (key === undefined) {
    window.localStorage.removeItem('undefined_wallet_auth_key');
  } else {
    window.localStorage.setItem('undefined_wallet_auth_key', `{"accountId": "${username}"}`);
    window.localStorage.setItem(`near-api-js:keystore:${username}:mainnet`, key);
  }

  document.getElementById('refreshPageButton').classList.remove('display-none');
}

window.addAccount = function() {
  const username = document.getElementById('addAccountUsername').value.trim();
  const key = document.getElementById('addAccountKey').value.trim() || undefined;
  window.allAccountsSet(username, key);
  window.chooseAccountValues(username);
  window.updateAccountList();
  window.addAccountClose();
}

window.addAccountClose = function() {
  document.getElementById('addAccountUsername').value = "";
  document.getElementById('addAccountKey').value = "";
  window.toggleAddAccountMenu();
}

window.currentAccount = function() {
  return (JSON.parse(window.localStorage.getItem('undefined_wallet_auth_key')) || {}).accountId;
}

window.updateAccountList = function() {
  const select = document.getElementById('accountList');
  select.innerHTML = "";
  let selected = false;
  for (const username in window.allAccounts()) {
    const option = document.createElement('option');
    option.setAttribute('value', username);
    option.innerHTML = username;
    if (username === window.currentAccount()) {
      option.setAttribute('selected', true);
      selected = true;
    }
    select.appendChild(option);
  }
  if (!selected) {
    window.chooseAccount();
  }
}

window.deleteCurrentAccount = function() {
  const username = window.currentAccount();
  if (username === undefined) {
    return;
  }
  if (confirm(`Вы точно хотите удалить аккаунт "${username}" из браузера?`)) {
    window.allAccountsSet(username, undefined);
    window.updateAccountList();
  }
}

window.addOpenedAccount = function() {
  const username = window.currentAccount();
  if (username === undefined) {
      return;
  }
  const key = window.localStorage.getItem(`near-api-js:keystore:${username}:mainnet`);
  if (key === null) {
      return;
  }
  window.allAccountsSet(username, key);
}

const start = function() {
    'use strict';
    window.document.body.insertAdjacentHTML('afterbegin', `
<div style="display: flex; gap: 40px; align-items: center">
  <div>Аккаунт:
    <select id="accountList" onchange="chooseAccount()"></select>
    <button type="button" id="refreshPageButton" onclick="window.location.reload()" class='display-none'>Обновить</button>
  </div>
  <div>
    <button type="button" onclick="toggleAddAccountMenu()" id="addAccountMenuButton">Добавить</button>
    <div id="addAccountMenu" class="display-none">
      <input type="text" id="addAccountUsername" placeholder="username.near">
      <input type="text" id="addAccountKey" placeholder="ed25519:xxx">
      <button type="button" onclick="addAccount()">Добавить</button>
      <button type="button" onclick="addAccountClose()">Отмена</button>
    </div>
    <button type="button" onclick="deleteCurrentAccount()" id="deleteCurrentAccount">Удалить</button>
  </div>
</div>
<hr style="margin: 10px 0 20px 0">

<style>
.display-none {
  display: none;
}
input {
  width: 120px;
}
</style>` );
    window.addOpenedAccount();
}
start();

