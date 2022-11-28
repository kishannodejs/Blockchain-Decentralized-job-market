import useEth from "../../contexts/EthContext/useEth";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";

function Home() {
  const { state } = useEth();


  const home = (
    <>
      <div className="contract-container">

      </div>
    </>
  );

  return (
    <div className="demo">
      {!state.artifact ? (
        <NoticeNoArtifact />
      ) : !state.contract ? (
        <NoticeWrongNetwork />
      ) : (
        home 
      )}
    </div>
  );
}

export default Home;
