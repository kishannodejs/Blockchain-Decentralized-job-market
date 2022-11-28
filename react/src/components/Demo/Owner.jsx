import web3 from "web3";
import useEth from "../../contexts/EthContext/useEth";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import classes from './JobDetails.module.css';

export default function Owner() {
    const {
        state: { contract, accounts },
    } = useEth();

    const [jobType, setJobType] = useState("");
    const [jobDes, setJobDes] = useState("");
    const [jobBudget, setJobBudget] = useState("");
    const [depositETH, setDepositETH] = useState("0");

    const jobTypeHandler = (e) => {
        // if (/^\d+$|^$/.test(e.target.value)) {
        setJobType(e.target.value);
        // }
    };
    const jobDesHandler = (e) => {
        // if (/^\d+$|^$/.test(e.target.value)) {
        setJobDes(e.target.value);
        // }
    };
    const jobBudgetHandler = (e) => {
        // if (/^\d+$|^$/.test(e.target.value)) {
        setJobBudget(e.target.value);
        // }
    };
    const depositETHHandler = (e) => {
        // if (/^\d+$|^$/.test(e.target.value)) {
        setDepositETH(e.target.value);
        // }
    };
    const registerJob = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (jobBudget === "") {
            alert("Job budget should not be zero.");
            return;
        }
        try {
            await contract.methods
                .registerJob(jobType, jobDes, web3.utils.toWei(jobBudget, "ether"))
                .send({
                    value: web3.utils.toWei(depositETH, "ether"),
                    from: accounts[0],
                });
        } catch (error) {
            console.log(error);
        }

        // await contract.events.JobRegistered({}, function (error, event) { console.log(event); })
        //     .on("connected", function (subscriptionId) {
        //         console.log(subscriptionId);
        //     })
        //     .on('data', function (event) {
        //         console.log(event); // same results as the optional callback above
        //     })
        //     .on('changed', function (event) {
        //         console.log(event); // same results as the optional callback above
        //         // remove event from local database
        //     })
        //     .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        //         console.log(error); // same results as the optional callback above
        //         console.log(receipt); // same results as the optional callback above

        //     });

        setJobType("");
        setJobDes("");
        setJobBudget("");
        setDepositETH("0");
    };
    
    return (
        <React.Fragment>
            <div
                className={classes.owner}
            >
                <div className={classes.buttonDiv}>
                    <h2>Register Job</h2>
                    <Form
                    >
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label><strong>Job Type</strong></Form.Label>
                            <Form.Control type="text" placeholder="Type" value={jobType} onChange={jobTypeHandler} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label><strong>Description</strong></Form.Label>
                            <Form.Control /*as="textarea"*/ type="text" placeholder="Short Description" value={jobDes} onChange={jobDesHandler} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label><strong>Budget</strong></Form.Label>
                            <Form.Control type="number" placeholder="Budget" value={jobBudget} onChange={jobBudgetHandler} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label><strong>ETH</strong></Form.Label>
                            <Form.Control type="number" placeholder="ETH Value" value={depositETH} onChange={depositETHHandler} />
                            <Form.Text className="text-muted">
                                Not needed, If you have Extra Fund in JobMarket Wallet.
                            </Form.Text>
                        </Form.Group>
                        <Button variant="primary" onClick={registerJob}>
                            Register
                        </Button>
                    </Form>
                </div>
            </div>
        </React.Fragment >
    )
}
