// src/App.js
import React, { useRef, useCallback, useEffect, useState, useLayoutEffect } from "react";
import Webcam from "react-webcam";
import Feed from "./Feed";
import "./FeedFull.css";
import './App.css'; // или './FeedFull.css'
// Хук для адаптивных размеров камеры и canvas
function useMediaSize() {
  const [mediaSize, setMediaSize] = useState({ width: 300, height: 400 });

  useLayoutEffect(() => {
    function update() {
      const isMobile = window.innerWidth < 600;
      const width = isMobile ? Math.min(window.innerWidth * 0.97, 400) : 300;
      setMediaSize({ width, height: Math.round(width * 4 / 3) });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return mediaSize;
}
// Предварительная загрузка изображений-оверлеев
const overlayUrls = {
  glasses: "https://static.vecteezy.com/system/resources/previews/048/220/008/non_2x/black-rimmed-sunglasses-free-png.png",
  hat: "/pics/cap.png",
  scarf: "https://png.pngtree.com/png-clipart/20210502/original/pngtree-clothing-red-scarf-png-image_6258566.png",
  mask: "https://pics.clipartpng.com/midle/White_Face_Mask_PNG_Clipart-3285.png",
};
const overlayImages = {};
Object.entries(overlayUrls).forEach(([key, url]) => {
  const img = new window.Image();
  img.src = url;
  overlayImages[key] = img;
});

// Добавить до export default function App()
const feedItems = [
  {
    id: 1,
    image: "/pics/cap.png",
    title: "@bratikberi.shop",
    desc: "Кепка стоник братик тема",
    avatar: "/pics/user1.png",
    overlayKey: "hat",
  },
  {
    id: 2,
    image: "https://static.vecteezy.com/system/resources/previews/048/220/008/non_2x/black-rimmed-sunglasses-free-png.png",
    title: "@rayban_clubmaster",
    desc: "Classic look for every day 😎",
    avatar: "/pics/user2.png",
    overlayKey: "glasses",
  },
  {
    id: 3,
    image: "https://png.pngtree.com/png-clipart/20210502/original/pngtree-clothing-red-scarf-png-image_6258566.png",
    title: "@r0ckstar4btch",
    desc: "Archive winter style scarf",
    avatar: "/pics/user3.png",
    overlayKey: "scarf",
  },
  {
    id: 4,
    image: "https://pics.clipartpng.com/midle/White_Face_Mask_PNG_Clipart-3285.png",
    title: "@tiananmen89",
    desc: "Protection, F*** COVID",
    avatar: "/pics/user4.png",
    overlayKey: "mask",
  }
];

export default function App() {
  const [selectedKey, setSelectedKey] = useState("hat");
  const [screen, setScreen] = useState("feed"); // camera, tryon, profile, feed
  const [photoSrc, setPhotoSrc] = useState(null);

  const webcamRef = useRef();
  const canvasRef = useRef();
  const photoCanvasRef = useRef();
  const [landmarks, setLandmarks] = useState(null);

  const { width: MEDIA_WIDTH, height: MEDIA_HEIGHT } = useMediaSize();

  // Внутри App (после хуков), добавить:
  const handleTry = (overlayKey) => {
    setSelectedKey(overlayKey);
    setScreen("camera");
    setPhotoSrc(null);
  };

  // Главный рендер оверлея и лендмарков
  const onFaceResults = useCallback((results) => {
    if (!results.multiFaceLandmarks?.length) return;
    const lms = results.multiFaceLandmarks[0];
    setLandmarks(lms);

    const wrapper = document.querySelector(".media-wrapper");
    if (!wrapper) return;
    const canvas = canvasRef.current;
    const width = wrapper.offsetWidth;
    const height = wrapper.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    // Рисуем красные точки еще тоньше
    ctx.fillStyle = "red";
    lms.forEach(lm => {
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 0.7, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Рисуем аксессуар
    const imgOv = overlayImages[selectedKey];
    if (imgOv && imgOv.complete) {
      if (selectedKey === "hat") {
        const leftEar = lms[234];
        const rightEar = lms[454];
        const forehead = lms[10];
        // Центр между ушами, чуть выше лба
        const cx = (leftEar.x + rightEar.x) / 2 * width;
        const cy = forehead.y * height + 0.01 * height;
        const faceWidth = Math.abs(rightEar.x - leftEar.x) * width * 1.32;
        const oW = faceWidth;
        const oH = faceWidth * (imgOv.height / imgOv.width);
        // Угол головы по ушам
        const dx = rightEar.x - leftEar.x;
        const dy = rightEar.y - leftEar.y;
        const angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.drawImage(imgOv, -oW / 2, -oH * 0.9, oW, oH);
        ctx.restore();
        return;
      } else if (selectedKey === "glasses") {
        const leftEye = lms[33];
        const rightEye = lms[263];
        const cx = (leftEye.x + rightEye.x) / 2 * width;
        const cy = (leftEye.y + rightEye.y) / 2 * height;
        const dx = (rightEye.x - leftEye.x) * width;
        const dy = (rightEye.y - leftEye.y) * height;
        const angle = Math.atan2(dy, dx);
        const eyeWidth = Math.sqrt(dx * dx + dy * dy) * 1.6;
        const oW = eyeWidth;
        const oH = eyeWidth * (imgOv.height / imgOv.width);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.drawImage(imgOv, -oW / 2, -oH / 2, oW, oH);
        ctx.restore();
        return;
      } else if (selectedKey === "mask") {
        const leftCheek = lms[234] || landmarks[234];
        const rightCheek = lms[454] || landmarks[454];
        const nose = lms[2] || landmarks[2];
        const chin = lms[152] || landmarks[152];

        const cx = (leftCheek.x + rightCheek.x) / 2 * width;
        const cy = (nose.y * 0.65 + chin.y * 0.35) * height;
        const faceWidth = Math.abs(rightCheek.x - leftCheek.x) * width * 1.19;
        const oW = faceWidth;
        const oH = faceWidth * (imgOv.height / imgOv.width) * 1.05;

        // Угол по щекам
        const dx = rightCheek.x - leftCheek.x;
        const dy = rightCheek.y - leftCheek.y;
        const angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.drawImage(imgOv, -oW / 2, -oH / 2, oW, oH);
        ctx.restore();
        return;
      } else if (selectedKey === "scarf") {
        const chin = lms[152];
        const cx = chin.x * width;
        const cy = chin.y * height + 0.30 * height;
        const faceWidth = Math.abs(lms[234].x - lms[454].x) * width * 1.92;
        const oW = faceWidth;
        const oH = faceWidth * (imgOv.height / imgOv.width);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.drawImage(imgOv, -oW / 2, -oH / 2, oW, oH);
        ctx.restore();
      }
    }
  }, [selectedKey]);

  // MediaPipe FaceMesh запускается только при отображении камеры
  useEffect(() => {
    if (
      screen === "camera" &&
      webcamRef.current &&
      webcamRef.current.video &&
      window.FaceMesh &&
      window.Camera
    ) {
      let stopped = false;
      const faceMesh = new window.FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults((results) => !stopped && onFaceResults(results));
      const camera = new window.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (!stopped) await faceMesh.send({ image: webcamRef.current.video });
        },
        width: MEDIA_WIDTH,
        height: MEDIA_HEIGHT,
      });
      camera.start();
      return () => {
        stopped = true;
        camera.stop();
      };
    }
  }, [onFaceResults, screen]);

  // Рисуем фото с аксессуаром поверх фото
  useEffect(() => {
    if (screen !== "tryon" || !photoSrc || !landmarks) return;
    const img = new window.Image();
    img.src = photoSrc;
    img.onload = () => {
      const canvas = photoCanvasRef.current;
      const width = MEDIA_WIDTH, height = MEDIA_HEIGHT;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const imgOv = overlayImages[selectedKey];
      if (imgOv && imgOv.complete) {
        if (selectedKey === "hat") {
          const leftEar = landmarks[234];
          const rightEar = landmarks[454];
          const forehead = landmarks[10];
          // Центр между ушами, чуть выше лба
          const cx = (leftEar.x + rightEar.x) / 2 * width;
          const cy = forehead.y * height + 0.05 * height;
          const faceWidth = Math.abs(rightEar.x - leftEar.x) * width * 1.32;
          const oW = faceWidth;
          const oH = faceWidth * (imgOv.height / imgOv.width);
          // Угол головы по ушам
          const dx = rightEar.x - leftEar.x;
          const dy = rightEar.y - leftEar.y;
          const angle = Math.atan2(dy, dx);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.drawImage(imgOv, -oW / 2, -oH * 0.9, oW, oH);
          ctx.restore();
          return;
        } else if (selectedKey === "glasses") {
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const cx = (leftEye.x + rightEye.x) / 2 * width;
          const cy = (leftEye.y + rightEye.y) / 2 * height;
          const dx = (rightEye.x - leftEye.x) * width;
          const dy = (rightEye.y - leftEye.y) * height;
          const angle = Math.atan2(dy, dx);
          const eyeWidth = Math.sqrt(dx * dx + dy * dy) * 1.6;
          const oW = eyeWidth;
          const oH = eyeWidth * (imgOv.height / imgOv.width);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.drawImage(imgOv, -oW / 2, -oH / 2, oW, oH);
          ctx.restore();
          return;
        } else if (selectedKey === "mask") {
          const leftCheek = landmarks[234];
          const rightCheek = landmarks[454];
          const nose = landmarks[2];
          const chin = landmarks[152];

          const cx = (leftCheek.x + rightCheek.x) / 2 * width;
          const cy = (nose.y * 0.65 + chin.y * 0.35) * height;
          const faceWidth = Math.abs(rightCheek.x - leftCheek.x) * width * 1.19;
          const oW = faceWidth;
          const oH = faceWidth * (imgOv.height / imgOv.width) * 1.05;

          // Угол по щекам
          const dx = rightCheek.x - leftCheek.x;
          const dy = rightCheek.y - leftCheek.y;
          const angle = Math.atan2(dy, dx);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.drawImage(imgOv, -oW / 2, -oH / 2, oW, oH);
          ctx.restore();
          return;
        } else if (selectedKey === "scarf") {
          const chin = landmarks[152];
          const cx = chin.x * width;
          const cy = chin.y * height + 0.30 * height;
          const faceWidth = Math.abs(landmarks[234].x - landmarks[454].x) * width * 1.92;
          const oW = faceWidth;
          const oH = faceWidth * (imgOv.height / imgOv.width);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.drawImage(imgOv, -oW / 2, -oH / 2, oW, oH);
          ctx.restore();
        }
      }
    };
  }, [photoSrc, landmarks, selectedKey, screen]);

  return (
    <div className="app-container">
      <header className="header">
        <h2>Tryon!</h2>
      </header>
      {screen !== "feed" && (
        <button className="back-btn" onClick={() => setScreen('feed')}>
          <img src="/pics/arrow-back-try.png" alt="Back" />
        </button>
      )}
      <main className="main-feed">
  {screen === "feed" && (
    <Feed feedItems={feedItems} onTry={handleTry} />
  )}

  {screen === "camera" && (
    <>
      <div
        className="media-wrapper"
        style={{
          width: MEDIA_WIDTH,
          height: MEDIA_HEIGHT,
          position: "relative",
          margin: "32px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          border: "2px solid #222",
          borderRadius: 14,
          boxSizing: "border-box"
        }}>
        <Webcam
          ref={webcamRef}
          className="camera-view"
          style={{
            width: MEDIA_WIDTH,
            height: MEDIA_HEIGHT,
            position: "absolute",
            left: 0,
            top: 0,
            objectFit: "cover",
          }}
          audio={false}
          mirrored={false}
          screenshotFormat="image/jpeg"
        />
        <canvas
          ref={canvasRef}
          className="overlay"
          style={{
            width: MEDIA_WIDTH,
            height: MEDIA_HEIGHT,
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
        <button
          onClick={() => {
            const image = webcamRef.current.getScreenshot();
            setPhotoSrc(image);
            setScreen("tryon");
          }}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "4px solid #ff006c",
            background: "#fff",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            cursor: "pointer"
          }}
        >
          <span style={{
            position: "absolute",
            left: 14,
            top: 14,
            width: 40,
            height: 40,
            background: "#ff006c",
            borderRadius: "50%",
            display: "block"
          }} />
        </button>
      </div>
    </>
  )}

  {screen === "tryon" && (
    <>
      <div
        className="media-wrapper"
        style={{
          width: MEDIA_WIDTH,
          height: MEDIA_HEIGHT,
          position: "relative",
          margin: "32px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          border: "2px solid #222",
          borderRadius: 14,
          boxSizing: "border-box"
        }}>
        <canvas
          ref={photoCanvasRef}
          style={{
            width: MEDIA_WIDTH,
            height: MEDIA_HEIGHT,
            position: "absolute",
            left: 0,
            top: 0,
            borderRadius: 12,
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
        <button
          onClick={() => setScreen("camera")}
          style={{
            background: "#ff006c",
            color: "",
            fontWeight: 600,
            padding: "12px 24px",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "8px",
          }}
        >🔄 Еще раз</button>
      </div>
    </>
  )}
</main>
    </div>
  );
}