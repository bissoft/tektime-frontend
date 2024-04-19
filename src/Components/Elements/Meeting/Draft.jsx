import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import Autosuggest from "react-autosuggest";
import { toast } from "react-toastify";
import { Button, Spinner } from "react-bootstrap";
import lodash from "lodash";
// import { validateParticipants } from "./UpdateMeeting";
import ShowIF from "../../Utils/ShowIF";
import LoadingButton from "../../Utils/LoadingButton";

const Draft = () => {
  const [t] = useTranslation("global");
  const { id } = useParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(false);

  //Add Participants field functionality
  const [participants, setParticipants] = useState([]);
  const [meetingParticipants, setMeetingParticipants] = useState([]);
  const [meetingSteps, setMeetingSteps] = useState([]);
  const [meeting, setMeeting] = useState({});
  // const [meetingId, setMeetingId] = useState("");
  const [buttonText, setButtonText] = useState("Valider");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const [prise_de_notes, setPrise_de_notes] = useState(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const getMeeting = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        console.log("response", response.data.data);
        const alarmValue = response.data?.data?.alarm;
        setAlarm(
          alarmValue === "1"
            ? true
            : alarmValue === "0" || alarmValue === null
            ? false
            : null
        );
        setPrise_de_notes(
          response.data.data?.prise_de_notes === null
            ? "Manual"
            : response.data.data?.prise_de_notes
        );

        const responsePT = response.data.data?.participants;
        setMeetingParticipants(responsePT);
        const responseData = response.data.data.steps;
        setMeetingSteps(responseData);
        setMeeting(response.data?.data);
        if (response.data?.data && response.data?.data?.objective) {
          setValue(response.data?.data?.objective);
        } else {
          setValue("");
        }
      }
    } catch (error) {
      // console.log("error", error);
    }
  };

  useEffect(() => {
    getMeeting();
  }, [id]);

  // ==============================================> PARTICIPANTS FUNCTIONS START <=====================================
  const handleParticipantChange = (index, field, value) => {
    const tempParticipants = [...meetingParticipants];
    tempParticipants[index][field] = value;
    setMeetingParticipants(tempParticipants);
  };
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

  const handleAddParticipants = lodash.debounce(
    async () => {
      const isValid = validateParticipants(meetingParticipants);
      if (!isValid) {
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
          setMeetingParticipants([...meetingParticipants, newParticipant]);
        }
        console.log("Participant successfully created:", newParticipant);
      } catch (error) {
        setLoadingParticipants(false);
        console.error("Error while adding participant:", error);
      }
    },
    300,
    {
      leading: true,
      trailing: false,
    }
  );

  const handleCancelParticipants = async (item, indexToRemove) => {
    if (!item.id) {
      setMeetingParticipants((prevParticipants) => {
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
        setMeetingParticipants((prevParticipants) => {
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

  const handleParticipantBlur = async (index, field, value) => {
    let URL = `${API_BASE_URL}/participants`;
    const participant = meetingParticipants[index];

    if (participant.id) {
      URL = `${API_BASE_URL}/participants/${participant.id}`;
      participant._method = "put";
    }

    try {
      participant[field] = value;
      const response = await axios.post(URL, participant, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        const newlySavedPArticipant = response.data.data;
        let participantsCopy = [...meetingParticipants];
        participantsCopy[index] = newlySavedPArticipant;
        setMeetingParticipants(participantsCopy);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // ==============================================> PARTICIPANTS FUNCTIONS END <=====================================

  // ==============================================> STEPS FUNCTIONS START <=====================================
  const handleAddStep = lodash.debounce(
    async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${API_BASE_URL}/steps`,
          { meeting_id: id, count2: 0 },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        const newStep = response.data.data;
        if (response.status) {
          setMeetingSteps([...meetingSteps, newStep]);
        }
      } catch (error) {
        console.error("Error while adding step:", error);
      } finally {
        setLoading(false);
      }
      // CALLBACK FUNCTION ENDS.
    },
    300,
    {
      leading: true,
      trailing: false,
    }
  );

  const handleDeleteStep = async (item, index) => {
    if (index === 0) {
      return;
    } else {
      try {
        const updatedGroups = [...meetingSteps];
        updatedGroups.splice(index, 1);
        // Update the sequence for each group
        updatedGroups.forEach((group, i) => {
          group.step = i + 1;
        });

        setMeetingSteps(updatedGroups);
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
        // console.error("Error deleting step", error);
      }
    }
  };

  const handleCountChange = (item, event) => {
    const temp = JSON.parse(JSON.stringify(meetingSteps));
    temp.forEach((step) => {
      if (step.id === item.id) {
        step.count2 = parseInt(event.target.value, 10) || 0;
        step.time = step.count2;
      }
    });
    setMeetingSteps(temp);
  };

  const handleIncrement = async (index, item) => {
    if (isTitleBlurred) {
      // Update count2 only if title is blurred
      const temp = JSON.parse(JSON.stringify(meetingSteps));
      temp.forEach((step) => {
        if (step.id === item.id) {
          step.count2 += 1;
          step.time = step.count2;
        }
      });
      setMeetingSteps(temp);
      // setIsTitleBlurred(false); // Reset flag
    }
  };
  const handleDecrement = async (index, item) => {
    if (isTitleBlurred) {
      const temp = JSON.parse(JSON.stringify(meetingSteps));
      temp.forEach((step) => {
        if (step.id === item.id && step.count2 > 1) {
          step.count2 = Math.max(temp[index].count2 - 1, 1);
          step.time = step.count2;
        }
      });
      setMeetingSteps(temp);
    }
  };

  const handleInputChangeStep = (item, event) => {
    const temp = JSON.parse(JSON.stringify(meetingSteps));
    temp.forEach((step, index) => {
      if (step.id === item.id) {
        step.title = event.target.value;
      }
    });
    setMeetingSteps(temp);
  };

  const [isTitleBlurred, setIsTitleBlurred] = useState(false);
  const handleStepBlur = async (index, field, value) => {
    setIsTitleBlurred(true); // Set blurred flag
    let URL = `${API_BASE_URL}/steps`;
    const step = meetingSteps[index];

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

      console.log("response-->", response);
      if (response.status === 200 || response.status === 201) {
        const updatedStep = response.data.data;
        // Update the count2 value in the inputGroups state
        setMeetingSteps((prevInputGroups) => {
          const newInputGroups = [...prevInputGroups];
          newInputGroups[index] = updatedStep;
          return newInputGroups;
        });
      } else {
        console.error("Failed to update step:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating step:", error);
    }
  };

  let total_time = 0;
  meetingSteps?.forEach((group) => {
    total_time += parseInt(group.count2) || 0; // Add each count to totalCount
  });

  // ==============================================> STEPS FUNCTIONS END <=====================================

  const [data, setData] = useState({});

  const updateMeeting = async (isAddStepButtonClicked) => {
    try {
      // setLoading(true);
      const { id, type, title, date, start_time, description, priority } =
        meeting;

      const updatedSteps = meetingSteps.map((step) => ({
        ...step,
        id: step.id,
        meeting_id: id,
      }));

      const updatedParticipants = meetingParticipants.map((participant) => ({
        ...participant,
        id: participant.id,
        meeting_id: id,
      }));

      const payload = {
        objective: value,
        type,
        title,
        date,
        start_time,
        description: description !== undefined ? description : null,
        total_time,
        priority,
        prise_de_notes: prise_de_notes,
        participants: updatedParticipants,
        steps: updatedSteps,
        alarm: alarm,
        status: "draft",
        _method: "put",
      };
      payload.steps.sort((a, b) => a.id - b.id);

      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        const updatedSteps = response.data.data.steps;
        setMeetingSteps(updatedSteps);
        // setLoading(false);
        updatedSteps.sort((a, b) => a.id - b.id);
        if (isAddStepButtonClicked) {
          setMeetingSteps((prev) => {
            console.log("prev step", prev);
            const previousStep = prev[prev.length - 1];
            const count2Value = previousStep ? previousStep.count2 : 0;
            return [
              ...prev,
              {
                order_no: meetingSteps.length + 1,
                step: meetingSteps.length + 1,
                title: "",
                count1: count2Value,
                count2: 0,
                time: 0,
              },
            ];
          });
        }
        // setButtonDisabled(true);
        const updatedParticipants = response.data.data.participants;
        updatedParticipants.sort((a, b) => a.id - b.id);
        setMeetingParticipants(updatedParticipants);
        setData(response.data.data);
      }
    } catch (error) {
      // console.error("Error updating draft", error);
    } finally {
      // setLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const updateMeetingValidate = async () => {
    setIsLoading(true);
    try {
      setButtonDisabled(true);
      const {
        id,
        type,
        title,
        date,
        start_time,
        description,
        prise_de_notes,
        priority,
      } = meeting;

      const allSteps = [
        ...meetingSteps.filter(
          (step, index, self) =>
            index ===
            self.findIndex(
              (s) => s.title === step.title && s.count2 === step.count2
            )
        ),
      ];

      const allParticipants = [
        ...participants,
        ...meetingParticipants.filter(
          (participant, index, self) =>
            index ===
            self.findIndex(
              (p) =>
                p.first_name === participant.first_name &&
                p.last_name === participant.last_name &&
                p.email === participant.email &&
                p.post === participant.post
            )
        ),
      ];

      const payload = {
        objective: value,
        type,
        title,
        date,
        start_time,
        description: description !== undefined ? description : null,
        total_time,
        priority,
        prise_de_notes,
        participants: allParticipants,
        steps: allSteps,
        alarm: alarm,
        status: "draft",
        _method: "put",
      };

      // Check for duplicate step names
      const stepNames = allSteps?.map((step) => step.title);
      const duplicateStepNames = stepNames?.filter(
        (stepName) =>
          stepNames.indexOf(stepName) !== stepNames.lastIndexOf(stepName)
      );
      if (duplicateStepNames.length > 0) {
        toast.error(t("messages.stepNames"));
        setButtonText("Valider");

        setButtonDisabled(false);
        setIsLoading(false);

        return;
      }

      const nullSteps = allSteps?.filter((step) => !step.title || !step.count2);
      if (nullSteps.length > 0) {
        toast.error(t("messages.stepTime"));
        setButtonText("Valider");
        setButtonDisabled(false);
        setIsLoading(false);

        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        const responseSteps = response.data.data.steps;
        responseSteps.sort((a, b) => a.id - b.id);
        setData(response.data.data);
        setButtonDisabled(false);
        // setData({ ...response.data.data, steps: responseSteps });
        navigate(`/validateMeeting/${response.data.data.id}`, {
          state: { inputData: data },
        });
        setIsLoading(false);
      }
    } catch (error) {
      // console.error("Error updating draft", error);
      setButtonDisabled(false);
    } finally {
      // setLoading(false);
      setIsLoading(false);
    }
  };

  const handleInputBlur = () => {
    updateMeeting();
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

  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const lowerCasedObjectives = objectives?.map((obj) => {
    if (obj) {
      return {
        name: obj.toLowerCase(),
      };
    }
    return null;
  });

  function getSuggestions(value) {
    return lowerCasedObjectives?.filter((obj) =>
      obj?.name.includes(value?.trim()?.toLowerCase())
    );
  }

  return (
    <div className="new-meeting">
      <div className="container-fluid py-3">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card p-5">
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
                    // placeholder: "Type any character",
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
                  name="type"
                  value={meeting.type}
                  onChange={(e) =>
                    setMeeting({
                      ...meeting,
                      type: e.target.value,
                    })
                  }
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
                  value={meeting.title}
                  className="form-control"
                  name="title"
                  onChange={(e) =>
                    setMeeting({
                      ...meeting,
                      title: e.target.value,
                    })
                  }
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
                  name="priority"
                  value={meeting.priority}
                  onChange={(e) =>
                    setMeeting({
                      ...meeting,
                      priority: e.target.value,
                    })
                  }
                  onBlur={handleInputBlur}
                >
                  <option value="">
                    {t("meeting.newMeeting.options.priorities.priority")}
                  </option>
                  <option value="Critique">
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
                  className="form-control"
                  rows={5}
                  name="description"
                  value={meeting.description}
                  onChange={(e) =>
                    setMeeting({
                      ...meeting,
                      description: e.target.value,
                    })
                  }
                  onBlur={handleInputBlur}
                  placeholder={t("meeting.newMeeting.placeholders.context")}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  min={today}
                  name="date"
                  value={meeting.date}
                  className="form-control"
                  onChange={(e) =>
                    setMeeting({
                      ...meeting,
                      date: e.target.value,
                    })
                  }
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
                  value={meeting.start_time}
                  className="form-control "
                  onChange={(e) =>
                    setMeeting({
                      ...meeting,
                      start_time: e.target.value,
                    })
                  }
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
                    onBlur={handleInputBlur}
                  />
                  <span> {t("meeting.newMeeting.alarmText.yes")}</span>
                  <input
                    // value={!meeting.alarm}
                    value="false"
                    type="radio"
                    name="alarm"
                    checked={alarm === false ? true : false}
                    onChange={(e) => setAlarm(false)}
                    onBlur={handleInputBlur}
                  />
                  <span> {t("meeting.newMeeting.alarmText.no")}</span>
                </div>
              </div>

              {/* PARTICIPANTS MAPPED */}
              <div className="mb-4">
                {meetingParticipants?.map((participant, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <label htmlFor="">{`Invité ${index + 1}`}</label>
                      {/* {index >= 1 && ( */}
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
                      value={participant.first_name}
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
                      value={participant.last_name}
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
                      value={participant.email}
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
                      value={participant.post}
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
              <div>
                {meetingSteps?.map((group, index) => (
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
                            onClick={() => handleDeleteStep(group, index)}
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
                {loading ? (
                  <LoadingButton
                    loading={loading}
                    className="w-100"
                  ></LoadingButton>
                ) : (
                  <button
                    className="btn btn-primary createbtn px-5 mb-4"
                    style={{ width: "100%" }}
                    onClick={async () => {
                      if (
                        meetingSteps[meetingSteps.length - 1].title === "" ||
                        meetingSteps[meetingSteps.length - 1].count2 === 0
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
                )}
              </div>

              <br />
              <div className="d-flex justify-content-between">
                <div>
                  <h6>{t("meeting.newMeeting.labels.plannedTime")}</h6>
                </div>
                <div>
                  <h6>{t("meeting.newMeeting.labels.realTimeDuration")}</h6>
                  <span>{total_time} Min </span>
                </div>
              </div>
              <div className="d-flex  justify-content-center pt-3">
                {isLoading ? (
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
                    className="form-control btn btn-primary createbtn px-5"
                    onClick={updateMeetingValidate}
                  >
                    {buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Draft;