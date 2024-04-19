import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi2";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import NoContent from "../Meeting/NoContent";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

function CurrentGoals() {
  const { setHeaderTitle } = useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Initially set to true to display the loader

  const getMeetings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/participants`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (response) {
        const sortedMeetings = response.data?.data?.meetings?.sort(
          (a, b) => b.id - a.id
        );
        setMeetings(sortedMeetings);
        setIsLoading(false); // Update isLoading to false after successfully fetching data
      }
    } catch (error) {
      // console.error(error);
      setIsLoading(false); // Update isLoading to false in case of error
    }
  };

  const handleUpdateParticipant = (id) => {
    navigate(`/updateParticipant/${id}`);
  };
  useEffect(() => {
    getMeetings();
  }, []);

  const handleView = (id) => {
    navigate(`/participantToAction/${id}`);
  };
  return (
    <div className="scheduled">
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          {isLoading ? (
            <Spinner
              animation="border"
              role="status"
              className="center-spinner"
            ></Spinner>
          ) : (
            <>
              {meetings?.length === 0 ? (
                <NoContent title="Todo Actions" />
              ) : (
                <>
                  {meetings
                    ?.filter(
                      (meeting) =>
                        meeting?.plan_d_actions?.length !== 0 &&
                        meeting.participants.some(
                          (participant) =>
                            participant.todo_plandactions_count ===
                              participant.total_plandactions_count &&
                            participant.total_plandactions_count !== 0
                        )
                    )
                    .map((meeting, index) => (
                      <>
                        <div className="col-md-12 py-3">
                          <div className="card">
                            <div className="card-body">
                              <div className="cardbody">
                                <h5>{meeting.objective?.toUpperCase()}</h5>

                                <div className="row subtitle card2 py-4 px-4">
                                  <div className="col-md-1 text-start obj">
                                    <span>{t("guests.profile")}</span>
                                  </div>
                                  <div className="col-md-2 text-center obj">
                                    <span>{t("guests.name")}</span>
                                  </div>
                                  <div className="col-md-2 text-center obj">
                                    <span>{t("guests.fname")}</span>
                                  </div>
                                  <div className="col-md-2 text-center obj">
                                    <span>Progression</span>
                                  </div>
                                  <div className="col-md-2 text-center obj">
                                    <span>{t("guests.post")}</span>
                                  </div>
                                  <div className="col-md-2 text-center obj">
                                    <span>Mail</span>
                                  </div>
                                  <div className="col-md-1 text-end obj">
                                    <span>Actions</span>
                                  </div>
                                </div>

                                {meeting.participants
                                  .filter(
                                    (participant) =>
                                      participant.total_plandactions_count !==
                                        0 &&
                                      participant.todo_plandactions_count > 0
                                  )
                                  .map((item, index) => (
                                    <>
                                      <div
                                        className="row py-4 pb-5 text-body-dark px-3"
                                        key={index}
                                      >
                                        <div className="col-md-1 text-start obj1">
                                          <h6>
                                            {item.participant_image ? (
                                              <>
                                                <img
                                                  className="logo"
                                                  width={50}
                                                  height={50}
                                                  src={`${item.participant_image}`}
                                                  alt="logo"
                                                />
                                              </>
                                            ) : (
                                              <HiUserCircle size={45} />
                                            )}
                                          </h6>
                                        </div>
                                        <div className="col-md-2 text-center obj1">
                                          <h6>{item.first_name}</h6>
                                        </div>
                                        <div className="col-md-2 text-center obj1">
                                          <h6>{item.last_name}</h6>
                                        </div>
                                        <div className="col-md-2 text-center obj1">
                                          <h6>
                                            {/* {
                                              meeting
                                                ?.plan_d_actions_status_counts
                                                ?.Todo
                                            } */}

                                            {`${
                                              item.total_plandactions_count -
                                              item.todo_plandactions_count
                                            }/${item.total_plandactions_count}`}
                                          </h6>
                                        </div>
                                        <div className="col-md-2 text-center obj1">
                                          <h6>{item.post}</h6>
                                        </div>
                                        <div className="col-md-2 text-center obj1">
                                          <h6>{item.email}</h6>
                                        </div>
                                        <div className="col-md-1 text-end  d-flex justify-content-end ">
                                          <div className="">
                                            <IoEyeOutline
                                              size={"22px"}
                                              style={{ cursor: "pointer" }}
                                              onClick={() => {
                                                setHeaderTitle([
                                                  {
                                                    titleText: "Stratégie de",
                                                    link: "/Invities",
                                                  },
                                                  {
                                                    titleText: `${item.first_name} ${item.last_name} sur ${meeting.objective}`,

                                                    link: `/participantToAction/${item.id}`,
                                                  },
                                                ]);
                                                handleView(item.id);
                                              }}
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
                                                    handleUpdateParticipant(
                                                      item.id
                                                    );
                                                  }}
                                                >
                                                  <CiEdit size={"20px"} />{" "}
                                                  &nbsp;
                                                  {t("dropdown.To modify")}
                                                </a>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  {meetings?.every((meeting) =>
                    meeting?.participants?.every(
                      (participant) =>
                        participant?.todo_plandactions_count === 0
                    )
                  ) && <NoContent title="Todo PlanDAction" />}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurrentGoals;
