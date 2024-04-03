import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

const CameraFeed = () => {
  const videoRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const canvasRef = useRef(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 }); // Initial dimensions


  const loadModels=async()=>{
    try {
        await faceapi.loadFaceDetectionModel('models');
      } catch (error) {
        console.error('Error loading face detection model:', error);
      }
  }
  useEffect(() => {

    const startCamera = async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setVideoDimensions({ width: videoRef.current.videoWidth, height: videoRef.current.videoHeight });
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    const detectFace = async () => {
      if (videoRef.current) {
        const video = videoRef.current;
        const detections = await faceapi.detectAllFaces(video);
        setFaceDetected(detections.length > 0);
      }
    };

    startCamera();

    const intervalId = setInterval(() => {
      detectFace();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
  const captureImage = () => {
    console.log("iamge capture")
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Generate data URL for preview
      const imageDataUrl = canvas.toDataURL('image/jpeg');
        console.log(imageDataUrl)
      // Convert data URL to a Blob object
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a FormData object to upload the image file
          const formData = new FormData();
          formData.append('image', blob, 'captured_image.jpg');
  
          // You can now upload the formData to your server using fetch or any other method
          // Example using fetch:
          fetch('/upload', {
            method: 'POST',
            body: formData
          })
          .then(response => {
            // Handle response from server
          })
          .catch(error => {
            console.error('Error uploading image:', error);
          });
        }
      }, 'image/jpeg');
    }
  };
  return (
    <div>
 <div style={{   overflow: 'hidden' }} className={faceDetected?'show':'hide'}>
      <video ref={videoRef} autoPlay playsInline style={{ transform: 'scaleY(1)', width: '100%', height: '100%' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }}  />

     <button onClick={captureImage} style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 999 }}>Capture Image</button>

    </div>
    <div style={{   overflow: 'hidden' }} className={faceDetected?'hide':'show'}>
    <img src="/images/TempBG1.jpg" alt="Default" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
        </div>
  );
};

export default CameraFeed;
