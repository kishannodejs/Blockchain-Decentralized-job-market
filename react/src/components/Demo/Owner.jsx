import web3 from "web3";
import useEth from "../../contexts/EthContext/useEth";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import classes from './details.module.css';
import Tx from "./Tx";
export default function Owner() {
    const {
        state: { contract, accounts }, balanceType, balanceUpdate,
        tx,
        setTx,
        setReceipt } = useEth();

    const [jobType, setJobType] = useState("");
    const [jobDes, setJobDes] = useState("");
    const [jobBudget, setJobBudget] = useState("");
    const [depositETH, setDepositETH] = useState("0");

    const jobTypeHandler = (e) => {
        setJobType(e.target.value);
    };
    const jobDesHandler = (e) => {
        setJobDes(e.target.value);
    };
    const jobBudgetHandler = (e) => {
        setJobBudget(e.target.value);
    };
    const depositETHHandler = (e) => {
        setDepositETH(e.target.value);
    };
    const registerJob = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (jobBudget === "") {
            alert("Job budget should not be zero.");
            return;
        }
        let _receipt;
        try {
            _receipt = await contract.methods
                .registerJob(jobType, jobDes, web3.utils.toWei(jobBudget, "ether"))
                .send({
                    value: web3.utils.toWei(depositETH, "ether"),
                    from: accounts[0],
                });
                // contract.events.JobRegistered({})
                // .on('data', event => console.log(event));
            if (_receipt.status) {
                setReceipt(_receipt)
                setTx(true);
            }
        } catch (error) {
            console.log("error: ", error);
            console.log("error.message: ", error.message);
        }


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
                {tx && <Tx />}

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
                            <Form.Label><strong>{balanceType()}</strong></Form.Label>
                            <Form.Control type="number" placeholder={`${balanceType()} Value`} value={depositETH} onChange={depositETHHandler} />
                            <Form.Text className="text-muted">
                                Not needed, If you have Extra Fund in JobMarket Wallet.
                            </Form.Text>
                        </Form.Group>
                        <Button variant="primary" onClick={registerJob}>
                            Register
                        </Button>
                        <Button variant="primary" onClick={balanceUpdate}>
                            Events
                        </Button>
                    </Form>
                </div>
            </div>
        </React.Fragment >
    )
}
