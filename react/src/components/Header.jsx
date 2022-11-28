import useEth from "../contexts/EthContext/useEth";
import Web3 from "web3";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "react-bootstrap/esm/Button";
import { Link } from 'react-router-dom';
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import React, { useState } from "react";
import { useEffect } from "react";

function Header() {
  const {
    state: { artifact, contract, accounts, balance },
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
    await contract.methods.withdrawExtraFund().send({
      from: accounts[0],
    });
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
        <Container>
          {!artifact ? (
            <Nav className="me-auto">
              <Nav.Link><strong>Notice No Artifacts</strong></Nav.Link>
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
              />
              <Nav.Link><strong>ETH: </strong>{balance} </Nav.Link>
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
  ...props }) {
  const handleClose = () => setShow(false);

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} {...props}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Wallet</Offcanvas.Title>
        </Offcanvas.Header>
        <div style={{
          height: "auto",
          margin: "auto",
          padding: "2rem 5rem",
          display: "flex",
          gap: "100px",
          alignItems: "center"
        }}>
          <div>
            <strong>Total Fund: </strong>
            {Web3.utils.fromWei(_fundOfOwner, "ether")}ETH
          </div>
          <div >
            <strong>Locked Fund:  </strong>
            {Web3.utils.fromWei(_fundLocked, "ether")}ETH
          </div>
          <div >
            <strong>Extra Fund: </strong>
            {Web3.utils.fromWei(_extraFund, "ether")}ETH
          </div>
          <Button onClick={withdrawExtraFund}>Withdraw Fund</Button>
        </div>
      </Offcanvas>
    </>
  );
}

