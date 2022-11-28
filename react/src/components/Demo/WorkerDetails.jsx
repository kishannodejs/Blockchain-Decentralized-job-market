import React, { useState, useEffect } from 'react'
import web3 from 'web3';
import useEth from "../../contexts/EthContext/useEth";
import {useParams } from 'react-router-dom'


export default function WorkerDetails() {
    const {
        state: { contract, accounts },
    } = useEth();
    const [workerDetails, setWorkerDetails] = useState([]);
    let { workerAdd } = useParams();

    // const workerDetailsHandler = async () => {
    //     setWorkerDetails([]);
    //     try {
    //         await contract.methods
    //             .seeWorker(workerAdd)
    //             .call({
    //                 from: accounts[0],
    //             }).then(WD => setWorkerDetails(WD));

    //     } catch (error) {
    //         console.log(error);
    //     }
    // };


    useEffect(() => {
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
    }, [])

    return (
        <React.Fragment >
            <div
                style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "7px"
                }}
            >
                {/* <div className="d-grid gap-2">
                    <Button variant="primary" size="lg" onClick={workerDetailsHandler}>Show Details</Button>
                </div> */}
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
                                    <strong>{`Id              :  `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.workerId}
                                    </span>
                                    <strong>{`
    Name            :  `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.workerName}
                                    </span>
                                    <strong>{`
    Working         :  `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.isWorking ? "true" : "false"}
                                    </span>
                                    <strong>{`
    Register Date   :  `}</strong>
                                    <span style={{ color: "red" }}>
                                        {new Date(
                                            workerDetails.workerRegisteredDate * 1000
                                        ).toLocaleDateString("en-GB")}
                                    </span>
                                    <strong>{`
    Job Completed   :  `}</strong>
                                    <span style={{ color: "red" }}>
                                        {workerDetails.jobsCompleted}
                                    </span>
                                    <strong>{`
    Total Earned    :  `}</strong>
                                    <span style={{ color: "red" }}>
                                        {web3.utils.fromWei(workerDetails.totalEarned, "ether")}ETH
                                    </span>
                                </>
                            </code>
                        </div>
                    )
                    }
                </div>
            </div>
        </React.Fragment>

    )
}
