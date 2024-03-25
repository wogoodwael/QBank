// import axios from "axios";

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const convertPdfToImages = async () => {
  await wait(4000);
  return ["/assets/Fill in the blank.jpg", "/assets/Fill in the blank.jpg"];
};

export { convertPdfToImages };
