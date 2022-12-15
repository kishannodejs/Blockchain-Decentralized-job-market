import WorkerDetails from "./components/Demo/WorkerDetails";
import Worker from "./components/Demo/Worker";

import Owner from './components/Demo/Owner';
import JobDetails from "./components/Demo/JobDetails";
import Jobs from "./components/Demo/Jobs";

import Header from "./components/Header";

import { EthProvider } from "./contexts/EthContext";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';



function App() {

  return (

    <EthProvider>
      <Router>
        <Header/>
        <Routes>

        <Route path='/' element={
            <Jobs
            />}></Route>
          
          <Route path='/home' element={
            <Jobs
            />}></Route>

          <Route path='/jobs' element={
            <Jobs
            />}></Route>

          <Route path={`/jobDetail/:jobId`} element={
            <JobDetails
            />}></Route>

          <Route path='/owner' element={<Owner />}></Route>

          <Route path='/worker' element={<Worker />}></Route>

          <Route path='/workerDetails/:workerAdd' element={
            <WorkerDetails
            />}></Route>
        </Routes>
      </Router>
    </EthProvider>


  );
}

export default App;
