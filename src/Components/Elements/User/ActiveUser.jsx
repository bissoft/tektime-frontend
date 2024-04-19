import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Spinner, Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";
import { toast } from "react-toastify";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";

function ActiveUser({ setActiveTab }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [t] = useTranslation("global");

  const handleUpdateUser = (id) => {
    navigate(`/ModifierUser/${id}`);
  };
  const handleChangeStatus = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/${id}/status`,
        { status: "closed", _method: "put" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        getTeam();
        setActiveTab("Utilisateurs désactivés");
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
  };
  const [team, setTeam] = useState({});
  const [loading, setLoading] = useState(false);
  const getTeam = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTeam(response?.data?.data);
        setLoading(true);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    const getTeam = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setTeam(response?.data?.data);
          setLoading(true);
        }
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error.message));
        // console.log("error message", error);
      }
    };
    getTeam();
  }, [setActiveTab, loading]);
  const sortedUsers =
    Array.isArray(team?.users) && team?.users?.length > 0
      ? [...team?.users].sort((a, b) => {
        if (a.id && b.id) {
          return b.id - a.id;
        }
        return 0;
      })
      : [];
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="user">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {loading ? (
              sortedUsers?.length === 0 ? (
                <>
                  <NoContent title={`Active User of ${team.name}`} />
                  <div className="d-flex justify-content-center my-3">
                    <button className="btn btn-primary" onClick={goBack}>
                      Revenir à la page précédente
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {sortedUsers?.map(
                    (user, index) =>
                      (user?.status === "active" ||
                        user.status === "pending") && (
                        <>
                          <div className="card mb-4" key={index}>
                            <div className="card-body">
                              <div className="cardbody">
                                <h5>{team?.name}</h5>
                                <Table responsive>
                                  <thead>
                                    <tr>
                                      <th className="table-head">logo</th>
                                      <th className="table-head">
                                        {t("user.team")}
                                      </th>
                                      <th className="table-head">
                                        {t("user.name")}
                                      </th>
                                      <th className="table-head">
                                        {t("user.fname")}
                                      </th>
                                      <th className="table-head">
                                        {t("user.job")}
                                      </th>
                                      <th className="table-head">Email </th>
                                      <th className="table-head">
                                        {t("user.Profile")}
                                      </th>
                                      <th className="table-head">
                                        {" "}
                                        {t("user.Creation date")}{" "}
                                      </th>

                                      <th className="table-head">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody style={{ padding: "10px 10px" }}>
                                    {/* {sortedUsers?.map((user, index) => ( */}
                                    <tr>
                                      <td className="table-data">
                                        {user?.images ? (
                                          <img
                                            className="logo"
                                            width={50}
                                            height={50}
                                            src={`${Assets_URL}/${user?.image}`}
                                            alt="logo"
                                          />
                                        ) : (
                                          <FaUserCircle size={30} />
                                        )}
                                      </td>
                                      <td className="table-data">
                                        {team?.name}
                                      </td>
                                      <td className="table-data">
                                        {user?.name}
                                      </td>
                                      <td className="table-data">
                                        {user.last_name}
                                      </td>
                                      <td className="table-data">
                                        {user?.post}
                                      </td>
                                      <td className="table-data">
                                        {user?.email}
                                      </td>
                                      <td className="table-data">
                                        {
                                          (
                                            () => {
                                              const roleName = user?.role?.name;
                                              if (roleName === "MasterAdmin") {
                                                return "Master"
                                              } else if (roleName === "SuperAdmin") {
                                                return "Créateur"
                                              }else if (roleName === "Admin"){
                                                return "Administrator"
                                              }else{
                                                return "Guide"
                                              }

                                              return roleName;
                                            }
                                          )()
                                        }
                                      </td>
                                      <td className="table-data">
                                        {(user?.created_at).substring(0, 10)}
                                      </td>
                                      <td className="table-data d-flex align-items-center">

                                        {
                                          (
                                            () => {

                                              if (getUserRoleID() === 1) {
                                                return (
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
                                                            handleUpdateUser(user?.id)
                                                          }
                                                        >
                                                          <CiEdit size={"20px"} /> &nbsp;
                                                          {t("user.modify")}
                                                        </a>
                                                      </li>
                                                      <li
                                                        onClick={() =>
                                                          handleChangeStatus(user?.id)
                                                        }
                                                      >
                                                        <a
                                                          className="dropdown-item"
                                                          style={{ cursor: "pointer" }}
                                                        >
                                                          <RiDeleteRow size={"20px"} />{" "}
                                                          &nbsp;
                                                          {t("user.Deactivate")}
                                                        </a>
                                                      </li>
                                                    </ul>
                                                  </div>
                                                )
                                              } else if (getUserRoleID() === 3 && user?.role?.name !== "SuperAdmin" && user?.role?.name !== "MasterAdmin") {
                                                return <>
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
                                                            handleUpdateUser(user?.id)
                                                          }
                                                        >
                                                          <CiEdit size={"20px"} /> &nbsp;
                                                          {t("user.modify")}
                                                        </a>
                                                      </li>
                                                      <li
                                                        onClick={() =>
                                                          handleChangeStatus(user?.id)
                                                        }
                                                      >
                                                        <a
                                                          className="dropdown-item"
                                                          style={{ cursor: "pointer" }}
                                                        >
                                                          <RiDeleteRow size={"20px"} />{" "}
                                                          &nbsp;
                                                          {t("user.Deactivate")}
                                                        </a>
                                                      </li>
                                                    </ul>
                                                  </div>
                                                </>
                                              } else if (getUserRoleID() === 2 && user?.role?.name !== "MasterAdmin") {
                                                return <>
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
                                                            handleUpdateUser(user?.id)
                                                          }
                                                        >
                                                          <CiEdit size={"20px"} /> &nbsp;
                                                          {t("user.modify")}
                                                        </a>
                                                      </li>
                                                      <li
                                                        onClick={() =>
                                                          handleChangeStatus(user?.id)
                                                        }
                                                      >
                                                        <a
                                                          className="dropdown-item"
                                                          style={{ cursor: "pointer" }}
                                                        >
                                                          <RiDeleteRow size={"20px"} />{" "}
                                                          &nbsp;
                                                          {t("user.Deactivate")}
                                                        </a>
                                                      </li>
                                                    </ul>
                                                  </div>
                                                </>
                                              } else if (getUserRoleID() === 4 && user?.role?.name !== "MasterAdmin" && user?.role?.name !== "SuperAdmin" && user?.role?.name !== "Admin") {
                                                return <>
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
                                                            handleUpdateUser(user?.id)
                                                          }
                                                        >
                                                          <CiEdit size={"20px"} /> &nbsp;
                                                          {t("user.modify")}
                                                        </a>
                                                      </li>
                                                      <li
                                                        onClick={() =>
                                                          handleChangeStatus(user?.id)
                                                        }
                                                      >
                                                        <a
                                                          className="dropdown-item"
                                                          style={{ cursor: "pointer" }}
                                                        >
                                                          <RiDeleteRow size={"20px"} />{" "}
                                                          &nbsp;
                                                          {t("user.Deactivate")}
                                                        </a>
                                                      </li>
                                                    </ul>
                                                  </div>
                                                </>
                                              }
                                            }

                                          )()
                                        }
                                      </td>
                                    </tr>
                                    {/* ))} */}
                                  </tbody>
                                </Table>
                                <div className="user-status">
                                  <span
                                    className={`badge ${user.status === "active"
                                      ? "bg-success"
                                      : "bg-danger"
                                      }`}
                                  >
                                    {user.status === "active"
                                      ? t("user.validated account")
                                      : t("user.account awaiting validation")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )
                  )}
                  <div className="d-flex justify-content-center my-3">
                    <button className="btn btn-primary" onClick={goBack}>
                      Revenir à la page précédente
                    </button>
                  </div>
                </>
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

export default ActiveUser;

