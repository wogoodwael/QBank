import React from "react";
import  { useState } from 'react';
import ReactQuill from 'react-quill';
import '../../App.css';
import 'react-quill/dist/quill.snow.css';
import styles from "./fillBlank.module.scss";
import { Button, CircularProgress } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import QuestionForm from "../../components/FillBlank/QuestionForm/QuestionForm";
import axios from "../../axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Delete, ExpandLess, ExpandMore } from "@mui/icons-material";
const generateFillBlankQuestion = () => {
  return {
    _question_: "",
    answers: [
      { id: uuidv4(), _tip_: "",_option_:"" },
     
    ],
  };
};

const FillBlankForm = (props) => {
  const [parameters, setParameters] = React.useState(
    generateFillBlankQuestion
  );
  const [questions, setQuestions] = React.useState([
    generateFillBlankQuestion(),
  ]);


  const [json, setJSON] = React.useState("");
  const location = useLocation();
  const params = useParams();
  const [showForm, setShowForm] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { data: state } = useStore();
  const navigate = useNavigate();
  const [renderFromModal, setRenderFromModal] = React.useState(false);
  const appendIdToAnswers = (parameters) => {
    const newAnswers = parameters?.answers?.map((ans) => ({
      ...ans,
      id: uuidv4(),
    }));
    const newParameters = { ...parameters, answers: newAnswers };
    return newParameters;
  };
  const fetchData = async (id) => {
    const res = await axios.get(`/interactive-objects/${id}`);
    console.log(res.data);
    const { parameters } = res.data;
  
    setParameters(parameters);
    const newParameters = appendIdToAnswers(parameters);
    setParameters(newParameters);
  };
  React.useEffect(() => {
    // Edit
    if (location.pathname.includes("/edit_fill/")) {
      const { id } = params;
      fetchData(id);
    } else {
      if (state.parameters) {
        const keys = Object.keys(state.parameters);
        // OCR
        if (keys.length > 0) {
          setParameters(state.parameters);
          setRenderFromModal(true);
        }
      }
    }
  }, []);


  const handleEditQuestionParam = (param, value) => {
    setParameters((prevState) => ({ ...prevState, [param]: value }));
  };

  const onClickNew = () => {
    setShowForm(true);
    setParameters(generateFillBlankQuestion());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const containsOption = parameters.answers.some(answer => answer._option_);

    
    
    console.log(state);
    console.log('lenght', parameters.length)
    const data = {
      ...state,
      isAnswered: containsOption ? "g" : "r",

      parameters,
    };
    console.log(data);
    console.log("typee", data.questionName)
    // const answerText = parameters.answers[0].text;

    const h5pString = {
  
      questions: `<p>${parameters._question_} * ${parameters.answers?.[0]?._option_ ?? ""}${parameters.answers?.[1] ? '/' + parameters.answers?.[1]?._option_ : ""}:${parameters.answers?.[0]?._tip_ ?? ""}*</p>`
    };
    try {
      setLoading(true);
      if (location.pathname.includes("/edit_fill/")) {
        const { id } = params;
        await axios.patch(`/interactive-objects/${id}`, {
          ...data,
          h5pString

        });
        toast.success("Question updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        await axios.post("/interactive-objects", {
          ...state,
          questionName:data.questionName,
          isAnswered:containsOption ? "g" : "r",
          parameters,
          h5pString
        });
        if (props.onSubmit) {
          props.onSubmit();
        } else {
          toast.success("Question created successfully!");
          setTimeout(() => {
            setShowForm(false);
          }, 2000);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleOpenQuestion = (id) => {
    setQuestions((prevState) => {
      return prevState.map((question) => {
        if (question.id === id) {
          question.open = !question.open;
        }
        return question;
      });
    });
  };
  const handleAddQuestion = () => {
    setQuestions((prevState) => [...prevState, generateFillBlankQuestion()]);
  };
  const handleDeleteQuestion = (id) => {
    if (questions.length <= 1) {
      return;
    }
    setQuestions((prevState) => [
      ...prevState.filter((question) => question.id !== id),
    ]);
  };
  const styleSheet = {
    form: {
      display: 'flex', // Use flexbox to align components side by side
      justifyContent: 'space-between', // Space between the two components
      alignItems: 'flex-start', // Align items to the top
    },
  };
 


  return showForm ? (
    <form className="container" onSubmit={handleSubmit}>
      {!renderFromModal && (
        <>
    <div className="header-container">
    <div className="" style={styleSheet.form}>
      <div className={styles.contentContainer}>
        <header className="app-header-fill"> {/* Add header */}
          <h1>Fill in the blank</h1> {/* Add the header text */}
        </header>
        <div className={styles.verticalSpace} /> {/* Add vertical space */}
     
      </div>{/* Integrate the MyQuillEditor component */}
    </div>
   
  </div>

  <div className={styles["image"]}>
    <img src="/assets/question-bg-2.jpg" alt="question background" />
  </div>
        </>
      )}
      
      
        <List
          sx={{ width: "105%", bgcolor: "background.paper" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
        {questions.map((question, idx) => (
          <Box key={question.id} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2}>
              <ListItemButton
                onClick={() => handleOpenQuestion(question.id)}
                sx={
                  question.open
                    ? { backgroundColor: grey[300] }
                    : { backgroundColor: grey[200] }
                }
              >
                <ListItemText primary={`Question ${idx + 1}`} />
                {question.open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <IconButton
                aria-label="delete"
                sx={{ width: "3rem", height: "3rem" }}
                color="error"
                onClick={() => handleDeleteQuestion(question.id)}
              >
                <Delete />
              </IconButton>
            </Stack>
            <Collapse
              in={question.open}
              timeout="auto"
              unmountOnExit
              sx={{
                border: `1px solid ${grey[300]}`,
                borderTop: 0,
                mb: 2,
                p: 2,
                borderRadius: "0 0 .5rem .5rem",
                width: "95%",
              }}
            >
              <Box>
            
                <QuestionForm
        question={parameters}
        handleEditQuestionParam={handleEditQuestionParam}
        renderFromModal={renderFromModal}
      />
              </Box>
            </Collapse>
          </Box>
        ))}
        
      </List>
      <button
          type="button"
          onClick={() => {
            setJSON(parameters);
          }}
        >
          Show JSON
        </button>
        <p>{JSON.stringify(parameters)}</p>
      <Button   //*deited
        size="large"
        sx={{ fontWeight: "bold" }}
        onClick={handleAddQuestion}
      >
        Add Sentence   
      </Button>
      {/* <QuestionForm
        question={parameters}
        handleEditQuestionParam={handleEditQuestionParam}
        renderFromModal={renderFromModal}
      /> */}
      
      <div className={styles["submit-box"]}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          <span>Submit</span>
          {loading && <CircularProgress />}
        </Button>
      </div>
    </form>
  ) : (
    <div className="container">
      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon />}
        onClick={onClickNew}
      >
        New
      </Button>
    </div>
  );
};

export default FillBlankForm;
