import useEth from "../../contexts/EthContext/useEth";
import React, { useState, useEffect } from 'react'
import web3 from 'web3';
import { Link, useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import classes from './JobDetails.module.css';
import Table from 'react-bootstrap/Table';

export default function JobDetails({ jobDetail, allBiders }) {
    const {
        state: { contract, accounts },
    } = useEth();
    let { idx } = useParams();
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
        if (jobDetail[idx].jobOwner !== accounts[0]) {
            alert("Only job owner will accept the bid.");
            return;
        }
        try {
            await contract.methods.acceptBid(jobDetail[idx].jobId, workerAdd).send({
                from: accounts[0],
            });
        } catch (error) {
            console.log(error);
        }
    };

    //place bid
    const bidAmountHandler = (e) => {
        setBidAmount(e.target.value);
    }
    const placeBid = async (e) => {
        if (jobDetail[idx].jobOwner == accounts[0]) {
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
            await contract.methods
                .bidJob(jobDetail[idx].jobId, web3.utils.toWei(bidAmount, "ether"))
                .send({
                    from: accounts[0],
                });
        } catch (error) {
            console.log(error);
            // debugger
        }
        setBidAmount("");
    };

    //modify bid
    const addCheck = () => {
        let worker = false;
        let assignedWorker = false;
        allBiders.map((bidders) => {
            (
                bidders.map((bidder) => {
                    if (bidder.jobId == jobDetail[idx].jobId && bidder.biderAddress == accounts[0])
                        worker = true;
                    if (bidder.jobId == jobDetail[idx].jobId && jobDetail[idx].jobWorker == accounts[0])
                        assignedWorker = true;
                })
            )
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
            await contract.methods
                .modifyBid(jobDetail[idx].jobId, web3.utils.toWei(bidAmount, "ether"))
                .send({
                    from: accounts[0],
                });
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
            await contract.methods.jobDone(jobDetail[idx].jobId).send({
                from: accounts[0],
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const data = () => {
            if (contract != null) {
                setTimeout(async () => {
                    await contract.methods.seeJob(idx).call({ from: accounts[0], })
                        .then((p) => setJD(p))
                        .catch(error => console.log(error));
                    await contract.methods.allBiders(idx).call({ from: accounts[0], })
                        .then((p) => setAB(p))
                        .catch(error => console.log(error));
                }, 500)
            }
        }
        data();
    }, [contract])

    return (
        <React.Fragment >
            {<div
                style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "7px"
                }}
            >

                <div style={{
                    margin: "10px",
                    backgroundColor: "#DDDAD9",
                    borderRadius: "1rem",
                    width: "73%"
                }}>
                    {/* {jobDetail[idx] && (<div>
                        <code style={{ color: "black" }}>
                            <strong>{`Job Details
    `}</strong>
                            <>
                                <strong>{`Id           :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobId}
                                </span>
                                <strong>{`
    Name         :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobName}
                                </span>
                                <strong>{`
    Description  :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobDescription}
                                </span>
                                <strong>{`
    Owner        :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobOwner}
                                </span>
                                <strong>{`
    Worker       :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {
                                        jobDetail[idx].jobWorker == "0x0000000000000000000000000000000000000000" ?
                                            "Not Assigned Yet" : jobDetail[idx].jobWorker
                                    }
                                </span>
                                <strong>{`
    Completed    :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].isCompleted ? "true" : "false"}
                                </span>
                                <strong>{`
    Register Date:  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobRegisteredDate > 0
                                        ? new Date(
                                            jobDetail[idx].jobRegisteredDate * 1000
                                        ).toLocaleDateString("en-GB")
                                        : "Invalid"}
                                </span>
                                <strong>{`
    Start Date   :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobStartedDate > 0
                                        ? new Date(jobDetail[idx].jobStartedDate * 1000).toLocaleDateString(
                                            "en-GB"
                                        )
                                        : "Not Started Yet"}

                                </span>
                                <strong>{`
    Complete Date:  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobCompletedDate > jobDetail[idx].jobStartedDate
                                        ? new Date(
                                            jobDetail[idx].jobCompletedDate * 1000
                                        ).toLocaleDateString("en-GB")
                                        : "Not Completed Yet"}
                                </span>
                                <strong>{`
    Budget       :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {web3.utils.fromWei(jobDetail[idx].jobBudget, "ether")}ETH

                                </span>
                                <strong>{`
    Settled At   :  `}</strong>
                                <span style={{ color: "red" }}>
                                    {jobDetail[idx].jobSettledAmount > 0
                                        ? `${web3.utils.fromWei(jobDetail[idx].jobSettledAmount, "ether")}ETH`
                                        : "Not Settled Yet "}
                                </span>
                            </>
                        </code>
                        <code >
                            <strong style={{ color: "black" }} >{`All Bidders  `}</strong>
                            <span>
                                {<Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Bider Address</th>
                                            <th>Bid Amount</th>
                                        </tr>
                                    </thead>
                                    {allBiders.map((bidders) => {
                                        return (
                                            bidders.map((bidder, indx) => {
                                                if (bidder.jobId == jobDetail[idx].jobId) {
                                                    return (
                                                        <tbody key={indx} >
                                                            <tr>
                                                                <td>{indx + 1}</td>
                                                                <td>
                                                                    <Link to={`/workerDetails/${bidder.biderAddress}`}>
                                                                        {bidder.biderAddress}
                                                                    </Link>
                                                                </td>
                                                                <td>
                                                                    {web3.utils.fromWei(bidder.bidAmount, "ether")}ETH
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    )
                                                }
                                            })
                                        )
                                    })
                                    }
                                </Table>
                                }
                            </span>
                        </code>
                    </div>)
                    } */}
                </div>
                {/* 
                {!jobDetail[idx].isCompleted ? (
                    <div style={{
                        width: "25%",
                        height: "50px",
                    }}>
                        {jobDetail[idx].jobWorker == "0x0000000000000000000000000000000000000000" ? (
                            <div>
                                {accounts[0] == jobDetail[idx].jobOwner && <div className={classes.buttonDiv}>
                                    <h2>Accept Bid</h2>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>Job Id</strong></Form.Label>
                                            <Form.Control type="number" placeholder="JobId" value={jobDetail[idx].jobId} disabled />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Select Worker</Form.Label>
                                            <Form.Select placeholder="Select Worker" onChange={workerAddHandler}>{<option>Select Worker</option>}
                                                {allBiders.map((bidders) => {
                                                    return (
                                                        bidders.map((bidder, indx) => {
                                                            if (bidder.jobId == jobDetail[idx].jobId)
                                                                return (
                                                                    <option key={indx}>{bidder.biderAddress}</option>
                                                                )
                                                        })
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
                                {!(accounts[0] == jobDetail[idx].jobOwner) && <> {!addCheck().worker ? (
                                    <div className={classes.buttonDiv}>
                                        <h2>Place Bid</h2>
                                        <Form>
                                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                                <Form.Label><strong>Job Id</strong></Form.Label>
                                                <Form.Control type="number" placeholder="JobId" value={jobDetail[idx].jobId} disabled />
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
                                                <Form.Control type="number" placeholder="JobId" value={jobDetail[idx].jobId} disabled />
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
                        {accounts[0] == jobDetail[idx].jobWorker
                            &&
                            <div className={classes.buttonDiv}>
                                <h2>Job Done</h2>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label><strong>Job Id</strong></Form.Label>
                                        <Form.Control type="number" placeholder="JobId" value={jobDetail[idx].jobId} disabled />
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
                    </div>)} */}
            </div>}
        </React.Fragment>

    )
}
