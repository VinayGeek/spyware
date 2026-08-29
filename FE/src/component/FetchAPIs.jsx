import Axios from "axios";

const BaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

const GetAPI = async (url) => {
  const response = await Axios.get(`${BaseUrl}${url}`);
  return response.data;
};

const PostAPI = async (url, data) => {
  const response = await Axios.post(`${BaseUrl}${url}`, data);
  return response.data;
};

const PostFormAPI = async (url, formData, signal) => {
  const response = await Axios.post(`${BaseUrl}${url}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
  return response.data;
};

export { GetAPI, PostAPI, PostFormAPI };
