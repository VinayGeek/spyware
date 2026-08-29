export function createScreenshotScheduler({
  capture,
  upload,
  intervalMs = 2500,
  pauseWhenHidden = true,
  onError = () => {},
}) {
  let running = false;
  let busy = false;
  let timer = null;
  let abortController = null;

  const scheduleNext = () => {
    if (!running) return;
    timer = setTimeout(tick, intervalMs);
  };

  const tick = async () => {
    if (!running) return;

    if (busy || (pauseWhenHidden && document.hidden)) {
      scheduleNext();
      return;
    }

    busy = true;
    abortController = new AbortController();

    try {
      const blob = await capture();
      if (blob) {
        await upload(blob, { signal: abortController.signal });
      }
    } catch (err) {
      if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") {
        onError(err);
      }
    } finally {
      busy = false;
      abortController = null;
      scheduleNext();
    }
  };

  return {
    start() {
      if (running) return;
      running = true;
      tick();
    },
    stop() {
      running = false;
      clearTimeout(timer);
      abortController?.abort();
    },
    isRunning: () => running,
  };
}
