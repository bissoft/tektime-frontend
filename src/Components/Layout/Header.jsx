import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../Apicongfig";
import { FaUserPen } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../context/HeaderTitleContext";
import axios from "axios";

function Header({ onSignin, onLogout, isAuthenticated }) {
  const { profileImage, setProfileImage } = useHeaderTitle();
  const [imageError, setImageError] = useState(false);
  const { title, popHeaderTitle } = useHeaderTitle();
  const location = useLocation();
  const params = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [profileImage, setProfileImage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [t, i18n] = useTranslation("global");

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const getHeaderText = () => {
    switch (location.pathname) {
      case "/":
        return t("header.home");
      case "/Enterprises":
        return t("header.enterprises");
      case "/enterprises":
        return t("header.enterprises");
      case "/meeting":
        return t("header.myEvents");
      case location.pathname.startsWith("/tektime/"):
        if (params.id) {
          return t("header.trainingWithId", { id: params.id });
        } else {
          return t("header.training");
        }
      case "/graph":
        return t("header.newMeeting");
      case location.pathname.startsWith("/presentation/"):
        return t("header.automatedReport");
      case "/profile":
        return t("header.myProfile");
      case "/Team":
        return t("header.teams");
      case "/Invities":
        return t("header.guests");
      case "/contract":
        return t("header.contract");
      case "/drafts":
        return t("header.drafts");
      case `/validateMeeting/${params.id}`:
        return t("header.validateMeeting");
      case `/validateMeeting2/${params.id}`:
        return t("header.validateMeeting");
      // DYNAMIC ROUTES
      case "/CopyContract":
        return t("header.duplicateContract");
      case `/CopyContract/${params.id}`:
        return t("header.duplicateContract");
      case `/ModifierContract/${params.id}`:
        return t("header.modifyContract");
      case `/ModifierEnterprises/${params.id}`:
        return t("header.modifyEnterprise");
      case `/ModifierTeam/${params.id}`:
        return t("header.modifyTeam");
      case `/readContract/${params.id}`:
        // Contract Details
        return t("header.contractDetails");
      case `/CopyClosedContract/${params.id}`:
        return t("header.duplicateContract");
      case `/ModifierUser/${params.id}`:
        return t("header.modifyUser");
      case `/view/${params.id}`:
        return t("header.preview");
      case `/updateParticipant/${params.id}`:
        return t("header.modifyParticipant");
      case `/participant/${params.id}`:
        return t("header.partcipantDetail");
      case `/completeedit/${params.id}`:
        return t("header.modifyMeeting");
      case `/meetingDetail/${params.id}`:
        return t("header.meetingDetail");
      case `/play/${params.id}`:
        return <img src="/Assets/Tek.png" width="60px" alt="Tektime" />;
      case `/draft/${params.id}`:
        return t("header.draftMeeting");
      case `/presentation/${params.id}`:
        return t("header.reporting");
      case `/presentationreport/${params.id}`:
        return t("header.reporting");
      case `/step-details/${params.id}`:
        return "Détails de l'étape";
      // return t("header.stepDetails");
      default:
      //   return t("header.default");
    }
  };

  const handleScroll = () => {
    if (window.scrollY > 0) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const userID = sessionStorage.getItem("user_id");
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (response.status === 200) {
          // console.log("response in header", response);
          setProfileImage(response.data.data.image);
        }
      } catch (error) {
        // console.log(error?.message);
      }
    };
    getUser();
  }, [userID]);

  return (
    <div className={` ${scrolled ? "header" : "header"}`}>
      <div className="container-fluid">
        <div className="pt-3 row">
          <div className="my d-flex justify-content-between align-items-center">
            <div></div>
            <div>
              <div>
                {getHeaderText() ? (
                  <h3>{getHeaderText()}</h3>
                ) : (
                  <h5>
                    {title.length > 0 &&
                      Array.isArray(title) &&
                      title.map((item, index) => {
                        const isLast = index === title.length - 1;
                        return (
                          <span className="breadcrumbs">
                            <Link
                              className={`${isLast ? "opacity-50" : ""}`}
                              to={item.link}
                              onClick={() => {
                                const items_to_pop = title.length - index - 1;
                                for (let i = 0; i < items_to_pop; i++) {
                                  popHeaderTitle();
                                }
                              }}
                            >
                              {item.titleText}
                            </Link>
                            <span>&nbsp; {!isLast && ">"} &nbsp;</span>
                          </span>
                        );
                      })}
                  </h5>
                )}
              </div>
            </div>
            <div>
              <div className="btn-group pf-btn">
                <button
                  type="button"
                  className="drop-btn pf-btn"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    className="user-img"
                    // src={
                    //   !imageError
                    //     ? `${Assets_URL}/${profileImage} `
                    //     : "/Assets/avatar.jpeg"
                    // }
                    src={Assets_URL + "/" + profileImage}
                    alt="profile"
                    onErrorCapture={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Assets/avatar.jpeg";
                    }}
                  />
                </button>
                <ul className="dropdown-menu">
                  <li style={{ paddingLeft: "5px" }}>
                    <Link
                      className="dropdown-item"
                      to="/profile"
                      // onClick={handleProfile}
                    >
                      <FaUserPen size={23} />
                      &nbsp;&nbsp;&nbsp; Profile
                    </Link>
                  </li>
                  <li>
                    <div className="mt-1 swtich">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="languageSwitch"
                          role="switch"
                          checked={i18n.language === "fr"} // Set the checked state based on the current language
                          onChange={() =>
                            handleChangeLanguage(
                              i18n.language === "fr" ? "en" : "fr"
                            )
                          }
                        />
                      </div>
                      <label
                        className="form-check-label"
                        htmlFor="languageSwitch"
                      >
                        {i18n.language === "fr" ? "Français" : "English"}
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <hr />
      </div>
    </div>
  );
}

export default Header;