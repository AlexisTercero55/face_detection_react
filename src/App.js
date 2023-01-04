import './App.css';

import React, {useState, useEffect, useRef} from 'react';
import * as faceAPI from 'face-api.js';

function App() 
{
  // hooks
  // AI app state on|off
  const [runnig, setRunnig] = useState(false);
  // const [hasPermission, setHasPermission] = useState(false);
  // jsx references
  const videoRef = useRef();
  const canvasRef = useRef();

  /**
   * Load AI models when the component mounts,
   * then start webcam stream.
   */
  useEffect(() => 
  {
    const loadModels = async () =>
    {
      const MODEL_URL = process.env.PUBLIC_URL + '/assets/weights';
      // setHasPermission(true);
      setRunnig(true);//start loading face-api models
      Promise.all([
        faceAPI.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceAPI.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceAPI.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceAPI.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]).then(startWebcam);
    };
    loadModels();
    // return () => { };//TODO : make a cleanup function
  }, []);

  // utils--------------------------------------------------------------
  const SQ_RESOLUTION = 512;
  const startWebcam = () => 
  {
    // Set the constraints for the video stream
    const constraints = {video: {width: { min: SQ_RESOLUTION },
                                 height: { min: SQ_RESOLUTION }}};
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  }

  /*** Updating detections*/
  const handleVideoOnPlay = (stream) => 
  {
    setInterval( async () =>
    {
      if(runnig){ setRunnig(false);} //check if models are available //TODO: add error handling

      // canvas drawings setUp-----------------------------------------------------------------------------------
      canvasRef.current.innerHTML = faceAPI.createCanvasFromMedia(videoRef.current);
      const displaySize = { width: SQ_RESOLUTION,
                            height: SQ_RESOLUTION};
      faceAPI.matchDimensions(canvasRef.current, displaySize);
      // face detection set up------------------------------------------------------------------------------------
      const detections = await faceAPI.detectAllFaces(videoRef.current,
                              new faceAPI.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      // drawing detections types process-------------------------------------------------------------------------
      const resizeDetections = faceAPI.resizeResults(detections, displaySize);
      canvasRef.current.getContext('2d').clearRect(0, 0, SQ_RESOLUTION, SQ_RESOLUTION);
      faceAPI.draw.drawDetections(canvasRef.current, resizeDetections);
      faceAPI.draw.drawFaceLandmarks(canvasRef.current, resizeDetections);
      faceAPI.draw.drawFaceExpressions(canvasRef.current, resizeDetections);
    }, 200);
  }
  // :3 uwu °w° 77 T-T °¬°
  return (
    <div className="App">
      <header className="App-header">
        <span className="state">
          {runnig?"Loading models":"Ready"}
        </span>
        <center className='container'>
          <video ref={videoRef} autoPlay muted
                width={SQ_RESOLUTION}
                height={SQ_RESOLUTION} 
                onPlay={handleVideoOnPlay}></video>
          <canvas className='face' ref={canvasRef}></canvas>
        </center>
      </header>
    </div>
  );
}
export default App;