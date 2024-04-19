import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import Autosuggest from "react-autosuggest";
import { Button, Modal, Spinner } from "react-bootstrap";
// import { validateParticipants } from "./UpdateMeeting";
import lodash from "lodash"; // Import lodash debounce function
import ShowIF from "../../Utils/ShowIF";
import LoadingButton from "../../Utils/LoadingButton";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaRotate } from "react-icons/fa6";

const NewMeeting = () => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [discription, setDiscription] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [alarm, setAlarm] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [meetingId, setMeetingId] = useState();
  const [buttonText, setButtonText] = useState("Valider");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [stepBtnDisabled, setStepBtnDisabled] = useState(false);
  const [prise_de_notes, setPrise_de_notes] = useState(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [show, setShow] = useState(false);
  const [repitition, setRepitition] = useState("single");
  // console.log("repitition: ", repitition);
  const [participants, setParticipants] = useState([]);

  //Add Steps Functionality
  const [inputGroups, setInputGroups] = useState([
    {
      // order_no: 1,
      id: null,
      step: 1,
      title: "",
      count1: 0,
      count2: 0,
      time: 0,
    },
  ]);
  const [now, setNow] = useState(false);
  function validateParticipants(participants) {
    for (let participant of participants) {
      // Skip validation for participants where isCreator is 1
      if (participant.isCreator === 1) {
        continue;
      }
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email);
      if (!isValidEmail) {
        toast.error(
          t("meeting.chart.error.validEmail")
        );
        return false; // Return false if any of the emails are invalid
      }
      if (
        participant.first_name === null ||
        participant.first_name === "" ||
        participant.last_name === null ||
        participant.last_name === "" ||
        participant.email === null ||
        participant.email === "" ||
        participant.post === null ||
        participant.post === ""
      ) {
        toast.error(t("meeting.newMeeting.participants"));
        return false; // Return false if any of the fields are null or empty
      }
    }
    return true; // Return true if all participants are valid
  }
  // ==============================================> PARTICIPANTS FUNCTIONS START <=====================================
  const handleAddParticipants = lodash.debounce(
    async () => {
      if (!validateParticipants(participants)) {
        return;
      }
      if (meetingData?.id === undefined) {
        toast.error("Veuillez d'abord remplir les champs ci-dessus"); // Please fill the above fields first
        return;
      }
      try {
        setLoadingParticipants(true);
        const response = await axios.post(
          `${API_BASE_URL}/participants`,
          { meeting_id: checkId },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        const newParticipant = response.data.data;
        if (response.status) {
          setParticipants([...participants, newParticipant]);
          setLoadingParticipants(false);
        }
      } catch (error) {
        setLoadingParticipants(false);
        // console.error("Error while adding participant:", error);
      }
      // CALLBACK FUNCTION ENDS.
    },
    300,
    {
      leading: true,
      trailing: false,
    }
  );
  const handleCancelParticipants = async (item, indexToRemove) => {
    if (!item.id) {
      setParticipants((prevParticipants) => {
        const updatedParticipants = prevParticipants.filter(
          (participant, index) => index !== indexToRemove
        );
        return updatedParticipants;
      });
      return;
    }
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/participants/${item?.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setParticipants((prevParticipants) => {
          const updatedParticipants = prevParticipants.filter(
            (participant, index) => index !== indexToRemove
          );
          return updatedParticipants;
        });
      } else {
        // console.error("Failed to delete participant");
      }
    } catch (error) {
      // console.error("Error deleting participant", error);
    }
  };

  const handleParticipantChange = (index, field, value) => {
    const tempParticipants = [...participants];
    tempParticipants[index][field] = value;
    setParticipants(tempParticipants);
  };

  const handleParticipantBlur = async (index, field, value) => {
    let URL = `${API_BASE_URL}/participants`;
    const participant = participants[index];

    if (participant.id) {
      URL = `${API_BASE_URL}/participants/${participant.id}`;
      participant._method = "put";
    }

    try {
      // Update the field value in the participant object
      participant[field] = value;
      const response = await axios.post(URL, participant, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      // console.log("Response:", response);
      if (response.status === 200) {
        const newlySavedParticipant = response.data.data;
        // Update the participant in the participants array
        let participantsCopy = [...participants];
        participantsCopy[index] = newlySavedParticipant;
        setParticipants(participantsCopy);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {}, [participants]);
  // ==============================================> END ADD PARTICIPANTS <=====================================

  // ==============================================> STEPS FUNCTIONS START <=====================================

  const handleAddStep = lodash.debounce(
    async () => {
      // if (!validateParticipants(participants)) {
      //   return;
      // }
      if (meetingData?.id === undefined) {
        toast.error("Veuillez d'abord remplir les champs ci-dessus"); // Please fill the above fields first
        return;
      }
      try {
        setLoadingSteps(true);
        const response = await axios.post(
          `${API_BASE_URL}/steps`,
          { meeting_id: checkId, count2: 0 },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        const newStep = response.data.data;
        if (response.status) {
          setInputGroups([...inputGroups, newStep]);
          setLoadingSteps(false);
        }
      } catch (error) {
        setLoadingSteps(false);
        // console.error("Error while adding step:", error);
      }
      // CALLBACK FUNCTION ENDS.
    },
    300,
    {
      leading: true,
      trailing: false,
    }
  );

  const handleCancelStep = async (item, index) => {
    if (index === 0) {
      return;
    } else {
      try {
        const updatedGroups = [...inputGroups];
        updatedGroups.splice(index, 1);
        // Update the sequence for each group
        updatedGroups.forEach((group, i) => {
          group.step = i + 1;
        });

        setInputGroups(updatedGroups);
        const response = await axios.delete(
          `${API_BASE_URL}/steps/${item?.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        if (response.status) {
          // console.log("Step deleted successfully", response.data.data);
        }
      } catch (error) {
        // console.log("Error deleting step", error);
      }
    }
  };

  const handleInputChangeStep = (item, event) => {
    const temp = JSON.parse(JSON.stringify(inputGroups));
    temp.forEach((step, index) => {
      if (step.id === item.id) {
        step.title = event.target.value;
      }
    });
    setInputGroups(temp);
  };

  const handleCountChange = (item, event) => {
    const temp = JSON.parse(JSON.stringify(inputGroups));
    temp.forEach((step) => {
      if (step.id === item.id) {
        step.count2 = parseInt(event.target.value, 10) || 0;
        step.time = step.count2;
      }
    });
    setInputGroups(temp);
  };

  const handleDecrement = async (index, item) => {
    if (isTitleBlurred) {
      const temp = JSON.parse(JSON.stringify(inputGroups));
      temp.forEach((step) => {
        if (step.id === item.id && step.count2 > 1) {
          step.count2 = Math.max(temp[index].count2 - 1, 1);
          step.time = step.count2;
        }
      });
      setInputGroups(temp);
    }
  };

  const handleIncrement = async (index, item) => {
    if (isTitleBlurred) {
      // Update count2 only if title is blurred
      const temp = JSON.parse(JSON.stringify(inputGroups));
      temp.forEach((step) => {
        if (step.id === item.id) {
          step.count2 += 1;
          step.time = step.count2;
        }
      });
      setInputGroups(temp);
      // setIsTitleBlurred(false); // Reset flag
    }
  };
  const [isTitleBlurred, setIsTitleBlurred] = useState(false);
  const handleStepBlur = async (index, field, value) => {
    setIsTitleBlurred(true); // Set blurred flag
    let URL = `${API_BASE_URL}/steps`;
    const step = inputGroups[index];

    if (step.id) {
      console.log("blur wali");
      URL = `${API_BASE_URL}/steps/${step.id}`;
      step._method = "put";
    }
    try {
      step[field] = value;
      step.time = step.count2 || 0;
      const response = await axios.post(URL, step, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        const updatedStep = response.data.data;
        // Update the count2 value in the inputGroups state
        setInputGroups((prevInputGroups) => {
          const newInputGroups = [...prevInputGroups];
          newInputGroups[index] = updatedStep;
          return newInputGroups;
        });
      } else {
        // console.error("Failed to update step:", response.statusText);
      }
    } catch (error) {
      // console.error("Error updating step:", error);
    }
  };

  let total_time = 0;
  inputGroups.forEach((group) => {
    total_time += parseInt(group.count2) || 0; // Add each count to totalCount
  });

  // ==============================================> STEPS FUNCTIONS END <=====================================

  const [meetingData, setMeetingData] = useState({});

  const nextPage = async () => {
    // if (
    //   // objective.trim() === "" ||
    //   value.trim() === "" ||
    //   title.trim() === "" ||
    //   date.trim() === "" ||
    //   startTime.trim() === ""
    // ) {
    //   toast.error(t("messages.emptyFields"));
    //   return;
    // }
    // Check if any required field is empty
    const requiredFields = [
      { name: "objective", label: t("meeting.newMeeting.labels.Destinations") },
      { name: "type", label: t("meeting.newMeeting.labels.exchangeType") },
      { name: "title", label: t("meeting.newMeeting.labels.objective") },
      { name: "priority", label: t("meeting.newMeeting.labels.priority") },
      { name: "description", label: t("meeting.newMeeting.labels.context") },
      { name: "date", label: t("meeting.newMeeting.labels.date") },
      { name: "start_time", label: t("meeting.newMeeting.labels.startTime") },
    ];

    let hasEmptyField = false;

    requiredFields.forEach((field) => {
      if (!inputGroups[field.name]) {
        toast.error(`${t("messages.field")} "${field.label}"`);
        hasEmptyField = true;
      }
    });

    if (hasEmptyField) {
      // If any required field is empty, return without further processing
      return;
    }
    const steps = inputGroups.map((group, index) => {
      const isFirstStep = index === 0;
      let count1 = isFirstStep ? 0 : inputGroups[index - 1].count2;
      let stepName = group.title;
      return {
        // title: `Step ${group.step}`,
        title: stepName,
        // time: (count1 + group.count) * 60, //convert to seconds
        time: group.count2,
        count1: count1,
        count2: group.count2,
      };
    });
    // Check for duplicate step names
    const stepNames = steps.map((step) => step.title);
    const duplicateStepNames = stepNames.filter(
      (stepName) =>
        stepNames.indexOf(stepName) !== stepNames.lastIndexOf(stepName)
    );
    if (duplicateStepNames.length > 0) {
      toast.error(t("messages.stepNames"));
      setButtonDisabled(false);
      return;
    }
    // Check for count
    const stepCounts = steps.map((step) => step.count2);
    const zeroCounts = stepCounts.filter(
      (stepName) =>
        stepCounts.indexOf(stepName) !== stepCounts.lastIndexOf(stepCounts)
    );
    if (zeroCounts.length > 0) {
      toast.error(t("messages.stepTImeZero"));
      setButtonDisabled(false);
      return;
    }

    const inputData = {
      objective: value,
      title,
      date,
      start_time: `${startTime}:00`,
      type: type,
      description: discription,
      steps: steps,
      alarm: alarm,
      prise_de_notes: prise_de_notes,
      total_time,
      priority: priority,
      participants: participants,
      status: "draft",
      meeting_id: meetingId,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/meetings`, inputData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        setMeetingId(response.data?.data?.id);
        setMeetingData(response.data?.data);
        setButtonDisabled(false);
        navigate(`/validateMeeting/${response.data?.data?.id}`, {
          state: { inputData: inputData },
        });
      }
    } catch (error) {
      toast.error(error?.response.data.message);
      setButtonDisabled(false);
    }
  };

  const validate = async () => {
    if (meetingId === null) {
      nextPage();
    } else {
      updateMeetingPage();
    }
  };

  const [checkId, setCheckId] = useState(null);

  const handleDraft = async () => {
    const slides = [];
    let prevCount = 0;

    for (let i = 0; i < inputGroups.length; i++) {
      const currentStep = inputGroups[i];
      const counts = [prevCount, prevCount + currentStep.count2];

      slides.push({
        value: currentStep.title,
        counts: counts,
      });

      prevCount = counts[1];
    }
    const steps = inputGroups.map((group, index) => {
      const isFirstStep = index === 0;
      let count1 = isFirstStep ? 0 : inputGroups[index - 1].count2;
      let stepName = group.title;
      return {
        order_no: 1,
        // title: `Step ${group.step}`,
        title: stepName,
        time: count1 + group.count2,
        count1: count1,
        count2: group.count2,
      };
    });

    const inputData = {
      objective: value,
      type: type,
      title,
      date,
      start_time: `${startTime}`,
      description: discription,
      steps: steps,
      alarm: alarm === true ? true : alarm === null ? false : false,
      total_time,
      prise_de_notes:
        prise_de_notes === true
          ? "Automatic"
          : prise_de_notes === null
          ? "Manual"
          : "Manual",
      priority: priority,
      // repitition,
      participants: participants,
      meeting_id: meetingId,
      status: "draft",
    };
    try {
      const response = await axios.post(`${API_BASE_URL}/meetings`, inputData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (response.status) {
        setCheckId(response.data?.data?.id);
        setMeetingData(response.data?.data);
        if (response.data.data.steps.length > 0) {
          setInputGroups(response.data.data.steps);
        }
        if (response.data.data.participants.length > 0) {
          setParticipants(response.data?.data?.participants);
        }
        toast.success(t("messages.draftSaved"));
      }
    } catch (error) {
      // console.log("error", error);
    }
  };

  const handleInputBlur = async () => {
    const formFields = [
      value,
      type,
      title,
      discription,
      date,
      startTime,
      alarm,
      // repitition
    ];
    const hasText = formFields.some((field) => {
      if (typeof field === "string") {
        // Check if field is a string
        return field.trim() !== "";
      }
      return false;
    });
    if (hasText) {
      if (checkId === null) {
        handleDraft();
      } else {
        updateDraft();
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const updateMeetingPage = async () => {
    setLoading(true);
    // if (
    //   value.trim() === "" ||
    //   title.trim() === "" ||
    //   date.trim() === "" ||
    //   startTime.trim() === ""
    // ) {
    //   toast.error(t("messages.emptyFields"));
    //   setLoading(false);

    //   return;
    // }
    // Check if any required field is empty
    const requiredFields = [
      { name: "objective", label: t("meeting.newMeeting.labels.Destinations") },
      { name: "type", label: t("meeting.newMeeting.labels.exchangeType") },
      { name: "title", label: t("meeting.newMeeting.labels.objective") },
      { name: "priority", label: t("meeting.newMeeting.labels.priority") },
      { name: "description", label: t("meeting.newMeeting.labels.context") },
      { name: "date", label: t("meeting.newMeeting.labels.date") },
      { name: "start_time", label: t("meeting.newMeeting.labels.startTime") },
    ];

    let hasEmptyField = false;

    requiredFields.forEach((field) => {
      if (!meetingData[field.name]) {
        toast.error(`${t("messages.field")} "${field.label}"`);
        hasEmptyField = true;
        setLoading(false);
      }
    });

    if (hasEmptyField) {
      // If any required field is empty, return without further processing
      return;
    }
    setButtonDisabled(true);
    const inputData = {
      ...meetingData,
      objective: value,
      type: type,
      title,
      date,
      start_time: `${startTime}`,
      description: discription,
      priority: priority,
      alarm: alarm,
      prise_de_notes: prise_de_notes,
      total_time: total_time,
      steps: inputGroups,
      participants: participants,
      status: "draft",
      _method: "put",
    };
    console.log("update meeting validator-->", inputData);

    // // Check for duplicate step names
    // const stepNames = inputGroups.map((step) => step.title);
    // const duplicateStepNames = stepNames.filter(
    //   (stepName) =>
    //     stepNames.indexOf(stepName) !== stepNames.lastIndexOf(stepName)
    // );
    // if (duplicateStepNames.length > 0) {
    //   toast.error(t("messages.stepNames"));
    //   setButtonText("Valider");

    //   setButtonDisabled(false);
    //   return;
    // }
    // Check for duplicate step names
    const stepNames = inputGroups?.map((step) => step.title);
    const duplicateStepNames = stepNames?.filter(
      (stepName) =>
        stepNames.indexOf(stepName) !== stepNames.lastIndexOf(stepName)
    );
    if (duplicateStepNames.length > 0) {
      toast.error(t("messages.stepNames"));
      setButtonText("Valider");

      setButtonDisabled(false);
      setLoading(false);

      return;
    }

    // Check for null titles or count2 in steps
    const nullSteps = inputGroups?.filter(
      (step) => !step.title || !step.count2
    );
    if (nullSteps.length > 0) {
      toast.error(t("messages.stepTime"));
      setButtonText("Valider");
      setButtonDisabled(false);
      setLoading(false);

      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${checkId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        sessionStorage.setItem("meetingId", response.data?.data?.id);
        setMeetingId(response.data?.data?.id);
        setMeetingData(response.data?.data);
        toast.success(t("messages.draftSaved"));
        setParticipants(response.data?.data?.participants);
        setButtonText("Valider");
        setButtonDisabled(false);
        navigate(`/validateMeeting/${response.data?.data?.id}`, {
          state: { inputData: inputData },
        });
        setLoading(false);
      }
    } catch (error) {
      // console.log("error", error);
      setLoading(false);

      toast.error(error?.response.data.message);
    }
  };

  const updateDraft = async (isAddStepButtonClicked) => {
    const formFields = [value, type, title, discription, date, startTime];
    const hasText = formFields.some((field) => field.trim() !== "");
    if (!hasText) {
      toast.error("Veuillez d'abord remplir les champs ci-dessus");
      return;
    }
    const inputData = {
      ...meetingData,
      objective: value,
      type: type,
      title,
      date,
      start_time: `${startTime}`,
      description: discription,
      priority: priority,
      alarm: alarm,
      prise_de_notes: prise_de_notes,
      total_time: total_time,
      // repitition,
      participants: participants,
      steps: inputGroups,
      status: "draft",
      _method: "put",
      meeting_id: checkId,
    };

    // console.log("inputData--->", inputData);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${checkId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.status) {
        const allSteps = response.data.data.steps.sort((a, b) => a.id - b.id);
        if (response.data.data.steps.length > 0) {
          setInputGroups(allSteps);
          //--//--
          if (isAddStepButtonClicked) {
            setInputGroups((prev) => {
              return [
                ...prev,
                {
                  order_no: inputGroups.length + 1,
                  step: inputGroups.length + 1,
                  title: "",
                  count1: 0,
                  count2: 0,
                  time: 0,
                },
              ];
            }); //--//--
          }
        }
        if (response.data.data.participants.length > 0) {
          setParticipants(response.data?.data?.participants);
        }

        setMeetingData({
          ...response.data?.data,
          steps: allSteps,
          participants: response.data?.data?.participants,
        });
      }
    } catch (error) {
    } finally {
      setStepBtnDisabled(false);
    }
    // }, 3000);
  };

  const [meetings, setMeetings] = useState([]);
  const [objectives, setObjectives] = useState([]);

  const getMeetings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (response.status) {
        const meetingsData = response.data?.data;
        setMeetings(meetingsData);
        const objectivesData = meetingsData.map((meeting) => meeting.objective);
        setObjectives(objectivesData);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  useEffect(() => {
    getMeetings();
  }, []);

  const lowerCasedObjectives = objectives?.map((obj) => {
    if (obj) {
      return {
        name: obj.toLowerCase(),
      };
    }
    return null;
  });

  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  function getSuggestions(value) {
    return lowerCasedObjectives?.filter((obj) =>
      obj?.name.includes(value?.trim()?.toLowerCase())
    );
  }

  // const handleDragEnd = (result) => {
  //   console.log("result", result);
  //   if (!result.destination) {
  //     return;
  //   }

  //   const reorderedSteps = Array.from(inputGroups);
  //   const [removed] = reorderedSteps.splice(result.source.index, 1);
  //   reorderedSteps.splice(result.destination.index, 0, removed);

  //   // Update state with new order of steps
  //   // Assuming setInputChangeGroups is a function to update state
  //   setInputGroups(reorderedSteps);
  // };

  // --------------------REPITITION------------------
  const [show1, setShow1] = useState(false); // Assuming repetition is mandatory
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([]);

  const handleClose = () => setShow1(false);
  const userId = sessionStorage.getItem("user_id");
  const handleSave = async () => {
    // Handle saving logic here (e.g., send data to server)
    const payload = {
      meeting_id: checkId, //meeting_id
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      repetition: selectedNumber,
      repetition_frequency: selectedFrequency,
      repetition_days: selectedDays,
    };
    console.log("payload", payload);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/meeting-recurring`,
        payload,
        {
          // const response = await axios.post(`https://stage-tektime.digitalisolutions.net/api/meeting-recurring`, payload, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      console.log("response-->", response.data.data);
      if (response.status) {
        // toast.success(t("messages.repetitionSaved"));
        toast.success("Data is Saved");
        setShow1(false);
      }
    } catch (error) {
      console.log("error while saving data", error);
    } finally {
      setShow1(false);
    }
  };

  const handleNumberChange = (event) => {
    setSelectedNumber(event.target.value);
  };

  const handleFrequencyChange = (event) => {
    setSelectedFrequency(event.target.value);
    // Update selectedDays based on frequency change
    if (event.target.value === "daily") {
      setSelectedDays([...days]); // Select all days for daily frequency
    } else {
      setSelectedDays([]); // Clear selected days for other frequencies
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleDayClick = (day) => {
    const newSelectedDays = [...selectedDays]; // Create a copy to avoid mutation
    if (newSelectedDays.includes(day)) {
      const index = newSelectedDays.indexOf(day);
      newSelectedDays.splice(index, 1);
    } else {
      newSelectedDays.push(day);
    }
    setSelectedDays(newSelectedDays);
  };

  const renderDay = (day, index) => {
    const isSelected = selectedDays.includes(day);
    const firstChar = day.charAt(0);
    const styles = {
      backgroundColor: isSelected ? "rgb(10 167 255)" : "#dfdfdf",
      borderRadius: "50%",
      border: "none",
      padding: "6px 14px",
      textAlign: "center",
      cursor: "pointer",
      color: isSelected ? "white" : "black",
    };

    return (
      <div key={index} style={styles} onClick={() => handleDayClick(day)}>
        {firstChar}
      </div>
    );
  };
  useEffect(() => {
    if (show1 && selectedFrequency === "daily") {
      setSelectedDays([...days]);
    }
  }, [show1, selectedFrequency]);

  useEffect(() => {
    // Open modal when switching to "multiple" mode
    if (repitition === "multiple") {
      setShow1(true);
    }
  }, [repitition]);

  return (
    <div className="new-meeting">
      <div className="py-3 container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="p-5 card">
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.Destinations")}
                </label>
                <Autosuggest
                  className="form-control"
                  suggestions={suggestions}
                  onSuggestionsClearRequested={() => setSuggestions([])}
                  onSuggestionsFetchRequested={({ value }) => {
                    setValue(value);
                    setSuggestions(getSuggestions(value));
                  }}
                  onSuggestionSelected={(_, { suggestionValue }) =>
                    console.log("Selected: " + suggestionValue)
                  }
                  getSuggestionValue={(suggestion) => suggestion.name}
                  renderSuggestion={(suggestion) => (
                    <span>{suggestion.name}</span>
                  )}
                  inputProps={{
                    placeholder: t(
                      "meeting.newMeeting.placeholders.destination"
                    ),
                    value: value,
                    onChange: (_, { newValue, method }) => {
                      setValue(newValue);
                    },
                    onBlur: () => {
                      handleInputBlur();
                    },
                  }}
                  highlightFirstSuggestion={true}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.exchangeType")}
                </label>
                <br />
                <select
                  className="select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  onBlur={handleInputBlur}
                >
                  <option value="">
                    {t("meeting.newMeeting.placeholders.activityType")}
                  </option>
                  <option value="Atelier">
                    {t(
                      "meeting.newMeeting.options.activityTypes.businessPresentation"
                    )}
                  </option>
                  <option value="Comité">
                    {t("meeting.newMeeting.options.activityTypes.committee")}
                  </option>
                  <option value="Conférence">
                    {t("meeting.newMeeting.options.activityTypes.conference")}
                  </option>
                  <option value="Entretien individuel">
                    {t(
                      "meeting.newMeeting.options.activityTypes.individualInterview"
                    )}
                  </option>
                  <option value="Embauche">
                    {t("meeting.newMeeting.options.activityTypes.jobInterview")}
                  </option>
                  <option value="Pomodoro">
                    {t("meeting.newMeeting.options.activityTypes.Pomodoro")}
                  </option>
                  <option value="Formation">
                    {t("meeting.newMeeting.options.activityTypes.training")}
                  </option>
                  <option value="Intégration">
                    {t("meeting.newMeeting.options.activityTypes.integration")}
                  </option>

                  <option value="Partage d'informations">
                    {t(
                      "meeting.newMeeting.options.activityTypes.informationSharing"
                    )}
                  </option>

                  <option value="Présentation">
                    {t(
                      "meeting.newMeeting.options.activityTypes.pitchPresentation"
                    )}
                  </option>
                  <option value="Réseautage">
                    {t(
                      "meeting.newMeeting.options.activityTypes.collaborativeMeeting"
                    )}
                  </option>
                  <option value="Rituel agile">
                    {t("meeting.newMeeting.options.activityTypes.Agile ritual")}
                  </option>
                  <option value="Résolution de problème">
                    {t(
                      "meeting.newMeeting.options.activityTypes.problemResolution"
                    )}
                  </option>
                  <option value="Réunion commerciale">
                    {t("meeting.newMeeting.options.activityTypes.oneOnOne")}
                  </option>
                  <option value="Suivi de projet">
                    {t(
                      "meeting.newMeeting.options.activityTypes.projectFollowup"
                    )}
                  </option>

                  <option value="Séminaire">
                    {t("meeting.newMeeting.options.activityTypes.seminar")}
                  </option>
                  <option value="Suivi d’accompagnement">
                    {t(
                      "meeting.newMeeting.options.activityTypes.supportFollowup"
                    )}
                  </option>

                  <option value="Autre">
                    {t("meeting.newMeeting.options.activityTypes.other")}
                  </option>
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {" "}
                  {t("meeting.newMeeting.labels.objective")}
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleInputBlur}
                  placeholder={t("meeting.newMeeting.placeholders.objective")}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {" "}
                  {t("meeting.newMeeting.labels.priority")}
                </label>
                <br />
                <select
                  className="select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  onBlur={handleInputBlur}
                >
                  <option value="">
                    {t("meeting.newMeeting.options.priorities.priority")}
                  </option>
                  <option value="Obligatoire">
                    {" "}
                    {t("meeting.newMeeting.options.priorities.critical")}
                  </option>
                  <option value="Majeure">
                    {t("meeting.newMeeting.options.priorities.major")}
                  </option>
                  <option value="Moyenne">
                    {t("meeting.newMeeting.options.priorities.medium")}
                  </option>
                  <option value="Mineure">
                    {t("meeting.newMeeting.options.priorities.minor")}
                  </option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">
                  {" "}
                  {t("meeting.newMeeting.labels.context")}
                </label>
                <textarea
                  type="text"
                  required
                  className="form-control"
                  rows={5}
                  onChange={(e) => setDiscription(e.target.value)}
                  onBlur={handleInputBlur}
                  placeholder={t("meeting.newMeeting.placeholders.context")}
                />
              </div>
              <div className="mb-4">
                <div className="d-flex ">
                  <label className="form-label">Date</label>
                  {/* <div
                    className="mb-4 d-flex align-items-center gap-2"
                    style={{
                      marginLeft: "12px",
                    }}
                  >
                    <div className="d-flex gap-1">
                      <label style={{ fontWeight: "normal" }}>
                        <input
                          type="radio"
                          name="repitition"
                          value={repitition}
                          defaultChecked={true}
                          onChange={() => setRepitition("single")}
                        />
                        <span>
                          {" "}
                          {t("meeting.newMeeting.repitition.single")}
                        </span>
                      </label>
                      <label style={{ fontWeight: "normal" }}>
                        <input
                          type="radio"
                          name="repitition"
                          value={repitition}
                          onChange={() => setRepitition("multiple")}
                        />
                        <span>
                          {" "}
                          {t("meeting.newMeeting.repitition.multiple")}
                        </span>
                      </label>
                    </div>
                  </div> */}
                </div>
                <input
                  type="date"
                  lang="fr"
                  min={today}
                  required
                  className="form-control"
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.startTime")}
                </label>
                <input
                  type="time"
                  required
                  className="form-control"
                  onChange={(e) => setStartTime(e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>

              <div className="mb-4 d-flex align-items-center gap-2">
                <label className="form-label mb-0">
                  {t("meeting.newMeeting.labels.notetaking")}
                </label>
                <div className="d-flex gap-1">
                  <label style={{ fontWeight: "normal" }}>
                    <input
                      type="radio"
                      name="prise_de_notes"
                      value={"Automatic"}
                      onChange={(e) => setPrise_de_notes(e.target.value)}
                      onBlur={handleInputBlur}
                    />
                    <span>
                      {" "}
                      {t("meeting.newMeeting.options.notetaking.automatic")}
                    </span>
                  </label>
                  <label style={{ fontWeight: "normal" }}>
                    <input
                      type="radio"
                      name="prise_de_notes"
                      value={"Manual"}
                      onChange={(e) => setPrise_de_notes(e.target.value)}
                      onBlur={handleInputBlur}
                      defaultChecked={true}
                    />
                    <span>
                      {" "}
                      {t("meeting.newMeeting.options.notetaking.manual")}
                    </span>
                  </label>
                </div>
              </div>

              <div className="mb-4 d-flex align-items-center gap-2">
                <label className="form-label mb-0">
                  {t("meeting.newMeeting.labels.alarm")}
                </label>
                <div className="d-flex gap-1">
                  <label style={{ fontWeight: "normal" }}>
                    <input
                      type="radio"
                      name="alarm"
                      value={true}
                      onChange={() => setAlarm(true)}
                      onBlur={handleInputBlur}
                    />
                    <span> {t("meeting.newMeeting.alarmText.yes")}</span>
                  </label>
                  <label style={{ fontWeight: "normal" }}>
                    <input
                      type="radio"
                      name="alarm"
                      value={false}
                      onChange={() => setAlarm(false)}
                      onBlur={handleInputBlur}
                      defaultChecked={true}
                    />
                    <span> {t("meeting.newMeeting.alarmText.no")}</span>
                  </label>
                </div>
              </div>

              {/* PARTICIPANTS FORM */}
              <div className="mb-4">
                {participants?.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <label htmlFor="">{`Invité ${index + 1}`}</label>

                      {/* {index >= 1 && ( */}
                      <div>
                        <AiOutlineClose
                          size={"18px"}
                          color="#ff0000"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleCancelParticipants(item, index)}
                        />
                      </div>
                      {/* )} */}
                    </div>
                    <input
                      autoComplete="off"
                      aria-autocomplete="none"
                      type="text"
                      className="form-control mb-2"
                      placeholder={t(
                        "meeting.newMeeting.placeholders.firstName"
                      )}
                      value={item.first_name}
                      onChange={(e) =>
                        handleParticipantChange(
                          index,
                          "first_name",
                          e.target.value
                        )
                      }
                      onBlur={(e) => {
                        handleParticipantBlur(
                          index,
                          "first_name",
                          e.target.value
                        );
                      }}
                    />
                    <input
                      autoComplete="off"
                      aria-autocomplete="none"
                      type="text"
                      className="form-control mb-2"
                      placeholder={t(
                        "meeting.newMeeting.placeholders.lastName"
                      )}
                      value={item.last_name}
                      onChange={(e) =>
                        handleParticipantChange(
                          index,
                          "last_name",
                          e.target.value
                        )
                      }
                      onBlur={(e) => {
                        handleParticipantBlur(
                          index,
                          "last_name",
                          e.target.value
                        );
                      }}
                    />
                    <input
                      autoComplete="off"
                      aria-autocomplete="none"
                      type="email"
                      className="form-control mb-2"
                      placeholder="Email"
                      value={item.email}
                      onChange={(e) =>
                        handleParticipantChange(index, "email", e.target.value)
                      }
                      onBlur={(e) => {
                        handleParticipantBlur(index, "email", e.target.value);
                      }}
                    />
                    <input
                      autoComplete="off"
                      aria-autocomplete="none"
                      type="text"
                      className="form-control mb-2"
                      placeholder={t("meeting.newMeeting.placeholders.post")}
                      value={item.post}
                      // onChange={(event) =>
                      //   handleFourthChangeParticipants(item, event)
                      // }
                      onChange={(e) =>
                        handleParticipantChange(index, "post", e.target.value)
                      }
                      onBlur={(e) => {
                        handleParticipantBlur(index, "post", e.target.value);
                      }}
                    />
                  </div>
                ))}
                <ShowIF condition={loadingParticipants === false}>
                  <button
                    className="btn btn-primary createbtn px-5"
                    style={{ width: "100%" }}
                    onClick={async () => {
                      handleAddParticipants();
                    }}
                    // disabled={show}
                  >
                    {t("meeting.newMeeting.labels.addGuest")}
                  </button>
                </ShowIF>
                <ShowIF condition={loadingParticipants === true}>
                  <LoadingButton
                    className="btn btn-primary createbtn px-5 w-100"
                    loading={loadingParticipants}
                  ></LoadingButton>
                </ShowIF>
              </div>
              {/* STEPPPPPPPPPS FORM */}
              <div>
                {/* <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="steps">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {inputGroups?.map((group, index) => (
                          <Draggable
                            key={index}
                            draggableId={`step-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="d-flex justify-content-between">
                                  <label className="form-label">{`${t(
                                    "meeting.newMeeting.labels.step"
                                  )} ${index + 1}`}</label>
                                  {index >= 1 && (
                                    <div>
                                      <AiOutlineClose
                                        size={"18px"}
                                        color="#ff0000"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          handleCancelStep(group, index)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                                <h6>{t("meeting.newMeeting.labels.title")}</h6>
                                <input
                                  className="mb-3 form-control"
                                  required
                                  type="text"
                                  value={group.title}
                                  onChange={(event) =>
                                    handleInputChangeStep(group, event)
                                  }
                                  onBlur={() => {
                                    handleStepBlur(group, index);
                                  }}
                                />
                                <div className="mb-3">
                                  <button
                                    className={`count-btn ${
                                      now ? "disabled" : ""
                                    } `}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      handleDecrement(index, group);
                                    }}
                                    onBlur={() => {
                                      handleStepBlur(group, index);
                                    }}
                                  >
                                    <img src="Assets/minus.svg" alt="minus" />
                                  </button>
                                  <input
                                    className="count-field"
                                    type="text"
                                    value={group.count2}
                                    onChange={(event) =>
                                      handleCountChange(group, event)
                                    }
                                    onKeyDown={(event) => {
                                      if (
                                        event.key === "+" ||
                                        event.key === "-"
                                      ) {
                                        event.preventDefault(); // Prevent the default behavior for '+' and '-' keys
                                      }
                                    }}
                                    onWheel={(event) => {
                                      if (
                                        event.deltaY < 0 &&
                                        parseInt(group.count2) <= 0
                                      ) {
                                        event.preventDefault(); // Prevent decreasing below zero
                                      }
                                    }}
                                  />
                                  <span style={{ marginRight: "10px " }}>
                                    min
                                  </span>
                                  <button
                                    className={`count-btn ${
                                      now ? "disabled" : ""
                                    } `}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      handleIncrement(index, group);
                                    }}
                                    onBlur={() => handleStepBlur(group, index)}
                                    disabled={now}
                                  >
                                    <img src="Assets/plus.svg" alt="plus" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext> */}
                {inputGroups?.map((group, index) => (
                  <div key={index}>
                    <div className="d-flex justify-content-between">
                      <label className="form-label">{`${t(
                        "meeting.newMeeting.labels.step"
                      )} ${index + 1}`}</label>
                      {index >= 1 && (
                        <div>
                          <AiOutlineClose
                            size={"18px"}
                            color="#ff0000"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCancelStep(group, index)}
                          />
                        </div>
                      )}
                    </div>
                    <h6>{t("meeting.newMeeting.labels.title")}</h6>
                    <input
                      className="mb-3 form-control"
                      required
                      type="text"
                      value={group.title}
                      onChange={(event) => {
                        handleInputChangeStep(group, event);
                      }}
                      // onMouseOut={(e) =>
                      //   handleStepBlur(index, "title", e.target.value)

                      // }
                      onMouseOut={() => setIsTitleBlurred(true)}
                    />

                    <div class="input-group">
                      <input
                        type="button"
                        value="-"
                        class="button-minus"
                        data-field="quantity"
                        onClick={() => {
                          handleDecrement(index, group);
                        }}
                        onMouseOut={() =>
                          handleStepBlur(index, "count2", group?.count2)
                        }
                        style={{
                          border: "none",
                          fontSize: "40px",
                          padding: "0px",
                          color: "#339ede",
                        }}
                      />
                      <input
                        className="count-field"
                        value={group.count2}
                        name="count2"
                        onChange={(event) => handleCountChange(group, event)}
                        onKeyDown={(event) => {
                          if (event.key === "+" || event.key === "-") {
                            event.preventDefault(); // Prevent the default behavior for '+' and '-' keys
                          }
                        }}
                        onWheel={(event) => {
                          if (event.deltaY < 0 && parseInt(group.count2) <= 0) {
                            event.preventDefault(); // Prevent decreasing below zero
                          }
                        }}
                        onBlur={() => {
                          handleStepBlur(index, "title", group.title);
                          handleStepBlur(index, "count2", group?.count2);
                        }}
                        style={{ borderRadius: "13px", margin: "10px 16px" }}
                      />
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginRight: "12px",
                          marginLeft: "-10px",
                        }}
                      >
                        min
                      </span>
                      <input
                        type="button"
                        value="+"
                        class="button-plus"
                        data-field="quantity"
                        onClick={() => {
                          handleIncrement(index, group);
                        }}
                        onMouseOut={() =>
                          handleStepBlur(index, "count2", group?.count2)
                        }
                        style={{
                          border: "none",
                          fontSize: "40px",
                          padding: "0px",
                          color: "#339ede",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <ShowIF condition={loadingSteps === false}>
                  <button
                    className="px-5 mb-4 btn btn-primary createbtn"
                    style={{ width: "100%" }}
                    onClick={async () => {
                      if (
                        inputGroups[inputGroups.length - 1].title === "" ||
                        inputGroups[inputGroups.length - 1].count2 === 0
                      ) {
                        toast.error(
                          "Veuillez d'abord remplir le titre et l'heure de l'étape "
                        );
                        return;
                      }
                      handleAddStep();
                    }}
                  >
                    {t("meeting.newMeeting.labels.addStep")}
                  </button>
                </ShowIF>
                <ShowIF condition={loadingSteps === true}>
                  <LoadingButton
                    className="btn btn-primary createbtn px-5 w-100"
                    loading={loadingSteps}
                  ></LoadingButton>
                </ShowIF>
              </div>
              <br />
              <div className="d-flex justify-content-between">
                <div>
                  <h6> {t("meeting.newMeeting.labels.plannedTime")}</h6>
                </div>
                <div>
                  <h6>{t("meeting.newMeeting.labels.realTimeDuration")}</h6>
                  <span>{total_time} Min </span>
                </div>
              </div>
              <div className="pt-3 d-flex justify-content-center">
                {loading ? (
                  <>
                    <Button
                      variant="dark"
                      disabled
                      style={{
                        backgroundColor: "#3aa5ed",
                        border: "none",
                      }}
                      className="w-100"
                    >
                      <Spinner
                        as="span"
                        variant="light"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        animation="border"
                      />
                    </Button>
                  </>
                ) : (
                  <button
                    className="px-5 form-control btn btn-primary createbtn"
                    onClick={() => {
                      if (!validateParticipants(participants)) {
                        return;
                      }
                      validate();
                    }}
                  >
                    {t("meeting.newMeeting.labels.validate")}
                    {/* {buttonText} */}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {repitition === "multiple" && (
        <Modal show={show1} onHide={handleClose}>
          <Modal.Header
            closeButton
            style={{
              bordebottom: "none",
            }}
          >
            <Modal.Title>Repitition</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row" style={{ alignItems: "baseline" }}>
              <div className="col-md-3">
                <label htmlFor="" className="mb-1">
                  Debut
                </label>
              </div>
              <div className="col-md-6">
                <input
                  type="date"
                  lang="fr"
                  min={new Date().toISOString().slice(0, 10)} // Assuming today as minimum
                  required
                  className="form-control"
                  onChange={(e) => setStartDate(e.target.value)}
                  // onBlur={handleInputBlur}
                  style={{
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                  }}
                />
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="row align-items-center">
                  <div className="col-md-2">
                    <FaRotate />
                  </div>
                  <div className="col-md-6 p-0">
                    <span>Repeter Chaque</span>
                  </div>
                  <div className="col-md-4 position-relative">
                    <select
                      id="numberSelect"
                      className="form-select"
                      value={selectedNumber}
                      onChange={handleNumberChange}
                      style={{ border: "none" }}
                    >
                      {[...Array(10).keys()].map((num) => (
                        <option
                          key={num + 1}
                          value={num + 1}
                          data-icon="bi bi-funnel-fill"
                        >
                          {num + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <select
                  id="frequencySelect"
                  className="form-select w-auto"
                  value={selectedFrequency}
                  onChange={handleFrequencyChange}
                  style={{ border: "none" }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-12">
                <div
                  className="days-circle d-flex gap-1 align-items-center justify-content-evenly"
                  style={{ cursor: "pointer" }}
                >
                  {days.map(renderDay)}
                </div>
              </div>
            </div>
            <div className="row mt-4" style={{ alignItems: "baseline" }}>
              <div className="col-md-3">
                <label htmlFor="" className="mb-1">
                  Date de fin
                </label>
              </div>
              <div className="col-md-6">
                <input
                  type="date"
                  lang="fr"
                  min={new Date().toISOString().slice(0, 10)}
                  required
                  className="form-control"
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                  }}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
            <Button
              style={{ background: "rgb(10 167 255)" }}
              onClick={handleSave}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )} */}
    </div>
  );
};

export default NewMeeting;