import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import useEth from "../../contexts/EthContext/useEth";
import React, { useState } from "react";
import web3 from 'web3';
import { Link } from 'react-router-dom';
import Collapse from 'react-bootstrap/Collapse';
import Alert from 'react-bootstrap/Alert';
function Jobs({ jobDetails, setJobDetails, setAllBiders }) {
  const {
    state: { contract, accounts },
  } = useEth();
  const [B1, setB1] = useState(false);
  const [B2, setB2] = useState(false);

  const _activeJobs = async () => {
    setB2(false);
    setJobDetails([]);
    setAllBiders([]);

    setTimeout(async () => {
      let _activeJobsIdB32;
      try {
        _activeJobsIdB32 = await contract.methods.activeJobs().call({
          from: accounts[0],
        });
      } catch (error) {
        console.log(error);
      }

      let _activeJobsId = [];
      _activeJobsIdB32.map((id) => {
        _activeJobsId.push((web3.utils.toBN(id)).toString())
      })

      _activeJobsId.map(async (jobId) => {
        await contract.methods.seeJob(jobId).call({ from: accounts[0], })
          .then((p) => setJobDetails((pre) => { return [p, ...pre] }))
          .catch(error => console.log(error));
      })

      _activeJobsId.map(async (jobId) => {
        await contract.methods.allBiders(jobId).call({ from: accounts[0], })
          .then((p) => setAllBiders((pre) => { return [p, ...pre] }))
          .catch(error => { });
      })

    }, 500);
    setB1(!B1);
  };
  const allJobs = async () => {
    setB1(false);
    setJobDetails([]);
    setAllBiders([]);

    setTimeout(async () => {
      for (let i = 1; i <= totalJobs; i++) {
        await contract.methods.seeJob(i).call({ from: accounts[0], })
          .then((p) => setJobDetails((pre) => { return [p, ...pre] }))
          .catch(error => console.log(error));;
        await contract.methods.allBiders(i).call({ from: accounts[0], })
          .then((p) => setAllBiders((pre) => { return [p, ...pre] }))
          .catch(error => console.log(error));;
      }
    }, 500)
    let totalJobs = await contract.methods._jobIds().call({ from: accounts[0], });

    setB2(!B2);
  };

  const noJobs = () => {
    alert("No Jobs");
    console.log("no jobs")
  }

  return (
    <React.Fragment >
      <div
        style={{
          margin: "auto",
          display: "auto",
        }}
      >

        <div style={{ padding: "1rem 2rem" }}>
          <div className="d-grid gap-2">
            <Button
              onClick={_activeJobs}
              aria-expanded={B1}>Show Active Jobs</Button>
          </div>
          {<Collapse in={B1}>
            <div>
              <Row xs={4} md={7} className="g-4" style={{ margin: "auto" }}>
                {jobDetails.map((jobDetail, idx) => (
                  <Col key={idx}>
                    <Card>
                      <Card.Body>
                        <Card.Title>{jobDetail.jobName}</Card.Title>
                        <Card.Subtitle><strong>{`JobId: `}</strong>{jobDetail.jobId}
                        </Card.Subtitle>
                        <Card.Text>
                          {jobDetail.jobDescription}
                        </Card.Text>
                        <Link to={`/jobDetail/${jobDetail.jobId}`}>
                          <Button variant="primary">View Details</Button>
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Collapse>}
        </div>

        <div style={{ padding: "1rem 2rem" }}>
          <div className="d-grid gap-2">
            <Button
              onClick={allJobs}
              aria-expanded={B2}>Show All Jobs</Button>
          </div>
          <Collapse in={B2}>
            <div>
              <Row xs={4} md={7} className="g-4" style={{ margin: "auto" }}>
                {jobDetails.map((jobDetail, idx) => (
                  <Col key={idx}>
                    <Card border={jobDetail.isCompleted ? "success" : "warning"}>
                      <Card.Body>
                        <Card.Title>{jobDetail.jobName}</Card.Title>
                        <Card.Subtitle><strong>{`JobId: `}</strong>{jobDetail.jobId}
                        </Card.Subtitle>
                        <Card.Text>
                          {jobDetail.jobDescription}
                        </Card.Text>
                        <Link to={`/jobDetail/${idx}`}>
                          <Button variant="primary">View Details</Button>
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Collapse>
        </div>

      </div>
    </ React.Fragment>
  );
}

export default Jobs;
