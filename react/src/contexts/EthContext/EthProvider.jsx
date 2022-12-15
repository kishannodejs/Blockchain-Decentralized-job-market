import Web3 from "web3";
import EthContext from "./EthContext";

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import { reducer, actions, initialState } from "./state";
import React, { useReducer, useCallback, useEffect, useState } from "react";

import classes from './ErrorModal.module.css'

function EthProvider({ children }) {
  const [tx, setTx] = useState(false);
  const [receipt, setReceipt] = useState({})
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async artifact => {
      if (!localStorage.getItem('address')) {
        dispatch({
          type: actions.logOut,
        });
      } else {
        if (artifact) {
          const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
          const accounts = await web3.eth.requestAccounts();
          const balance = (+web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), "ether")).toFixed(3);
          const networkID = await web3.eth.net.getId();
          const { abi } = artifact;

          let address, contract;
          try {
            address = artifact.networks[networkID].address;
            contract = new web3.eth.Contract(abi, address);
          } catch (err) {
            console.error(err);
          }
          dispatch({
            type: actions.init,
            data: { artifact, web3, accounts, networkID, contract, balance }
          });
        }
      }

    }, []);

  useEffect(() => {
    const reload = async () => {
      if (!localStorage.getItem('address')) return;
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      if (localStorage.getItem('address') !== accounts[0]) {
        localStorage.removeItem('address');
        window.location.reload(false);
        return;
      }
    };
    reload();
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/JobMarket.json");
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);


  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      localStorage.removeItem('address');
      init(state.artifact);
    };

    events.forEach(e => { window.ethereum.on(e, handleChange) });
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);


  const logIn = async () => {
    try {
      const artifact = require("../../contracts/JobMarket.json");
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      localStorage.setItem('address', accounts[0]);
      const balance = (+web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), "ether")).toFixed(3);
      const networkID = await web3.eth.net.getId();
      const { abi } = artifact;

      let address, contract;
      try {
        address = artifact.networks[networkID].address;
        contract = new web3.eth.Contract(abi, address);
      } catch (err) {
        console.error(err);
      }
      dispatch({
        type: actions.init,
        data: { artifact, web3, accounts, networkID, contract, balance }
      });
    } catch (err) {
      console.error(err);
    }
  }
  const logOut = () => {
    localStorage.removeItem('address');
    dispatch({
      type: actions.logOut,
    })
  }

  const balanceUpdate = async() => {
    const balance = (+state.web3.utils.fromWei(await state.web3.eth.getBalance(state.accounts[0]), "ether")).toFixed(3);
    dispatch({
      type: actions.init,
      data: { balance }
    });
    // console.log(state.accounts, state.balance)
  }

  const balanceType = () => {
    if (state.networkID === 80001)
      return "MATIC";
    return "ETH";
  }

  return (
    <EthContext.Provider value={{
      state,
      dispatch,
      logOut,
      tx, setTx,
      receipt, setReceipt,
      balanceType,
      balanceUpdate
    }}>

      {localStorage.getItem('address') === null && (
        <>
          <div className={classes.backdrop} />
          <Card className={classes.modal} >
            <Card.Header><strong>LogIn</strong></Card.Header>
            <Card.Body>
              <Card.Title>Please login.</Card.Title>
              <Card.Text>

              </Card.Text>
              <Button variant="primary" onClick={logIn}>Login</Button>
            </Card.Body>
          </Card>
        </>
      )}

      {state.accounts !== null && !state.contract && (
        <>
          <div className={classes.backdrop} />
          <Card className={classes.modal} >
            <Card.Header><strong>Connected To Wrong Network</strong></Card.Header>
            <Card.Body>
              <Card.Title>Please change the Network from Metamask.
                (Either Mumbai testnet or Localhost-Ganache)</Card.Title>
            </Card.Body>
          </Card>
        </>
      )}

      {children}
    </EthContext.Provider >
  );
}

export default EthProvider;
