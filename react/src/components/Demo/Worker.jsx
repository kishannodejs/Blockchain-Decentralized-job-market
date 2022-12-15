import web3 from "web3";
import useEth from "../../contexts/EthContext/useEth";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import classes from './details.module.css';
import { useEffect } from "react";
import Table from 'react-bootstrap/Table';
import Tx from "./Tx";
export default function Worker() {
    const {
        state: { contract, accounts }, balanceType,
        tx,
        setTx,
        setReceipt } = useEth();

    const [workerName, setWorkerName] = useState("");
    const [workerDetails, setWorkerDetails] = useState([]);

    //register worker
    const workerNameHandler = (e) => {
        setWorkerName(e.target.value);
    };
    const _registerWorker = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (workerName === "") {
            alert("Enter a valid name.");
            return;
        }
        try {
            let _receipt = await contract.methods
                .registerWorker(workerName)
                .send({ from: accounts[0], });
            if (_receipt.status) {
                setReceipt(_receipt)
                setTx(true);
            }
        } catch (error) {
            console.log(error);
        }
        setWorkerName("");
    };

    useEffect(() => {
        if (contract === null) return;
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
    }, [contract]);

    useEffect(() => {
        if (contract === null) return;
        if (workerName !== "") return;
        const data = setTimeout(async () => {
            try {
                await contract.methods
                    .seeWorker(accounts[0])
                    .call({ from: accounts[0], }).then((p) => setWorkerDetails(p));
            } catch (error) {
                console.log(error, "err");
            }
        }, 500);
        return () => {
            clearTimeout(data);
        }
    }, [workerName]);

    return (
        <React.Fragment>
            <div
                style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "7px"
                }}            >

                <div
                    style={{
                        backgroundColor: workerDetails.workerId != 0 ? "#ABEBC6" : "#FAB0AD",
                    }}
                    className={classes.details} >
                    {workerDetails[0] && <>
                        <div style={{ padding: "0.5rem" }}>
                            <h2>Worker Details</h2>
                        </div>
                        <div style={{ padding: "1rem" }}>
                            <Table striped>
                                <tbody>
                                    <tr>
                                        <th>Id</th>
                                        <td>{workerDetails.workerId}</td>
                                    </tr>
                                    <tr>
                                        <th>Name</th>
                                        <td>{workerDetails.workerName}</td>
                                    </tr>
                                    <tr>
                                        <th>Working</th>
                                        <td>{workerDetails.isWorking ? "true" : "false"}</td>
                                    </tr>
                                    <tr>
                                        <th>Registered At</th>
                                        <td>{workerDetails.workerRegisteredDate > 0 ? (new Date(
                                            workerDetails.workerRegisteredDate * 1000
                                        ).toLocaleString(
                                            "en-GB", { timeZone: 'IST' }
                                        )
                                        ) : (
                                            "Not Registered"
                                        )
                                        }</td>
                                    </tr>
                                    <tr>
                                        <th>Job Completed</th>
                                        <td>{workerDetails.jobsCompleted}</td>
                                    </tr>
                                    <tr>
                                        <th>Total Earned</th>
                                        <td> {web3.utils.fromWei(workerDetails.totalEarned, "ether")}{balanceType()}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div></>}
                </div>
                {tx && <Tx />}

                <div className={classes.buttonDiv}>
                    <h3>Register Worker</h3>
                    <Form
                    >
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label><strong>Name</strong></Form.Label>
                            <Form.Control type="text" placeholder="Name" value={workerName} onChange={workerNameHandler} />
                        </Form.Group>
                        <Button variant="primary" onClick={_registerWorker}>
                            Register
                        </Button>
                    </Form>
                </div>
            </div>
        </React.Fragment >
    )
}
