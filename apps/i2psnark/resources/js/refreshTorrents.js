/* I2PSnark refreshTorrents.js by dr|3d */
/* Selective refresh torrents and other volatile elements in the I2PSnark UI */
/* License: AGPL3 or later */

import {onVisible} from "./onVisible.js";
import {initFilterBar} from './torrentDisplay.js';
import {initLinkToggler} from "./toggleLinks.js";
import {initToggleLog} from "./toggleLog.js";

const filterbar = document.getElementById("torrentDisplay");
const home = document.querySelector(".nav_main");
const storageRefresh = window.localStorage.getItem("snarkRefresh");
const xhrsnark = new XMLHttpRequest();
let refreshIntervalId;
let requestInProgress = false;

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function refreshTorrents(callback) {
  const complete = document.getElementsByClassName("completed");
  const control = document.getElementById("torrentInfoControl");
  const dirlist = document.getElementById("dirlist");
  const down = document.getElementById("down");
  const files = document.getElementById("dirInfo");
  const info = document.getElementById("torrentInfoStats");
  const mainsection = document.getElementById("mainsection");
  const noload = document.getElementById("noload");
  const notfound = document.getElementById("NotFound");
  const thead = document.getElementById("snarkHead");
  const torrents = document.getElementById("torrents");
  const storage = window.localStorage.getItem("snarkfilter");
  const filterEnabled = localStorage.hasOwnProperty("snarkfilter");
  const snarkTable = torrents || files;
  const baseUrl = "/i2psnark/.ajax/xhr1.html";
  const query = window.location.search;
  const url = filterEnabled ? baseUrl + query + (query ? "&" : "?") + "ps=9999" : baseUrl;


  if (requestInProgress) {
    return;
  }

  if (document.getElementById("ourDest") === null) {
    const childElems = document.querySelectorAll("#snarkHead th>*");
    document.getElementById("snarkHead").classList.add("initializing");
    childElems.forEach(elem => {elem.style.opacity = "0";});
  }

  requestInProgress = true;

  xhrsnark.open("GET", url, true);
  xhrsnark.responseType = "document";
  xhrsnark.onload = function () {
    switch (xhrsnark.status) {
      case !200 || !404 || !500:
        requestInProgress = true;
      case 200:
        break;
      case 404 || 500 || !200:
        noAjax(5000);
        break;
      default:
        requestInProgress = false;
    }

    if (xhrsnark.readyState !== 4) {
      return;
    }

    if (storageRefresh === null) {
      getRefreshInterval();
    }

    if (down || noload) {
      refreshAll();
    } else if (files || torrents) {
      refreshHeaderAndFooter();
      updateVolatile();
    }

    if (torrents?.responseXML) {
        filterbar.removeEventListener("mouseover", setLinks);
        const torrentsContainer = document.getElementById("torrents");
        if (torrentsContainer?.responseXML) {
          const newTorrents = torrents.responseXML.getElementById("torrents");
          if (newTorrents && torrentsContainer.innerHTML !== newTorrents.innerHTML) {
            torrentsContainer.innerHTML = newTorrents.innerHTML;
          }
        }
    } else if (dirlist?.responseXML) {
      if (info) {
        const infoResponse = xhrsnark.responseXML.getElementById("torrentInfoStats");
        if (infoResponse) {
          const infoParent = info.parentNode;
          if (!Object.is(info.innerHTML, infoResponse.innerHTML)) {
            infoParent.replaceChild(infoResponse, info);
          }
        }
      }
      if (control) {
        const controlResponse = xhrsnark.responseXML.getElementById("torrentInfoControl");
        if (controlResponse) {
          const controlParent = control.parentNode;
          if (!Object.is(control.innerHTML, controlResponse.innerHTML)) {
            controlParent.replaceChild(controlResponse, control);
          }
        }
      }
      if (complete?.length && dirlist?.responseXML) {
        const completeResponse = xhrsnark.responseXML.getElementsByClassName("completed");
        for (let i = 0; i < complete.length && completeResponse?.length; i++) {
          if (!Object.is(complete[i].innerHTML, completeResponse[i]?.innerHTML)) {
            complete[i].innerHTML = completeResponse[i].innerHTML;
          }
        }
      }
      setLinks(query);
    }

    function refreshHeaderAndFooter() {
      const thead = document.getElementById("snarkHead");
      if (thead?.responseXML) {
        const theadParent = thead.parentNode;
        const theadResponse = thead.responseXML?.getElementById("snarkHead");
        if (thead && theadResponse && !Object.is(thead.innerHTML, theadResponse.innerHTML)) {
          thead.innerHTML = theadResponse.innerHTML;
        }
      }
    }

    function refreshAll() {
      const files = document.getElementById("dirInfo");
      const mainsection = document.getElementById("mainsection");
      const notfound = document.getElementById("NotFound");
      const dirlist = document.getElementById("dirlist");
      if (mainsection) {
        const mainsectionResponse = xhrsnark.responseXML?.getElementById("mainsection");
        if (mainsectionResponse && mainsection.innerHTML !== mainsectionResponse.innerHTML) {
          mainsection.innerHTML = mainsectionResponse.innerHTML;
        }
        if (filterbar) {
          initFilterBar();
        }
      } else if (files) {
        const dirlistResponse = xhrsnark.responseXML?.getElementById("dirlist");
        if (dirlistResponse && !Object.is(dirlist.innerHTML, dirlistResponse.innerHTML) && notfound === null) {
          dirlist.innerHTML = dirlistResponse.innerHTML;
        }
      }
    }

    function updateVolatile() {
      const dirlist = document.getElementById("dirlist");
      const updating = document.getElementsByClassName("volatile");
      const updatingResponse = xhrsnark.responseXML?.getElementsByClassName("volatile");
      if (updatingResponse?.length && updating.length === updatingResponse.length) {
        let updated = false;
        Array.from(updating).forEach((elem, index) => {
          if (elem.innerHTML !== updatingResponse[index].innerHTML) {
            elem.outerHTML = updatingResponse[index].outerHTML;
            updated = true;
          }
        });
        if (updated && filterbar) {
          initFilterBar();
        }
      } else {
        refreshAll();
      }
    }

    function updateIfVisible(snarkTable) {
      const delay = getRefreshInterval();
      let snarkUpdateId;
      if (snarkUpdateId) {
        clearTimeout(snarkUpdateId);
      }
      const onUpdate = () => {
        snarkUpdateId = setTimeout(onUpdate, delay);
      };
      onVisible(snarkTable, onUpdate, {
        hidden: () => {
          clearTimeout(snarkUpdateId);
        },
      });
    }

    if (typeof callback === "function") {
      callback(xhrsnark.responseXML, url);
    }

    requestInProgress = false;
    updateIfVisible(snarkTable);
    initLinkToggler();

    function getRefreshInterval() {
      const interval = parseInt(xhrsnark.getResponseHeader("X-Snark-Refresh-Interval")) || 5;
      localStorage.setItem("snarkRefresh", interval);
      return interval * 1000;
    }
    requestInProgress = false;
  };
  xhrsnark.send();
}

