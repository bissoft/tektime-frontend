import axios from "axios";
import React, { useEffect, useState } from "react";
import { Spinner, Pagination } from "react-bootstrap";
import { API_BASE_URL } from "../../Apicongfig";
import moment from "moment/moment";
import { CiEdit } from "react-icons/ci";
import { BsPlay } from "react-icons/bs";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import NoContent from "./NoContent";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { askPermission } from "../../Utils/askPermission";

// >==============================> For Sorting <================================<
function sortMeetings(meetings) {
  const today = new Date().toISOString().slice(0, 10);

  return meetings.sort((meeting1, meeting2) => {
    // Group meetings by status and date
    const group1 = `${meeting1.status}-${meeting1.date}`;
    const group2 = `${meeting2.status}-${meeting2.date}`;

    // Sort by group order
    if (group1 !== group2) {
      return group1 < group2 ? 1 : -1; // Drafts First, Then Today's Meetings, Then Active Meetings Except Today's Meetings.
    }

    // Draft meetings first within each group
    if (meeting1.status === "draft" && meeting2.status !== "draft") {
      return -1;
    } else if (meeting1.status !== "draft" && meeting2.status === "draft") {
      return 1;
    }

    // Within the same group, sort by date (descending) and time (descending)
    if (meeting1.date !== meeting2.date) {
      return new Date(meeting2.date) - new Date(meeting1.date);
    } else {
      const time1 = meeting1.start_time.split(":").map(Number);
      const time2 = meeting2.start_time.split(":").map(Number);
      return time2[0] * 60 + time2[1] - (time1[0] * 60 + time1[1]);
    }
  });
}

// >==============================> F.C <================================<

