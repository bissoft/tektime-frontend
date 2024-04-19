import React, { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Spinner, Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { MdRestartAlt } from "react-icons/md";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";
import { toast } from "react-toastify";

const ClosedUsers = ({ setActiveTab }) => {
  const { id } = useParams();
  const [t] = useTranslation("global");

  const handleChangeStatus = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/${id}/status`,
        { status: "active", _method: "put" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        getClosedUser();
        setActiveTab("Utilisateurs désactivés");
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      console.log("error", error);
    }
  };
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const getClosedUser = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status) {
        setUser(response?.data?.data);
        setLoading(true);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    const getClosedUser = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status) {
          setUser(response?.data?.data);
          setLoading(true);
        }
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error.message));
        // console.log("error message", error);
      }
    };
    getClosedUser();
  }, [setActiveTab, loading]);
  const sortedUsers =
    Array.isArray(user?.users) && user?.users?.length > 0
      ? [...user?.users].sort((a, b) => {
          if (a.id && b.id) {
            return b.id - a.id;
          }
          return 0;
        })
      : [];
  const isAnyUserClosed =
    sortedUsers && sortedUsers.some((user) => user.status === "closed");
  const goBack = () => {
    setActiveTab("Utilisateurs actifs");
  };
  return (
    <div className="closed-user">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {loading ? (
              !isAnyUserClosed ? (
                <>
                  <NoContent title={`Closed User of ${user.name}`} />
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
                      user?.status == "closed" && (
                        <>
                          <div className="card mb-4" key={index}>
                            <div className="card-body">
                              <div className="cardbody">
                                <h5>{user?.name}</h5>
                                <Table responsive>
                                  <thead>
                                    <tr>
                                      <th className="table-head">logo</th>
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
                                        {t("user.Deactivation date")}
                                      </th>

                                      <th className="table-head">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody style={{ padding: "10px 10px" }}>
                                    {/* {sortedUsers?.map((user, index) => ( */}
                                    <tr>
                                      <>
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
                                      </>
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
                                        {user?.role?.name}
                                      </td>
                                      <td className="table-data">
                                        {(user?.updated_at).substring(0, 10)}
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
                                            <li
                                              onClick={() =>
                                                handleChangeStatus(user?.id)
                                              }
                                            >
                                              <a
                                                className="dropdown-item"
                                                style={{ cursor: "pointer" }}
                                              >
                                                <MdRestartAlt size={"20px"} />{" "}
                                                &nbsp;
                                                {t("user.reactive")}
                                              </a>
                                            </li>
                                          </ul>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                                <span
                                  className={`badge ${
                                    user.status === "closed"
                                      ? "bg-danger"
                                      : "bg-danger"
                                  }`}
                                >
                                  {t("user.closed")}
                                </span>
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
};

export default ClosedUsers;
