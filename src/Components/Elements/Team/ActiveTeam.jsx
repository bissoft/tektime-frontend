import React, { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { MdContentCopy } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi2";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { Spinner, Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { toast } from "react-toastify";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";

const ActiveTeam = ({ setActiveTab }) => {
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } =
    useHeaderTitle();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [t] = useTranslation("global");

  const navigate = useNavigate();

  const handleUpdateTeam = (id) => {
    navigate(`/ModifierTeam/${id}`);
  };
  const handleUsers = () => {
    navigate("/Users");
  };
  const handleUpdateContract = (id) => {
    navigate(`/ModifierContract/${id}`);
  };

  const handlelinkUser = (id) => {
    navigate(`/users/${id}`);
  };

  const handleCopyTeam = (id) => {
    navigate(`/CopyTeam/${id}`);
  };
  
  const getData = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status) {
        // If user is admin, no need to filter teams.
        if (getUserRoleID() === 1) {
          // No need to filter teams for admin user.
          // const filterredTeams = response?.data?.data?.filter(
          //   (team) =>
          //     team.created_by.id.toString() ===
          //     sessionStorage.getItem("user_id").toString()
          // );
          setTeam(response.data?.data);
          setLoading(true);
        } else if (getUserRoleID() == 2) {
          sessionStorage.setItem(
            "enterprise",
            JSON.stringify(response.data?.enterprise)
          );
          setLoading(true);

          //Filter Teams based on user id: show only teams created by logged in user.
          const filterredTeams = response?.data?.data?.filter(
            (team) =>
              team.created_by.id.toString() ===
              sessionStorage.getItem("user_id").toString()
          );
          setTeam(filterredTeams);
          setLoading(true);
        } else if (getUserRoleID() == 3) {
          sessionStorage.setItem(
            "enterprise",
            JSON.stringify(response.data.enterprise)
          );
          //Filter Teams based on user id: show only teams created by logged in user.
          const filterredTeams = response.data?.data?.filter((team) => {
            return (
              team?.enterprise?.id ==
              JSON.parse(sessionStorage.getItem("enterprise"))?.id
            );
          });
          setTeam(filterredTeams);
          setLoading(true);
        } else {
          sessionStorage.setItem(
            "enterprise",
            JSON.stringify(response.data?.enterprise)
          );
          //Filter Teams based on user id: show only teams created by logged in user.
          const filterredTeams = response.data.data.filter((team) => {
            return team.created_by == sessionStorage.getItem("user_id");
          });
          setTeam(filterredTeams);
          setLoading(true);
        } //
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const handleChangeStatus = async (id) => {
    const token = sessionStorage.getItem("token");
    const currentDate = moment().format();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/teams/${id}/status`,
        { status: "closed", _method: "put" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status) {
        getData();
        setActiveTab("Equipes archivées");
        setCurrentDate(currentDate);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
  };
  // const sortedTeams =
  //   Array.isArray(team) && team?.length > 0
  //     ? team.sort((a, b) => {
  //         if (a.id && b.id) {
  //           return b.id - a.id;
  //         }
  //         return 0;
  //       })
  //     : [];

      const sortedTeams =
      Array.isArray(team) && team?.length > 0
        ? team.sort((a, b) => {
            if (a.created_at && b.created_at) {
              return new Date(b.created_at) - new Date(a.created_at);
            }
            return 0;
          })
        : [];
  return (
    <div className="team">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {loading ? (
              sortedTeams.length > 0 ? (
                sortedTeams?.map((item, index) => (
                  <>
                    <div className="card mb-4" key={index}>
                      <div className="card-body">
                        <div className="cardbody">
                          <Table responsive>
                            <thead>
                              <tr>
                                <th className="table-head">logo</th>
                                <th className="table-head">
                                  {t("Team.Creator")}
                                </th>
                                <th className="table-head">
                                  {t("Team.Company")}
                                </th>
                                <th className="table-head">
                                  {t("Team.fname")}
                                </th>

                                <th className="table-head">
                                  {t("Team.Creation date")}
                                </th>
                                <th className="table-head">
                                  {t("Team.Effective")}
                                </th>
                                <th className="table-head">Action</th>
                              </tr>
                            </thead>
                            <tbody style={{ padding: "10px 10px" }}>
                              <tr>
                                <td className="table-data">
                                  {item.logo ? (
                                    <img
                                      className="logo"
                                      width={50}
                                      height={50}
                                      src={`${Assets_URL}/${item.logo}`}
                                      alt="logo"
                                    />
                                  ) : (
                                    <HiUserCircle size={"40px"} />
                                  )}
                                </td>
                                <td className="table-data">
                                  {item.created_by?.last_name === null
                                    ? item.created_by?.name
                                    : item.created_by?.name +
                                      " " +
                                      item.created_by.last_name}
                                </td>
                                <td className="table-data">
                                  {item.enterprise?.name}
                                </td>
                                <td className="table-data">{item.name}</td>
                                <td className="table-data">
                                  {item.created_at.substring(0, 10)}
                                </td>
                                <td className="table-data">
                                  {item?.users_count}
                                </td>
                                <td className="table-data d-flex align-items-center">
                                  <IoEyeOutline
                                    size={"22px"}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setHeaderTitle([
                                        {
                                          titleText: item?.enterprise?.name,
                                          link: "/Team",
                                        },
                                        {
                                          titleText: item.name,
                                          link: `/users/${item?.id}`,
                                        },
                                      ]);
                                      handlelinkUser(item?.id);
                                    }}
                                  />
                                  <div
                                    className="dropdown dropstart"
                                    style={{
                                      position: "absolute",
                                    }}
                                  >
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
                                    <ul
                                      className="dropdown-menu"
                                      style={{ top: "3rem !important" }}
                                    >
                                      <li>
                                        <a
                                          className="dropdown-item"
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            handleUpdateTeam(item?.id)
                                          }
                                        >
                                          <CiEdit size={"20px"} /> &nbsp;{" "}
                                          {t("Team.modify")}
                                        </a>
                                      </li>
                                      <li
                                        onClick={() =>
                                          handleChangeStatus(item?.id)
                                        }
                                      >
                                        <a
                                          className="dropdown-item"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <RiDeleteRow size={"20px"} /> &nbsp;
                                          {t("Team.Deactivate")}
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </>
                ))
              ) : (
                <NoContent title="Active Teams" />
              )
            ) : (
              <>
                <Spinner
                  animation="border"
                  role="status"
                  className="center-spinner"
                ></Spinner>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTeam;