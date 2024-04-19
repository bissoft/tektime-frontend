import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useRef } from "react";
import Spinner from "react-bootstrap/Spinner";
import Chart from "./Chart";
import { useTranslation } from "react-i18next";
import { useTotalTime } from "../../../context/TotalTimeContext";
import { Button } from "react-bootstrap";
// import { validateParticipants } from "./UpdateMeeting";
import ShowIF from "../../Utils/ShowIF";
import LoadingButton from "../../Utils/LoadingButton";

const MeetingCopy = () => {
  const { total_Time, updateTotalTime } = useTotalTime();
  const [t] = useTranslation("global");
  const [buttonClicked, setButtonClicked] = useState(false);
  let navigate = useNavigate();
  const { id } = useParams();
  const [chartData, setChartData] = useState([]);
  const [inputData, setInputData] = useState([]);
  console.log("inputdata --> copy meeting", inputData);
  const [lastCountSum, setLastCountSum] = useState(0);
  const [countSum, setCountSum] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const [storedStartTime, setStoredStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modifiedFileText, setModifiedFileText] = useState([]);
  const [buttonText, setButtonText] = useState("Dupliquer");
  const [alarm, setAlarm] = useState(null);

  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);

  const [prise_de_notes, setPrise_de_notes] = useState(null);
  useEffect(() => {
    // Ensure that inputData and inputData.steps are defined before mapping
    if (inputData && inputData.steps) {
      setModifiedFileText(inputData?.steps.map((step) => step.fileText));
    }
  }, [inputData]);

  const today = new Date().toISOString().split("T")[0];
  const [userId, setUserId] = useState("");

  const [meeting, setMeeting] = useState({});
  const [participants, setParticipants] = useState([]);

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
        setParticipants(response.data?.data?.participants);
        handleAdditionalActions(response?.data.data);
        setInputData(response?.data.data);
        setLoading(false);
      }
    } catch (error) {
      // console.log("error", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getMeeting();
  }, [id]);

  const handleAdditionalActions = (data) => {
    setStoredStartTime(moment(data.start_time, "HH:mm").format("hh:mm a"));

    const { steps, lastCountSum } = data;
    setLastCountSum(lastCountSum);
    const countSum = steps.reduce((sum, slide) => sum + slide.count2, 0);
    updateTotalTime(countSum);
    setCountSum(countSum);

    const formattedData = steps
      ?.map((item) => ({
        x: item.title,
        y: [item.count1, item.count1 + item.count2, item.count2],
      }))
      .reverse();
    setChartData(formattedData);
  };

  const inputDataRef = useRef(inputData);
  useEffect(() => {
    inputDataRef.current = inputData;
  }, [inputData]);

  const closeModal = () => {
    if (!isModalOpen) {
      toast.error("Modal is not open");
    }
    setSelectedBar(null);
    setSelectedValue(null);
    setSelectedCount(null);
    setIsModalOpen(false);
    // window.location.reload()
  };

  useEffect(() => {
    const userIdFromSession = sessionStorage.getItem("user_id");
    if (userIdFromSession) {
      setUserId(userIdFromSession);
    }
  }, []);

  const pullStepDataFormChart = (data) => {
    const updatedInputData = { ...inputData, steps: data };
    setInputData(updatedInputData);
  };

  const [isLoading, setIsLoading] = useState(false);
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
  //Duplicate Meeting API
  const handleDuplicate = async (e) => {
    if (!validateParticipants(participants)) {
      return;
    }
    setIsLoading(true);
    // e.preventDefault();
    // if (buttonClicked) {
    //   return;
    // }
    setButtonClicked(true);
    // setButtonText("Dupliquer...");
    // let participantArrayWithCreatorAdded = [
    //   ...participants,
    //   {
    //     first_name: JSON.parse(sessionStorage.getItem("user")).name,
    //     last_name: JSON.parse(sessionStorage.getItem("user")).last_name,
    //     email: JSON.parse(sessionStorage.getItem("user")).email,
    //     post: JSON.parse(sessionStorage.getItem("user")).post,
    //     isCreator: true,
    //   },
    // ];
    try {
      // const newParticipants = inputData.participants.map((user) => ({
      //   id: user.id ? user.id : "",
      //   first_name: user.first_name,
      //   last_name: user.last_name,
      //   email: user.email,
      //   post: user.post,
      // }));
      const postData = {
        user_id: userId,
        title: inputData.title,
        objective: inputData.objective,
        description: inputData.description,
        priority: inputData.priority,
        type: inputData.type,
        date: inputData.date,
        start_time: inputData.start_time,
        prise_de_notes: prise_de_notes,
        total_time: countSum,
        alarm: alarm,
        steps: inputData?.steps,
        // steps: inputData?.steps?.map((slide) => ({
        //   id: slide.id,
        //   title: slide.title,
        //   time: slide.count2,
        //   count1: slide.count1,
        //   count2: slide.count2,
        //   editor_type: slide.editor_type,
        //   editor_content: slide.editor_content,
        // })),
        participants: participants,
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
        // toast.error("Request failed:", response.status, response.statusText);
        setIsLoading(false);
      } else {
        toast.error("Échec de la duplication de la réunion");
      }
    } catch (error) {
      toast.error("");
    } finally {
      setButtonClicked(false);
      setIsLoading(false);
    }
  };
  const handleChange3 = (e) => {
    const updatedInputData = {
      ...inputData,
      [e.target.name]: e.target.value,
    };
    setInputData(updatedInputData);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
      // window.location.reload()
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
  // useEffect(() => {
  //   if (inputData?.participants) {
  //     const participantsWithoutCreator = inputData.participants.filter(participant => participant.isCreator !== 1);
  //     setParticipants(participantsWithoutCreator);
  //   }
  // }, [inputData?.participants]);

  const handleParticipantChange = (index, fieldName, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][fieldName] = value;
    setParticipants(updatedParticipants);
    setInputData((prevInputData) => ({
      ...prevInputData,
      participants: updatedParticipants,
    }));
  };
  // const handleAddParticipants = () => {
  //   const newParticipant = {
  //     first_name: "",
  //     last_name: "",
  //     email: "",
  //     post: "",
  //   };
  //   setParticipants([...participants, newParticipant]);
  // };
  const handleAddParticipants = async () => {
    // VALIDATION ADDED BY ZAIN..--->:-)
    const hasEmptyFields = participants.some((participant) => {
      // Check if any value in the participant object is empty
      return (
        participant?.first_name === null ||
        participant?.last_name === null ||
        participant?.email === null ||
        participant?.post === null
      );
    });
    if (hasEmptyFields) {
      toast.error("Veuillez remplir tous les champs des participants");
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

  const handleDeleteParticipant = (index) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
    setInputData((prevInputData) => ({
      ...prevInputData,
      participants: updatedParticipants,
    }));
  };

  return (
    <div className="meetingcopy">
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div className="container-fluid py-3">
          <div className="row">
            <div className="col-md-4">
              <div className="card p-3 graph-card">
                <div className="mb-4">
                  <label className="form-label">
                    {" "}
                    {t("meeting.newMeeting.labels.Destinations")}
                  </label>
                  <input
                    type="text"
                    name="objective"
                    value={inputData.objective}
                    className="form-control"
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    {" "}
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

                {/* <div className="mb-4">
                <label className="form-label">
                  {" "}
                  {t("meeting.newMeeting.labels.notetaking")}
                </label>
                <br />
                <select
                  className="select"
                  value={inputData.prise_de_notes}
                  onChange={handleChange3}
                  name="prise_de_notes"
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
                  <label className="form-label">Contexte</label>
                  <textarea
                    type="text"
                    name="description"
                    value={inputData.description}
                    className="form-control"
                    rows={3}
                    placeholder="contexte"
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
                                onClick={() => handleDeleteParticipant(index)}
                              />
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          className="form-control mb-2"
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
                          type="text"
                          className="form-control mb-2"
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
                          type="text"
                          className="form-control mb-2"
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
                          type="text"
                          className="form-control mb-2"
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
                  {loadingParticipants ? (
                    <LoadingButton
                      loading={loadingParticipants}
                      className="w-100"
                    />
                  ) : (
                    <button
                      className="btn btn-primary createbtn px-5"
                      style={{ width: "100%" }}
                      onClick={handleAddParticipants}
                    >
                      {t("meeting.newMeeting.labels.addGuest")}
                    </button>
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
                    {" "}
                    {t("meeting.newMeeting.labels.realTimeDuration")}
                  </label>
                  <p>{total_Time + " Min"}</p>
                </div>
              </div>
            </div>
            <div className="col-md-8 mt-2">
              <div className="card graph-card2 p-3">
                <Chart
                  inputData={inputData}
                  meetingId={inputData.id}
                  puller={pullStepDataFormChart}
                  participants={participants}
                />
              </div>
              <div className="text-center my-5">
                {isLoading ? (
                  <>
                    <Button
                      variant="dark"
                      disabled
                      style={{
                        backgroundColor: "#3aa5ed",
                        border: "none",
                        padding: "11px 72px",
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
                    className="btn add"
                    onClick={handleDuplicate}
                    // disabled={buttonClicked}
                  >
                    {t("buttons.Duplicate")}
                  </button>
                )}
                <button
                  className="btn btn-danger mx-4 py-2 px-4"
                  onClick={() => navigate("/meeting")}
                >
                  {t("buttons.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MeetingCopy;