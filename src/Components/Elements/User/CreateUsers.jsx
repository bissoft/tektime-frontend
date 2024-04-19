import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";

/**
 * Master admin can create All Roles.
 * Super admin can create SuperAdmin, Admin and User.
 * Admin can create Admin and User.
 */

const masterAdminOptions = [
  { value: "1", label: "Master" },
  { value: "2", label: "Créateur" },
  { value: "3", label: "Administrateur" },
  { value: "4", label: "Guide" },
];
const superAdminOptions = [
  { value: "3", label: "Administrateur" },
  { value: "4", label: "Guide" },
];
const adminOptions = [
  { value: "3", label: "Administrateur" },
  { value: "4", label: "Guide" },
];

const CreateUsers = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const [t] = useTranslation("global");

  const initialUserData = {
    name: "",
    last_name: "",
    email: "",
    role_id: "",
    post: "",
    enterprise_id: "",
    team_id: [],
  };
  const [userData, setUserData] = useState({
    name: "",
    last_name: "",
    email: "",
    role_id: "",
    post: "",
    team_id: [],
  });

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);
  const [enterprise, setEnterprise] = useState({});
  const [roleID, setRoleID] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSelectInputChange = (selectedOptions, action) => {
    if (action.name === "team_id") {
      const selectedTeams = selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [];

      setUserData({
        ...userData,
        team_id: selectedTeams,
      });
      setSelectedTeams(selectedOptions);
    }
  };

  const getData = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTeams(response?.data?.data);
        // if (getUserRoleID() === 1) {
        //   //Admin can see all teams so no need to filter.
        //   const teams = response.data.data.filter(
        //     (team) => team?.enterprise_id === enterprise.enterprise_id
        //   );
        //   setTeams(teams);
        //   console.log("teams admin-->",teams)
        // } else {
        //   const teams = response.data.data.filter(
        //     (team) => team?.enterprise_id === enterprise.enterprise_id
        //   );
        //   setTeams(teams);
        // }
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };

  const options1 = teams?.filter(
    (team) => team?.enterprise_id === enterprise.enterprise_id
  );
  const teamOptions = options1?.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const createUser = async () => {
    try {
      setIsLoading(true);
      const updatedUserData = {
        ...userData,
        enterprise_id: enterprise.enterprise_id,
      };
      const response = await axios.post(
        `${API_BASE_URL}/users`,
        updatedUserData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setLoading(false);
      if (response.status === 201) {
        setLoading(true);
        setUserData(initialUserData);
        toast.success(t("messages.user.create.success"));
        toast.success(t("messages.user.create.mailSent"));
        setActiveTab("Utilisateurs actifs");
        setSelectedTeams([]);
      }
    } catch (error) {
      // if 400 then show error message.
      if (error.response.status === 400) {
        toast.error(t(error.response?.data?.errors[0] || error.message));
      } else {
        // setShow(true);
        error?.response?.data?.errors?.forEach((error) => {
          toast.error(t("messages.user.create.error"));
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEnterprise = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setEnterprise(response?.data?.data);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    const USER_ROLE_ID = JSON.parse(sessionStorage.getItem("role")).id;
    setRoleID(USER_ROLE_ID);
    getData();
    getEnterprise();
  }, [setActiveTab]);

  const goBack = () => {
    setActiveTab("Utilisateurs actifs");
  };
  return (
    <div className="profile">
      <div className="container-fluid">
        <>
          <div className="card pt-5 pb-5">
            <div className="row justify-content-center">
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.name")}</h6>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder={t("user.name")}
                    onChange={handleInputChange}
                    value={userData.name}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.fname")}</h6>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder={t("user.fname")}
                    onChange={handleInputChange}
                    value={userData.last_name}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>Email</h6>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Email"
                    onChange={handleInputChange}
                    value={userData.email}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    <h6>{t("user.Profile")}</h6>
                  </label>
                  <br />
                  <select
                    className="select"
                    name="role_id"
                    value={userData.role_id}
                    onChange={handleInputChange}
                  >
                    <option value="" selected>
                      {t("user.Profile")}
                    </option>
                    {getUserRoleID() === 1
                      ? masterAdminOptions.map((option) => (
                          <option value={option.value}>{option.label}</option>
                        ))
                      : getUserRoleID() === 2
                      ? superAdminOptions.map((option) => (
                          <option value={option.value}>{option.label}</option>
                        ))
                      : getUserRoleID() === 3
                      ? adminOptions.map((option) => (
                          <option value={option.value}>{option.label}</option>
                        ))
                      : null}
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.company")}</h6>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={enterprise?.enterprise?.name || ""}
                    onChange={handleInputChange}
                    name="enterprise_id"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.team")}</h6>
                  </label>
                  <Select
                    className="react-select"
                    id="teamSelect"
                    isMulti
                    name="team_id"
                    options={teamOptions}
                    value={selectedTeams}
                    onChange={handleSelectInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.job")}</h6>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="post"
                    placeholder={t("user.job")}
                    onChange={handleInputChange}
                    value={userData.post}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-center mt-5 gap-3">
                {isLoading ? (
                  <>
                    <div style={{ width: "12%" }}>
                      <Button
                        variant="blue"
                        disabled
                        className="w-100"
                        style={{
                          backgroundColor: "#3aa5ed",
                          border: "none",
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
                    </div>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={createUser}>
                    {t("user.Generate creation link")}
                  </button>
                )}
                <button className="btn btn-danger" onClick={goBack}>
                  {t("user.cancel")}
                </button>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default CreateUsers;