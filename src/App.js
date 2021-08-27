import "./App.css";
import Peer from "peerjs";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
function App() {
  let [peerId, setPeerId] = useState("");
  let [remoteId, setRemoteId] = useState("");

  let [status, setStatus] = useState("idle");

  let [call, setCall] = useState(null);

  let audioControl = useRef(null);
  let videoControl = useRef(null);
  let peer = useMemo(() => {
    return new Peer();
  }, []);

  useEffect(() => {
    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("call", (call) => {
      console.log("Call recevied, answering");
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
          // eslint-disable-next-line no-restricted-globals
          const res = confirm("Accept?");
          if (res) {
            call.answer(stream);
            setCall(call);
          }
        });

      call.on("stream", (stream) => {
        // const ctx = new AudioContext();
        // const source = ctx.createMediaStreamSource(stream);
        // source.connect(ctx.destination);
        videoControl.current.srcObject = stream;
        videoControl.current.autoplay = true;

        console.log("Recevier: Connected stream");
        setStatus("connected");
      });

      call.on("close", () => {
        setCall(null);
        setStatus("idle");
      });

      call.on("error", (er) => {
        setCall(null);
        console.log(er);
        setStatus("idle");
      });
    });
  }, []);

  const makeCall = (ev) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        const call = peer.call(remoteId, stream);

        setCall(call);
        setStatus("calling");

        call.on("close", () => {
          setStatus("idle");
          setCall(null);
        });
        call.on("error", (er) => {
          console.error(er);
          setStatus("idle");
          setCall(null);
        });
        call.on("stream", (stream) => {
          setStatus("connected");

          console.log("Caller: Connected stream");

          videoControl.current.srcObject = stream;
          videoControl.current.autoplay = true;
        });
      });
  };
  const stopCall = () => {
    call.close();
  };

  return (
    <div className="App">
      <h1>{status}</h1>
      <h2>My Id: {peerId}</h2>

      <div>
        {status === "idle" ? (
          <>
            <input
              onChange={(ev) => setRemoteId(ev.target.value)}
              placeholder="Remote Id"
              value={remoteId}
            />
            <button type="button" onClick={makeCall}>
              Call
            </button>
          </>
        ) : (
          <button type="button" onClick={stopCall}>
            End
          </button>
        )}
      </div>
      <video controls ref={videoControl} />
    </div>
  );
}

export default App;
