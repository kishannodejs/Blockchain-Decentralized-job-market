import React, { useState, useEffect } from 'react'
import web3 from 'web3';
import useEth from "../../contexts/EthContext/useEth";
import { useParams } from 'react-router-dom'
import Table from 'react-bootstrap/Table';
import classes from './details.module.css';

export default function WorkerDetails() {
    const {
        state: { contract, accounts }, balanceType,
        connect
    } = useEth();
    const [workerDetails, setWorkerDetails] = useState([]);
    let { workerAdd } = useParams();


    useEffect(() => {

        if (contract === null) return;
        const data = async () => {
            try {
                await contract.methods
                    .seeWorker(workerAdd)
                    .call({
                        from: accounts[0],
                    }).then(WD => setWorkerDetails(WD));
            } catch (error) {
                console.log(error);
            }
        }
        data();
    }, [contract])

    return (
        <React.Fragment >
            <div
                style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "7px"
                }}
            >
                {workerDetails[0] && <div className={classes.details} >
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
                                    <td>{new Date(
                                        workerDetails.workerRegisteredDate * 1000
                                    ).toLocaleString(
                                        "en-GB", { timeZone: 'IST' }
                                    )}</td>
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
                    </div>
                </div>}
            </div>
        </React.Fragment>

    )
}
