import useEth from "../contexts/EthContext/useEth";
import Web3 from "web3";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "react-bootstrap/esm/Button";
import { Link } from 'react-router-dom';
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import React, { useState, useEffect } from "react";
import Tx from './Demo/Tx'
function Header() {
  const {
    state: { artifact, contract, networkID, accounts, balance }, balanceType,
    logOut,
    tx,
    setTx,
    setReceipt
  } = useEth();

  //balance enquiry
  const [show, setShow] = useState(false);
  const [_fundOfOwner, setFundOfOwner] = useState("");
  const [_fundLocked, setFundLocked] = useState("");
  const [_extraFund, setExtraFund] = useState("");

  const balanceOfOwner = async () => {
    const _balance = await contract.methods
      ._fundByJobOwner(accounts[0])
      .call({ from: accounts[0] });
    setFundOfOwner(_balance);
  };
  const fundLocked = async () => {
    const _Locked = await contract.methods
      ._jobOwnerFundLocked(accounts[0])
      .call({ from: accounts[0] });
    setFundLocked(_Locked);
  };
  const extraFund = async () => {
    const _extra = await contract.methods
      .extraFund()
      .call({ from: accounts[0] });
    setExtraFund(_extra);
  };
  const handleShow = () => {
    balanceOfOwner();
    fundLocked();
    extraFund();
    setShow(true);
  };
  const withdrawExtraFund = async () => {
    try {
      let _receipt = await contract.methods.withdrawExtraFund().send({
        from: accounts[0],
      });
      if (_receipt.status) {
        setReceipt(_receipt)
        setTx(true);
      }
    } catch (error) {
      console.log(error)
    }


    balanceOfOwner();
    fundLocked();
    extraFund();
  };

  return (
    <React.Fragment>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>JobMarket</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to='/home'>Home</Nav.Link>
            <Nav.Link as={Link} to='/jobs'>Jobs</Nav.Link>
            <Nav.Link as={Link} to='/owner'>Owners</Nav.Link>
            <Nav.Link as={Link} to='/worker'>Workers</Nav.Link>
          </Nav>
        </Container>
        <Container style={{ margin: "0rem 1rem" }}>
          {!artifact ? (
            <Nav className="me-auto" style={{ gap: "200px" }}>
              <Nav.Link><strong>Wallet not Connected</strong></Nav.Link>
            </Nav>
          ) : !contract ? (
            <Nav className="me-auto">
              <Nav.Link ><strong>Connected to Wrong Network</strong></Nav.Link>
            </Nav>
          ) : (
            <Nav className="me-auto">
              <Nav.Link onClick={handleShow}><strong>Connected Account: </strong>{accounts[0]}</Nav.Link>
              <OffCanvas
                key={2}
                placement={'top'}
                show={show}
                setShow={setShow}
                handleShow={handleShow}
                _fundOfOwner={_fundOfOwner}
                _fundLocked={_fundLocked}
                _extraFund={_extraFund}
                withdrawExtraFund={withdrawExtraFund}
                tx={tx}
                balanceType = {balanceType()}
              />
              <Nav.Link><strong>{balanceType()}: </strong>{balance} </Nav.Link>
              <Button style={{ margin: "0.8rem" }} onClick={logOut}>LogOut</Button>
            </Nav>
          )}
        </Container>
      </Navbar>
    </React.Fragment>
  );
}

export default Header;

function OffCanvas({
  withdrawExtraFund,
  _fundOfOwner, _fundLocked,
  _extraFund,
  handleShow,
  show,
  setShow,
  tx,
  balanceType,
  ...props }) {
  const handleClose = () => setShow(false);

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} {...props}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Decentralized JobMarket Fund</Offcanvas.Title>
        </Offcanvas.Header>
        <div style={{
          height: "auto",
          margin: "auto",
          padding: "2rem 5rem",
          display: "flex",
          gap: "90px",
          alignItems: "center"
        }}>
          {tx && <Tx />}
          <div>
            <strong>Total Fund: </strong>
            {Web3.utils.fromWei(_fundOfOwner, "ether")}{balanceType}
          </div>
          <div >
            <strong>Locked Fund:  </strong>
            {Web3.utils.fromWei(_fundLocked, "ether")}{balanceType}
          </div>
          <div >
            <strong>Extra Fund: </strong>
            {Web3.utils.fromWei(_extraFund, "ether")}{balanceType}
          </div>
          <Button onClick={withdrawExtraFund}>Withdraw Fund</Button>
        </div>
      </Offcanvas>
    </>
  );
}

