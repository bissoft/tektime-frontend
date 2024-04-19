import React, { useEffect, useState } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment/moment";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import { LuClock7, LuClock9 } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";
import { Modal, Stack } from "react-bootstrap";
import Chart from "./Chart";
import PlanDChart from "./PlanDChart";

const Presentation = () => {
  const location = window.location.href;
  const [len, setLen] = useState();
  const [leftBtn, setLeftBtn] = useState(false);

  const [imageError, setImageError] = useState(false);
  const [t] = useTranslation("global");
  const [meetingId, setMeetingId] = useState(useParams().id);
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState([]); // response Data.
  //FORM BINDED VALUEs:
  const [steps, setSteps] = useState([]); // steps of meeting.
  const [profileData, setProfileData] = useState({}); // profile data of user who created meeting.
  const [summaryOfNotes, setSummaryOfNotes] = useState([]); // summary of notes.
  const [planOfAction, setPlanOfAction] = useState([]); // plan of action.
  const [decisions, setDecisions] = useState([]); // decisions.
  const [notes, setNotes] = useState([]); // notes.
  const [participants, setParticipants] = useState([]); // participants.
  const [loading, setLoading] = useState(true);
  const [pic, setPic] = useState();
  const [meetingCount, setMeetingCount] = useState();
  const [userProfile, setUserProfile] = useState("");

  console.log("meetingCount: ", meetingCount);
  // For fetching the meeting data
  useEffect(() => {
    const getMeetingByID = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const REQUEST_URL = `${API_BASE_URL}/meetingView/${meetingId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const _data = response.data.data;
        if (_data) {
          setMeetingCount(_data?.destinationCount);
          setImage(response.data.data?.user?.image);
          setPic(response.data.data?.user?.enterprise.logo);
          setMeetingData(response.data.data);
          setParticipants(response.data?.data?.participants);
          setPlanOfAction(response.data?.data?.plan_d_actions);
          setLeftBtn(false);
          setDecisions(
            response?.data?.data?.step_decisions?.map((item) => item).join("\n")
          ); // Take all the decisions from the steps and join them with a new line and form a single string.
          setNotes(
            response?.data?.data?.step_notes?.map((item) => item).join("\n")
          ); // Take all the decisions from the steps and join them with a new line and form a single string.
          setSummaryOfNotes(
            response?.data?.data?.step_notes?.map((item) => item).join("\n")
          ); // Take all the notes from the steps and join them with a new line and form a single string.
        } else {
          toast.error("Échec de la récupération du rapport");
          setLoading(false);
        }
      } catch (error) {
        // console.log("error", error);
      } finally {
        setLoading(false);
      }
    };
    getMeetingByID();
    // fetchStepNotes();
  }, [meetingId]);
  // for fetching the profile data of user who created meeting.
  useEffect(() => {
    const getUserByID = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const userId = meetingData?.user_id;
        const REQUEST_URL = `${API_BASE_URL}/users/${userId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response) {
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
  const formattedDate = formatDate(meetingData?.date);

  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     const message =
  //       "You have unsaved changes. Are you sure you want to leave?";
  //     event.returnValue = message;
  //     return message;
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  const openProfileLink = () => {
    if (profileData.link) {
      const isCompleteUrl = /^https?:\/\//i.test(profileData.image);
      const url = isCompleteUrl
        ? profileData.image
        : `http://${profileData.link}`;
      window.open(url, "_blank");
    }
  };

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
  }
  const totalScheduledDuration = meetingData?.total_time;
  const clockColor =
    meetingData?.real_start_time <= meetingData?.start_time ? "green" : "red";
  const finClockColor =
    realPlayDuration > totalScheduledDuration ? "red" : "green";

  const [selectedIndex, setSelectedIndex] = useState(null);
  const handleItemClick = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  const [meetingIndex, setMeetingIndex] = useState(0);
  console.log("meetingIndex", meetingIndex);
  const [image, setImage] = useState(null);

  const handleLeft = async (id) => {
    let previousIndex;
    if (meetingIndex > 0) {
      previousIndex = meetingIndex - 1;
      setMeetingIndex(previousIndex);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/meetingViewDestination/${id}/${meetingData?.objective}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          console.log("previous Index-->", previousIndex);
          const meetings = response.data.data;
          setLen(meetings?.length);
          // setMeetingId(meetings[previousIndex-1].id);
          setMeetingData(meetings[previousIndex]);
        }
      } catch (error) {
        console.log("error: " + error);
      }
    }
    if (previousIndex === 0) {
      try {
        const REQUEST_URL = `${API_BASE_URL}/meetingView/${meetingId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        const _data = response.data.data;
        setLen(response?.data?.data?.length);
        if (_data) {
          setImage(response.data.data?.user?.image);
          setPic(response.data.data?.user?.enterprise.logo);
          setMeetingData(response.data?.data);
          setMeetingCount(_data?.destinationCount);
          setLeftBtn(false);
          // setMeetingId(response.data.data?.id);
          setParticipants(response.data?.data?.participants);
          setPlanOfAction(response.data?.data?.plan_d_actions);
          setDecisions(
            response?.data?.data?.step_decisions?.map((item) => item).join("\n")
          );
          setNotes(
            response?.data?.data?.step_notes?.map((item) => item).join("\n")
          );
          setSummaryOfNotes(
            response?.data?.data?.step_notes?.map((item) => item).join("\n")
          );
        }
      } catch (error) {
        console.log("error while fetching get meeting by id", error);
      }
    }
  };

  const [id, setId] = useState(null);
  const handleRight = async (id) => {
    setLeftBtn(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/meetingViewDestination/${id}/${meetingData.objective}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        const meetings = response.data.data;
        console.log("meetings", meetings);
        console.log("meetings length", meetings.length);
        // setId(meetings.id)
        setLen(meetings?.length);
        let nextIndex = meetingIndex;
        if (nextIndex < meetings.length) {
          // setMeetingId(response.data.data[nextIndex].id);
          setMeetingData(meetings[nextIndex]);
          if (meetings.length >= 0) {
            setMeetingIndex(nextIndex + 1);
          }
        } else {
          console.log("No more meetings available");
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // const handleLeft = async () => {
  //   try {
  //     if (meetingIndex > 0) {
  //       const response = await axios.get(
  //         `${API_BASE_URL}/meetingViewDestination/${meetingId}/${meetingData?.objective}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       if (response.status === 200) {
  //         const meetings = response.data.data;
  //         setLen(meetings?.length);
  //         if (meetingIndex >= meetings.length) {
  //           var previousIndex = meetingIndex - 2;
  //           setMeetingData(meetings[previousIndex]);
  //           // setMeetingId(meetings[previousIndex].id);
  //           setMeetingIndex(previousIndex);
  //         } else {
  //           setMeetingData(meetings[meetingIndex - 1]);
  //           // setMeetingId(meetings[meetingIndex - 1].id);
  //           previousIndex = meetingIndex - 1;
  //           setMeetingIndex(previousIndex);
  //           return;
  //         }
  //       }
  //     }
  //     // alert("meeting Index is before " + meetingIndex);

  //     if (meetingIndex === 0) {
  //       // alert("meeting Index is  after" + meetingIndex);
  //       // alert("ok");
  //       try {
  //         const REQUEST_URL = `${API_BASE_URL}/meetingView/${meetingId}`;
  //         const response = await axios.get(REQUEST_URL, {
  //           headers: {
  //             Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  //           },
  //         });
  //         const _data = response.data.data;
  //         console.log("_data", _data);
  //         setLen(response?.data?.data?.length);
  //         if (_data) {
  //           setPic(response.data.data?.user?.enterprise.logo);
  //           setMeetingData(response.data.data);
  //           // setMeetingId(response.data.data.id);
  //           setParticipants(response.data?.data?.participants);
  //           setPlanOfAction(response.data?.data?.plan_d_actions);
  //           setDecisions(
  //             response?.data?.data?.step_decisions
  //               ?.map((item) => item)
  //               .join("\n")
  //           );
  //           setNotes(
  //             response?.data?.data?.step_notes?.map((item) => item).join("\n")
  //           );
  //           setSummaryOfNotes(
  //             response?.data?.data?.step_notes?.map((item) => item).join("\n")
  //           );
  //         } else {
  //           console.log("Failed to fetch meeting data");
  //         }
  //       } catch (error) {
  //         console.log("error while fetching get meeting by id", error);
  //       }
  //     }
  //   } catch (error) {
  //     console.log("error fetching meetings", error);
  //   }
  // };

  const [show, setShow] = useState(false);
  const stepModal = () => {
    setShow(true);
  };

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showPlanActionModal, setShowPlanActionModal] = useState(false);

  const notesModal = () => {
    setShowNoteModal(true);
  };
  const decisionsModal = () => {
    setShowDecisionModal(true);
  };

  const planActionModal = () => {
    setShowPlanActionModal(true);
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
              <div>
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
              {leftBtn && (
                <div
                  className="position-relative"
                  style={{ left: "14rem", cursor: "pointer" }}
                  onClick={() => handleLeft(meetingData.id)}
                >
                  <FaAngleLeft size={30} />
                </div>
              )}
            </div>
            <div className="text-center presen-title mb-2">
              <div>
                <h2>{meetingData?.objective} </h2>
              </div>
              <div>
                {formattedDate} |{" "}
                {(() => {
                  const startTime = meetingData?.real_start_time;
                  const endTime = meetingData?.real_end_time;
                  const totalHHMM = moment.duration(
                    moment(endTime, "HH:mm").diff(moment(startTime, "HH:mm"))
                  );
                  return totalHHMM.hours() + "h" + totalHHMM.minutes();
                })()}{" "}
              </div>
              <div>
                <h4>{meetingData?.title} </h4>
              </div>
            </div>

            <div className="card card1 p-3 text-center mb-2">
              <div>
                <div className="card-title">
                  <h6>{t("presentation.statistics")}</h6>
                </div>
                <div className="d-flex justify-content-center gap-5">
                  <div>
                    <span className="start">{t("presentation.start")}</span>{" "}
                    <br />
                    <LuClock7 size={20} color={clockColor} /> <br />
                    <span className="time">
                      {moment(meetingData?.real_start_time, "HH:mm").format(
                        "HH[h]mm"
                      )}
                    </span>
                  </div>{" "}
                  <div>
                    <span className="start">{t("presentation.end")}</span>{" "}
                    <br />
                    <LuClock9 size={20} color={finClockColor} /> <br />
                    <span className="time">
                      {moment(meetingData?.real_end_time, "HH:mm").format(
                        "HH[h]mm"
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {meetingCount > 0 && meetingIndex !== len && (
                <div
                  style={{
                    right: "21rem",
                    position: "absolute",
                    top: "3.1rem",
                    cursor: `${
                      meetingIndex !== len ? "pointer" : "not-allowed"
                    }`,
                  }}
                  onClick={() => handleRight(meetingData?.id)}
                >
                  <FaAngleRight
                    size={30}
                    color={meetingIndex !== len ? "black" : "#8f8f8f"}
                  />
                </div>
              )}
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
                    // src={`${Assets_URL}${image}` || "/Assets/avatar.jpeg"}
                    // src={
                    //   imageError
                    //     ? "/Assets/avatar.jpeg"
                    //     : `${Assets_URL}/${image}`
                    // }
                    src={
                      imageError
                        ? "/Assets/avatar.jpeg"
                        : `${Assets_URL}/${image}`
                    }
                    style={{ cursor: "pointer" }}
                    alt="profile"
                    onClick={openProfileLink}
                    className="profileimg"
                    onError={(e) => {
                      setImageError(true);
                    }}
                  />
                  <b>
                    {" - "}
                    {meetingData?.user?.name}
                    {" - "}
                    {meetingData?.user?.last_name}
                    {" - "}
                    {Array.isArray(meetingData?.enterprise)
                      ? profileData.enterprise?.map((enterprise) => (
                          <>{enterprise?.name}</>
                        ))
                      : meetingData?.user?.enterprise?.name}
                    {" - "}
                    {meetingData?.user?.teams?.map((team) => (
                      <>{team?.name} </>
                    ))}
                    {meetingData?.user?.teams.length > 0 && "-"}
                    {meetingData?.user?.post}{" "}
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
                            size={"16px"}
                            onClick={() => handleItemClick(index)}
                          />{" "}
                          &nbsp;
                          <input
                            readOnly
                            type="text"
                            name="participant"
                            value={`${item.first_name} ${item.last_name}`}
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
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="mr-3"
                    style={{
                      cursor: "pointer",
                      // background: "#007BFF",
                      borderRadius: "20px",
                      padding: "3px 6px",
                      // color: "white",
                    }}
                    onClick={() => {
                      navigate("/step-details/" + meetingData?.id);
                    }}
                  >
                    <IoMdEye
                      color="black"
                      size={18}
                      style={{
                        margin: "2px",
                      }}
                    />
                  </div>
                  <div className="text-center flex-grow-1">
                    <h5>{t("presentation.summary")}</h5>
                  </div>
                </div>
                {/* <div className="resume"> */}
                <ol className="resume">
                  {meetingData?.steps?.map((item, index) => (
                    <li key={index}>
                      <input type="text" name="title" value={item.title} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <div className="card card2 p-3 ">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="mr-3"
                    style={{
                      cursor: "pointer",
                      // background: "#007BFF",
                      borderRadius: "20px",
                      padding: "3px 6px",
                      // color: "white",
                    }}
                    onClick={notesModal}
                  >
                    <IoMdEye
                      color="black"
                      size={18}
                      style={{
                        margin: "2px",
                      }}
                    />
                  </div>
                  <div className="text-center flex-grow-1">
                    <h5>{t("presentation.notes")}</h5>
                  </div>
                </div>
                <div className="resume">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: meetingData?.step_notes,
                    }}
                  />
                  {/* <textarea
                    type="text"
                    name="step_notes"
                    value={(() => {
                      let filteredNotes = [];
                      meetingData?.step_notes?.map((note) => {
                        if (note != null) {
                          filteredNotes.push(note);
                        }
                      });
                      return filteredNotes.join("\n");
                    })()}
                    className="form-control "
                    rows={5}
                    placeholder="Summary of Notes Taken on each step"
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
                <div className="d-flex align-items-center mb-3">
                  {/* <div
                    className="mr-3"
                    style={{
                      cursor: "pointer",
                      // background: "#007BFF",
                      borderRadius: "20px",
                      padding: "3px 6px",
                      // color: "white",
                    }}
                    onClick={planActionModal}
                  >
                    <IoMdEye
                      color="black"
                      size={18}
                      style={{
                        margin: "2px",
                      }}
                    />
                  </div> */}
                  <div className="text-center flex-grow-1">
                    <h5 className="card-title">
                      {t("presentation.planDActions")}
                    </h5>
                  </div>
                </div>
                {/* <h5 className="card-title">{t("presentation.planDActions")}</h5> */}

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
                            readOnly
                          >
                            {Array.from({ length: 10 }).map((_, i) => (
                              <option value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <textarea
                            value={action.action}
                            name="action"
                            rows={2}
                            placeholder="Action"
                            maxLength={100}
                            className="wrapped-textarea"
                          />
                        </div>

                        <div className="col-md-2">
                          <select
                            disabled
                            readOnly
                            className="form-select form-select-sm"
                            name="participant_id"
                            value={action.participant_id}
                          >
                            <option value={""}>select participant</option>
                            {participants?.map((user, index) => (
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
                          />
                        </div>

                        <div className="col-md-2">
                          <select
                            readOnly
                            disabled
                            className="form-select form-select-sm"
                            value={action.status}
                            name="status"
                          >
                            <option value={""}>Status</option>
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

                        {/* <div className="col-1">
                          <button
                            className="btndel"
                          >
                            <AiFillDelete size={"15px"} color="red" />
                          </button>
                        </div> */}
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex justify-content-center text-center mt-2 gap-2">
                  {/* ADD PLAN D ACTION BUTTON */}
                  <div></div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-2">
              {/* DECISIONS */}
              <div className="card card2 p-3 ">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="mr-3"
                    style={{
                      cursor: "pointer",
                      borderRadius: "20px",
                      padding: "3px 6px",
                    }}
                    onClick={decisionsModal}
                  >
                    <IoMdEye
                      color="black"
                      size={18}
                      style={{
                        margin: "2px",
                      }}
                    />
                  </div>
                  <div className="text-center flex-grow-1">
                    <h5>{t("presentation.decisions")}</h5>
                  </div>
                </div>
                <div className="resume">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: meetingData?.step_decisions,
                    }}
                  />
                  {/* <textarea
                    // disabled
                    readOnly
                    type="text"
                    name="step_decisions"
                    value={(() => {
                      let filteredDecisions = [];
                      meetingData?.step_decisions?.map((note) => {
                        if (note != null) {
                          filteredDecisions.push(note);
                        }
                      });
                      return filteredDecisions.join("\n");
                    })()}
                    rows={5}
                    placeholder="Summary of Decisions Taken"
                  /> */}
                </div>
              </div>
            </div>
          </section>
          <div className="text-center d-flex gap-3 justify-content-center pres-btn">
            <a
              href="https://www.tektime.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              En savoir plus sur TekTIME
            </a>
          </div>
          <Modal show={showNoteModal} className="modal-lg">
            <Modal.Body>
              <div className="modal-header">
                <h5>{t("presentation.notes")}</h5>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowNoteModal(false)}
                ></button>
              </div>
              <div
                className="d-flex flex-column gap-1"
                style={{ marginLeft: "17px", marginTop: "15px" }}
              >
                {meetingData?.step_notes?.length > 0 &&
                  meetingData?.step_notes
                    .filter((item) => item !== null)
                    .map((item, index) => {
                      return (
                        <>
                          <div
                            dangerouslySetInnerHTML={{ __html: item }}
                            key={index}
                          >
                            {/* <p>{item}</p> */}
                          </div>
                        </>
                      );
                    })}
              </div>
            </Modal.Body>
          </Modal>
          <Modal show={showDecisionModal} className="modal-lg">
            <Modal.Body>
              <div className="modal-header">
                <h5>{t("presentation.decisions")}</h5>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowDecisionModal(false)}
                ></button>
              </div>

              {meetingData?.step_decisions?.length > 0 &&
                meetingData?.step_decisions
                  .filter((item) => item !== null)
                  .map((item, index) => {
                    return (
                      <>
                        <div key={index}>
                          <Stack
                            direction="row"
                            align="center"
                            gap={3}
                            className="my-3"
                          >
                            <div className="col-md-12">
                              <div className="card">
                                <div className="card-body">
                                  <div className="cardbody">
                                    <div className="row subtitle card2 py-2 px-3">
                                      <div className="col-md-1 text-start obj">
                                        <span>{index + 1}</span>
                                      </div>
                                      <div className=" col-md-3 ">
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: item,
                                          }}
                                          key={index}
                                        >
                                          {/* <p>{item}</p> */}
                                        </div>
                                        {/* <span>{item}</span> */}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Stack>
                        </div>
                      </>
                    );
                  })}
            </Modal.Body>
          </Modal>
          {/* <Modal show={show} className={`modal-xl`}>
            <Modal.Body>
              <div className="modal-header">
                <h5>{t("presentation.summary")}</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShow(false)}
                ></button>
              </div>
              <Chart meetingId={meetingData?.id} />
            </Modal.Body>F
          </Modal> */}
          <Modal show={showPlanActionModal} className={`modal-xl`}>
            <Modal.Body>
              <div className="modal-header">
                <h5>{t("presentation.planDActions")}</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowPlanActionModal(false)}
                ></button>
              </div>
              <PlanDChart meetingId={meetingData?.id} />
            </Modal.Body>
          </Modal>
        </main>
      )}
    </div>
  );
};

export default Presentation;