xhrsnark.onerror = function (error) {
  //console.error("XHR request failed:", error);
  requestInProgress = false;
};

function setLinks(query) {
  const home = document.querySelector('.nav_main');
  if (home) {
    if (query !== undefined && query !== null) {
      home.href = `/i2psnark/${query}`;
    } else {
      home.href = "/i2psnark/";
    }
  }
}

function noAjax(delay) {
  var failMessage = "<div class='routerdown' id='down'><span>Router is down</span></div>";
  var targetElement = mainsection || snarkInfo;
  setTimeout(function() {
    if (targetElement) {
      targetElement.innerHTML = failMessage;
    }
  }, delay);
}

const debouncedRefreshTorrents = debounce(refreshTorrents, 500);

window.addEventListener("load", () => {
  debouncedRefreshTorrents();
});

function setupPage() {
  if (mainsection) {
    initToggleLog();
  }
  if (filterbar) {
    initFilterBar();
  }
}

function initSnarkRefresh() {
  const interval = (parseInt(storageRefresh) || 5) * 1000;
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }
  refreshIntervalId = setInterval(() => {
    refreshTorrents(setupPage);
  }, interval);
}

document.addEventListener("DOMContentLoaded", function() {
  initSnarkRefresh();
  initLinkToggler();
  setupPage();
});

export {initSnarkRefresh, refreshTorrents, debouncedRefreshTorrents};