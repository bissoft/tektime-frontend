import React, { useEffect, useState } from "react";
import { IoIosCheckmarkCircleOutline, IoMdEye } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment/moment";
import axios from "axios";
import copy from "copy-to-clipboard";
import { AiFillDelete } from "react-icons/ai";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import Spinner from "react-bootstrap/Spinner";
import { GoPlusCircle } from "react-icons/go";
import { LuClock7, LuClock9 } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import ReactQuill from "react-quill";
import ModalEditor from "./ModalEditor";
import { openLinkInNewTab } from "../../Utils/openLinkInNewTab";
import { Button } from "react-bootstrap";

const Presentation = () => {
  const [notesModalShow, setNotesModalShow] = React.useState(false);
  const [decisionModalShow, setDecisionModalShow] = React.useState(false);
  const [t] = useTranslation("global");
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState([]); // response Data.
  console.log("meetingData", meetingData);
  //FORM BINDED VALUEs:
  const [steps, setSteps] = useState([]); // steps of meeting.
  const [profileData, setProfileData] = useState({}); // profile data of user who created meeting.
  const [summaryOfNotes, setSummaryOfNotes] = useState([]); // summary of notes.
  const [planOfAction, setPlanOfAction] = useState([]); // plan of action.
  const [updatedPlanAction, setUpdatedPlanAction] = useState([]); // updated
  const [decisions, setDecisions] = useState([]); // decisions.
  const [notes, setNotes] = useState([]); // notes.
  const [participants, setParticipants] = useState([]); // participants.
  console.log("participants", participants);

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState("");
  const [imageError, setImageError] = useState(false);
  const [pic, setPic] = useState();
  // For fetching the meeting data
  useEffect(() => {
    const getMeetingByID = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const REQUEST_URL = `${API_BASE_URL}/meetings/${meetingId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const _data = response.data.data;
        console.log("respons-->", response);
        if (_data) {
          setPic(response.data.data?.user?.enterprise.logo);
          setMeetingData(response.data?.data);
          setParticipants(response.data?.data?.participants);
          setPlanOfAction(response.data?.data?.plan_d_actions);
          setDecisions(
            response?.data?.data?.step_decisions
              ?.map((item) => item)
              ?.join("\n")
          ); // Take all the decisions from the steps and join them with a new line and form a single string.
          setNotes(
            response?.data?.data?.step_notes?.map((item) => item)?.join("\n")
          ); // Take all the decisions from the steps and join them with a new line and form a single string.
          setSummaryOfNotes(
            response?.data?.data?.step_notes?.map((item) => item)?.join("\n")
          ); // Take all the notes from the steps and join them with a new line and form a single string.
        } else {
          toast.error("Échec de la récupération du rapport");
        }
      } catch (error) {
        // console.log("error", error);
      } finally {
      }
    };
    getMeetingByID();
    // fetchStepNotes();
  }, [meetingId]);

  useEffect(() => {
    const getUserByID = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("user_id");
        const REQUEST_URL = `${API_BASE_URL}/users/${userId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status) {
          setProfileData(response.data.data);
          setUserProfile(response.data.data.image);
        } else {
          // toast.error("Échec de la récupération du rapport");
          setLoading(false);
        }
      } catch (error) {
        // console.log("error", error);
      } finally {
        setLoading(false);
      }
    };
    getUserByID();
  }, [meetingData]);

  // HANDLERS;
  function formatDate(inputDate) {
    if (inputDate) {
      const parts = inputDate.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}/${month}/${year}`;
      }
    }
    return inputDate;
  }
  const formattedDate = formatDate(meetingData.date);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message =
        "You have unsaved changes. Are you sure you want to leave?";
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const handleValidation = async () => {
    setIsLoading(true);
    const steps = meetingData.steps;
    const stepNotes = meetingData.step_notes;
    const stepDecisions = meetingData.step_decisions;
    // const planOfAction = meetingData.plan_d_actions;
    const cleanedPlanOfAction = planOfAction.map((action) => {
      let cleanedAction = { ...action };
      if (cleanedAction.id === "") {
        delete cleanedAction.id;
      }
      return cleanedAction;
    });
    // Validation for required fields
    const isActionValid = planOfAction.every(
      (action) => action.action.trim() !== ""
    );
    const isParticipantValid = planOfAction.every(
      (action) => action.participant_id !== null && action.participant_id !== ""
    );

    if (!isActionValid || !isParticipantValid) {
      setIsLoading(false);
      toast.error(t("presentation.fields"));
      return;
    }
    const POST_URL = `${API_BASE_URL}/meeting/${meetingId}/report`;
    const POST_REQUEST_PAYLOAD = {
      steps: steps,
      // step_notes: Array.isArray(stepNotes) && stepNotes.length > 0 ? stepNotes?.map((note) => { return { note: note } }) : [{ note: '' }],
      // step_decisions: Array.isArray(stepDecisions) && stepDecisions.length > 0 ? stepDecisions?.map((decision) => { return { decision: decision } }) : [{ decision: '' }],
      description: meetingData.description,
      step_notes: stepNotes,
      step_decisions: stepDecisions,
      plan_d_actions: cleanedPlanOfAction,
      _method: "put",
    };
    try {
      const response = await axios.post(POST_URL, POST_REQUEST_PAYLOAD, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        setLoading(false);
        // console.log("report updated Successfully", response.data.data);
        // toast.success(response.data.message);
        navigate("/meeting?from=presentation");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      // console.log("error", error);
      setLoading(false);
      setIsLoading(false);
    }
  };
  const handleValidationWithoutNavigate = async () => {
    const steps = meetingData.steps;
    const stepNotes = meetingData.step_notes;
    const stepDecisions = meetingData.step_decisions;
    // const planOfAction = meetingData.plan_d_actions;
    const cleanedPlanOfAction = planOfAction.map((action) => {
      let cleanedAction = { ...action };
      if (cleanedAction.id === "") {
        delete cleanedAction.id;
      }
      return cleanedAction;
    });
    const POST_URL = `${API_BASE_URL}/meeting/${meetingId}/report`;
    const POST_REQUEST_PAYLOAD = {
      steps: steps,
      // step_notes: Array.isArray(stepNotes) && stepNotes.length > 0 ? stepNotes?.map((note) => { return { note: note } }) : [{ note: '' }],
      // step_decisions: Array.isArray(stepDecisions) && stepDecisions.length > 0 ? stepDecisions?.map((decision) => { return { decision: decision } }) : [{ decision: '' }],
      step_notes: stepNotes,
      step_decisions: stepDecisions,
      plan_d_actions: cleanedPlanOfAction,
      _method: "put",
    };
    // console.log("update report payload-->", POST_REQUEST_PAYLOAD);
    try {
      const response = await axios.post(POST_URL, POST_REQUEST_PAYLOAD, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        setLoading(false);
        // toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      // console.log("error", error);
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    handleValidationWithoutNavigate();
    const baseUrl = window.location.origin;
    const currentURL = `${baseUrl}/presentationreport/${meetingId}`;
    const userConfirmed = window.confirm(
      "La génération d'un lien sans enregistrer les modifications supprimera toutes les modifications non enregistrées. Êtes-vous sur de vouloir continuer?"
    );

    if (userConfirmed) {
      copy(currentURL);
      openLinkInNewTab(currentURL);
      // toast.success("Lien copié : " + currentURL);
    } else {
      toast.info(
        "Action annulée. Veuillez enregistrer les modifications avant de générer le lien."
      );
    }
  };

  //=======================================DELETE PLAN OF ACTION BY ID=======================================
  const deletePlanDActionByID = async (id) => {
    //----API CALL TO DELETE ACTION
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
    } catch (error) {
      console.log("error", error);
      return;
    }
  };

  const openProfileLink = () => {
    if (profileData.link) {
      const isCompleteUrl = /^https?:\/\//i.test(profileData.image);
      const url = isCompleteUrl
        ? profileData.image
        : `http://${profileData.link}`;
      window.open(url, "_blank");
    }
  };

  // CLOCK COLOR CALCULATIONS:
  // Assuming you have real start time and real end time stored in meetingData
  const realStartTime = meetingData?.real_start_time;
  const realEndTime = meetingData?.real_end_time;
  let realPlayDuration = 0;
  // Ensure both real start time and real end time are defined
  if (realStartTime && realEndTime) {
    // Split the time strings into hours, minutes, and seconds
    const [startHours, startMinutes, startSeconds] = realStartTime
      .split(":")
      .map(Number);
    const [endHours, endMinutes, endSeconds] = realEndTime
      .split(":")
      .map(Number);

    // Calculate the difference in seconds
    let secondsDifference = (endHours - startHours) * 3600;
    secondsDifference += (endMinutes - startMinutes) * 60;
    secondsDifference += endSeconds - startSeconds;

    // Convert seconds to minutes
    const realPlayDurationMinutes = secondsDifference / 60;
    realPlayDuration = realPlayDurationMinutes;
    // console.log("Real Play Duration:", realPlayDurationMinutes, "minutes");
  }
  const totalScheduledDuration = meetingData?.total_time;
  const clockColor =
    meetingData.real_start_time <= meetingData.start_time ? "green" : "red";
  const finClockColor =
    realPlayDuration > totalScheduledDuration ? "red" : "green";

  const [selectedIndex, setSelectedIndex] = useState(null);
  const handleItemClick = async (index, id) => {
    console.log("index-->", index);
    console.log("id-->", id);
    setSelectedIndex(index === selectedIndex ? null : index);

    const newAttendanceStatus = participants[index].attandance ? 0 : 1;
    const reuestBODY = {
      first_name: participants[index].first_name,
      email: participants[index].email,
      attandance: newAttendanceStatus,
      _method: "put",
    };
    const requestURL = `${API_BASE_URL}/participants/${id}`;

    try {
      const response = await axios.post(requestURL, reuestBODY, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = response?.data?.data;
      let updatedParticipants = [...participants];
      updatedParticipants[index] = data;
      setParticipants(updatedParticipants);
    } catch (error) {
      console.log("FAILED TO UPDATE THE ATTENDANCE", error);
    }
  };

  const handleNavigate = (item) => {
    if (item.isCreator === 1) {
      navigate("/profile");
    } else {
      navigate(`/participant/${item.id}`);
    }
  };
  return (
    <div className="presentation">
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <main className="container-fluid py-5">
          <section className="d-flex justify-content-between main-presen">
            <div className="d-flex justify-content-center align-items-center mb-2">
              <div className="">
                {/* <img
                  src="/Assets/Group 492 (2).png"
                  className="img-fluid"
                  alt="tektime"
                /> */}
                {pic === null ? (
                  <img
                    src="/Assets/logo2.png"
                    // className="img-fluid"
                    style={{ height: "9rem", mixBlendMode: "multiply" }}
                    alt="tektime"
                  />
                ) : (
                  <img
                    src={Assets_URL + pic}
                    className="user-img"
                    // style={{ height: "9rem", mixBlendMode: "multiply" }}
                    alt="tektime"
                    onErrorCapture={(e) => {
                      e.target.src = "/Assets/logo2.png";
                    }}
                  />
                )}
              </div>
            </div>
            <div className="text-center presen-title mb-2">
              <div>
                <h2>{meetingData?.objective} </h2>
              </div>
              <div>
                {formattedDate} |{" "}
                {(() => {
                  const startTime = meetingData.real_start_time;
                  const endTime = meetingData.real_end_time;
                  const totalHHMM = moment.duration(
                    moment(endTime, "HH:mm").diff(moment(startTime, "HH:mm"))
                  );
                  return totalHHMM.hours() + "h" + totalHHMM.minutes();
                })()}{" "}
                |{" "}
              </div>
              <div>
                <h4>{meetingData.title} </h4>
              </div>
            </div>

            <div className="card card1 p-3 text-center mb-2">
              <div className="card-title">
                <h6>{t("presentation.statistics")}</h6>
              </div>
              <div className="d-flex justify-content-center gap-5">
                <div>
                  <span className="start">{t("presentation.start")}</span>{" "}
                  <br />
                  <LuClock7 size={20} color={clockColor} /> <br />
                  <span className="time">
                    {moment(meetingData.real_start_time, "HH:mm").format(
                      "HH[h]mm"
                    )}
                  </span>
                </div>{" "}
                <div>
                  <span className="start">{t("presentation.end")}</span> <br />
                  <LuClock9 size={20} color={finClockColor} /> <br />
                  <span className="time">
                    {moment(meetingData.real_end_time, "HH:mm").format(
                      "HH[h]mm"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
          <br />
          <section className="row py-1">
            <div className="col-md-6 mb-2">
              <div className="card card2 p-3 ">
                <div>
                  <h5>{t("presentation.agenda")}</h5>
                </div>
                {/* <div className=""> */}
                <textarea
                  type="text"
                  name="description"
                  value={meetingData?.description}
                  // className="form-control "
                  rows={5}
                  placeholder="contexte"
                  onChange={(e) => {
                    setMeetingData({
                      ...meetingData,
                      description: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <div className="card card2 p-3 ">
                <div>
                  <h5>{t("presentation.participants")}</h5>
                </div>
                <div className="text-start mb-2">
                  <img
                    // src={
                    //   `${profileData.picture}`
                    //     ? `${Assets_URL}/${profileData.picture}`
                    //     : "/Assets/avatar.jpeg"
                    // }
                    // src={profileData.image || "/Assets/avatar.jpeg"}
                    src={
                      imageError
                        ? "/Assets/avatar.jpeg"
                        : `${Assets_URL}/${userProfile}`
                    }
                    onError={() => setImageError(true)}
                    style={{ cursor: "pointer" }}
                    alt="profile"
                    onClick={openProfileLink}
                    className="profileimg"
                  />
                  <b>
                    {" - "}
                    {profileData.name}
                    {" - "}
                    {profileData.last_name}
                    {" - "}
                    {Array.isArray(profileData.enterprise) &&
                      profileData.enterprise?.map((enterprise) => (
                        <>{enterprise?.name}</>
                      ))}
                    {" - "}
                    {profileData?.teams?.map((team) => (
                      <>{team?.name}</>
                    ))}
                    {" - "}
                    {profileData.post}{" "}
                  </b>
                </div>
                <div className="resume">
                  <ul className="list-unstyled">
                    {meetingData?.participants
                      ?.filter(
                        (item) =>
                          item.first_name !== null || item.last_name !== null
                      )
                      ?.map((item, index) => (
                        <li key={item.id} className="d-flex align-items-center">
                          {" "}
                          <IoIosCheckmarkCircleOutline
                            // color={selectedIndices.includes(index) ? "red" : "green"}
                            color={
                              participants[index]?.attandance === 0
                                ? "green"
                                : "red"
                            }
                            size={"18px"}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              handleItemClick(index, participants[index].id)
                            }
                          />{" "}
                          &nbsp;
                          <input
                            readOnly
                            type="text"
                            name="participant"
                            style={{ cursor: "pointer" }}
                            value={`${item.first_name} ${item.last_name}`}
                            // onChange={(e) => handleChange2(e, index)}
                            onClick={() => handleNavigate(item)}
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
          {/* 2nd GRID STARTS */}
          <section className="row py-1">
            <div className="col-md-6 mb-2">
              <div className="card card2 p-3 ">
                <div>
                  <h5>{t("presentation.summary")}</h5>
                </div>
                {/* <div className="resume"> */}
                <ol className="resume">
                  {meetingData?.steps?.map((item, index) => (
                    <li key={index}>
                      <input
                        type="text"
                        name="title"
                        value={item.title}
                        // onChange={(e) => handleChange2(e, index)}
                        onChange={(e) => {
                          const stepData = [...meetingData.steps];
                          stepData[index].title = e.target.value;
                          setMeetingData({
                            ...meetingData,
                            steps: stepData,
                            // report_steps: stepData,
                          });
                        }}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="col-md-6 mb-2">
              {/* NOTES EDITOR */}
              <div className="card card2 p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <IoMdEye
                    style={{
                      cursor: "pointer",
                      position: "sticky",
                      backgroundColor: "white",
                    }}
                    size={"20px"}
                    color="green"
                    onClick={() => setNotesModalShow(true)}
                  />
                  <h5 className="m-auto">{t("presentation.notes")}</h5>
                </div>
                <div className="resume">
                  <ModalEditor
                    title="Résumé de la prise de notes"
                    onChange={(value) => {
                      const updatedMeetingData = { ...meetingData };
                      updatedMeetingData.step_notes = value.split("\n");
                      setMeetingData(updatedMeetingData);
                    }}
                    defaultValue={(() => {
                      let filteredNotes = [];
                      meetingData?.step_notes?.map((note) => {
                        if (note != null) {
                          console.log(note);
                          filteredNotes.push(note);
                          return note;
                        }
                      });
                      return filteredNotes.join("\n");
                    })()}
                    show={notesModalShow}
                    onHide={() => setNotesModalShow(false)}
                  />
                  <div
                    className="mt-4"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let filteredNotes = [];
                        meetingData?.step_notes?.map((note) => {
                          if (note != null) {
                            console.log(note);
                            filteredNotes.push(note);
                            return note;
                          }
                        });
                        return filteredNotes.join("\n");
                      })(),
                    }}
                  />
                  {/* <textarea
                    type="text"
                    name="step_notes"
                    value={(() => {
                      let filteredNotes = [];
                      meetingData?.step_notes?.map((note) => {
                        if (note != null) {
                          console.log(note);
                          filteredNotes.push(note);
                        }
                      });
                      return filteredNotes.join("\n");
                    })()}
                    className="form-control "
                    rows={5}
                    placeholder="Summary of Notes Taken on each step"
                    onChange={(e) => {
                      const updatedMeetingData = { ...meetingData };

                      updatedMeetingData.step_notes =
                        e.target.value.split("\n");
                      // .map((note) => ({ note: note }));
                      setMeetingData(updatedMeetingData);
                    }}
                  /> */}
                </div>
              </div>
            </div>
          </section>
          {/* 3rd GRID */}
          <section className="row py-1">
            <div className="col-md-6 mb-2">
              {/* Plan of Action */}
              <div className="card card2 p-3 table-container ">
                <h5 className="card-title">{t("presentation.planDActions")}</h5>
                <div className="cardbody resume">
                  <div className=" row  subtitle  text-body-secondary">
                    <div className="col-md-2 ">
                      <span>{t("presentation.order")}</span>
                    </div>
                    <div className=" col-md-3 ">
                      <span>{t("presentation.action")}</span>
                    </div>
                    <div className="col-md-2 ">
                      <span>{t("presentation.carrier")}</span>
                    </div>
                    <div className="col-md-2">
                      <span>{t("presentation.dueDate")}</span>
                    </div>
                    <div className=" col-md-2">
                      <span>{t("presentation.status")}</span>
                    </div>
                  </div>
                  {planOfAction?.map((action, index) => {
                    return (
                      <div
                        className="row mt-3"
                        style={{ borderBottom: "1px solid #ccc" }}
                        key={index}
                      >
                        <div className="col-md-2">
                          <select
                            className="form-select form-select-sm"
                            value={action.order}
                            onChange={(e) => {
                              const updatedPlanOfAction = [...planOfAction];
                              updatedPlanOfAction[index].order = e.target.value;
                              setUpdatedPlanAction(updatedPlanOfAction);
                            }}
                          >
                            {Array.from({ length: 11 }).map((_, i) => (
                              <option value={i}>{i}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <textarea
                            value={action.action}
                            name="action"
                            onChange={(e) => {
                              const updatedPlanOfAction = [...planOfAction];
                              updatedPlanOfAction[index].action =
                                e.target.value;
                              setUpdatedPlanAction(updatedPlanOfAction);
                            }}
                            rows={2}
                            placeholder="Action"
                            maxLength={100}
                            required={true}
                            className="wrapped-textarea"
                          />
                        </div>

                        <div className="col-md-2">
                          <select
                            className="form-select form-select-sm"
                            name="participant_id"
                            value={action.participant_id}
                            onChange={(e) => {
                              const updatedPlanOfAction = [...planOfAction];
                              updatedPlanOfAction[index].participant_id =
                                e.target.value;
                              setUpdatedPlanAction(updatedPlanOfAction);
                            }}
                            required={true}
                          >
                            <option value="">Select participant</option>
                            {participants
                              ?.filter(
                                (item) =>
                                  item.first_name !== null ||
                                  item.last_name !== null
                              )
                              ?.map((user, index) => (
                                <option value={user?.id}>
                                  {user.first_name} {user.last_name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <input
                            type="text"
                            value={Math.floor(action.action_days)}
                            name="action_days"
                            onChange={(e) => {
                              const updatedPlanOfAction = [...planOfAction];
                              updatedPlanOfAction[index].action_days =
                                e.target.value;
                              setUpdatedPlanAction(updatedPlanOfAction);
                            }}
                          />
                        </div>

                        <div className="col-md-2">
                          <select
                            className="form-select form-select-sm"
                            value={action.status}
                            name="status"
                            onChange={(e) => {
                              const updatedPlanOfAction = [...planOfAction];
                              updatedPlanOfAction[index].status =
                                e.target.value;
                              setUpdatedPlanAction(updatedPlanOfAction);
                            }}
                          >
                            <option value={"Todo"}>
                              {t("presentation.todo")}
                            </option>
                            <option value={"InProgress"}>
                              {t("presentation.inprogress")}
                            </option>
                            <option value={"Finished"}>
                              {t("presentation.finished")}
                            </option>
                          </select>
                        </div>

                        <div className="col-1">
                          <button
                            className="btndel"
                            onClick={async () => {
                              // If the action has an id, then it means it was saved to the database. SO we need to delete it from the database.
                              planOfAction[index].id &&
                                (await deletePlanDActionByID(
                                  planOfAction[index].id
                                ));

                              const updatedPlanOfAction = [...planOfAction];
                              updatedPlanOfAction.splice(index, 1); // Remove the element at the specified index
                              setUpdatedPlanAction(updatedPlanOfAction);
                              setPlanOfAction(updatedPlanOfAction);
                            }}
                          >
                            <AiFillDelete size={"15px"} color="red" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex justify-content-center text-center mt-2 gap-2">
                  <div>
                    <GoPlusCircle
                      size="30px"
                      onClick={() => {
                        setPlanOfAction([
                          ...(planOfAction || []),
                          {
                            id: "",
                            action: "",
                            participant_id: "",
                            action_days: 0,
                            order: 0,
                            status: "Todo",
                          },
                        ]);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-2">
              {/* DECISIONS */}
              <div className="card card2 p-3 ">
                <div className="d-flex  align-items-center justify-content-between">
                  <IoMdEye
                    style={{
                      cursor: "pointer",
                      position: "sticky",
                      backgroundColor: "white",
                    }}
                    size={"20px"}
                    color="green"
                    onClick={() => setDecisionModalShow(true)}
                  />
                  <h5 className="m-auto">{t("presentation.decisions")}</h5>
                </div>
                <div className="resume">
                  <ModalEditor
                    title="Décisions prises"
                    onChange={(value) => {
                      const updatedMeetingData = { ...meetingData };
                      updatedMeetingData.step_decisions = value.split("\n");
                      setMeetingData(updatedMeetingData);
                    }}
                    defaultValue={meetingData?.step_decisions
                      ?.filter((note) => {
                        return note != null;
                      })
                      .join("\n")}
                    show={decisionModalShow}
                    onHide={() => setDecisionModalShow(false)}
                  />
                  <div
                    className="mt-4"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let filteredDecisions = [];
                        meetingData?.step_decisions?.map((note) => {
                          if (note != null) {
                            filteredDecisions.push(note);
                          }
                          return note;
                        });
                        return filteredDecisions.join("\n");
                      })(),
                    }}
                  />
                  {/* <textarea
                    type="text"
                    name="step_decisions"
                    value={(() => {
                      let filteredDecisions = [];
                      meetingData?.step_decisions?.map((note) => {
                        if (note != null) {
                          filteredDecisions.push(note);
                        }
                        return note;
                      });
                      return filteredDecisions.join("\n");
                    })()}
                    onChange={(e) => {
                      const updatedMeetingData = { ...meetingData };
                      updatedMeetingData.step_decisions =
                        e.target.value.split("\n");
                      setMeetingData(updatedMeetingData);
                    }}
                    rows={5}
                    placeholder="Summary of Decisions Taken"
                  /> */}
                </div>
              </div>
            </div>
          </section>
          <div className="text-center d-flex gap-3 justify-content-center align-items-center pres-btn">
            {isLoading ? (
              <>
                <Button
                  variant="dark"
                  disabled
                  style={{
                    backgroundColor: "#3aa5ed",
                    border: "none",
                    width: "25%",
                    height: " min-content",
                    padding: "6px 0px",
                  }}
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
                className="btn btn-primary  my-4"
                style={{ width: "25%" }}
                onClick={handleValidation}
              >
                {t("presentation.register")}
              </button>
            )}
            <button
              className="btn btn-primary  my-4"
              style={{ width: "15%" }}
              onClick={handleCopyToClipboard}
            >
              {t("presentation.generateLink")}
            </button>
            <button
              className="btn btn-primary  my-4"
              style={{ width: "15%" }}
              onClick={() => navigate("/meeting?from=presentation")}
            >
              {t("presentation.cancel")}
            </button>
          </div>
        </main>
      )}
    </div>
  );
};

export default Presentation;