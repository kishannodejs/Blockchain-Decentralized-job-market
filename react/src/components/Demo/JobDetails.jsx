import useEth from "../../contexts/EthContext/useEth";
import React, { useState, useEffect } from 'react'
import web3 from 'web3';
import { Link, useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import classes from './details.module.css';
import Table from 'react-bootstrap/Table';
import Tx from "./Tx";

export default function JobDetails() {
    const {
        state: { contract, accounts }, balanceType,
        tx,
        setTx,
        setReceipt } = useEth();
    let { jobId } = useParams();
    const [jobID, setJobID] = useState("");
    const [bidAmount, setBidAmount] = useState("");
    const [workerAdd, setWorkerAdd] = useState("");
    const [JD, setJD] = useState([]);
    const [AB, setAB] = useState([]);



    //accept bid
    const workerAddHandler = (e) => {
        setWorkerAdd(e.target.value);
    };
    const acceptBid = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (JD.jobOwner !== accounts[0]) {
            alert("Only job owner will accept the bid.");
            return;
        }
        try {
            let _receipt = await contract.methods.acceptBid(JD.jobId, workerAdd).send({
                from: accounts[0],
            });
            if (_receipt.status) {
                setReceipt(_receipt)
                setTx(true);
            }
        } catch (error) {
            console.log(error);
        }
        setWorkerAdd("");
    };

    //place bid
    const bidAmountHandler = (e) => {
        setBidAmount(e.target.value);
    }
    const placeBid = async (e) => {
        if (JD.jobOwner === accounts[0]) {
            alert("Job owner not allowed to place the bid.");
            return;
        }
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (bidAmount === "") {
            alert("Please enter a valid value.");
            return;
        }
        try {
            let _receipt = await contract.methods
                .bidJob(JD.jobId, web3.utils.toWei(bidAmount, "ether"))
                .send({
                    from: accounts[0],
                });
            if (_receipt.status) {
                setReceipt(_receipt);
                setTx(true);
            }
        } catch (error) {
            console.log(error);
        }
        setBidAmount("");
    };

    //modify bid
    const addCheck = () => {
        let worker = false;
        let assignedWorker = false;
        AB.forEach((bidder) => {
            if (bidder.bidderAddress === accounts[0])
                worker = true;
            if (JD.jobWorker === accounts[0])
                assignedWorker = true;
        })
        return { worker, assignedWorker };
    };
    const modifyBid = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (bidAmount === "") {
            alert("Please enter a valid value.");
            return;
        }

        try {
            let _receipt = await contract.methods
                .modifyBid(JD.jobId, web3.utils.toWei(bidAmount, "ether"))
                .send({
                    from: accounts[0],
                });
            if (_receipt.status) {
                setReceipt(_receipt)
                setTx(true);
            }
        } catch (error) {
            console.log(error);
        }
        setBidAmount("");
    };

    //job done
    const jobDone = async () => {
        if (!addCheck().assignedWorker) {
            alert("Only assigned worker complete the job.");
            return;
        }
        try {
            let _receipt = await contract.methods.jobDone(JD.jobId).send({
                from: accounts[0],
            });
            setJobID(jobId);
            if (_receipt.status) {
                setReceipt(_receipt)
                setTx(true);
            }
        } catch (error) {
            console.log(error);
        }
        setTimeout(() => {
            setJobID("");
        }, 1000)
    };

    useEffect(() => {
        if (contract === null) return;
        const data = () => {
            setTimeout(async () => {
                await contract.methods.seeJob(jobId).call({ from: accounts[0], })
                    .then((p) => setJD(p))
                    .catch(error => console.log(error));
                await contract.methods.allBidders(jobId).call({ from: accounts[0], })
                    .then((p) => setAB(p))
                    .catch(error => console.log(error));
            }, 500)
        }
        data();
    }, [contract])


    useEffect(() => {
        if (contract === null) return;
        if (bidAmount !== "" || workerAdd !== "" || jobID !== "") return;
        const data = setTimeout(async () => {
            await contract.methods.seeJob(jobId).call({ from: accounts[0], })
                .then((p) => setJD(p))
                .catch(error => console.log(error));
            await contract.methods.allBidders(jobId).call({ from: accounts[0], })
                .then((p) => setAB(p))
                .catch(error => console.log(error));
        }, 500);

        return () => {
            clearTimeout(data);
        }
    }, [bidAmount, workerAdd, jobID])

    return (
        <React.Fragment >
            {JD[0] && accounts && <div
                style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "7px"
                }}
            >
                <div className={classes.details}>
                    <div style={{ padding: "0.5rem" }}>
                        <h2>Job Details</h2>
                    </div>
                    <div style={{ padding: "1rem" }}>
                        <Table striped>
                            <tbody>
                                <tr>
                                    <th>Id</th>
                                    <td>{JD.jobId}</td>
                                </tr>
                                <tr>
                                    <th>Name</th>
                                    <td>{JD.jobName}</td>
                                </tr>
                                <tr>
                                    <th>Description</th>
                                    <td>{JD.jobDescription}</td>
                                </tr>
                                <tr>
                                    <th>Owner</th>
                                    <td>{JD.jobOwner}</td>
                                </tr>
                                <tr>
                                    <th>Worker</th>
                                    <td>{
                                        JD.jobWorker === "0x0000000000000000000000000000000000000000" ?
                                            "Not Assigned Yet" : JD.jobWorker
                                    }</td>
                                </tr>
                                <tr>
                                    <th>Completed</th>
                                    <td>{JD.isCompleted ? "true" : "false"}</td>
                                </tr>
                                <tr>
                                    <th>Registered At</th>
                                    <td>{JD.jobRegisteredDate > 0
                                        ? new Date(
                                            JD.jobRegisteredDate * 1000
                                        ).toLocaleString(
                                            "en-GB", { timeZone: 'IST' }
                                        )
                                        : "Invalid"}</td>
                                </tr>
                                <tr>
                                    <th>Started At</th>
                                    <td>{JD.jobStartedDate > 0
                                        ? new Date(JD.jobStartedDate * 1000).toLocaleString(
                                            "en-GB", { timeZone: 'IST' }
                                        )
                                        : "Not Started Yet"}</td>
                                </tr>
                                <tr>
                                    <th>Completed At</th>
                                    <td>{JD.jobCompletedDate > JD.jobStartedDate
                                        ? new Date(
                                            JD.jobCompletedDate * 1000
                                        ).toLocaleString(
                                            "en-GB", { timeZone: 'IST' }
                                        )
                                        : "Not Completed Yet"}</td>
                                </tr>
                                <tr>
                                    <th>Budget</th>
                                    <td>{web3.utils.fromWei(JD.jobBudget, "ether")}{balanceType()}</td>
                                </tr>
                                <tr>
                                    <th>Settled At</th>
                                    <td>{JD.jobSettledAmount > 0
                                        ? `${web3.utils.fromWei(JD.jobSettledAmount, "ether")}${balanceType()}`
                                        : "Not Settled Yet "}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <div
                        style={{ padding: "0.5rem" }}>
                        <h2>All Bidders</h2>
                    </div>
                    <div style={{ padding: "1rem" }}>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Bidder Address</th>
                                    <th>Bid Amount</th>
                                </tr>
                            </thead>
                            {AB.map((bidder, indx) => {
                                return (
                                    <tbody key={indx} >
                                        <tr>
                                            <td>{indx + 1}</td>
                                            <td>
                                                <Link to={`/workerDetails/${bidder.bidderAddress}`}>
                                                    {bidder.bidderAddress}
                                                </Link>
                                            </td>
                                            <td>
                                                {web3.utils.fromWei(bidder.bidAmount, "ether")}{balanceType()}
                                            </td>
                                        </tr>
                                    </tbody>
                                )
                            })
                            }
                        </Table>
                    </div>
                </div>

                {tx && <Tx />}

                {!JD.isCompleted ? (
                    <div style={{
                        width: "25%",
                        height: "50px",
                    }}>
                        {JD.jobWorker === "0x0000000000000000000000000000000000000000" ? (
                            <div>
                                {accounts[0] === JD.jobOwner && <div className={classes.buttonDiv}>
                                    <h2>Accept Bid</h2>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Job Id</strong></Form.Label>
                                            <Form.Control type="number" placeholder="JobId" value={JD.jobId} disabled />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Select Worker</Form.Label>
                                            <Form.Select placeholder="Select Worker" onChange={workerAddHandler}>{<option>Select Worker</option>}
                                                {AB.map((bidder, indx) => {
                                                    if (bidder.jobId === JD.jobId)
                                                        return (
                                                            <option key={indx}>{bidder.bidderAddress}</option>
                                                        )
                                                })
                                                }
                                            </Form.Select>
                                        </Form.Group>
                                        <Button variant="primary" onClick={acceptBid}>
                                            Accept Bid
                                        </Button>
                                    </Form>
                                </div>}
                                {!(accounts[0] === JD.jobOwner) && <> {!addCheck().worker ? (
                                    <div className={classes.buttonDiv}>
                                        <h2>Place Bid</h2>
                                        <Form>
                                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                                <Form.Label><strong>Job Id</strong></Form.Label>
                                                <Form.Control type="number" placeholder="JobId" value={JD.jobId} disabled />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                                <Form.Label><strong>Bid Amount</strong></Form.Label>
                                                <Form.Control type="number" placeholder="Bid Amount" min={0} value={bidAmount} onChange={bidAmountHandler} />
                                            </Form.Group>
                                            <Button variant="primary" onClick={placeBid}>
                                                Place Bid
                                            </Button>
                                        </Form>
                                    </div>
                                ) : (
                                    <div className={classes.buttonDiv}>
                                        <h2>Modify Bid</h2>
                                        <Form>
                                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                                <Form.Label><strong>Job Id</strong></Form.Label>
                                                <Form.Control type="number" placeholder="JobId" value={JD.jobId} disabled />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                                <Form.Label><strong>Bid Amount</strong></Form.Label>
                                                <Form.Control type="number" placeholder="Bid Amount" min={0} value={bidAmount} onChange={bidAmountHandler} />
                                            </Form.Group>
                                            <Button variant="primary" onClick={modifyBid}>
                                                Modify Bid
                                            </Button>
                                        </Form>
                                    </div>
                                )}</>}
                            </div>
                        ) : (
                            <div
                                style={{ height: "100px", backgroundColor: "#F9E79F" }}
                                className={classes.buttonDiv}>
                                <h3>Worker Assigned</h3>
                            </div>
                        )}
                        {accounts[0] === JD.jobWorker
                            &&
                            <div className={classes.buttonDiv}>
                                <h2>Job Done</h2>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label><strong>Job Id</strong></Form.Label>
                                        <Form.Control type="number" placeholder="JobId" value={JD.jobId} disabled />
                                    </Form.Group>
                                    <Button variant="primary" onClick={jobDone}>
                                        Job Done
                                    </Button>
                                </Form>
                            </div>}
                    </div>
                ) : (
                    <div
                        style={{ height: "100px", backgroundColor: "#ABEBC6" }}
                        className={classes.buttonDiv}>
                        <h3>This Job is Competed</h3>
                    </div>)}
            </div>}
        </React.Fragment>

    )
}
