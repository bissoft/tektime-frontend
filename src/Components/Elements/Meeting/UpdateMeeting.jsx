import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";
import { API_BASE_URL } from "../../Apicongfig";
import Spinner from "react-bootstrap/Spinner";
import Chart from "./Chart";
import { useTotalTime } from "../../../context/TotalTimeContext";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import LoadingButton from "../../Utils/LoadingButton";

export function validateParticipants(participants) {
  for (let participant of participants) {
    // Skip validation for participants where isCreator is 1
    if (participant.isCreator === 1) {
      continue;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email);
    if (!isValidEmail) {
      toast.error(
        "Veuillez saisir une adresse e-mail valide pour les participants"
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
      toast.error("Veuillez remplir tous les champs des participants");
      return false; // Return false if any of the fields are null or empty
    }
  }
  return true; // Return true if all participants are valid
}

// =====> UpdateMeeting Component
const UpdateMeeting = () => {
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [t] = useTranslation("global");
  const { setHeaderTitle } = useHeaderTitle();
  const { total_Time, updateTotalTime } = useTotalTime();
  let navigate = useNavigate();
  const { id } = useParams();
  const [buttonClicked, setButtonClicked] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [inputData, setInputData] = useState([]);
  const [lastCountSum, setLastCountSum] = useState(0);
  const [countSum, setCountSum] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState();
  const [data, setData] = useState([]);
  const [storedStartTime, setStoredStartTime] = useState(0);
  const [modifiedFileText, setModifiedFileText] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [buttonClick, setButtonClick] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState({});
  const [allTime, setAllTime] = useState(0);
  const [buttonText, setButtonText] = useState();
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const pullStepDataFormChart = (data) => {
    const updatedInputData = { ...inputData, steps: data };
    setInputData(updatedInputData);
  };
  useEffect(() => {
    if (inputData && inputData.steps) {
      setModifiedFileText(inputData.steps.map((step) => step.fileText));
    }
  }, [inputData]);
  // alert(inputData)
  const [participants, setParticipants] = useState([]);

  function validateParticipants(participants) {
    for (let participant of participants) {
      // Skip validation for participants where isCreator is 1
      if (participant.isCreator === 1) {
        continue;
      }
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email);
      if (!isValidEmail) {
        toast.error(t("meeting.chart.error.validEmail"));
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

  const getMeeting = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        setMeeting(response.data?.data);
        if (response.data.data.alarm === "1") {
          setAlarm(true);
        } else {
          setAlarm(false);
        }
        setParticipants(response.data?.data?.participants);
        handleAdditionalActions(response?.data.data);
        setInputData(response?.data.data);
        updateTotalTime(response?.data.data?.total_time);
        const calculatedTotalTime = response.data.data?.steps.reduce(
          (sum, step) => sum + step.count2,
          0
        );
        setAllTime(calculatedTotalTime);
        setLoading(false);
      }
    } catch (error) {
      // console.log("error", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    getMeeting();
  }, [id, isModalOpen]);

  const handleAdditionalActions = (data) => {
    setStoredStartTime(moment(data.start_time, "HH:mm").format("hh:mm a"));
    const { steps, total_time } = data;
    setLastCountSum(total_time);
    const countSum = steps.reduce((sum, step) => sum + step.count2, 0);
    setCountSum(countSum);
    const formattedData = steps
      ?.map((item) => ({
        x: item.title,
        y: [item.count1, item.count1 + item.count2, item.count2],
      }))
      .reverse();
    setChartData(formattedData);
  };

  useEffect(() => {
    setChartData((prevChartData) => {
      return prevChartData;
    });
  }, [inputData]);
  const inputDataRef = useRef(inputData);

  useEffect(() => {
    inputDataRef.current = inputData;
  }, [inputData]);

  const closeModal = () => {
    if (!isModalOpen) {
      // toast.error("Modal is not open");
    }
    setSelectedBar(null);
    setSelectedValue(null);
    setSelectedCount(null);
    setIsModalOpen(false);
  };

  // // Function to set alarm field based on API response
  // useEffect(() => {
  //   if (meeting) {
  //     setInputData((prevInputData) => ({
  //       ...prevInputData,
  //       alarm: meeting.alarm === "1", // Convert string "1" to boolean true
  //     }));
  //   }
  // }, [meeting]);

  // const setAlarm = (value) => {
  //   setInputData((prevInputData) => ({
  //     ...prevInputData,
  //     alarm: value,
  //   }));
  // };
  const setPrise_de_notes = (value) => {
    setInputData((prevInputData) => ({
      ...prevInputData,
      prise_de_notes: value,
    }));
  };
  const handleChange3 = (e) => {
    const updatedInputData = {
      ...inputData,
      [e.target.name]: e.target.value,
    };
    updatedInputData.steps = updatedInputData.steps.map((step, index) => {
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

  useEffect(() => {
    const userIdFromSession = sessionStorage.getItem("user_id");
    if (userIdFromSession) {
      setUserId(userIdFromSession);
    }
  }, []);
  const [isCopy, setIsCopy] = useState(false);

  const handleCopy = async () => {
    // console.log("item",inputData.id)
    // navigate(`/copyMeeting/${inputData?.id}`);
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
    setButtonClicked(true);
    // setButtonText("Dupliquer...");
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
    try {
      setIsCopy(true);

      let convertedTime = inputData.start_time;

      if (inputData.start_time.match(/^\d{2}:\d{2}$/)) {
        // Append ":00" to convert it to H:i:s format
        convertedTime = `${inputData.start_time}:00`;
      }
      const postData = {
        ...inputData,
        start_time: convertedTime,
        total_time: total_Time,
        _method: "put",
        duplicate: true,
      };
      console.log("copy meeting payload--->", postData);
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        // console.log(response?.data?.data);
        toast.success("Réunion dupliquée avec succès");
        navigate("/meeting");
        setButtonClicked(false);
        setIsCopy(false);
      } else {
        toast.error("Échec de la duplication de la réunion");
      }
    } catch (error) {
      // toast.error("");
    } finally {
      setButtonClicked(false);
      setIsCopy(false);
    }
  };
  const handleDelete = async () => {
    try {
      const meetingId = inputData.id;

      // Show a confirmation dialog to the user
      const userConfirmed = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette réunion ?"
      );
      if (!userConfirmed) {
        return; // If the user cancels the deletion, exit the function
      }
      // Make the DELETE API request using the fetch API or Axios (replace the API_URL with your actual API endpoint)
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      // Handle the API response status
      if (!response.ok) {
        toast.error("Échec de la suppression de la réunion");
      } else {
        toast.success("Réunion supprimée avec succès.");
        setData((prevData) => prevData.filter((item) => item.id !== meetingId));
        navigate("/meeting");
      }
    } catch (error) {
      // console.error("Error deleting data:", error);
      toast.error("Échec de la suppression de la réunion");
    }
  };

  const [steps, setSteps] = useState([]);
  useEffect(() => {
    if (inputData && inputData.steps) {
      setSteps(inputData?.steps);
    }
  }, [inputData]);

  const [isLoading, setIsLoading] = useState(false);
  const directUpdateMeeting = async () => {
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

    if (!validateParticipants(participants)) {
      return;
    }
    setIsLoading(true);
    try {
      let convertedTime = inputData.start_time;

      if (inputData.start_time.match(/^\d{2}:\d{2}$/)) {
        // Append ":00" to convert it to H:i:s format
        convertedTime = `${inputData.start_time}:00`;
      }

      const updateMeetingData = {
        ...inputData,
        start_time: convertedTime,
        total_time: total_Time, // I changed it to total_Time. Total time is coming from context.
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        updateMeetingData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        toast.success("Réunion mise à jour avec succès");
        // setButtonDisabled(false);
        navigate("/meeting");
        setIsLoading(false);

        // setActiveTab("")
      }
    } catch (error) {
      // console.log("Error updating meeting:", error);
      // setButtonClick(false);
      // setButtonDisabled(false);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  //Participants Functionality
  useEffect(() => {
    if (inputData?.participants) {
      var participants = inputData.participants;
      var creator = participants.find((item) => item.isCreator === 1);
      var otherParticipants = participants.filter(
        (item) => item.isCreator !== 1
      );
      setParticipants([creator, ...otherParticipants]);
    }
  }, [inputData?.participants]);

  const handleParticipantChange = (index, fieldName, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][fieldName] = value;
    setParticipants(updatedParticipants);
    setInputData((prevInputData) => ({
      ...prevInputData,
      participants: updatedParticipants,
    }));
  };

  const handleAddParticipants = async () => {
    const areParticipantsValid = validateParticipants(participants);
    if (!areParticipantsValid) {
      return;
    }
    console.log(participants);
    // ====================> Add participant to the database
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
  const handleCancelParticipants = async (item, indexToRemove) => {
    if (indexToRemove === 0) {
      return;
    } else {
      // setParticipants((prevParticipants) => {
      //   const updatedParticipants = prevParticipants.filter(
      //     (participant, index) => index !== indexToRemove
      //   );
      //   return updatedParticipants;
      // });

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
    }
  };
  return (
    <div className="meetingedit">
      {loading ? (
        <Spinner animation="border" role="status" className="center-spinner" />
      ) : (
        <div className="py-3 container-fluid">
          <div className="row">
            <div className="col-md-4">
              <div className="p-3 card graph-card">
                <div className="mb-4">
                  <label className="form-label">
                    {t("meeting.newMeeting.labels.Destinations")}
                  </label>
                  <input
                    type="text"
                    name="objective"
                    value={inputData.objective}
                    className="form-control"
                    onChange={handleChange3}
                    placeholder={t(
                      "meeting.newMeeting.placeholders.destination"
                    )}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    {t("meeting.newMeeting.labels.exchangeType")}
                  </label>
                  <br />
                  <select
                    className="select"
                    name="type"
                    onChange={handleChange3}
                    value={inputData.type}
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
                      {t(
                        "meeting.newMeeting.options.activityTypes.jobInterview"
                      )}
                    </option>
                    <option value="Pomodoro">
                      {t("meeting.newMeeting.options.activityTypes.Pomodoro")}
                    </option>
                    <option value="Formation">
                      {t("meeting.newMeeting.options.activityTypes.training")}
                    </option>
                    <option value="Intégration">
                      {t(
                        "meeting.newMeeting.options.activityTypes.integration"
                      )}
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
                      {t(
                        "meeting.newMeeting.options.activityTypes.Agile ritual"
                      )}
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
                    className="form-control"
                    onChange={handleChange3}
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
                    {t("meeting.newMeeting.labels.context")}
                  </label>
                  <textarea
                    type="text"
                    name="description"
                    value={inputData.description}
                    className="form-control resume"
                    rows={3}
                    placeholder={t("meeting.newMeeting.labels.context")}
                    onChange={handleChange3}
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
                      checked={
                        inputData.prise_de_notes === "Automatic" ? true : false
                      }
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
                      checked={
                        inputData.prise_de_notes === "Manual" ||
                        inputData.prise_de_notes === null
                          ? true
                          : false
                      }
                    />
                    <span>
                      {" "}
                      {t("meeting.newMeeting.options.notetaking.manual")}
                    </span>
                  </div>
                </div>

                <div className="mb-4 d-flex align-items-center gap-2">
                  <label className="form-label mb-0">
                    {t("meeting.newMeeting.labels.alarm")}
                  </label>
                  <div className="d-flex gap-1">
                    <input
                      type="radio"
                      name="alarm"
                      value="true"
                      checked={alarm === true ? true : false}
                      onChange={(e) => setAlarm(true)}
                    />
                    <span> {t("meeting.newMeeting.alarmText.yes")}</span>

                    <input
                      type="radio"
                      name="alarm"
                      value="false"
                      checked={alarm === false ? true : false}
                      onChange={(e) => setAlarm(false)}
                    />
                    <span> {t("meeting.newMeeting.alarmText.no")}</span>
                  </div>
                </div>

                <div className="mb-4">
                  {participants?.map((participant, index) => {
                    console.log("participants --> from map", participant);
                    if (participant?.isCreator === 1) {
                      return;
                    }
                    return (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <label htmlFor="">{`Invité ${index}`}</label>
                          {index >= 1 && (
                            <div>
                              <AiOutlineClose
                                size={"18px"}
                                color="#ff0000"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleCancelParticipants(participant, index)
                                }
                              />
                            </div>
                          )}
                        </div>
                        <input
                          required
                          type="text"
                          className="mb-2 form-control"
                          placeholder={t(
                            "meeting.newMeeting.placeholders.firstName"
                          )}
                          value={participant?.first_name}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              "first_name",
                              e.target.value
                            )
                          }
                        />

                        <input
                          required
                          type="text"
                          className="mb-2 form-control"
                          placeholder={t(
                            "meeting.newMeeting.placeholders.lastName"
                          )}
                          value={participant?.last_name}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              "last_name",
                              e.target.value
                            )
                          }
                        />
                        <input
                          required
                          type="text"
                          className="mb-2 form-control"
                          placeholder="Email"
                          value={participant?.email}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                        />
                        <input
                          required
                          type="text"
                          className="mb-2 form-control"
                          placeholder={t(
                            "meeting.newMeeting.placeholders.post"
                          )}
                          value={participant?.post}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              "post",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    );
                  })}
                  {!loadingParticipants ? (
                    <button
                      className="px-5 btn btn-primary createbtn"
                      style={{ width: "100%" }}
                      onClick={handleAddParticipants} // Function to add more participants
                    >
                      {t("meeting.newMeeting.labels.addGuest")}
                    </button>
                  ) : (
                    <LoadingButton
                      loading={loadingParticipants}
                      className="btn btn-primary w-100"
                    />
                  )}
                </div>
                <div className="mb-4">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    min={today}
                    name="date"
                    value={inputData.date}
                    className="form-control"
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    {" "}
                    {t("meeting.newMeeting.labels.startTime")}
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={inputData.start_time}
                    className="form-control "
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    {t("meeting.newMeeting.labels.realTimeDuration")}
                  </label>

                  <p>{total_Time + " Min"}</p>
                </div>
              </div>
            </div>
            <div className="mt-2 col-md-8">
              <div className="p-3 card graph-card2">
                <Chart
                  puller={pullStepDataFormChart}
                  data={inputData}
                  meetingId={id}
                  participants={participants}
                />
              </div>
              <div className="my-5 text-center d-flex justify-content-between editbutton">
                <div className="gap-3 d-flex edit2">
                  <button
                    className="mb-3 btn add1"
                    onClick={() => navigate("/meeting")}
                  >
                    {t("buttons.cancel1")}
                  </button>
                  <button
                    className="mb-3 btn btn-danger del"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete()}
                  >
                    {t("buttons.Delete")}
                  </button>
                </div>
                <div className="gap-3 d-flex edit2">
                  {isLoading ? (
                    <>
                      <Button
                        variant="dark"
                        disabled
                        style={{
                          backgroundColor: "#3aa5ed",
                          border: "none",
                          padding: "11px 96px",
                          height: "fit-content",
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
                      className="mb-3 btn add2 "
                      onClick={directUpdateMeeting}
                      // disabled={buttonDisabled}
                    >
                      {t("buttons.Validatechanges")}
                    </button>
                  )}

                  {isCopy ? (
                    <>
                      <Button
                        variant="dark"
                        disabled
                        style={{
                          backgroundColor: "#3aa5ed",
                          border: "none",
                          padding: "11px 96px",
                          height: "fit-content",
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
                      className="mb-3 btn add3"
                      onClick={() => {
                        setHeaderTitle([
                          {
                            titleText: "Modifier la Moment",
                            link: `/updateMeeting/${id}`,
                          },
                          {
                            titleText: `Dupliquer : ${meeting.title}`,
                            link: `/copyMeeting/${id}`,
                          },
                        ]);
                        handleCopy();
                      }}
                      // disabled={buttonClick}
                    >
                      {t("buttons.Duplicate")}

                      {/* {buttonClick
                        ? t("buttons.Duplicate")
                        : t("buttons.Duplicate")} */}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UpdateMeeting;