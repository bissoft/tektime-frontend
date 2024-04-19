import axios from "axios";
import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../../Apicongfig";
import moment from "moment/moment";
import { AiOutlineDelete } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiPresentationFill } from "react-icons/ri";
import { GrFormView } from "react-icons/gr";
import NoContent from "./NoContent";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

const CompleteMeeting = ({ setActiveTab }) => {
  const { setHeaderTitle } = useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const moment = require("moment");
  require("moment/locale/fr");
  const getMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/closed/meetings`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (response) {
        setIsLoading(false);

        const sortedMeetings = [...response.data?.data].sort((a, b) => {
          if (a.updated_at && b.updated_at) {
            return new Date(b.updated_at) - new Date(a.updated_at);
          }
        });
        const filteredMeetings = sortedMeetings.filter((item) => {
          return item.status === "closed" || item.status === "abort";
        });
        setMeetings(filteredMeetings);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const presentMeeting = (meetingId, meetingData) => {
    navigate(`/presentation/${meetingId}`, { state: meetingData });
  };
  const handleDelete = async (dataId) => {
    const shouldDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette réunion ?"
    );

    if (!shouldDelete) {
      return; // User cancelled the deletion
    }

    try {
      const response = await fetch(`${API_BASE_URL}/meetings/${dataId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      if (!response.ok) {
        toast.error("Impossible d'obtenir une réponse");
      } else {
        toast.success(
          response?.data?.data?.message || "Réunion supprimée avec succès"
        );
        setMeetings((prevMeetings) =>
          prevMeetings.filter((meeting) => meeting.id !== dataId)
        );
      }
    } catch (error) {
      // console.log("Error deleting data:", error);
    }
  };
  const review = (data) => {
    navigate(`/meetingDetail/${data.id}`, { state: data });
  };
  const handleCopy = (val) => {
    navigate(`/copyMeeting/${val.id}`);
  };

  useEffect(() => {
    if (isLoading) {
      getMeetings();
    }
  }, []);

  const sortedMeetings =
    Array.isArray(meetings) && meetings?.length > 0 ? meetings : [];

  return (
    <div className="scheduled">
      <div className="py-2 container-fluid">
        <div className="row justify-content-center">
          {isLoading ? (
            <Spinner
              animation="border"
              role="status"
              className="center-spinner"
            ></Spinner>
          ) : sortedMeetings?.length > 0 ? (
            sortedMeetings.map((item) => (
              <div className="col-md-12" key={item.id}>
                <div
                  className={`card mb-3 ${
                    moment(item.date).isBefore(new Date()) ||
                    moment(item.start_time, "HH:mm A").isBefore(moment())
                      ? "missed"
                      : "upcoming"
                  }`}
                >
                  <div className="card-body">
                    <h5 className="card-title">
                      {moment(item.date).isSame(new Date(), "day") &&
                        " Aujourd'hui "}
                      {moment(item.date).isSame(
                        moment().add(1, "day"),
                        "day"
                      ) && "Demain"}
                      {!moment(item.date).isSame(new Date(), "day") &&
                        !moment(item.date).isSame(
                          moment().add(1, "day"),
                          "day"
                        ) &&
                        moment(item.date)
                          .locale("fr")
                          .format("dddd, DD MMMM YYYY")}
                    </h5>
                    <div className="cardbody">
                      <div className="px-4 py-4 row subtitle card2">
                        <div className="col-md-1 text-start obj">
                          <span>{t("meeting.activeMeetings.criticality")}</span>
                        </div>
                        <div className="text-center col-md-2 obj">
                          <span>{t("meeting.activeMeetings.type")}</span>
                        </div>

                        <div className="text-center col-md-2 obj">
                          <span>{t("meeting.activeMeetings.niche")}</span>
                        </div>

                        <div className="col-md-2 text-center obj">
                          <span>
                            {" "}
                            {t("meeting.activeMeetings.destinations")}
                          </span>
                        </div>
                        <div className="col-md-2 text-center obj">
                          <span>{t("meeting.activeMeetings.objective")}</span>
                        </div>
                        <div className="text-center col-md-2 obj">
                          <span>{t("meeting.activeMeetings.duration")}</span>
                        </div>
                        <div className="col-md-1 text-end obj">
                          <span>{t("meeting.activeMeetings.actions")}</span>
                        </div>
                      </div>

                      <div className="px-3 py-4 pb-5 row text-body-dark">
                        <div className="col-md-1 text-start obj1">
                          <h6>{item.priority}</h6>
                        </div>
                        <div className="text-center col-md-2 obj1">
                          <h6>{item.type}</h6>
                        </div>

                        <div className="text-center col-md-2 obj1">
                          <h6>
                            {moment(item.start_time, "HH:mm").format("hh:mm A")}
                          </h6>
                        </div>
                        <div className="text-center col-md-2 obj1">
                          <h6>{item.objective}</h6>
                        </div>
                        <div className="text-center col-md-2 obj1">
                          <h6>{item.title}</h6>
                        </div>
                        <div className="text-center col-md-2 obj1">
                          <h6>
                            {(() => {
                              const real_duration = moment.duration(
                                moment(item.real_end_time, "HH:mm").diff(
                                  moment(item.real_start_time, "HH:mm")
                                )
                              );
                              const total_minutes =
                                real_duration.hours() * 60 +
                                real_duration.minutes();
                              return `${total_minutes} Mins`;
                            })()}
                          </h6>
                        </div>
                        <div className="col-md-1 text-end obj1 d-flex justify-content-end">
                          <div>
                            {item.status !== "abort" && (
                              <div>
                                <RiPresentationFill
                                  size={"20px"}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => presentMeeting(item.id, item)}
                                  title="Report"
                                />
                              </div>
                            )}
                          </div>
                          <div className="dropdown dropstart">
                            <button
                              className="btn btn-secondary"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                padding: "0px",
                              }}
                            >
                              <BiDotsVerticalRounded
                                color="black"
                                size={"25px"}
                              />
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <a
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => review(item)}
                                >
                                  <GrFormView size={"20px"} /> &nbsp;
                                  {t("dropdown.Review the detail")}
                                </a>
                              </li>
                              <li>
                                <a
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setHeaderTitle([
                                      {
                                        titleText: t("header.duplication"),
                                        link: `/meeting`,
                                      },
                                      {
                                        titleText: `${item.title}`,
                                        link: `/copyMeeting/${item?.id}`,
                                      },
                                    ]);
                                    handleCopy(item);
                                  }}
                                >
                                  <MdContentCopy size={"18px"} /> &nbsp;
                                  {t("dropdown.Duplicate")}
                                </a>
                              </li>
                              <li>
                                <a
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <AiOutlineDelete size={"20px"} />
                                  &nbsp; {t("dropdown.Delete")}
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    {meetings &&
                      meetings.some(
                        (item) =>
                          item.status === "closed" || item.status === "abort"
                      ) && (
                        <div>
                          {item.status === "closed" ? (
                            <span className="mx-2 badge bg-success">
                              {t("badge.finished")}
                            </span>
                          ) : (
                            <span className="mx-2 badge bg-danger">
                              {t("badge.cancel")}
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <NoContent title="Closed Meeting" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteMeeting;
