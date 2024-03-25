import React from "react";
import { Button, Input, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { v4 as uuidv4 } from "uuid";
import axios from "../../../axios";
import styles from "./questionForm.module.scss";
import  { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';// Import Quill's CSS file

const styleSheet = {
  objectName: {
    position: "relative",
    marginBottom: "2rem",
    width: "100%",
  },
  option: {
    // position: "relative",
    width: "100%",
  },
  btn: {
    display: "flex",
    gap: ".5rem",
  },
  deleteBtn: {},
  box: {
    marginTop: "4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  treeItem: {
    ".MuiTreeItem-label": {
      fontSize: "1.4rem !important",
      padding: "1rem 0",
    },
  },
  form: {
    display: 'flex', // Use flexbox to align components side by side
    justifyContent: 'space-between', // Space between the two components
    alignItems: 'flex-start', // Align items to the top
  },
};


const QuestionForm = (props) => {
  const { question, handleEditQuestionParam } = props;


  const handleAddOption = () => {
    const newAnswers = question.answers
      ? [
          ...question?.answers,
          {
            id: uuidv4(),
            _option_:"",
            _tip_: "",
         
          },
        ]
      : [
          {
            id: uuidv4(),
            _option_:"",
            _tip_: "",
          
          },
        ];

    handleEditQuestionParam("answers", newAnswers);
  };

  

  const handleUpdateOption = (optionId, value, isCorrect, tip) => {
    const newAnswers = question?.answers?.map((answer) => {
      if (answer.id === optionId) {
        return {
          ...answer,
          _option_: value,
          correct: isCorrect,
          _tip_: tip,
        };
      }
      return answer;
    });
    handleEditQuestionParam("answers", newAnswers);
  };

  const handleDeleteOption = (answerId) => {
    if (question.answers.length <= 1) return;
    const newAnswers = question.answers.filter(
      (answer) => answer.id !== answerId
    );
    handleEditQuestionParam("answers", newAnswers);
  };
  const [show, setShow] = useState(false);
  const onClickTip = (optionId) => {
    setShow(!show)
    if (question && question?.answers) {
      
      const newAnswers = question?.answers?.map((answer) => {
        if (answer.id === optionId) {
          return {
            ...answer,
            
          };
         
        }
        return answer;
      });
      handleEditQuestionParam("answers", newAnswers);
    }
  };

  const handleShowObject = async () => {
    try {
      const {data} = await axios.get(
        "http://localhost:4000/api/createObject/65ccf38d2bc7f5003417ccec"
      );
      
      window.open(data)
      // Handle the response data as needed
    } catch (error) {
      console.error("Error fetching object:", error);
    }
  };
  return (
 
    <div className={styles.formContainerLeftHalf}>
    <div className={styles.form}>
      <TextField
        label="_Question_"
        variant="outlined"
        name="_question_"
        sx={styleSheet.objectName}
        value={question?._question_ }
        onChange={(e) => handleEditQuestionParam(e.target.name, e.target.value)}
      />
      <h4>_Answer_: </h4>
      <ul className={styles.options}>
        {question?.answers?.map((answer, idx) => (
          <li key={idx} className={styles?.option}>
            <>
              <div>
                <div>
                  <div>
                    <TextField
                      label={`_Answer ${idx + 1}_`}
                      variant="outlined"
                      sx={styleSheet.option}
                      value={answer?._option_}
                      onChange={(e) =>
                        handleUpdateOption(answer.id, e.target.value, answer.correct, answer._tip_)
                      }
                    ></TextField>
                    <button type="button" onClick={() => onClickTip(answer?.id)}>
                      <InfoIcon color="primary" />
                    </button>
                    <div
                      className={styles.popover}
                      style={{
                        display: show ? "block" : "none"
                      }}
                    >
                      <Input
                        value={answer._tip_}
                        onChange={(e) =>
                          handleUpdateOption(answer.id, answer._option_, answer.correct, e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
  
                <Button
                  sx={styleSheet.deleteBtn}
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteOption(answer.id)}
                >
                  <DeleteIcon />
                </Button>
              </div>
            </>
          </li>
        ))}
      </ul>
      <Button
        color="success"
        sx={(styleSheet.btn, { fontWeight: "bold" })}
        size="large"
        onClick={handleAddOption}
      >
        add correct answer
      </Button>
    </div>
  </div>
  
  
  );
};

export default QuestionForm;
