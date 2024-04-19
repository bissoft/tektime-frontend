import React, { useEffect, useState } from "react";
import { Spinner, Table } from "react-bootstrap";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import moment from "moment";
import { MdRestartAlt } from "react-icons/md";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";
import { HiUserCircle } from "react-icons/hi2";

function ClosedTeam({ setActiveTab }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [t] = useTranslation("global");

  const getData = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/closed/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status) {
        setLoading(true);

        // If user is admin, no need to filter teams.
        if (getUserRoleID() == 1) {
          // No need to filter teams for admin user.
          // const filterredTeams = response?.data?.data?.filter(
          //   (team) =>
          //     team.created_by.id.toString() ===
          //     sessionStorage.getItem("user_id").toString()
          // );
          // setTeams(filterredTeams);\
          setTeams(response.data.data);
          setLoading(true);
        } else {
          //Filter Teams based on user id: show only teams created by logged in user.
          const filterredTeams = response.data.data.filter((team) => {
            return team.created_by == sessionStorage.getItem("user_id");
          });
          setTeams(filterredTeams);
          setLoading(true);
        } //
        // setTeams(response.data.data);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const handleReactiveTeam = async (id) => {
    const token = sessionStorage.getItem("token");
    const currentDate = moment().format();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/teams/${id}/status`,
        { status: "active", _method: "put" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        getData();
        setActiveTab("Equipes actives");
        setCurrentDate(currentDate);
      }
    } catch (error) {
      if (
        error.response.data.errors == "Team status is closed" ||
        error.response.status == 500
      ) {
        toast.error(t("errors.entClosed"));
      }
      // console.log("error", error);
      // toast.error(t("messages.team.update.close"));
    }
  };
  const sortedTeams =
    Array.isArray(teams) && teams?.length > 0
      ? teams.sort((a, b) => {
          if (a.id && b.id) {
            return b.id - a.id;
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
              sortedTeams.length === 0 ? (
                <NoContent title="Closed Teams" />
              ) : (
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
                                  {" "}
                                  {t("Team.Effective")}
                                </th>
                                <th className="table-head">
                                  {" "}
                                  {t("Team.Closing Date")}
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
                                <td className="table-data">
                                  {item?.updated_at.substring(0, 10)}
                                </td>
                                <td className="table-data d-flex align-items-center">
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
                                            handleReactiveTeam(item?.id)
                                          }
                                        >
                                          <MdRestartAlt size={"20px"} /> &nbsp;
                                          {t("Team.reactive")}
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
}

export default ClosedTeam;
