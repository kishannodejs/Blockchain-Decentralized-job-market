import WorkerDetails from "./components/Demo/WorkerDetails";
import Worker from "./components/Demo/Worker";

import Owner from './components/Demo/Owner';
import JobDetails from "./components/Demo/JobDetails";
import Jobs from "./components/Demo/Jobs";

import Home from "./components/Demo";
import Header from "./components/Header";

import { EthProvider } from "./contexts/EthContext";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

//css
import "./App.css";


function App() {
  const [jobDetails, setJobDetails] = useState([]);
  const [allBiders, setAllBiders] = useState([]);


  return (<div>
    <EthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path='/home' element={<Home />}></Route>

          <Route path='/jobs' element={
            <Jobs
              jobDetails={jobDetails}
              setJobDetails={setJobDetails}
              allBiders={allBiders}
              setAllBiders={setAllBiders}
            />}></Route>

          <Route path={`/jobDetail/:idx`} element={
            <JobDetails
              jobDetail={jobDetails}
              allBiders={allBiders}
            />}></Route>

          <Route path='/owner' element={<Owner />}></Route>

          <Route path='/worker' element={<Worker />}></Route>

          <Route path='/workerDetails/:workerAdd' element={
            <WorkerDetails
            />}></Route>
        </Routes>
      </Router>
    </EthProvider>
  </div>

  );
}

export default App;
