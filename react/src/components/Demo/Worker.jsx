import web3 from "web3";
import useEth from "../../contexts/EthContext/useEth";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import classes from './JobDetails.module.css';
import { useEffect } from "react";

export default function Worker() {
    const {
        state: { contract, accounts},
    } = useEth();

    const [workerName, setWorkerName] = useState("");
    const [workerDetails, setWorkerDetails] = useState([]);

    //register worker
    const workerNameHandler = (e) => {
        setWorkerName(e.target.value);
    };
    const registerWorker = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (workerName === "") {
            alert("Enter a valid name.");
            return;
        }
        try {
            await contract.methods
                .registerWorker(workerName)
                .send({ from: accounts[0], });
        } catch (error) {
            console.log(error);
        }

        setWorkerName("");
    };
    // console.log(contract)

    //worker details
    useEffect(() => {
        const data = () => {
            setTimeout(async () => {
                try {
                    await contract.methods
                        .seeWorker(accounts[0])
                        .call({ from: accounts[0], }).then((p) => setWorkerDetails(p));
                } catch (error) {
                    console.log(error, "err");
                }
            }, 500)
        }
        data();
    }, [accounts, registerWorker]);

    return (
        <React.Fragment>
            <div
                style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "7px"
                }}            >
                <div style={{
                    margin: "10px",
                    backgroundColor: "#DDDAD9",
                    borderRadius: "1rem",
                    width: "73%"

                }}>
                    {workerDetails[0] && (
                        <div>
                            <code style={{ color: "black" }}>
                                <strong>{`Worker Details
    `}</strong>
                                <>
                                    <strong>{`Id                : `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.workerId}
                                    </span>
                                    <strong>{`
    Name              : `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.workerName}
                                    </span>
                                    <strong>{`
    Currently Working : `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.isWorking ? "true" : "false"}
                                    </span>
                                    <strong>{`
    Register Date     : `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.workerRegisteredDate > 0 ? (new Date(
                                            workerDetails.workerRegisteredDate * 1000
                                        ).toLocaleDateString("en-GB")) : ("Not Registered")
                                        }
                                    </span>
                                    <strong>{`
    Job Completed     : `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.jobsCompleted}

                                    </span>
                                    <strong>{`
    Total Earned      : `}</strong>
                                    <span style={{ color: "red" }}>
                                        {web3.utils.fromWei(workerDetails.totalEarned, "ether")}ETH
                                    </span>
                                </>
                            </code>
                        </div>)
                    }
                </div>
                <div className={classes.buttonDiv}>
                    <h2>Register Worker</h2>
                    <Form
                    >
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label><strong>Name</strong></Form.Label>
                            <Form.Control type="text" placeholder="Name" value={workerName} onChange={workerNameHandler} />
                        </Form.Group>
                        <Button variant="primary" onClick={registerWorker}>
                            Register
                        </Button>
                    </Form>
                </div>
            </div>
        </React.Fragment >
    )
}
