import { useEffect, useRef } from "react";
import {
  captureCamera,
  captureStrategies,
} from "../services/screenshot/captureStrategies.js";
import { compressToLimit } from "../services/screenshot/compressImage.js";
import { createScreenshotScheduler } from "../services/screenshot/screenshotScheduler.js";
import { SCREENSHOT_DEFAULTS } from "../services/screenshot/types.js";
import { uploadScreenshot } from "../services/screenshot/uploadScreenshot.js";

export function useScreenshotCapture(options = {}) {
  const streamRef = useRef(null);
  const schedulerRef = useRef(null);

  const {
    strategy = SCREENSHOT_DEFAULTS.strategy,
    intervalMs = SCREENSHOT_DEFAULTS.intervalMs,
    target,
    pauseWhenHidden = SCREENSHOT_DEFAULTS.pauseWhenHidden,
    maxBytes = SCREENSHOT_DEFAULTS.maxBytes,
    jpegQuality = SCREENSHOT_DEFAULTS.jpegQuality,
    onError = console.error,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    // const captureFn = captureStrategies[strategy] ?? captureStrategies.page;
    const captureFn = captureCamera;

    const capture = async () => {
      try {
        const blob = await captureFn(target, streamRef, { jpegQuality });
        return blob ? compressToLimit(blob, { maxBytes, jpegQuality }) : null;
      } catch (err) {
        if (strategy === "screen") {
          return captureStrategies
            .page(target, streamRef, { jpegQuality })
            .then((fallback) =>
              fallback
                ? compressToLimit(fallback, { maxBytes, jpegQuality })
                : null,
            );
        }
        throw err;
      }
    };

    const scheduler = createScreenshotScheduler({
      capture,
      upload: uploadScreenshot,
      intervalMs,
      pauseWhenHidden,
      onError,
    });

    schedulerRef.current = scheduler;
    scheduler.start();

    return () => {
      scheduler.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      schedulerRef.current = null;
    };
  }, [
    strategy,
    intervalMs,
    target,
    pauseWhenHidden,
    maxBytes,
    jpegQuality,
    onError,
    enabled,
  ]);

  return {
    stop: () => schedulerRef.current?.stop(),
  };
}
