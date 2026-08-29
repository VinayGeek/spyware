import html2canvas from "html2canvas";

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Failed to create blob")),
      type,
      quality,
    );
  });
}

async function captureFromVideoStream(stream, quality) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;

  await new Promise((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Video load failed"));
    video.play().catch(reject);
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  video.srcObject = null;
  return canvasToBlob(canvas, "image/jpeg", quality);
}

export const captureStrategies = {
  page: async (
    target = document.body,
    _streamRef,
    { jpegQuality = 0.7 } = {},
  ) => {
    const canvas = await html2canvas(target, { useCORS: true, logging: false });
    return canvasToBlob(canvas, "image/jpeg", jpegQuality);
  },

  screen: async (_target, streamRef, { jpegQuality = 0.7 } = {}) => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("Screen capture not supported");
    }

    if (!streamRef.current) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      stream.getVideoTracks()[0].onended = () => {
        streamRef.current = null;
      };
      streamRef.current = stream;
    }

    return captureFromVideoStream(streamRef.current, jpegQuality);
  },
};

export const captureCamera = async (_target, streamRef, options) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Camera access is not available. Make sure the page is served over HTTPS or localhost.",
    );
  }

  if (!streamRef.current) {
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    });
  }

  const stream = streamRef.current;

  const video = document.createElement("video");

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  await video.play();

  // Give the camera a moment to provide dimensions.
  await new Promise((resolve) => {
    if (video.videoWidth > 0) {
      resolve(true);
      return;
    }

    video.onloadedmetadata = () => resolve(true);
  });

  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create canvas context");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  video.pause();
  video.srcObject = null;

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", options.jpegQuality);
  });
};
