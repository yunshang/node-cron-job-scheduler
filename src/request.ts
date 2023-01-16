import axios from "axios";
const createInstance = () => {
  const request = axios.create({
    // baseURL: "http://172.16.128.86:31040/api/v1",
    baseURL: "",
    timeout: 10000,
  });
  return request;
};
export default createInstance();
