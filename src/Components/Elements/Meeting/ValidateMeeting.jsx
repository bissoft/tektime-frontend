import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineClose } from "react-icons/ai";
import { API_BASE_URL } from "../../Apicongfig";
import Chart from "./Chart";
import axios from "axios";
import { useTotalTime } from "../../../context/TotalTimeContext";
import { useTranslation } from "react-i18next";
// import { validateParticipants } from "./UpdateMeeting";
import { Button, Spinner } from "react-bootstrap";
import ShowIF from "../../Utils/ShowIF";
import LoadingButton from "../../Utils/LoadingButton";

const ValidateMeeting = () => {
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [t] = useTranslation("global");
  const validateText = t("meeting.newMeeting.validateEvent");
  const { id } = useParams();
  let navigate = useNavigate();
  const [inputData, setInputData] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonText, setButtonText] = useState(validateText);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { total_Time, updateTotalTime } = useTotalTime();
  const [alarm, setAlarm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prise_de_notes, setPrise_de_notes] = useState(null);

  useEffect(() => {
    if (inputData && inputData.steps) {
      const hasEmptyEditorContent = inputData?.steps?.some(
        (step) => !step.editor_content
      );
      if (hasEmptyEditorContent) {
        setButtonClicked(true);
        setButtonDisabled(false);
      } else {
        setButtonClicked(false);
      }
    }
  }, [inputData]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [modifiedFileText, setModifiedFileText] = useState([]);

  const pullStepDataFormChart = (data) => {
    console.log("data-->", data);
    const updatedInputData = { ...inputData, steps: data };
    setInputData(updatedInputData);
  };

  useEffect(() => {
    if (inputData && inputData.steps) {
      setModifiedFileText(inputData?.steps?.map((step) => step.fileText));
    }
  }, [inputData]);
  const [userId, setUserId] = useState("");

  const [meeting, setMeeting] = useState({});
  const getMeeting = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        setMeeting(response.data?.data);
        if (response.data?.data?.alarm == "1") {
          setAlarm(true);
        } else {
          setAlarm(false);
        }
        if (response.data?.data?.prise_de_notes == "Automatic") {
          setPrise_de_notes("Automatic");
        } else {
          setPrise_de_notes("Manual");
        }
        const updatedSteps = response.data?.data?.steps;
        updatedSteps.sort((a, b) => a.id - b.id);
        setParticipants(response?.data?.data?.participants);

        setInputData({
          ...response.data?.data,
          steps: updatedSteps,
          participants: participants,
        });
        updateTotalTime(response.data.data.total_time);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };

  //  // Function to set alarm field based on API response
  //  useEffect(() => {
  //   if (meeting) {
  //     setInputData(prevInputData => ({
  //       ...prevInputData,
  //       alarm: meeting.alarm  // Convert string "1" to boolean true
  //     }));
  //   }
  // }, [meeting]);

  // const setAlarm = (value) => {
  //   setInputData(prevInputData => ({
  //     ...prevInputData,
  //     alarm: value
  //   }));
  // };
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
  useEffect(() => {
    getMeeting();
  }, [id]);

  const inputDataRef = useRef(inputData);

  useEffect(() => {
    inputDataRef.current = inputData;
  }, [inputData]);

  useEffect(() => {
    const userIdFromSession = sessionStorage.getItem("user_id");
    if (userIdFromSession) {
      setUserId(userIdFromSession);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const createMeeting = async () => {
    if (!validateParticipants(participants)) {
      return;
    }

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
      if (!inputData[field.name]) {
        toast.error(`${t("messages.field")} "${field.label}"`);
        hasEmptyField = true;
      }
    });

    if (hasEmptyField) {
      // If any required field is empty, return without further processing
      return;
    }
    
    setLoading(true);
    // CREATOR
    let participantArrayWithCreatorAdded = [
      ...participants,
      {
        first_name: JSON.parse(sessionStorage.getItem("user")).name,
        last_name: JSON.parse(sessionStorage.getItem("user")).last_name,
        email: JSON.parse(sessionStorage.getItem("user")).email,
        post: JSON.parse(sessionStorage.getItem("user")).post,
        isCreator: true,
      },
    ];

    setIsLoading(true);
    let convertedTime = inputData?.start_time;

    if (inputData?.start_time?.match(/^\d{2}:\d{2}$/)) {
      // Append ":00" to convert it to H:i:s format
      convertedTime = `${inputData.start_time}:00`;
    }
    try {
      let convertedTime = inputData.start_time;
      if (inputData.start_time.match(/^\d{2}:\d{2}$/)) {
        // Append ":00" to convert it to H:i:s format
        convertedTime = `${inputData.start_time}:00`;
      }

      const createMeetingPayload = {
        ...inputData,
        participants: participantArrayWithCreatorAdded,
        start_time: convertedTime,
        total_time: total_Time, // Total time is coming from context.
        status: "active",
        _method: "put",
      };

      // console.log("createMeetingPayload-->", createMeetingPayload);
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        createMeetingPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Création de la réunion réussie");
        setIsLoading(false);
        navigate("/meeting");
        setLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setLoading(false);
    }
  };
  const handleChange3 = (e) => {
    const updatedInputData = {
      ...inputData,
      [e.target.name]: e.target.value,
    };
    updatedInputData.steps = updatedInputData?.steps?.map((step, index) => {
      if (index === selectedIndex) {
        return {
          ...step,
          fileText: e.target.value,
        };
      }
      return step;
    });
    setInputData(updatedInputData);
  };

  const [participants, setParticipants] = useState([]);
  const handleParticipantChange = (index, property, value) => {
    setParticipants((prevParticipants) => {
      const updatedParticipants = [...prevParticipants];
      updatedParticipants[index] = {
        ...updatedParticipants[index],
        [property]: value,
      };
      return updatedParticipants;
    });
  };

  // const handleAddParticipants = async () => {
  //   let URL = `${API_BASE_URL}/participants`;
  //   console.log("Last participant is: ", participants[participants.length - 1]);
  //   const lastParticipant = participants[participants.length - 1];
  //   lastParticipant.meeting_id = participants[0].meeting_id;

  //   console.log("MEETING ID IS:->", participants[0].meeting_id);
  //   // create new partcipant only if the last participant has all the fields filled.
  //   if (lastParticipant.id) {
  //     URL = `${API_BASE_URL}/participants/${lastParticipant.id}`;
  //     console.log("Last participant is already saved in database.");
  //     lastParticipant._method = "put";
  //   }
  //   /**
  //    * SO here is the simple algorithm:
  //    * 1. Get the last participant from the participants array.
  //    * 2. Check if all the fields are filled.
  //    * 3. If all the fields are filled, then create a new participant.
  //    * 4. If any of the fields are empty, then don't create a new participant.
  //    * 5. when participant is successfully created, then add it to the participants array.
  //    */
  //   const createNewParticipant = async (partcipant) => {
  //     const { first_name, last_name, email, post, _method, id } = partcipant;
  //     try {
  //       const response = await axios.post(
  //         URL,
  //         {
  //           id,
  //           first_name,
  //           last_name,
  //           email,
  //           post,
  //           meeting_id: participants[0].meeting_id,
  //           _method: _method || "post",
  //         },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       console.log("response", response);
  //       if (response.status === 200) {
  //         return response.data.data;
  //       }
  //     } catch (error) {
  //       console.error("Error creating participant", error);
  //       return null;
  //     }
  //   };

  //   const newPartcipant = await createNewParticipant(lastParticipant);
  //   if (newPartcipant) {
  //     // If new participant is created successfully, then add it to the participants array.
  //     lastParticipant.id = newPartcipant.id;
  //     let updatedParticipants = [...participants];
  //     updatedParticipants.pop();
  //     updatedParticipants.push(lastParticipant);

  //     setParticipants((prevParticipants) => {
  //       return [
  //         ...updatedParticipants,
  //         {
  //           first_name: "",
  //           last_name: "",
  //           email: "",
  //           post: "",
  //         },
  //       ];
  //     });
  //   }
  // };

  const handleAddParticipants = async () => {
    const areParticipantsValid = validateParticipants(participants);
    if (!areParticipantsValid) {
      return;
    }
    try {
      setLoadingParticipants(true);
      const response = await axios.post(
        `${API_BASE_URL}/participants`,
        { meeting_id: id },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      const newParticipant = response.data.data;
      setLoadingParticipants(false);
      if (response.status) {
        setParticipants([...participants, newParticipant]);
      }

      console.log("Participant successfully created:", newParticipant);
    } catch (error) {
      setLoadingParticipants(false);
      console.error("Error while adding participant:", error);
    }
  };

  // const handleAddParticipants = () => {
  //   setParticipants((prevParticipants) => [
  //     ...prevParticipants,
  //     {
  //       first_name: "",
  //       last_name: "",
  //       email: "",
  //       post: "",
  //     },
  //   ]);
  // };

  const handleDeleteParticipant = async (item, indexToRemove) => {
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
        console.log("DELETED FROM DB SUCCESSFULLY.");
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
  // const steps = meeting?.steps;

  const goBack = (item) => {
    navigate(`/draft/${item?.id}`);
  };
  // const goBackMeeting = () => {
  //   toast.info("Votre réunion est en brouillon jusqu'à compléter vos données");
  //   navigate("/meeting");
  // };

  const updateDraft = async () => {
    const total_time = inputData.steps?.reduce(
      (sum, step) => sum + step.count2,
      0
    );

    const data = {
      title: inputData.title,
      objective: inputData.objective,
      description: inputData.description,
      type: inputData.type,
      priority: inputData.priority,
      date: inputData.date,
      start_time: inputData.start_time,
      total_time: total_time,
      prise_de_notes: prise_de_notes,
      alarm: alarm,
      steps: inputData.steps,
      participants: participants,
      status: "draft",
      _method: "put",
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.status) {
        const updatedParticipants = response?.data?.data?.participants;
        setParticipants(updatedParticipants);
        setInputData(response.data?.data);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
  const handleParticipantBlur = async (index, field, value) => {
    console.log("Field:", field);
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

        console.log("Response:", response);

        if (response.status === 200) {
          const newlySavedPArticipant = response.data.data;
          //       // UPDADTE THE PARTICIPANT IN THE PARTICIPANTS ARRAY
                let participantsCopy = [...participants];
                participantsCopy[index] = newlySavedPArticipant;
                setParticipants(participantsCopy);
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

  // const handleParticipantBlur = async (participant, index) => {
  //   console.log(participant);
  //   let URL = `${API_BASE_URL}/participants`;
  //   participant.meeting_id = participants[0].meeting_id;
  //   if (participant.id) {
  //     URL = `${API_BASE_URL}/participants/${participant.id}`;
  //     participant._method = "put";
  //   }
  //   try {
  //     const response = await axios.post(URL, participant, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  //       },
  //     });
  //     console.log("response", response);
  //     if (response.status === 200) {
  //       const newlySavedPArticipant = response.data.data;
  //       // UPDADTE THE PARTICIPANT IN THE PARTICIPANTS ARRAY
  //       let participantsCopy = [...participants];
  //       participantsCopy[index] = newlySavedPArticipant;
  //       setParticipants(participantsCopy);
  //     }
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  const handleInputBlur = () => {
    if (id) {
      updateDraft();
    }
  };
  return (
    <div className="graph">
      <div className="container-fluid py-3">
        <div className="row">
          <div className="col-md-4">
            <div className="card p-3 graph-card">
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.Destinations")}
                </label>
                <input
                  type="text"
                  name="objective"
                  value={inputData.objective}
                  className="form-control input-field"
                  onChange={handleChange3}
                  onBlur={handleInputBlur}
                  placeholder={t("meeting.newMeeting.placeholders.destination")}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.typeOfChange")}
                </label>
                <br />
                <select
                  className="select"
                  name="type"
                  onChange={handleChange3}
                  value={inputData.type}
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
                  {t("meeting.newMeeting.labels.objective")}
                </label>
                <input
                  type="text"
                  name="title"
                  value={inputData.title}
                  className="form-control input-field"
                  onChange={handleChange3}
                  onBlur={handleInputBlur}
                  placeholder={t("meeting.newMeeting.placeholders.objective")}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.priority")}
                </label>
                <br />
                <select
                  className="select"
                  value={inputData.priority}
                  name="priority"
                  onChange={handleChange3}
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

              {/* <div className="mb-4">
                <label className="form-label">
                  {" "}
                  {t("meeting.newMeeting.labels.notetaking")}
                </label>
                <br />
                <select
                  className="select"
                  value={inputData.prise_de_notes}
                  name="prise_de_notes"
                  onChange={handleChange3}
                  onBlur={handleInputBlur}
                >
                  <option value="">
                    {t("meeting.newMeeting.labels.notetaking")}
                  </option>
                  <option value="Manual">
                    {" "}
                    {t("meeting.newMeeting.options.notetaking.manual")}
                  </option>
                  <option value="Automatic">
                    {t("meeting.newMeeting.options.notetaking.automatic")}
                  </option>
                </select>
              </div> */}
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.context")}
                </label>
                <textarea
                  type="text"
                  name="description"
                  value={inputData.description}
                  className="form-control"
                  rows={3}
                  placeholder={t("meeting.newMeeting.labels.context")}
                  onChange={handleChange3}
                  onBlur={handleInputBlur}
                />
              </div>

              <div className="mb-4 d-flex align-items-center gap-2">
                <label className="form-label mb-0">
                  {t("meeting.newMeeting.labels.notetaking")}
                </label>
                <div className="d-flex gap-1">
                  <input
                    type="radio"
                    name="prise_de_notes"
                    value={"Automatic"}
                    onChange={(e) => setPrise_de_notes("Automatic")}
                    onBlur={handleInputBlur}
                    checked={prise_de_notes === "Automatic" ? true : false}
                  />
                  <span>
                    {" "}
                    {t("meeting.newMeeting.options.notetaking.automatic")}
                  </span>
                  <input
                    type="radio"
                    name="prise_de_notes"
                    value={"Manual"}
                    onChange={(e) => setPrise_de_notes("Manual")}
                    onBlur={handleInputBlur}
                    checked={prise_de_notes === "Manual" ? true : false}
                  />
                  <span>
                    {" "}
                    {t("meeting.newMeeting.options.notetaking.manual")}
                  </span>
                </div>
              </div>

              <div className="mb-4 d-flex align-items-center gap-2">
                <label className="form-label mb-0 mr-2">
                  {t("meeting.newMeeting.labels.alarm")}
                </label>
                <div className="d-flex gap-1">
                  <input
                    type="radio"
                    name="alarm"
                    value="true"
                    checked={alarm === true ? true : false}
                    onChange={(e) => setAlarm(true)}
                    onBlur={handleInputBlur}
                  />
                  <span> {t("meeting.newMeeting.alarmText.yes")}</span>

                  <input
                    type="radio"
                    name="alarm"
                    value="false"
                    checked={alarm === false ? true : false}
                    onChange={(e) => setAlarm(false)}
                    onBlur={handleInputBlur}
                  />
                  <span> {t("meeting.newMeeting.alarmText.no")}</span>
                </div>
              </div>
              <div className="mb-4">
                {participants?.map((participant, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <label htmlFor="">{`${t(
                        "meeting.newMeeting.labels.Guests"
                      )} ${index + 1}`}</label>
                      {/* {index >= 1 && ( */}
                      <div>
                        <AiOutlineClose
                          size={"18px"}
                          color="#ff0000"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleDeleteParticipant(participant, index)
                          }
                        />
                      </div>
                      {/* )} */}
                    </div>
                    <input
                      type="text"
                      name="first_name"
                      className="form-control mb-2 input-field"
                      placeholder={t(
                        "meeting.newMeeting.placeholders.firstName"
                      )}
                      value={participant.first_name}
                      onChange={(e) =>
                        handleParticipantChange(
                          index,
                          "first_name",
                          e.target.value
                        )
                      }
                      // onBlur={() => {
                      //   handleParticipantBlur(participant, index);
                      // }}
                      onBlur={(e) => {
                        handleParticipantBlur(index, "first_name", e.target.value);
                      }}
                    />

                    <input
                      name="last_name"
                      type="text"
                      className="form-control mb-2 input-field"
                      placeholder={t(
                        "meeting.newMeeting.placeholders.lastName"
                      )}
                      value={participant.last_name}
                      onChange={(e) =>
                        handleParticipantChange(
                          index,
                          "last_name",
                          e.target.value
                        )
                      }
                      // onBlur={() => {
                      //   handleParticipantBlur(participant, index);
                      // }}
                      onBlur={(e) => {
                        handleParticipantBlur(index, "last_name", e.target.value);
                      }}
                    />
                    <input
                      name="email"
                      type="email"
                      className="form-control mb-2 input-field"
                      placeholder="Email"
                      value={participant.email}
                      onChange={(e) =>
                        handleParticipantChange(index, "email", e.target.value)
                      }
                      // onBlur={() => {
                      //   handleParticipantBlur(participant, index);
                      // }}
                      onBlur={(e) => {
                        handleParticipantBlur(index, "email", e.target.value);
                      }}
                    />
                    <input
                      name="post"
                      type="text"
                      className="form-control mb-2 input-field"
                      placeholder={t("meeting.newMeeting.placeholders.post")}
                      value={participant.post}
                      onChange={(e) =>
                        handleParticipantChange(index, "post", e.target.value)
                      }
                      // onBlur={() => {
                      //   handleParticipantBlur(participant, index);
                      // }}
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
                    onClick={handleAddParticipants}
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

              <div className="mb-4">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  min={today}
                  name="date"
                  value={inputData.date}
                  className="form-control input-field"
                  onChange={handleChange3}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.startTime")}
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={inputData.start_time}
                  className="form-control input-field"
                  onChange={handleChange3}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  {t("meeting.newMeeting.labels.estimatedDuration")}
                </label>
                <p>{total_Time + " Min"}</p>
              </div>
            </div>
          </div>
          <div className="col-md-8 mt-2">
            <div className="card graph-card2 p-3">
              <Chart
                inputData={inputData}
                puller={pullStepDataFormChart}
                meetingId={id}
                participants={participants}
              />
            </div>
            <div className="text-center my-5">
              {/* <button
                className="btn add"
                disabled={buttonClicked}
                onClick={createMeeting}
              >
                {buttonText}
              </button> */}
              {loading ? (
                <>
                  <Button
                    variant="dark"
                    disabled
                    style={{
                      backgroundColor: "#3aa5ed",
                      border: "none",
                      padding: "10px 50px 10px 50px",
                    }}
                    // className="w-100"
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
                  className="btn add"
                  // onClick={buttonClicked ? goBackMeeting : createMeeting}
                  onClick={createMeeting}
                >
                  {buttonClicked
                    ? t("meeting.newMeeting.validateEvent")
                    : buttonText}
                </button>
              )}
              <button
                className="btn btn-danger"
                style={{
                  padding: "10px 50px 10px 50px",
                  fontWeight: 500,
                  color: "white",
                  background: "#ed4949",
                  marginLeft: "10px",
                }}
                onClick={() => goBack(inputData)}
              >
                {t("meeting.newMeeting.cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ValidateMeeting;