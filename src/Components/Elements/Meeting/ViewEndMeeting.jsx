import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useRef } from "react";
import Spinner from "react-bootstrap/Spinner";
import { NewMeetingData } from "../../Utils/Meeting";
import Chart from "./Chart";
import { useTranslation } from "react-i18next";

const ViewEndMeeting = () => {
  const [t] = useTranslation("global");
  let navigate = useNavigate();
  const { id } = useParams();
  const [chartData, setChartData] = useState([]);
  const [inputData, setInputData] = useState([]);
  const [lastCountSum, setLastCountSum] = useState(0);
  const [countSum, setCountSum] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const [stageStart, setStageStart] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [data, setData] = useState([]);
  const [storedStartTime, setStoredStartTime] = useState(null);
  const [totalSelectedCount, setTotalSelectedCount] = useState(0);
  const [accumulatedSelectedCounts, setAccumulatedSelectedCounts] = useState(
    []
  );
  const [loading, setLoading] = useState(true);
  const [alarm, setAlarm] = useState(null);

  const [modifiedFileText, setModifiedFileText] = useState([]);
  useEffect(() => {
    // Ensure that inputData and inputData.steps are defined before mapping
    if (inputData && inputData.steps) {
      setModifiedFileText(inputData.steps.map((step) => step.fileText));
    }
  }, [inputData]);
  const [isDisabled, setIsDisabled] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const [editorContent, setEditorContent] = useState("");
  const [userId, setUserId] = useState("");
  const [meeting, setMeeting] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // console.error("Failed to fetch data:", response);
          // Handle the error, show a message, etc.
        } else {
          const data = await response.json();
          if (response.data?.data?.alarm == "1") {
            setAlarm(true);
          } else {
            setAlarm(false);
          }
          setMeeting(response.data?.data);
          handleAdditionalActions(data.data);
          setInputData(data.data);
        }
      } catch (error) {
        // console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAdditionalActions = (data) => {
    setStoredStartTime(moment(data.start_time, "HH:mm").format("hh:mm a"));

    const { steps, lastCountSum } = data;
    setLastCountSum(lastCountSum);

    const countSum = steps.reduce((sum, slide) => sum + slide.count2, 0);
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
  // Update inputDataRef whenever inputData changes
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
  };

  useEffect(() => {
    // Read from local storage and populate the initial state if available
    const savedInputData = localStorage.getItem(`meetingData_${meetingId}`);
    if (savedInputData) {
      setInputData(JSON.parse(savedInputData));
    }
  }, []);
  useEffect(() => {
    // Get the user's ID from sessionStorage during component initialization
    const userIdFromSession = sessionStorage.getItem("user_id");
    if (userIdFromSession) {
      setUserId(userIdFromSession);
    }
  }, []);

  const meetingId = inputData?.id;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    // Attach the event listener when the modal is open
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Remove the event listener when the modal is closed or the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  return (
    <div className="meetingedit">
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
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    {" "}
                    {t("meeting.newMeeting.labels.exchangeType")}'
                  </label>
                  <br />

                  <select
                    className="select"
                    name="type"
                    value={inputData.type}
                    disabled

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
                    {" "}
                    {t("meeting.newMeeting.labels.objective")}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={inputData.title}
                    className="form-control"
                    disabled

                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    {" "}
                    {t("meeting.newMeeting.labels.priority")}
                  </label>
                  <br />
                  <select
                    id="myDropdown1"
                    className="select"
                    value={inputData.priority}
                    name="priority"
                    disabled

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
                    className="form-control"
                    rows={3}
                    placeholder="contexte"
                    disabled

                  />
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
                      // onChange={(e) => setAlarm(true)}
                    // readOnly

                    />
                    <span> {t("meeting.newMeeting.alarmText.yes")}</span>

                    <input
                      type="radio"
                      name="alarm"
                      value="false"
                      checked={alarm === false ? true : false}
                      // onChange={(e) => setAlarm(false)}
                      // readOnly


                    />
                    <span> {t("meeting.newMeeting.alarmText.no")}</span>
                  </div>
                </div>
                <div className="mb-4">
                  {inputData?.participants
                    ?.filter((participant) => participant.isCreator !== 1)
                    .map((participant, index) => {
                      return (
                        <div key={index} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <label htmlFor="">{`Invities ${index + 1}`}</label>
                          </div>
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="First name"
                            value={participant.first_name}
                    disabled

                          />

                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Last name"
                            value={participant.last_name}
                    disabled

                          />
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Email"
                            value={participant.email}
                    disabled

                          />
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Post"
                            value={participant.post}
                    disabled

                          />
                        </div>
                      );
                    })}
                </div>
                <div className="mb-4">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    min={today}
                    name="date"
                    value={inputData.date}
                    className="form-control"
                    disabled

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
                    disabled

                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    {" "}
                    {t("meeting.newMeeting.labels.realTimeDuration")}
                  </label>
                  <p>{countSum + " Min"}</p>
                </div>
              </div>
            </div>
            <div className="col-md-8 mt-2">
              <div className="card graph-card2 p-3">
                <Chart data={inputData} meetingId={id} />
              </div>
              <div className="text-center my-5 d-flex justify-content-center editbutton">
                <div>
                  <button
                    className="btn add mb-3"
                    style={{ width: "200%" }}
                    onClick={() => navigate("/meeting?from=completeedit")}
                  >
                    {t("buttons.cancel1")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ViewEndMeeting;