import { PostFormAPI } from "../../component/FetchAPIs.jsx";

export async function uploadScreenshot(blob, { signal } = {}) {
  const file = new File([blob], `screenshot-${Date.now()}.jpg`, {
    type: blob.type || "image/jpeg",
  });

  const formData = new FormData();
  formData.append("image", file);

  return PostFormAPI("/user/addImage", formData, signal);
}
