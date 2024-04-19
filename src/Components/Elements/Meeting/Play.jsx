import moment from "moment";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { GoPlusCircle } from "react-icons/go";
import { AiFillDelete } from "react-icons/ai";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import CounterContainer from "./PlayMeeting/components/CounterContainer";
import { useCounterContext } from "./context/CounterContext";
import { useTranslation } from "react-i18next";
import { FaMicrophone } from "react-icons/fa6";
import useSpeechToText from "../../../hooks/useSpeechToText/useSpeechToText";
import { IoMdEye } from "react-icons/io";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Editor } from "@tinymce/tinymce-react";
import { optimizeEditorContent } from "./Chart";
import ShowIF from "../../Utils/ShowIF";
import { Button } from "react-bootstrap";
// ================================>ALL IMPORTS END HERE<=====================================================

// ================================>FUNCTIONAL COMPONENT STARTS HERE!<=====================================================
const Play = ({ props }) => {
  // // const stopVoiceInput = () => {
  // //   setStepNotes((prevVal) => [
  // //     transcript + (prevVal.length ? "\n" + prevVal.join("\n") : "")
  // //   ]);
  // //   stopListening();
  // // };
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    meetingData,
    savedTime,
    negativeTimes,
    activeStepIndex,
    setNextActiveStep,
    setPreviousActiveStep,
  } = useCounterContext();
  const [inputData, setInputData] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [slideTime, setSlideTime] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [nextSlideTime, setNextSlideTime] = useState("");
  const [stepTitle1, setStepTitle1] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [start, setStart] = useState(new Date()); // Fetch and set this when meeting starts
  const [staticTime, setStaticTime] = useState(null);
  const [showNextCounter, setShowNextCounter] = useState();
  const currentDate = new Date();
  const inputDate = new Date(inputData.date);
  const currentDateTime = moment(currentDate);
  const inputDateTime = moment(inputDate);
  const [stepsState, setStepsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [htmlString, setHtmlString] = useState("");

  const [consumingTimes, setConsumingTimes] = useState([]);
  const [meeting, setMeeting] = useState({});
  const [stepNotes, setStepNotes] = useState([]);
  const [decision, setDecision] = useState([]);
  const [myAllStepNote, setMyAllStepNote] = useState([]);
  const [real_start_time, setRealStartTime] = useState("");
  const [alarm, setAlarm] = useState("");
  const [buttonText, setButtonText] = useState(t("Close"));
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [showStepContentEditor, setShowStepContentEditor] = useState(false);
  // REACT QUILL EDITORS for Notes and Decisions:
  const [notesEditor, setNotesEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [decisionEditor, setDecisionEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [enteredData, setEnteredData] = useState([]); // State to store entered data
  const [planDActionEditor, setPlanDActionEditor] = useState({
    showEditor: false,
  });
  const [isAutomatic, setIsAutomatic] = useState(false);
  const getMeeting = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        setMeeting(response.data?.data);
        if (response.data.data?.prise_de_notes === "Automatic") {
          setIsAutomatic(true);
        } else {
          setIsAutomatic(false);
        }
        setHtmlString(
          response.data?.data?.steps[currentStepIndex]?.editor_content
        );
        setStepData(response.data?.data?.steps);

        setTableData(response.data?.data?.plan_d_actions || []);
        setInputData(response?.data?.data);
        setLoading(false);
        return response.data?.data;
      }
    } catch (error) {
      setLoading(false);
      return null;
    }
  };
  useEffect(() => {
    getMeeting();
  }, [id]);

  const [textInputValue, setTextInputValue] = useState("");
  const { isListening, transcript, startListening, stopListening } =
    useSpeechToText({
      continuous: true,
      isOn: isAutomatic,
    });

  useEffect(() => {
    if (!isListening && isAutomatic) {
      startListening();
    }
  }, [startListening]);

  useEffect(() => {
    if (isListening) {
      setTextInputValue(transcript);
    }
  }, [isListening, transcript]);

  useEffect(() => {
    setRealStartTime(moment().format("HH:mm:ss"));
    const fetchMeetingData = async () => {
      try {
        const currentTime = moment().format("HH:mm:ss");
        const meetingData = await getMeeting();
        const updatedMeetingData = {
          ...meetingData,
          real_start_time: currentTime,
          _method: "put",
        };

        const response = await axios.post(
          `${API_BASE_URL}/meetings/${id}`,
          updatedMeetingData,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };

    fetchMeetingData(); // Call the async function inside useEffect
  }, [id]);

  //Set Time Format
  useEffect(() => {
    const fetchCurrentTime = () => {
      const current = new Date();
      setCurrentTime(current);
      setStart(current);
      setStaticTime(current);
    };
    fetchCurrentTime();
  }, []);

  useEffect(() => {
    if (
      stepData &&
      currentStepIndex >= 0 &&
      currentStepIndex < stepData.length
    ) {
      const currentStep = stepData[currentStepIndex];
      const stepStartTime = moment(currentStep.time, "HH:mm");
      const currentTime = moment();
      const timeDifference = moment.duration(currentTime.diff(stepStartTime));
      const consumingTime = `${timeDifference.minutes()}:${timeDifference.seconds()}`;
      setConsumingTimes((prevTimes) => [...prevTimes, consumingTime]);
    }
  }, [currentStepIndex, stepData]);

  useEffect(() => {
    const initialState = stepData?.map((step) => ({
      remainingTime: step.time * 60, // Initialize with the duration in seconds
      isPlaying: false,
      pausedTime: null,
    }));
    setStepsState(initialState);
  }, [stepData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepsState((prevState) => {
        if (!Array.isArray(prevState)) {
          // If not, initialize it as an empty array
          prevState = [];
        }
        const updatedState = [...prevState];
        const currentStep = updatedState[currentStepIndex];

        // Automatically play when navigating to a step
        if (inputData && currentStep && !currentStep.isPlaying) {
          updatedState[currentStepIndex] = {
            ...currentStep,
            isPlaying: true,
            pausedTime: Date.now(),
          };
        }
        if (
          currentStep &&
          currentStep.isPlaying &&
          currentStep.remainingTime > 0
        ) {
          updatedState[currentStepIndex] = {
            ...currentStep,
            remainingTime: currentStep.remainingTime,
          };
        }
        return updatedState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStepIndex]);

  const [delay, setDelay] = useState("");

  useEffect(() => {
    if (currentDateTime.isSame(inputDateTime, "day")) {
      const startTime = moment(inputData.start_time, "HH:mm");
      const timeDifferenceInMillis = Math.abs(currentDateTime - startTime);
      const duration = moment.duration(timeDifferenceInMillis);

      if (currentDateTime.isSame(startTime)) {
        setDelay("");
      } else {
        const formattedTime = `Le rendez-vous\na démarré avec\n${duration.minutes()} minutes ${
          currentDateTime.isAfter(startTime) ? "de retard" : "en avance"
        }.`;

        if (duration.asMinutes() < 1) {
          setDelay("");
        } else {
          setDelay(formattedTime);
        }
      }
    }
  }, [inputData.start_time]);

  useEffect(() => {
    if (inputData && inputData.steps && inputData.steps.length > 0) {
      if (
        inputData.steps[currentStepIndex] &&
        inputData.steps[currentStepIndex].time
      ) {
        const formattedStartTime = new Date(
          inputData.steps[currentStepIndex].time
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setStartTime(formattedStartTime);
        setSlideTime(inputData.steps[currentStepIndex].time);

        setNextSlideTime(
          currentStepIndex < inputData.steps.length - 1
            ? inputData.steps[currentStepIndex + 1]?.time || ""
            : ""
        );
      }
      setStepTitle(
        currentStepIndex < inputData.steps.length - 1
          ? inputData.steps[currentStepIndex + 1]?.title || ""
          : ""
      );
      setStepTitle1(
        currentStepIndex < inputData.steps.length
          ? inputData.steps[currentStepIndex].title || ""
          : ""
      );
    }
  }, [inputData, currentStepIndex]);

  const [playMeetingTime, setPlayMeetingTime] = useState("");
  const [endMeetingTime, setEndMeetingTime] = useState("");

  useEffect(() => {
    setPlayMeetingTime(moment().format("HH:mm"));
    return () => {
      setEndMeetingTime(moment().format("HH:mm"));
    };
  }, []);

  const handlePlayPause = (index) => {
    const updatedStepsState = [...stepsState];
    const currentStep = updatedStepsState[index];

    if (currentStep.isPlaying) {
      // Pausing the timer
      const pausedTime = new Date().getTime();
      const pausedDurationInSeconds = Math.floor(
        (pausedTime - currentStep.pausedTime) / 1000
      );

      updatedStepsState[index] = {
        ...currentStep,
        isPlaying: false,
        remainingTime: Math.max(
          currentStep.remainingTime - pausedDurationInSeconds,
          0
        ),
        pausedTime,
      };
    } else {
      // Resuming the timer
      updatedStepsState[index] = {
        ...currentStep,
        isPlaying: true,
        pausedTime: new Date().getTime(),
      };
    }
    setStepsState(updatedStepsState);
  };

  // ------------------------------------------------API FOR UPDATE STEP CONTENT------------------------------------------------
  // stepNotes
  // const summarize = async () => {
  //   const options = {
  //     method: "POST",
  //     url: "https://tldrthis.p.rapidapi.com/v1/model/abstractive/summarize-text/",
  //     headers: {
  //       "content-type": "application/json",
  //       "X-RapidAPI-Key": "2b94d4c013msh52afac151b02ff0p1b0477jsn6c7b10332daf",
  //       "X-RapidAPI-Host": "tldrthis.p.rapidapi.com",
  //     },
  //     data: {
  //       text: "Six years after Yahoo purchased Tumblr for north of $1 billion, its parent corporation is selling the once-dominant blogging platform. WordPress owner Automattic Inc. has agreed to take the service off of Verizon’s hands. Terms of the deal are undisclosed, but the number is “nominal,” compared to its original asking price, per an article in The Wall Street Journal.\n\nAxios is reporting that the asking price for the platform is “well below $20 million,” a fraction of a fraction of its 2013 price tag.\n\nOnce the hottest game in town, the intervening half-decade has been tough on Tumblr, as sites like Facebook, Instagram, Reddit and the like have since left the platform in the dust. More recently, a decision to ban porn from the platform has had a marked negative impact on the service’s traffic. According to Sensor Tower, first-time users for Tumblr’s mobile app declined 33% year-over-year last quarter.\n\n“Tumblr is one of the Web’s most iconic brands,” Automattic CEO Matt Mullenweg said of the news. “It is an essential venue to share new ideas, cultures and experiences, helping millions create and build communities around their shared interests. We are excited to add it to our lineup, which already includes WordPress.com, WooCommerce, Jetpack, Simplenote, Longreads, and more.”\n\nThe news certainly isn’t surprising. In May, it was reported that Verizon was looking for a new owner for the site it inherited through its acquisition of Yahoo. Tumblr was Yahoo’s largest acquisition at the time, as then-CEO Marissa Mayer “promise[d] not to screw it up” in a statement made at the time.\n\nTumblr proved not to be a great fit for Yahoo — and even less so Verizon, which rolled the platform into its short-lived Oath business and later the Verizon Media Group (also TechCrunch’s umbrella company). On the face of it, at least, Automattic seems a much better match. The company runs WordPress.com, one of the internet’s most popular publishing tools, along with Jetpack and Simplenote. As part of the deal, the company will take on 200 Tumblr staffers.\n\n“We couldn’t be more excited to be joining a team that has a similar mission. Many of you know WordPress.com, Automattic’s flagship product. WordPress.com and Tumblr were both early pioneers among blogging platforms,” Tumblr fittingly wrote in a blog post. “Automattic shares our vision to build passionate communities around shared interests and to democratize publishing so that anyone with a story can tell it, especially when they come from under-heard voices and marginalized communities.”\n\n“Today’s announcement is the culmination of a thoughtful, thorough and strategic process,” Verizon Media CEO Guru Gowrappan said in a statement. “Tumblr is a marquee brand that has started movements, allowed for true identities to blossom and become home to many creative communities and fandoms. We are proud of what the team has accomplished and are happy to have found the perfect partner in Automattic, whose expertise and track record will unlock new and exciting possibilities for Tumblr and its users.",
  //       min_length: 100,
  //       max_length: 300,
  //     },
  //   };

  //   try {
  //     const response = await axios.request(options);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handlenextPage = async (val) => {
    // summarize()
    if (currentStepIndex < inputData.steps.length - 1) {
      handlePlayPause(currentStepIndex, false);
      setButtonDisabled(true);
      setShowNextCounter(false);
      const currentStep = inputData.steps[currentStepIndex];
      const stepId = currentStep.id;
      const optimizedEditorContent = await optimizeEditorContent(
        currentStep?.editor_content
      );
      const postData = {
        editor_content: optimizedEditorContent ? optimizedEditorContent : null,
        savedTime: savedTime == 0 ? 0 : savedTime,
        negative_time:
          negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0,
        totalstepnotes:
          textInputValue === "" ? stepNotes.join(" ") : textInputValue,
        totalstepnotes:
          textInputValue === "" ? stepNotes.join(" ") : textInputValue,
        totaldecision: decision.join(" "),
        note:
          textInputValue === "" ? stepNotes[currentStepIndex] : textInputValue,
        voice_notes: textInputValue,
        decision: decision[currentStepIndex],
        actions: tableData ? tableData : [],
      };

      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.post(
          `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action`,
          postData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: ` Bearer ${token}`,
            },
          }
        );
        if (response.status) {
          // toast.success(response.data?.message);
          const createdActions = response.data.data?.planDActions; // Assuming the response contains the new actions
          setTableData(createdActions); // Set the new actions for the current step
          setMyAllStepNote((prevNotes) => [...prevNotes, postData.note]);
        }
      } catch (error) {
        toast.error(error.response?.data?.message);
      }
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
      setButtonDisabled(false);
      setNextActiveStep();
    }
    return;
  };

  const previousPage = async () => {
    if (currentStepIndex > 0) {
      handlePlayPause(currentStepIndex, false);
      setCurrentStepIndex((prevIndex) => prevIndex - 1);
      const currentStep = inputData.steps[currentStepIndex];
      const optimizedEditorContent = await optimizeEditorContent(
        currentStep?.editor_content
      );
      const stepId = currentStep.id;

      const postData = {
        // totalstepnotes: stepNotes.join(" "),
        editor_content: optimizedEditorContent,
        totalstepnotes:
          textInputValue === "" ? stepNotes.join(" ") : textInputValue,

        totaldecision: decision.join(" "),
        savedTime: savedTime == 0 ? 0 : savedTime,
        negative_time:
          negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0,
        // note: stepNotes[currentStepIndex],
        note:
          textInputValue === "" ? stepNotes[currentStepIndex] : textInputValue,
        decision: decision[currentStepIndex],
        actions: tableData ? tableData : [],
      };
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.post(
          `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action`,
          postData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: ` Bearer ${token}`,
            },
          }
        );
        if (response.status) {
          // toast.success(response.data?.message);
          const createdActions = response.data.data.planDActions; // Assuming the response contains the new actions
          setTableData(createdActions); // Set the new actions for the current step
          setMyAllStepNote((prevNotes) => [...prevNotes, postData.note]);
          console.log("CREATED ACTIONS ON PREV PAGE", createdActions);
        }
        // setTableData([]);
        setPreviousActiveStep();
      } catch (error) {
        console.log("error", error);
        toast.error(error.response.data.message);
      }
    }
  };

  // FUNCTION TO SAVE THE EDITOR CONTENT of the current step.
  const saveEditorContent = async (editorContent) => {
    const _OPTIMIZED_EDITOR_CONTENT = await optimizeEditorContent(
      editorContent
    );
    const stepId = inputData.steps[currentStepIndex].id;
    const URL = `${API_BASE_URL}/play-meetings/steps/${stepId}`;
    const postData = {
      ...inputData.steps[currentStepIndex],
      editor_content: _OPTIMIZED_EDITOR_CONTENT,
    };
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(URL, postData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: ` Bearer ${token}`,
        },
      });
      if (response.status) {
        // toast.success(response.data?.message);
        toast.success("Content saved successfully");
      }
    } catch (error) {
      console.log("error", error);
    }
  }; //<=========<END OF FUNCTION>==================
  const saveDataonEnd = async (val) => {
    handlePlayPause(currentStepIndex, false);
    setButtonDisabled(true);
    setShowNextCounter(false);
    const currentStep = inputData.steps[currentStepIndex];
    const stepId = currentStep.id;
    const postData = {
      savedTime: savedTime == 0 ? 0 : savedTime,
      negative_time:
        negativeTimes[activeStepIndex] !== 0
          ? negativeTimes[activeStepIndex]
          : 0,
      // totalstepnotes: stepNotes.join(" "),
      totalstepnotes:
        textInputValue === "" ? stepNotes.join(" ") : textInputValue,
      totaldecision: decision.join(" "),
      // note: stepNotes[currentStepIndex],
      note:
        textInputValue === "" ? stepNotes[currentStepIndex] : textInputValue,
      voice_notes: textInputValue,
      decision: decision[currentStepIndex],
      actions: tableData ? tableData : [],
    };

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: ` Bearer ${token}`,
          },
        }
      );
      if (response.status) {
        // toast.success(response.data?.message);
        setMyAllStepNote((prevNotes) => [...prevNotes, postData.note]);
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error.response.data.message);
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const closeMeeting = async () => {
    // ------------------------------------------------- Update Closing Time of Meeting -----------------------------------------------
    // alert("close meeting");
    // return;
    // setButtonText(t("Close") + "...");
    setIsLoading(true);

    setButtonDisabled(true);
    localStorage.setItem("lastURL", "/play");
    const updatedDatWithClosingTime = {
      ...meetingData,
      real_end_time: moment().format("HH:mm:ss"),
      real_start_time: real_start_time,
      _method: "put",
      plan_d_actions: tableData ? tableData : [],
      step_notes:
        textInputValue === ""
          ? stepNotes.filter((note) => note !== "")
          : [textInputValue],
      step_decisions: decision.filter((decision) => decision !== ""),
    };
    try {
      const closingResponse = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        updatedDatWithClosingTime,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      // console.log("error", error);
    }
    // -------------------------------------------------- NOW UPDATE STATUS OF MEETING ----------------------------------------------
    const realEndTime = moment().format("HH:mm:ss");
    try {
      await saveDataonEnd();

      const postData = {
        real_end_time: realEndTime,
        status: "closed",
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      console.log("meeting status api", response);
      if (response.status) {
        console.log("meeting status changed successfully", response.data);
        setButtonDisabled(false);
        setIsLoading(false);
        navigate("/meeting");
      }
    } catch (error) {
      console.log("error ", error);
      setIsLoading(false);
    }
  };

  const updateMeetingStatus = async () => {
    const realEndTime = moment().format("HH:mm:ss");
    try {
      const postData = {
        real_end_time: realEndTime,
        status: "abort",
        _method: "put",
        plan_d_actions: tableData,
        step_notes: stepNotes,
        step_decisions: decision,
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        console.log("meeting status changed successfully", response.data);
        // toast.success(response.data?.message);
        navigate("/meeting");
        //
      }
    } catch (error) {
      // console.log("error ", error);
    }
  };

  const GradientSvg = (
    <svg>
      <defs>
        <linearGradient id="your-unique-id" x1="1" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#F2E358" />
          <stop offset="90%" stopColor="#CB690F" />
        </linearGradient>
      </defs>
    </svg>
  );

  const GradientSvg2 = (
    <svg>
      <defs>
        <linearGradient id="your-unique-id2" x1="1" y1="0" x2="1" y2="1">
          <stop offset="20%" stopColor="#F25861" />
          <stop offset="90%" stopColor="#CB0F1A" />
        </linearGradient>
      </defs>
    </svg>
  );
  const GradientSvg3 = (
    <svg>
      <defs>
        <linearGradient id="your-unique-id1" x1="1" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#CB0C17" />
          <stop offset="90%" stopColor="#5AAFD6" />
        </linearGradient>
      </defs>
    </svg>
  );

  const handleNotesChange = (event, index) => {
    const newNotes = [...stepNotes];
    newNotes[index] = event.target.value; // Update notes for the specified step index
    setStepNotes(newNotes);
  };
  const handleDecisionChange = (event, index) => {
    const newDecision = [...decision];
    newDecision[index] = event.target.value; // Update notes for the specified step index
    setDecision(newDecision);
  };
  console.log("tableData", tableData);

  const handleTableDataChange = (e, index) => {
    const { name, value } = e.target;
    // const selectedParticipantId = e.target.value;
    // let newArray = [];
    // if (selectedParticipantId === "all") {
    //   newArray = inputData?.participants?.map((participant) => participant.id);
    // } else {
    //   newArray = [selectedParticipantId];
    // }
    // console.log("newArray", newArray);
    setTableData((prevTableData) =>
      prevTableData?.map((rowData, i) =>
        i === index
          ? {
              ...rowData,
              [name]: value,
              // participant_id: newArray,
              step_id: inputData.steps[currentStepIndex].id,
              status: "Todo",
            }
          : rowData
      )
    );
  };

  const handleButtonClick = () => {
    if (Array.isArray(tableData) && tableData.length > 0) {
      setTableData([
        ...tableData,
        {
          order: 0,
          action: "",
          action_days: 0,
          participant_id: "",
          step_id: inputData.steps[currentStepIndex].id,
          status: "Todo",
        },
      ]);
    } else {
      setTableData([
        {
          order: 0,
          action: "",
          action_days: 0,
          participant_id: "",
          step_id: inputData.steps[currentStepIndex].id,
          status: "Todo",
        },
      ]);
    }
  };

  const handleButtonDelete = async (index) => {
    const actionToBeDeleted = tableData[index];
    const id = actionToBeDeleted.id;
    //Send API Call only if the action is already saved in the database.
    const foundInDatabase = actionToBeDeleted.id; // If the action is already saved in the database, it will have an id.
    //----API CALL TO DELETE ACTION
    if (foundInDatabase) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/planDactions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        console.clear();
        console.log("response", response);
      } catch (error) {
        console.log("error", error);
        return;
      }
    }

    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

  function addIframesToLinks(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const links = Array.from(doc.querySelectorAll("a"));

    links.forEach((linkElement) => {
      const linkURL = linkElement.getAttribute("href");
      const iframe = createIframeForLink(linkURL);
      // Replace the link element with the iframe
      linkElement.parentNode.replaceChild(iframe, linkElement);
    });

    return doc.documentElement.outerHTML;
  }
  function createIframeForLink(linkURL) {
    const iframe = document.createElement("iframe");
    iframe.src = linkURL;
    iframe.width = "100%";
    // iframe.height = "500px";
    iframe.title = "Embedded Content";
    iframe.style.scrollSnapType = "none";
    iframe.style.border = "none";
    return iframe;
  }
  // Show preview of Links in Iframe:
  useEffect(() => {
    if (inputData && inputData.steps && inputData.steps.length > 0) {
      // const originialHtml = inputData.steps[currentStepIndex].editor_content;
      const originialHtml =
        inputData.steps[currentStepIndex]?.editor_content === null
          ? ""
          : inputData.steps[currentStepIndex].editor_content;
      const modifiedHtml = addIframesToLinks(originialHtml);
      setInputData((prevData) => ({
        ...prevData,
        steps: prevData.steps.map((step, index) => {
          if (index === currentStepIndex) {
            return {
              ...step,
              editor_content: modifiedHtml,
            };
          }
          return step;
        }),
      }));
    }
  }, [currentStepIndex]);

  const handleIncrementCount = (index) => {
    setTableData((prevTableData) =>
      prevTableData.map((rowData, i) =>
        i === index
          ? {
              ...rowData,
              // action_days: Math.min(parseFloat(rowData.action_days) + 1, 5),
              action_days: Math.min(parseFloat(rowData.action_days) + 1, 100),
            }
          : rowData
      )
    );
  };

  const handleDecrementCount = (index) => {
    setTableData((prevTableData) =>
      prevTableData.map((rowData, i) =>
        i === index
          ? {
              ...rowData,
              action_days: Math.max(parseFloat(rowData.action_days) - 1, 0),
            }
          : rowData
      )
    );
  };

  // ================>RICH TEXT EDITORS TOGGLE FUNCTIONS: <====================
  const handleDecisionEditorToggle = () => {
    setNotesEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
    setShowStepContentEditor(false);
  };

  const handleNotesEditorToggle = () => {
    setDecisionEditor((prev) => ({ ...prev, showEditor: false })); // Close the decision editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setNotesEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
    setShowStepContentEditor(false);
  };

  // Function to handle eye button click
  const handlePlanDActionEditor = () => {
    setDecisionEditor((prev) => ({ ...prev, showEditor: false }));
    setNotesEditor((prev) => ({ ...prev, showEditor: false }));
    setPlanDActionEditor((prev) => ({
      ...prev,
      showEditor: !prev.showEditor,
    }));

    // If closing the editor, update entered data
    if (planDActionEditor.showEditor) {
      const enteredDataString = tableData?.map((rowData) => ({
        action: rowData.action,
        action_days: rowData.action_days,
      }));
      setEnteredData(enteredDataString);
    }
    setShowStepContentEditor(false);
  };

  const handleStepContentEditor = async () => {
    if (showStepContentEditor === true) {
      const optimizedEditorContent = optimizeEditorContent(
        inputData.steps[currentStepIndex]?.editor_content
      );
      await saveEditorContent(optimizedEditorContent);
    }
    setDecisionEditor((prev) => ({ ...prev, showEditor: false }));
    setNotesEditor((prev) => ({ ...prev, showEditor: false }));
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false }));
    setShowStepContentEditor((prev) => !prev);
  };

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const paragraphs = doc.body.querySelectorAll("p");
    // let strippedText = "";

    paragraphs.forEach((paragraph) => {
      paragraph.childNodes.forEach((node) => {
        if (node.nodeName === "STRONG") {
          strippedText += `<strong>${node.textContent}</strong>`;
        } else if (node.nodeName === "EM") {
          strippedText += `<em>${node.textContent}</em>`;
        } else {
          strippedText += node.textContent;
        }
      });
      strippedText += "\n\n";
    });

    return strippedText;
  };

  const strippedText = stripHtmlTags(notesEditor.value);
  return (
    <>
      <div className="tektime">
        {loading ? (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        ) : (
          <div className="container-fluid mx-auto card py-5">
            <div className="text-center mb-4">
              <h4>
                {inputData.objective}&nbsp; {">"} &nbsp; {inputData.title}&nbsp;
                {" >"} &nbsp; {stepTitle1} &nbsp;{" "}
              </h4>
            </div>
            <div className="text-start mb-4">
              {inputData?.steps[currentStepIndex]?.assigned_to_name === null ? (
                <div>
                  {inputData?.user?.image ? (
                    <img
                      // className="logo"
                      className="user-img"
                      width={50}
                      height={50}
                      src={`${Assets_URL}/${inputData?.user?.image}`}
                      alt="logo"
                    />
                  ) : (
                    <FaUserCircle size={30} />
                  )}
                  <span className="mx-2">{inputData?.user?.name}</span>
                  <span className="mx-2">{inputData?.user?.last_name}</span>
                </div>
              ) : (
                <div>
                  {inputData?.steps[currentStepIndex]?.assigned_to_name ? (
                    <img
                      // className="logo"
                      className="user-img"
                      width={50}
                      height={50}
                      src={`${inputData?.steps[currentStepIndex]?.assigned_to_image}`}
                      alt="logo"
                    />
                  ) : (
                    <FaUserCircle size={30} />
                  )}
                  <span className="mx-2">
                    {inputData.steps[currentStepIndex]?.assigned_to_name}
                  </span>
                </div>
              )}
            </div>
            <div className="row justify-content-center">
              <div className="col-md-8">
                <IoMdEye
                  size={30}
                  className="eye-icon"
                  onClick={handleStepContentEditor}
                />
                <div
                  className={`${
                    !planDActionEditor.showEditor && "card"
                  } mt-4 mb-4`}
                >
                  <div className="card-body displaycard">
                    {decisionEditor.showEditor === false &&
                      showStepContentEditor === false &&
                      notesEditor.showEditor === false &&
                      planDActionEditor.showEditor === false &&
                      (inputData.steps[currentStepIndex].editor_type ===
                      "File" ? (
                        <div>
                          <iframe
                            src={
                              Assets_URL +
                              inputData.steps[currentStepIndex].file
                            }
                            width="100%"
                            height="500px"
                          />
                        </div>
                      ) : (
                        // <div
                        //   className="rendered-content"
                        //   dangerouslySetInnerHTML={{
                        //     __html:
                        //       inputData &&
                        //       inputData.steps &&
                        //       inputData.steps[currentStepIndex] &&
                        //       inputData.steps[currentStepIndex].editor_content
                        //         ? inputData.steps[currentStepIndex]
                        //             .editor_content
                        //         : // : "",
                        //         inputData.steps[currentStepIndex]
                        //             .editor_content === null
                        //         ? ""
                        //         : inputData.steps[currentStepIndex]
                        //             .editor_content,
                        //   }}
                        // />
                        <div
                          className="rendered-content"
                          dangerouslySetInnerHTML={{
                            __html:
                              (inputData &&
                                inputData.steps &&
                                inputData.steps[currentStepIndex] &&
                                inputData.steps[currentStepIndex]
                                  .editor_content !== null) ||
                              inputData.steps[currentStepIndex]
                                .editor_content !== ""
                                ? inputData.steps[currentStepIndex]
                                    .editor_content
                                : " ",
                          }}
                        />
                      ))}

                    {/* NOTES EDITOR */}
                    {notesEditor.showEditor && (
                      <>
                        <h6>NOTES EDITOR</h6>
                        <ReactQuill
                          key={currentStepIndex}
                          className="h-75"
                          value={stepNotes[activeStepIndex]}
                          theme="snow"
                          onChange={(value) => {
                            setStepNotes((prev) => {
                              let newStepNotes = [...prev];
                              newStepNotes[activeStepIndex] = value;
                              return newStepNotes;
                            });
                          }}
                        />
                      </>
                    )}

                    {/* DECISION EDITOR */}
                    {decisionEditor.showEditor && (
                      <>
                        <h6>DECISION EDITOR</h6>
                        <ReactQuill
                          key={activeStepIndex}
                          className="h-75"
                          value={decision[activeStepIndex]}
                          theme="snow"
                          onChange={(value) => {
                            setDecision((prev) => {
                              let newDecision = [...prev];
                              newDecision[activeStepIndex] = value;
                              return newDecision;
                            });
                          }}
                        />
                      </>
                    )}
                    {!notesEditor.showEditor &&
                      !decisionEditor.showEditor &&
                      !showStepContentEditor &&
                      planDActionEditor.showEditor && (
                        <section className="row py-1">
                          <div className="col-md-12 mb-2">
                            {/* Plan of Action */}
                            <div className="card card2 p-3 table-container ">
                              {/* <h5 className="card-title">
                              {t("presentation.planDActions")}
                            </h5> */}
                              <div
                                className="cardbody resume"
                                style={{ overflowX: "hidden", height: "auto" }}
                              >
                                <div className=" row subtitle  text-body-secondary">
                                  <div className="col-md-2">
                                    <span>{t("presentation.order")}</span>
                                  </div>
                                  <div className=" col-md-3 ">
                                    <span>{t("presentation.action")}</span>
                                  </div>
                                  <div className="col-md-3">
                                    <span>{t("presentation.carrier")}</span>
                                  </div>
                                  <div className="col-md-3">
                                    <span>{t("presentation.dueDate")}</span>
                                  </div>
                                  <div className="col-md-1">
                                    <span></span>
                                  </div>
                                </div>

                                {tableData?.map((rowData, index) => {
                                  if (
                                    rowData.step_id !==
                                    inputData.steps[currentStepIndex].id
                                  ) {
                                    return null;
                                  }
                                  return (
                                    <div
                                      className="row p-2 text-body-dark mt-3 "
                                      style={{ borderBottom: "1px solid #ccc" }}
                                      key={index}
                                    >
                                      <div className="col-md-2">
                                        <select
                                          className="form-select form-select-sm"
                                          value={rowData.order}
                                          onChange={(e) => {
                                            handleTableDataChange(e, index);
                                          }}
                                          name="order"
                                        >
                                          {Array.from({ length: 11 }).map(
                                            (_, i) => (
                                              <option key={i} value={i}>
                                                {i}
                                              </option>
                                            )
                                          )}
                                        </select>
                                      </div>

                                      <div className="col-md-3">
                                        <textarea
                                          name="action"
                                          value={rowData.action}
                                          onChange={(e) => {
                                            handleTableDataChange(e, index);
                                          }}
                                          placeholder="Action"
                                          rows={3}
                                          // maxLength={100}
                                          className="wrapped-textarea txt"
                                        />
                                      </div>

                                      <div className="col-md-3">
                                        <select
                                          className="form-select form-select-sm"
                                          // value={rowData.participant_id || ""}
                                          value={rowData.participant_id}
                                          name="participant_id"
                                          onChange={(e) =>
                                            handleTableDataChange(e, index)
                                          }
                                        >
                                          <option value="" disabled>
                                            {t("Select Participant")}
                                          </option>
                                          {/* {inputData.participants &&
                                            inputData?.participants?.length >
                                              0 && (
                                              <option value="all">
                                                All Participants
                                              </option>
                                            )} */}
                                          {inputData.participants &&
                                            inputData.participants?.length <
                                              1 && (
                                              <option value="">
                                                No Participants Added{" "}
                                              </option>
                                            )}
                                          {inputData.participants &&
                                            inputData.participants?.map(
                                              (item) => {
                                                return (
                                                  <option
                                                    key={item.id}
                                                    value={item.id}
                                                  >
                                                    {item.first_name}{" "}
                                                    {item.last_name}
                                                  </option>
                                                );
                                              }
                                            )}
                                        </select>
                                      </div>

                                      <div className="col-md-3">
                                        <div>
                                          <img
                                            src="/Assets/minus1.svg"
                                            alt="minus"
                                            className="img-fluid "
                                            width={"15px"}
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                              handleDecrementCount(index)
                                            }
                                          />{" "}
                                          &nbsp; &nbsp;
                                          <span>
                                            {parseInt(rowData.action_days)}{" "}
                                            {t("Day")}
                                          </span>
                                          &nbsp;&nbsp;
                                          <img
                                            src="/Assets/plus1.svg"
                                            alt="plus"
                                            className="img-fluid"
                                            width={"15px"}
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                              handleIncrementCount(index)
                                            }
                                          />
                                        </div>
                                      </div>

                                      <div className="col-md-1">
                                        <button
                                          className="btndel"
                                          onClick={() =>
                                            handleButtonDelete(index)
                                          }
                                        >
                                          <AiFillDelete
                                            size={"25px"}
                                            color="red"
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}

                                <div className="d-flex justify-content-center mt-3 gap-2">
                                  <div>
                                    <GoPlusCircle
                                      size="30px"
                                      onClick={handleButtonClick}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      )}
                    {
                      // STEP EDITORRRR
                      !notesEditor.showEditor &&
                      !decisionEditor.showEditor &&
                      !planDActionEditor.showEditor &&
                      showStepContentEditor ? (
                        <div>
                          <h6>STEP CONTENT EDITOR</h6>
                          {/* FILE UPLOADDD */}
                          <section>
                            <ShowIF
                              condition={
                                inputData.steps[currentStepIndex]
                                  .editor_type === "File"
                              }
                            >
                              <label>
                                {inputData.steps[currentStepIndex].file}
                              </label>
                              <input
                                type="file"
                                multiple="false"
                                // value={inputData.steps[currentStepIndex].file}
                                onChange={async (e) => {
                                  console.log("file", e.target.files[0]);
                                  const file = e.target.files[0];
                                  const allowedFileTypes = [
                                    "application/pdf",
                                    "application/vnd.ms-excel",
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                    "application/vnd.ms-powerpoint",
                                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                    "application/msword",
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                  ];
                                  if (
                                    !file ||
                                    !allowedFileTypes.includes(file.type)
                                  ) {
                                    alert("Please select a valid file type");
                                  }
                                  // PREPARE THE PAYLOAD
                                  const updatedSteps = [
                                    ...(inputData?.steps || []),
                                  ];
                                  const selectedStep =
                                    updatedSteps[currentStepIndex];
                                  const filePayload = {
                                    title: selectedStep.title,
                                    count1: selectedStep.count1,
                                    count2: selectedStep.count2,
                                    time: selectedStep.count2,
                                    editor_type: selectedStep.editor_type,
                                    file: file,
                                    editor_content: null,
                                    _method: "put",
                                  };
                                  // SEND THE FILE TO THE SERVER
                                  try {
                                    const response = await axios.post(
                                      `${API_BASE_URL}/steps/${selectedStep?.id}`,
                                      filePayload,
                                      {
                                        headers: {
                                          "Content-Type": "multipart/form-data",
                                          Authorization: `Bearer ${sessionStorage.getItem(
                                            "token"
                                          )}`,
                                        },
                                      }
                                    );
                                    // console.log(
                                    //   "response--> file uploaded",
                                    //   response
                                    // );
                                    if (response.status === 200) {
                                      // Update the file in the state
                                      const updatedSteps = [
                                        ...(inputData?.steps || []),
                                      ];
                                      const selectedStep =
                                        updatedSteps[currentStepIndex];
                                      selectedStep.file =
                                        response.data.data.file;
                                      setInputData({
                                        ...inputData,
                                        steps: updatedSteps,
                                      });
                                    }
                                  } catch (error) {
                                    console.log(
                                      "error while uploading file",
                                      error
                                    );
                                  }
                                }}
                              />
                            </ShowIF>
                          </section>
                          <ShowIF
                            condition={
                              inputData.steps[currentStepIndex].editor_type !==
                              "File"
                            }
                          >
                            <Editor
                              onBlur={(value) => {
                                console.log("value", value);
                              }}
                              key={activeStepIndex}
                              apiKey="igbodkmd5ctops1j5kyglicj63lj9ce0owhl897jaecicb7c"
                              value={
                                inputData?.steps[activeStepIndex]
                                  ?.editor_content
                              }
                              init={{
                                branding: false,
                                height: 400,
                                menubar: true,
                                language: "fr_FR",
                                // language: "en_EN",
                                plugins:
                                  "print preview paste searchreplace image autolink directionality visualblocks visualchars fullscreen  link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                                toolbar:
                                  "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                                image_advtab: true,
                                file_picker_types: "image",

                                file_picker_callback: function (
                                  callback,
                                  value,
                                  meta
                                ) {
                                  if (meta.filetype === "image") {
                                    const input =
                                      document.createElement("input");
                                    input.setAttribute("type", "file");
                                    input.setAttribute("accept", "image/*");

                                    input.onchange = function () {
                                      const file = input.files[0];
                                      const reader = new FileReader();

                                      reader.onload = function (e) {
                                        const img = new Image();
                                        img.src = e.target.result;

                                        img.onload = function () {
                                          const canvas =
                                            document.createElement("canvas");
                                          const ctx = canvas.getContext("2d");
                                          const maxWidth = 700;
                                          const maxHeight = 394;

                                          let newWidth = img.width;
                                          let newHeight = img.height;

                                          if (img.width > maxWidth) {
                                            newWidth = maxWidth;
                                            newHeight =
                                              (img.height * maxWidth) /
                                              img.width;
                                          }

                                          if (newHeight > maxHeight) {
                                            newHeight = maxHeight;
                                            newWidth =
                                              (img.width * maxHeight) /
                                              img.height;
                                          }

                                          canvas.width = newWidth;
                                          canvas.height = newHeight;

                                          ctx.drawImage(
                                            img,
                                            0,
                                            0,
                                            newWidth,
                                            newHeight
                                          );

                                          const resizedImageData =
                                            canvas.toDataURL(file.type);

                                          // Pass the resized image data to the callback function
                                          callback(resizedImageData, {
                                            alt: file.name,
                                          });
                                        };

                                        img.src = e.target.result;
                                      };

                                      reader.readAsDataURL(file);
                                    };

                                    input.click();
                                  }
                                },
                              }}
                              onEditorChange={(content) => {
                                setInputData((prevData) => ({
                                  ...prevData,
                                  steps: prevData.steps.map((step, index) => {
                                    if (index === activeStepIndex) {
                                      return {
                                        ...step,
                                        editor_content: content,
                                      };
                                    }
                                    return step;
                                  }),
                                }));
                              }}
                            />
                          </ShowIF>
                        </div>
                      ) : null
                    }
                  </div>
                </div>

                <div className="d-flex justify-content-center text-center mt-2 gap-2">
                  <button
                    className="btn btn-danger"
                    onClick={updateMeetingStatus}
                  >
                    {t("Abort Moment")}
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <div className="">
                  <CounterContainer alarm={meetingData?.alarm || "0"} />
                </div>

                {currentStepIndex !== inputData?.steps?.length - 1 ? (
                  <>
                    <div className="d-flex justify-content-center pt-3 mb-3">
                      <br />
                      <div className="d-flex gap-3 prev-btn">
                        {currentStepIndex > 0 && (
                          <button
                            className="btn btn-primary"
                            onClick={previousPage}
                          >
                            Précédent
                          </button>
                        )}
                        {currentStepIndex < inputData?.steps?.length - 1 && (
                          <>
                            <button
                              className={`btn ${
                                currentStepIndex ===
                                inputData?.steps?.length - 1
                                  ? "btn-success"
                                  : "btn-primary"
                              }`}
                              onClick={() =>
                                currentStepIndex === inputData.steps.length - 1
                                  ? closeMeeting
                                  : handlenextPage(inputData)
                              }
                              // disabled={isButtonDisabled}
                            >
                              {currentStepIndex === inputData.steps.length - 1
                                ? t("Close")
                                : t("Next")}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="d-flex justify-content-center pt-3 mb-3">
                    <br />
                    <div className="d-flex  gap-3 prev-btn ">
                      <button
                        className="btn btn-primary"
                        onClick={async () => {
                          await previousPage();
                          setPreviousActiveStep();
                        }}
                        // onClick={backPage}
                      >
                        {t("Previous")}
                      </button>{" "}
                      <button
                        className={` btn ${
                          currentStepIndex === inputData?.steps?.length - 1
                            ? "btn-success"
                            : "btn-primary"
                        }`}
                        // onClick={
                        //   () => handlenextPage(inputData)
                        //   // disabled={isButtonDisabled}
                        // }
                        disabled={buttonDisabled}
                        onClick={() =>
                          currentStepIndex === inputData.steps.length - 1
                            ? closeMeeting()
                            : handlenextPage(inputData)
                        }
                      >
                        {currentStepIndex === inputData.steps.length - 1 ? (
                          isLoading ? (
                            <>
                              <Spinner
                                as="span"
                                variant="light"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                animation="border"
                              />
                            </>
                          ) : (
                            buttonText
                          )
                        ) : (
                          "suviant"
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {/* ...................START................ */}
                {isAutomatic ? (
                  <>
                    {/* -------------------WHEN NOTES AUTOMATIC------------- */}
                    {
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <label className="form-label m-0">
                            <img
                              src="/Assets/Ellipse 8.png"
                              className="img-fluid pb-1"
                              alt="circle"
                            />{" "}
                            &nbsp; {t("Take Notes")}
                          </label>
                          <FaMicrophone
                            color={isAutomatic ? "#d62d20" : "#008744"}
                          />
                        </div>
                        <textarea
                          className="form-control txt mt-2"
                          rows="1"
                          value={textInputValue}
                          onChange={() => {}}
                          disabled={isAutomatic}
                        ></textarea>
                      </div>
                    }

                    {/* ---DECISION */}
                    <div className="">
                      <label className="form-label mb-3">
                        <IoMdEye
                          className="eye-icon"
                          color="#20acd4"
                          size={18}
                          style={{
                            margin: "2px",
                          }}
                          onClick={handleDecisionEditorToggle}
                        />
                        &nbsp; {t("Decision")}
                      </label>
                    </div>
                    {!decisionEditor.showEditor && (
                      <div style={{ height: "200px" }}>
                        <ReactQuill
                          key={activeStepIndex}
                          className="h-75"
                          value={decision[activeStepIndex]}
                          theme="snow"
                          onChange={(value) => {
                            setDecision((prev) => {
                              let newDecision = [...prev];
                              newDecision[activeStepIndex] = value;
                              return newDecision;
                            });
                          }}
                        />
                      </div>
                    )}

                    {/* --------PlanDAction */}
                    <div className="card-body p-0 mt-1">
                      <h5 className="card-title ">
                        <div className="mb-3">
                          <label className="form-label mb-3">
                            <IoMdEye
                              className="eye-icon"
                              color="#20acd4"
                              size={18}
                              style={{
                                margin: "2px",
                              }}
                              onClick={handlePlanDActionEditor}
                            />
                            &nbsp; {t("Strategy")}
                          </label>
                        </div>
                      </h5>
                      {!planDActionEditor.showEditor && (
                        <div
                          className="cardbody resume card2"
                          style={{ overflowX: "hidden" }}
                        >
                          {tableData?.map((rowData, index) => {
                            console.log("rowData", rowData);
                            if (
                              rowData.step_id !==
                              inputData.steps[currentStepIndex].id
                            ) {
                              return null;
                            }
                            return (
                              <div
                                className="card3 card5 justify-content-between  p-2 text-body-dark gap-3 "
                                style={{ borderBottom: "1px solid #ccc" }}
                                key={index}
                              >
                                <div className="row">
                                  <div className="col-md-6">
                                    <select
                                      className="form-select form-select-sm"
                                      value={rowData?.order}
                                      onChange={(e) => {
                                        handleTableDataChange(e, index);
                                      }}
                                      name="order"
                                    >
                                      {[...Array(11).keys()].map((i) => (
                                        <option key={i} value={i}>
                                          {i}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-6">
                                    <textarea
                                      name="action"
                                      value={rowData.action}
                                      onChange={(e) =>
                                        handleTableDataChange(e, index)
                                      }
                                      placeholder="Action"
                                      rows={3}
                                      // maxLength={100}
                                      className="wrapped-textarea txt"
                                    />
                                  </div>
                                </div>

                                <br />
                                <div className="row m-0 d-flex align-items-center">
                                  <div className="col-md-4">
                                    <label className="form-label mb-3">
                                      &nbsp; {t("Actiondays")}
                                    </label>
                                    <div>
                                      <img
                                        src="/Assets/minus1.svg"
                                        alt="minus"
                                        className="img-fluid "
                                        width={"15px"}
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          handleDecrementCount(index)
                                        }
                                      />{" "}
                                      &nbsp; &nbsp;
                                      <span>
                                        {parseInt(rowData?.action_days)}{" "}
                                        {t("Day")}
                                      </span>
                                      &nbsp;&nbsp;
                                      <img
                                        src="/Assets/plus1.svg"
                                        alt="plus"
                                        className="img-fluid"
                                        width={"15px"}
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          handleIncrementCount(index)
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-8">
                                    <select
                                      className="select w-100 p-2"
                                      style={{ border: "1px solid #cccccc" }}
                                      value={rowData.participant_id}
                                      name="participant_id"
                                      onChange={(e) =>
                                        handleTableDataChange(e, index)
                                      }
                                    >
                                      <option value="" disabled>
                                        Select Participant
                                      </option>
                                      {inputData.participants &&
                                        inputData.participants?.map((item) => (
                                          <option key={item.id} value={item.id}>
                                            {item.first_name} {item.last_name}
                                          </option>
                                        ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="d-flex justify-content-end mt-3 mb-2">
                                  <div>
                                    <button
                                      className="btndel"
                                      onClick={() => handleButtonDelete(index)}
                                    >
                                      <AiFillDelete size={"25px"} color="red" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* -------------------WHEN NOTES AUTOMATIC------------- */}
                  </>
                ) : (
                  <>
                    {/* -------------------WHEN NOTES MANUAL------------- */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="form-label mb-3">
                          <IoMdEye
                            className="eye-icon"
                            color="#20acd4"
                            size={18}
                            style={{
                              margin: "2px",
                            }}
                            onClick={handleNotesEditorToggle}
                          />
                          &nbsp; {t("Notes")}
                        </label>
                      </div>
                      {
                        <div className="" style={{ height: "200px" }}>
                          <div
                            key={activeStepIndex}
                            className="h-100"
                            style={{
                              overflowY: "auto",
                              borderBottom: "1px solid #ccc",
                              padding: "10px",
                              borderRadius: "5px",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: stepNotes[activeStepIndex],
                            }}
                          />
                        </div>
                      }
                    </div>
                    <div className="">
                      <label className="form-label mb-3">
                        <IoMdEye
                          className="eye-icon"
                          color="#20acd4"
                          size={18}
                          style={{
                            margin: "2px",
                          }}
                          onClick={handleDecisionEditorToggle}
                        />
                        &nbsp; {t("Decision")}
                      </label>
                    </div>
                    {
                      <div style={{ height: "200px" }}>
                        <div
                          key={activeStepIndex}
                          className="h-100"
                          style={{
                            overflowY: "auto",
                            borderBottom: "1px solid #ccc",
                            padding: "10px",
                            borderRadius: "5px",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: decision[activeStepIndex],
                          }}
                        />
                      </div>
                    }
                    <div className="card-body p-0 mt-3">
                      <h5 className="card-title ">
                        <div className="mb-3">
                          <label className="form-label mb-3">
                            <IoMdEye
                              className="eye-icon"
                              color="#20acd4"
                              size={18}
                              style={{
                                margin: "2px",
                              }}
                              onClick={handlePlanDActionEditor}
                            />
                            &nbsp; {t("Strategy")}
                          </label>
                        </div>
                      </h5>
                      {
                        // !planDActionEditor.showEditor && (
                        <div
                          className="cardbody resume card2"
                          style={{ overflowX: "hidden" }}
                        >
                          {tableData?.map((rowData, index) => {
                            if (
                              rowData.step_id !==
                              inputData.steps[currentStepIndex].id
                            ) {
                              return null;
                            }
                            return (
                              <div
                                className="text-body-dark p-2"
                                style={{ borderBottom: "1px solid #ccc" }}
                                key={index}
                              >
                                <div className="row">
                                  <div className="col-md-12">
                                    <textarea
                                      name="action"
                                      value={rowData.action}
                                      onChange={(e) =>
                                        handleTableDataChange(e, index)
                                      }
                                      placeholder="Action"
                                      rows={3}
                                      // maxLength={100}
                                      className="wrapped-textarea txt"
                                      disabled
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {/* <div className="d-flex justify-content-center mt-3 gap-2">
                                <div>
                                  <GoPlusCircle
                                    size="30px"
                                    onClick={handleButtonClick}
                                  />
                                </div>
                              </div> */}
                        </div>
                        // )
                      }
                    </div>
                    {/* -------------------WHEN NOTES MANUAL------------- */}
                  </>
                )}
                {/* ...................END................ */}
              </div>
            </div>
          </div>
        )}

        <div>
          {GradientSvg}
          {GradientSvg2}
          {GradientSvg3}
        </div>
      </div>
    </>
  );
};

export default Play;