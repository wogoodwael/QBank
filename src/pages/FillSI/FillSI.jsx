import React from "react";
import  { useState } from 'react';
import ReactQuill from 'react-quill';
import '../../App.css';
import 'react-quill/dist/quill.snow.css';
import styles from "./fillSI.module.scss";
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
    title: "",
    options: [
      { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
     
    ],
    
  };
};

const FillSIForm = (props) => {
  const [parameters, setParameters] = React.useState(
    generateFillBlankQuestion
  );
  const [questions, setQuestions] = React.useState([
    generateFillBlankQuestion(),
  ]);
  const location = useLocation();
  const params = useParams();
  const [showForm, setShowForm] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { data: state } = useStore();
  const navigate = useNavigate();
  const [renderFromModal, setRenderFromModal] = React.useState(false);
  const appendIdToAnswers = (parameters) => {
    const newAnswers = parameters.answers.map((ans) => ({
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
    getQuestionTypes()
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
  const [selectedOption, setSelectedOption] = useState(""); 
  const [types, setTypes] = React.useState([]);

  const getQuestionTypes = async () => {
    const res = await axios.get("interactive-object-types");
    const types = res.data.map((item) => item.typeName);
    setTypes(types);
  };// State variable to track selected option
  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
    // openResultInNewTab()
  };
  const openResultInNewTab = () => {
    // Modify this URL to the appropriate result page URL
    window.open("/add-question/filltheblanks/manual", "_blank");
  };

  const handleEditQuestionParam = (param, value) => {
    setParameters((prevState) => ({ ...prevState, [param]: value }));
  };

  const onClickNew = () => {
    setShowForm(true);
    setParameters(generateFillBlankQuestion());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(state);
    const data = {
      ...state,
      isAnswered: "g",
      parameters,
    };
    console.log(data);
    try {
      setLoading(true);
      if (location.pathname.includes("/edit_fill/")) {
        const { id } = params;
        await axios.patch(`/interactive-objects/${id}`, {
          ...data,
        });
        toast.success("Question updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        await axios.post("/interactive-objects", {
          ...state,
          isAnswered: "g", // g, y , r
          parameters,
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
  const MyQuillEditor = () => {
    const [editorHtml, setEditorHtml] = useState('');
  
    const handleChange = (html) => {
      setEditorHtml(html);
    };
   
  const module={
  
  
  }
    return (
      
      <div className="quill-editor-container"> {/* Add a custom class */}
      <ReactQuill
        modules={module}
        theme="snow" // specify theme ('snow' or 'bubble')
        value={editorHtml}
        onChange={handleChange}
      />
      <div className="button-container">
            <button className="save-button">Save</button>
            <button className="cancel-button">Cancel</button>
            </div>
    </div>
    );
  };
  
  return showForm ? (
    <form className="container" onSubmit={handleSubmit}>
      {!renderFromModal && (
        <>
         <select value={selectedOption} onChange={handleDropdownChange}>
              <option value="">Select an option</option>
              {types.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
            </select>
    <div className="header-container">
    <div className="" style={styleSheet.form}>
      <div className={styles.contentContainer}>
        <header className="app-header"> {/* Add header */}
          <h1>Fill in the blank</h1> {/* Add the header text */}
        </header>
        <div className={styles.verticalSpace} /> {/* Add vertical space */}
        <MyQuillEditor /> {/* Integrate the MyQuillEditor component */}
      </div>{/* Integrate the MyQuillEditor component */}
    </div>
    <QuestionNameHeader>Smart Interactive object</QuestionNameHeader>
  </div>
 
  <div className={styles["image-box"]}>
    <img src="/assets/question-bg-2.jpg" alt="question background" />
  </div>
        </>
      )}
      
      {selectedOption === "FillTheBlank" && (
        <List
          sx={{ width: "60%", bgcolor: "background.paper" }}
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
        )}
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

export default FillSIForm;
