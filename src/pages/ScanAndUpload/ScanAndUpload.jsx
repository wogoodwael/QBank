import React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import StudioFill from "../../components/Studio Fill/Studio_fill";
import { convertPdfToImages } from "../../utils/server";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import { useFormState } from "react-hook-form";
import { useStore } from "../../store/store";
import parameters from "../../constants/parameters.json";

import styles from "./scanAndUpload.module.scss";
import DescriptionIcon from "@mui/icons-material/Description";
import CollectionsIcon from "@mui/icons-material/Collections";
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ScanAndUpload = () => {
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const { data: state } = useStore();

  const convertPdfToImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(
      "http://34.246.140.123:5000/api/pdf2img",
      formData
    );
    setLoading(false);
    return res.data?.images;
  };

  const convertPdfToImage2 = async (file) => {
    setLoading(true);
    const res = await convertPdfToImages(file);
    setLoading(false);
    return res;
  };
  const onChangePdf = async (event) => {
    const file = event.target.files[0];
    const images = await convertPdfToImage(file);
    setImages(images ? images : []);
  };

  const onChange = async (event) => {
    const file = event.target.files[0];
    const images = await convertPdfToImage2(file);
    setImages(images);
    console.log(images);
  };
  const onChangeImages = async (event) => {
    const files = event.target.files;
    const urls = [...files].map((file) => URL.createObjectURL(file));
    setImages(urls);
  };

  if (loading) {
    return (
      <div className="container">
        <QuestionNameHeader>{state.type}</QuestionNameHeader>
        <Loader text="Converting pdf to images" />
      </div>
    );
  }

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      <QuestionNameHeader>{state.type}</QuestionNameHeader>
      {!!images.length ? (
        <StudioFill images={images} />
      ) : (
        <div className={styles["upload-buttons"]}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<DescriptionIcon />}
          onChange={onChange}
          color="warning"
        >
          Upload PDF
          <VisuallyHiddenInput type="file" accept="application/pdf" />
        </Button>
        <Button
          component="label"
          variant="outlined"
          startIcon={<CollectionsIcon />}
          onChange={onChangeImages}
          color="success"
        >
          Upload images
          <VisuallyHiddenInput
            type="file"
            accept="image/png, image/jpeg"
            multiple
          />
        </Button>
      </div>
    )}
  </div>
  );
};

export default ScanAndUpload;
