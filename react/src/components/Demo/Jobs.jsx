import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import useEth from "../../contexts/EthContext/useEth";
import React, { useEffect, useState } from "react";
import web3 from 'web3';
import { Link } from 'react-router-dom';
import Collapse from 'react-bootstrap/Collapse';

function Jobs() {
  const {
    state: { contract, accounts }, } = useEth();

  const [jobDetails, setJobDetails] = useState([]);
  const [B1, setB1] = useState(false);
  const [B2, setB2] = useState(false);

  const _activeJobs = async () => {
    setB2(false);
    setJobDetails([]);
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
      _activeJobsIdB32.forEach((id) => {
        _activeJobsId.push((web3.utils.toBN(id)).toString())
      })

      _activeJobsId.forEach(async (jobId) => {
        await contract.methods.seeJob(jobId).call({ from: accounts[0], })
          .then((p) => setJobDetails((pre) => { return [p, ...pre] }))
          .catch(error => console.log(error));
      })
    }, 500);
    setB1(!B1);
  };
  const allJobs = async () => {
    setB1(false);
    setJobDetails([]);

    setTimeout(async () => {
      let totalJobs = await contract.methods._jobIds().call({ from: accounts[0], });

      for (let i = 1; i <= totalJobs; i++) {
        await contract.methods.seeJob(i).call({ from: accounts[0], })
          .then((p) => setJobDetails((pre) => { return [p, ...pre] }))
          .catch(error => console.log(error));
      }
    }, 500)

    setB2(!B2);
  };

  useEffect(() => {
    if (contract == null) return;
    const data = setTimeout(async () => {
      setB2(false);
      setJobDetails([]);
      let _activeJobsIdB32;
      try {
        _activeJobsIdB32 = await contract.methods.activeJobs().call({
          from: accounts[0],
        });
      } catch (error) {
        console.log(error);
      }

      let _activeJobsId = [];
      _activeJobsIdB32.forEach((id) => {
        _activeJobsId.push((web3.utils.toBN(id)).toString())
      })

      _activeJobsId.forEach(async (jobId) => {
        await contract.methods.seeJob(jobId).call({ from: accounts[0], })
          .then((p) => setJobDetails((pre) => { return [p, ...pre] }))
          .catch(error => console.log(error));
      })
    }, 500);
    if (!B1) setB1(!B1);
    return () => {
      clearTimeout(data);
    }
  }, [contract, accounts]);

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
                    <Card style={{ background: jobDetail.isCompleted ? "#ABEBC6" : "#FAB0AD" }}>
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
          </Collapse>
        </div>

      </div>
    </ React.Fragment>
  );
}

export default Jobs;
