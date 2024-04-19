import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BiShow, BiHide } from "react-icons/bi";
import { AiOutlineUser } from "react-icons/ai";
import { toast } from "react-toastify";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import {
  getLoggedInUser,
  getUserRoleID,
} from "../../Utils/getSessionstorageItems";
import Select from "react-select";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { Button, Spinner } from "react-bootstrap";

const AVATAR_SRC = "/public/Assets/avatar.jpeg";

function validatePasswords(passwordString, confirmPasswordString) {
  if (passwordString !== confirmPasswordString) {
    return false;
  }
  if (passwordString.length < 8 && passwordString.length > 0) {
    return false;
  }
  return true;
}

function Profile() {
  const { profileImage, setProfileImage } = useHeaderTitle();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    last_name: "",
    nick_name: "",
    post: "",
    // teams: [],
    team_id_array: [],
    team_id: [],
    role_id: "",
    link: "",
    picture: AVATAR_SRC,
    login: "",
    enterprise_id: "",
    job: "",
    user_id: "",
    confirmed_password: "",
  });
  const [t] = useTranslation("global");
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [responseData, setResponseData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userID = sessionStorage.getItem("user_id");

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);

  const [allTeams, setAllTeams] = useState([]);

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

  const teamOptions = teams?.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  useEffect(() => {
    const getUserDataFromAPI = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        const user = response?.data?.data;
        if (user) {
          // setLEnt(user.enterprise)
          setEnterprise(user.enterprise_id);
          setResponseData(response?.data?.data);
          setUserData({
            ...userData,
            email: user.email,
            name: user.name,
            last_name: user.last_name,
            nick_name: user.nick_name,
            team: user.team,
            link: user.link,
            picture: user.image,
            login: user.login,
            enterprise: user.enterprise,
            post: user.post,
            user_id: user.user_id,
            role_id: user.role.id,
            team_id: user?.teams?.map((team) => team.id),
            // teams: teams,
            // // team_id: [...user.teams.map((team) => team?.id), ...selectedTeams],
            // team_id_array:[...user.teams.map((team) => team?.id), ...selectedTeams], // array of team ID's
            // team_id_array: user.teams.map((team) => team?.id), // array of team ID's
            enterprise_id: user.enterprise_id,
          });
          setImagePreview(`${Assets_URL}${user.image}`);
          // Set the team IDs array
          // const teamIds = user.teams.map((team) => team?.name);
          // const teamIds = user?.teams?.map((team) => ({
          //   value: team.id,
          //   label: team.name,
          // }));
          setSelectedTeams(
            response.data.data?.teams?.map((team) => ({
              value: team.id,
              label: team.name,
            }))
          );
          //  selectedTeams(teamIds?.map((teamId) => teamId.value));
          // setSelectedValue(teamIds?.map((teamId) => teamId.label));
        } //
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error.message));
        // console.log(error?.message);
      } finally {
        setLoading(false);
      }
    };
    const getTeams = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const filterredActiveTeams = response?.data?.data?.filter(
            (team) => team.status === "active"
          );
          if (getUserRoleID() === 3) {
            // const user = JSON.parse(sessionStorage.getItem("user"));
            // console.log("user", user.enterprise.id);
            // const filterredTeams = filterredActiveTeams?.filter(
            //   (team) => team.created_by.enterprise_id === user.enterprise_id
            // );
            // console.log("admin Teams-->", filterredTeams);
            // setTeams(filterredTeams);
            // const teams = filterredActiveTeams.filter(
            //   (team) =>
            //     team.created_by.id.toString() ===
            //     sessionStorage.getItem("user_id").toString()
            // );
            setAllTeams(response?.data?.data);
            const teams = response.data.data.filter(
              (team) => team?.enterprise?.id === response?.data?.enterprise?.id
            );
            setTeams(teams);
          } else {
            setAllTeams(response?.data?.data);
            const teams = response.data.data.filter(
              (team) => team?.enterprise?.id === response?.data?.enterprise?.id
            );
            setTeams(teams);
          }
        }
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error.message));
        // console.log("error message", error);
      }
    };
    getUserDataFromAPI();
    getTeams();
  }, [userID]);

  const [allEnterprises, setAllEnterprises] = useState([]);
  const [enterprise, setEnterprise] = useState(""); //enterprisse dropdown;
  const localEnterprise = JSON.parse(sessionStorage.getItem("user"));
  const [lEnt, setLEnt] = useState(localEnterprise); //enterprisse dropdown;

  const roleID = getUserRoleID();
  useEffect(() => {
    // For Master admin
    const getAllEnterprises = async () => {
      const token = sessionStorage.getItem("token");
      const requestURL = `${API_BASE_URL}/enterprises`;
      try {
        const response = await axios.get(requestURL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (roleID === 1) {
          // Master admin
          const allActiveEnterprises = response.data.data.filter(
            (ent) => ent.status === "active"
          );
          setAllEnterprises(allActiveEnterprises);
        } else if (roleID !== 1) {
          // Admin, Super-Admin, etc.
          const enterprisesCreatedByCurrentAdmin = response.data.data.filter(
            (enterprise) => enterprise.created_by.id === getLoggedInUser().id
          );
          setAllEnterprises(enterprisesCreatedByCurrentAdmin);
        }
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error.message));
        // console.error("Error fetching data from server:", error);
      }
    }; //
    getAllEnterprises();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setUserData({
        ...userData,
        picture: file,
      });
    } else {
      setImagePreview(`${Assets_URL}${responseData.image}`);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleUpdateProfile = async () => {
    setIsLoading(true);

    // Step 1: Validate the password
    const password = userData.password;
    const confirmed_password = userData.confirmed_password;
    const isValidPassword = validatePasswords(password, confirmed_password);

    const teamId = userData.team_id;
    if (teamId.length === 0) {
      toast.error(t("messages.user.profile.teamError"));
      setIsLoading(false);
      return;
    }
    console.log("lastName:",userData.last_name)
    if (userData.name === null || userData.name === "") {
      toast.error(t("messages.user.profile.lastNameError"));
      setIsLoading(false);
      return;
    }
    if (userData.last_name === null || userData.last_name === "") {
      toast.error(t("messages.user.profile.nameError"));
      setIsLoading(false);
      return;
    }
    console.log("enterprise:", enterprise);
    if (enterprise === null) {
      toast.error(t("messages.user.profile.enterpriseError"));
      setIsLoading(false);
      return;
    }
    if (!isValidPassword) {
      toast.error(t("messages.user.profile.passwordError"));
      setIsLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const teamIds = Array.isArray(userData.team_id)
        ? userData.team_id
        : userData.team_id.split(",").map((id) => parseInt(id.trim()));
      // formData.append("team_id", JSON.stringify(teamIds));
      const payload = {
        name: userData.name,
        last_name: userData.last_name,
        nick_name: userData.nick_name,
        link: userData.link,
        post: userData.post,
        email: userData.email,
        enterprise_id: enterprise,
        team_id: teamIds,
        role_id: userData.role_id,
        image: userData.picture,
        _method: "put",
      };
      const response = await axios.post(
        // Use PUT method for update
        `${API_BASE_URL}/users/${userID}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        sessionStorage.setItem("user", JSON.stringify(response.data.data));
        toast.success(t("messages.user.profile.updateSuccess"));
        navigate(-1);
        console.clear();
        // console.log("PI", profileImage);
        setProfileImage(response.data.data.image);

        // console.log("PI", response.data.data.image);
      }
    } catch (error) {
      // Handle specific errors related to validation, if needed
      if (error.response && error.response.status === 422) {
        toast.error(t("messages.user.profile.validationError"));
      } else {
        toast.error(t("messages.user.profile.updateError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
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
        <div className="profile">
          <div className="container-fluid pb-5">
            <div className="row justify-content-center">
              <div className="col-md-3">
                <div className="image-uploader mt-4">
                  <div
                    className={`image-preview ${isHovered ? "hovered" : ""}`}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleButtonClick}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Uploaded" />
                    ) : (
                      <>
                        <div className="avatar">
                          <AiOutlineUser size={200} color="grey" />
                        </div>
                        {isHovered && !isEditing && (
                          <div className="upload-text">Click to Upload</div>
                        )}
                      </>
                    )}
                    {isHovered && !isEditing && (
                      <div className="upload-text">Click to Upload</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.name")}</h6>
                  </label>
                  <input
                    placeholder={t("profile.name")}
                    type="text"
                    className="form-control"
                    name="name"
                    value={
                      userData.name === "null" ? " " : userData.name || " "
                    }
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.fname")}</h6>
                  </label>
                  <input
                    placeholder={t("profile.fname")}
                    type="text"
                    className="form-control"
                    name="name"
                    value={
                      userData.last_name === "null"
                        ? " "
                        : userData.last_name || " "
                    }
                    onChange={(e) =>
                      setUserData({ ...userData, last_name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.nickname")}</h6>
                  </label>
                  <input
                    placeholder={t("profile.nickname")}
                    type="text"
                    className="form-control"
                    name="login"
                    value={
                      userData.nick_name === "null"
                        ? `${t("profile.nickname")}`
                        : userData.nick_name || " "
                    }
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        nick_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>Email</h6>
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="form-control"
                    name="email"
                    value={
                      userData.email === "null" ? " " : userData.email || " "
                    }
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label pass-lab">
                    <h6>{t("profile.password")}</h6>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      aria-label={
                        passwordVisible ? "Hide Password" : "Show Password"
                      }
                      onClick={togglePasswordVisibility}
                    >
                      {passwordVisible ? (
                        <BiHide color="#145CB8" />
                      ) : (
                        <BiShow color="#145CB8" />
                      )}
                    </button>
                  </label>
                  <input
                    placeholder={t("profile.password")}
                    type={passwordVisible ? "text" : "password"}
                    className="form-control"
                    value={userData.password}
                    id="password"
                    name="password"
                    onChange={(e) => {
                      setUserData({ ...userData, password: e.target.value });
                    }}
                    autoComplete="off"
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="confirm-password"
                    className="form-label pass-lab"
                  >
                    <h6>{t("profile.cpassword")}</h6>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      aria-label={
                        passwordVisible1 ? "Hide Password" : "Show Password"
                      }
                      onClick={togglePasswordVisibility1}
                    >
                      {passwordVisible1 ? (
                        <BiHide color="#145CB8" />
                      ) : (
                        <BiShow color="#145CB8" />
                      )}
                    </button>
                  </label>
                  <input
                    placeholder={t("profile.cpassword")}
                    type={passwordVisible1 ? "text" : "password"}
                    name="password_confirmation"
                    className="form-control"
                    id="confirm-password"
                    value={userData.confirmed_password || ""}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        confirmed_password: e.target.value,
                      })
                    }
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.company")}</h6>
                  </label>
                  <select
                    className="select"
                    disabled={getUserRoleID() === 1 ? false : true}
                    name="enterprise_id"
                    value={enterprise}
                    // onChange={handleInputChange}
                    onChange={(e) => {
                      setEnterprise(e.target.value);
                      const corresponsingTeams = allTeams.filter(
                        (team) => team?.enterprise_id == e.target.value
                      );
                      setTeams(corresponsingTeams);
                      // setSelectedTeams(corresponsingTeams.map((item) => {
                      //   return { value: item.id, label: item.name }
                      // }));
                    }}
                  >
                    <option value="" disabled>
                      {t("profile.company")}
                    </option>
                    {roleID !== 2 && roleID !== 3 && roleID !== 4 ? (
                      allEnterprises?.map((enterprise) => (
                        <option key={enterprise.id} value={enterprise.id}>
                          {enterprise?.name}
                        </option>
                      ))
                    ) : (
                      <option value={lEnt?.enterprise_id}>
                        {lEnt?.enterprise?.name}
                      </option>
                    )}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.team")}</h6>
                  </label>
                  <Select
                    className="react-select"
                    id="teamSelect"
                    isMulti
                    name="team_id"
                    isDisabled={getUserRoleID() === 4 ? true : false}
                    options={
                      Array.isArray(teamOptions) && teams?.length > 0
                        ? teamOptions
                        : []
                    }
                    value={selectedTeams}
                    onChange={handleSelectInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.job")}</h6>
                  </label>
                  <input
                    placeholder={t("profile.job")}
                    type="text"
                    value={
                      userData?.post === "null" ? " " : userData?.post || " "
                    }
                    className="form-control"
                    name="post"
                    onChange={(e) =>
                      setUserData({ ...userData, post: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.link")}</h6>
                  </label>
                  <input
                    placeholder={t("profile.link")}
                    type="text"
                    className="form-control"
                    value={userData.link === "null" ? "" : userData.link || ""}
                    name="link"
                    onChange={(e) =>
                      setUserData({ ...userData, link: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-5">
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
                <>
                  <button className="btn1" onClick={handleUpdateProfile}>
                    {t("profile.update")}
                  </button>
                </>
              )}
              <button className="btn btn-danger" onClick={() => navigate(-1)}>
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;