const ScheduledMeeting = ({ setActiveTab }) => {
  const effectRan = React.useRef(false);
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } =
    useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const moment = require("moment");
  require("moment/locale/fr");
  const [currentPage, setCurrentPage] = useState(1);
  const [meetingsPerPage] = useState(5);
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to the top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/meetings`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (response.status) {
        setMeetings(response?.data?.data);
        setIsLoading(false);
        // if (response.data?.data.length === 0) {
        //   setActiveTab("Nouvel évènement");
        //   // setIsLoading(false);
        // }
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error?.message));
      // console.error(error);
      setIsLoading(false);
    }
  };

  //Delete Meeting
  const handleDelete = async (id) => {
    const permissionGranted = askPermission(
      "Êtes-vous sûr de vouloir supprimer cette réunion ?" ||
        "Are you sure you want to delete this meeting?"
    );

    if (!permissionGranted) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status === 200) {
        toast.success("Réunion supprimée avec succès");
        getMeetings();
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
      toast.error(t(error.message));
    }
  };

  //Duplicate Meeting
  const handleCopy = (item) => {
    navigate(`/copyMeeting/${item.id}`);
  };

  //Play Meeting
  const handlePlay = (item) => {
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);
    // Check if the meeting is started 60 minutes early or late
    if (!(timeDifference >= -60 && timeDifference <= 60)) {
      toast.error(t("errors.playMeeting"));
      return;
    }
    navigate(`/play/${item.id}`);
  };

  const handleEdit = (item) => {
    navigate(`/updateMeeting/${item?.id}`);
  };
  const viewDraft = (item) => {
    const hasEditorContent = item?.steps?.some(
      (step) => step.editor_content !== null
    );
    if (hasEditorContent) {
      navigate(`/validateMeeting2/${item?.id}`);
    } else {
      navigate(`/draft/${item?.id}`);
    }
  };
  const handleView = (item) => {
    navigate(`/view/${item?.id}`);
  };

  useEffect(() => {
    if (isLoading) {
      getMeetings();
    }

    return () => {
      effectRan.current = true;
    };
  }, []);

  //For Sorting
  /**
   * SOW DRAFTS FIRST,
   * THEN TODAY'S MEETINGS,
   * THEN ACTIVE MEETINGS EXCEPT TODAY'S MEETINGS (BECAUSE TODAY'S MEETINGS ARE ALREADY DISPLAYED IN THE MIDDLE OF THE PAGE).
   */

  // const sortedMeetings =
  //   Array.isArray(meetings) && meetings?.length > 0
  //     ? [
  //         ...sortedDrafts,
  //         ...sortedYesterDayMeetings,
  //         ...todayMeetings,
  //         ...activeMeetingsWithoutTodayMeetingsAndYesterdayMeetings,
  //       ]
  //     : [];

  // const sortedMeetings = sortMeetings(meetings);
  const sortedMeetings = [...meetings];
  //-----------------------------------------------------------------------------------

  //For Pagination
  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = sortedMeetings?.slice(
    indexOfFirstMeeting,
    indexOfLastMeeting
  );

  return (
    <div className="scheduled">
      <div className="py-2 container-fluid">
        <div className="row justify-content-center">
          {sortedMeetings?.length === 0 && !isLoading ? (
            <NoContent title="Active Meeting" />
          ) : sortedMeetings?.length > 0 ? (
            <>
              {sortedMeetings?.map((item, index) => (
                <div className="col-md-12" key={index}>
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
                        {item.date ? (
                          moment(item.date, "YYYY-MM-DD", true).isValid() ? (
                            <>
                              {moment(item.date).isSame(new Date(), "day") &&
                                "Aujourd'hui "}
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
                            </>
                          ) : (
                            "Date à compléter"
                          )
                        ) : (
                          "Date à compléter"
                        )}
                      </h5>

                      <div className="cardbody">
                        <div className="px-4 py-4 row subtitle card2">
                          <div className="col-md-1 text-start obj">
                            <span>
                              {t("meeting.activeMeetings.criticality")}
                            </span>
                          </div>
                          <div className="text-center col-md-2 obj">
                            <span>{t("meeting.activeMeetings.type")}</span>
                          </div>
                          <div className="text-center col-md-2 obj">
                            <span>{t("meeting.activeMeetings.niche")}</span>
                          </div>
                          <div className="text-center col-md-2 obj">
                            <span>
                              {t("meeting.activeMeetings.destinations")}
                            </span>
                          </div>
                          <div className="text-center col-md-2 obj">
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
                              {item.start_time !== null
                                ? moment(item.start_time, "HH:mm").format(
                                    "hh:mm A"
                                  )
                                : ""}
                            </h6>
                          </div>
                          <div className="text-center col-md-2 obj1">
                            <h6>{item.objective}</h6>
                          </div>
                          <div className="text-center col-md-2 obj1">
                            <h6>{item.title}</h6>
                          </div>
                          <div className="text-center col-md-2 obj1">
                            <h6>{item.total_time + " Mins"}</h6>
                          </div>
                          <div className="col-md-1 text-end obj1 d-flex justify-content-end ">
                            {item.status === "active" ? (
                              <>
                                <div className="">
                                  <BsPlay
                                    size={"28px"}
                                    style={{ cursor: "pointer" }}
                                    title="Démarrer"
                                    onClick={() => handlePlay(item)}
                                  />
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
                                        onClick={() => {
                                          setHeaderTitle([
                                            {
                                              titleText: t(
                                                "header.modification"
                                              ),
                                              link: `/meeting`,
                                            },
                                            {
                                              titleText: `${item.title}`,
                                              link: `/updateMeeting/${item?.id}`,
                                            },
                                          ]);
                                          handleEdit(item);
                                        }}
                                      >
                                        <CiEdit size={"20px"} /> &nbsp;
                                        {t("dropdown.To modify")}
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        className="dropdown-item"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setHeaderTitle([
                                            {
                                              titleText:
                                                t("header.duplication"),
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
                                        onClick={() => handleView(item)}
                                      >
                                        <AiOutlineEye size={"20px"} /> &nbsp;
                                        {t("dropdown.Preview")}
                                      </a>
                                    </li>{" "}
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
                              </>
                            ) : (
                              <>
                                <div>
                                  <IoEyeOutline
                                    size={"28px"}
                                    style={{ cursor: "pointer" }}
                                    title="Démarrer"
                                    onClick={() => viewDraft(item)}
                                    // onClick={() => handleEdit(item)}
                                  />
                                </div>
                                <div>
                                  <AiOutlineDelete
                                    size={"20px"}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleDelete(item?.id)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {item.status !== "draft" && (
                        <span
                          className={`badge ${
                            moment().isAfter(
                              moment(
                                `${item.date} ${item.start_time}`,
                                "YYYY-MM-DD HH:mm"
                              )

                              // .add(1, 'hour')
                            )
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                        >
                          {moment().isAfter(
                            moment(
                              `${item.date} ${item.start_time}`,
                              "YYYY-MM-DD HH:mm"
                            )
                            // .add(1, 'hour')
                          )
                            ? t("badge.late")
                            : t("badge.future")}
                        </span>
                      )}

                      {/* {item.steps &&
                          item.steps.some(
                            (step) => step.editor_content === null
                          ) && (
                            <span className="mx-2 badge bg-warning">
                              Brouillon{" "}
                            </span>
                          )} */}
                      {item.status === "draft" && (
                        <span className="mx-2 badge bg-warning">
                          {t("badge.draft")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <Spinner
              animation="border"
              role="status"
              className="center-spinner"
            ></Spinner>
          )}
        </div>
        {/* Pagination Start */}
        {/* <div className="row justify-content-center">
          <Pagination className="justify-content-center">
            {Array.from({
              length: Math.ceil(sortedMeetings.length / meetingsPerPage),
            }).map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div> */}
        {/* Pagination End */}
      </div>
    </div>
  );
};

export default ScheduledMeeting;
