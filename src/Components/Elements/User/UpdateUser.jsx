import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";

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

const UpdateUser = () => {
  const roleID = getUserRoleID();
  const { id } = useParams();
  const navigate = useNavigate();
  const [t] = useTranslation("global");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getuserFromId = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(data.data.teams);
        setSelectedTeams(
          data.data.teams.map((team) => ({
            value: team.id,
            label: team.name,
          }))
        );
        setUserData({
          ...userData,
          name: data?.data?.name,
          last_name: data?.data?.last_name,
          email: data?.data?.email,
          role_id: data?.data?.role?.id,
          post: data?.data?.post,
          team_id: data?.data?.teams?.map((team) => team.id),
          enterprise_name: data?.data?.enterprise?.name,
          enterprise_id: data?.data?.enterprise?.id,
          teams: teams,
        });
      } catch (error) {
        // console.error("Error fetching User data:", error);
        toast.error(t(error.response?.data?.errors[0] || error.message));
      } finally {
        setLoading(false);
      }
    };

    getuserFromId();
  }, []);

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

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const updateUser = async () => {
    const formData = {
      name: userData.name,
      last_name: userData.last_name,
      email: userData.email,
      post: userData.post,
      role_id: userData.role_id,
      team_id: userData.team_id,
      enterprise_id: userData.enterprise_id,
      _method: "put",
    };

    // console.log("Form data:", formData);
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/users/${id}`,
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        // console.log("Response from server:", userData);
        toast.success(response?.data?.message);
        navigate(-1);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      // console.error("Error updating User:", error);
      toast.error("Error updating User. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify/user`,
        {
          id: id,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Email Sent Successfully");
        // navigate(-1);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      // console.error("Error updating User:", error);
      toast.error("Error updating User. Please try again.");
    }
  };

  return (
    <>
      {loading ? (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
      ) : (
        <>
          <div className="profile">
            <div className="container-fluid">
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
                        <option value="0" disabled>
                          {t("user.Profile")}
                        </option>
                        {roleID === 1
                          ? masterAdminOptions.map((option) => (
                              <option value={option.value}>
                                {option.label}
                              </option>
                            ))
                          : roleID === 2
                          ? superAdminOptions.map((option) => (
                              <option value={option.value}>
                                {option.label}
                              </option>
                            ))
                          : roleID === 3
                          ? adminOptions.map((option) => (
                              <option value={option.value}>
                                {option.label}
                              </option>
                            ))
                          : null}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">
                        <h6>{t("user.company")} </h6>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={userData?.enterprise_name}
                        readOnly
                        name="enterprise_name"
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
                        // options={
                        //   Array.isArray(teamOptions) && userData.teams?.length > 0
                        //     ? teamOptions
                        //     : []
                        // }
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
                        placeholder="Job"
                        onChange={handleInputChange}
                        value={userData.post}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center mt-5 gap-3">
                    <button
                      className="btn btn-primary"
                      onClick={handleGenerateLink}
                    >
                      {t("user.Generate creation link")}
                    </button>
                    {isLoading ? (
                      <div style={{ width: "8%" }}>
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
                    ) : (
                      <button className="btn btn-primary" onClick={updateUser}>
                        {t("user.updateUser")}
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => navigate(-1)}
                    >
                      {t("user.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UpdateUser;