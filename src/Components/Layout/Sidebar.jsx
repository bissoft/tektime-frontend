import React from "react";
import { NavLink, useNavigate, useLocation, useParams } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function Sidebar({ isSidebarOpen, toggleSidebar, onLogout }) {
  const [t] = useTranslation("global");
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const isActiveContract = [
    "/ModifierContract",
    "/ContractLinkEntreprises",
    "/ContractToTeam",
    `/readContract/${params.id}`,
    `/ModifierContract/${params.id}`,
    `/CopyContract/${params.id}`,
    `/CopyClosedContract/${params.id}`,
  ].includes(location.pathname);

  const isActiveEntreprises = [
    "/ModifierEnterprises",
    "/EntreprisesToTeam",
    `/ModifierEnterprises/${params.id}`,
  ].includes(location.pathname);

  const isActiveTeam = [
    `/ModifierTeam/${params.id}`,
    `/users/${params.id}`,
    `/ModifierUser/${params.id}`,
  ].includes(location.pathname);

  const isActiveMeeting =
    location.pathname.startsWith("/meeting") ||
    location.pathname.startsWith("/graph") ||
    location.pathname.startsWith("/view") ||
    location.pathname.startsWith("/copy") ||
    location.pathname.startsWith("/d") ||
    location.pathname.startsWith("/Play") ||
    location.pathname.startsWith("/presentation") ||
    location.pathname.startsWith("/validateMeeting") ||
    location.pathname.startsWith("/meetings/drafts");

  const isActiveGuest = [
    "/Invities",
    `/participantToAction/${params.id}`,
    `/updateParticipant/${params.id}`,
  ].includes(location.pathname);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    toast.success(t("header.logoutSuccess"));
    navigate("/");
  };
  const role = sessionStorage.getItem("type");

  return (
    <div
      className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}
      id="sidebar"
    >
      <div className="container-fluid ">
        <div
          className="logo "
          style={{
            padding: isSidebarOpen ? "13px 30px" : "13px 30px",
            cursor: "pointer",
          }}
        >
          <div
            className=" d-flex align-items-center gap-2 pt-1"
            style={{ display: isSidebarOpen ? "block" : "none" }}
          >
            <div style={{ display: isSidebarOpen ? "block" : "none" }}>
              <FaBars
                className="icon"
                color="white"
                onClick={toggleSidebar}
                size={20}
              />
            </div>
            {/* <div className="d-flex pt-1">
              <h2 style={{ display: isSidebarOpen ? "block" : "none" }}></h2>
            </div> */}
          </div>

          {isSidebarOpen ? (
            <></>
          ) : (
            <>
              <FaBars
                className="icon"
                color="white"
                onClick={toggleSidebar}
                size={20}
              />
            </>
          )}
        </div>
        <div className="side-btn ">
          <div style={{ position: "absolute", top: "25%" }}>
            {role !== "SuperAdmin" && role !== "Admin" && role !== "User" && (
              <NavLink
                className={`nav-link ${isActiveContract ? "active" : ""}`}
                activeClassName={role === "MasterAdmin" ? "active" : ""}
                to={"/contract"}
                activeStyle={{ color: "#069AF3" }}
              >
                <button
                  style={{ padding: isSidebarOpen ? "15px 30px" : "15px 20px" }}
                >
                  <img
                    src="/Assets/master.png"
                    alt="dashboard"
                    width={isSidebarOpen ? "25px" : "25px"}
                  />

                  <span
                    style={{
                      display: isSidebarOpen ? "block" : "none",
                      marginLeft: "10px",
                    }}
                  >
                    {t("sidebar.subscriptions")}
                  </span>
                </button>
              </NavLink>
            )}
            {role !== "Admin" && role !== "User" && (
              <NavLink
                className={`nav-link ${isActiveEntreprises ? "active" : ""}`}
                activeClassName={role === "SuperAdmin" ? "active" : ""}
                to={"/Enterprises"}
                activeStyle={{ color: "#069AF3" }}
              >
                <button
                  style={{ padding: isSidebarOpen ? "15px 30px" : "15px 20px" }}
                >
                  <img
                    src="/Assets/super.png"
                    alt="superAdmin"
                    width={isSidebarOpen ? "22px" : "25px"}
                  />

                  <span
                    style={{
                      display: isSidebarOpen ? "block" : "none",
                      marginLeft: "10px",
                    }}
                  >
                    {t("sidebar.enterprises")}
                  </span>
                </button>
              </NavLink>
            )}
            {role !== "User" && (
              <NavLink
                className={`nav-link ${isActiveTeam ? "active" : ""}`}
                activeClassName="active"
                to={"/Team"}
                activeStyle={{ color: "#069AF3" }}
              >
                <button
                  style={{ padding: isSidebarOpen ? "15px 30px" : "15px 20px" }}
                >
                  <img
                    src="/Assets/admin.png"
                    alt="admin"
                    width={isSidebarOpen ? "22px" : "25px"}
                  />

                  <span
                    style={{
                      display: isSidebarOpen ? "block" : "none",
                      marginLeft: "10px",
                    }}
                  >
                    {t("sidebar.teams")}
                  </span>
                </button>
              </NavLink>
            )}
            {
              <NavLink
                className={`nav-link ${isActiveMeeting ? "active" : ""}`}
                activeClassName="active"
                to={"/meeting"}
                activeStyle={{ color: "#069AF3" }}
              >
                <button
                  style={{ padding: isSidebarOpen ? "15px 20px" : "15px 10px" }}
                >
                  <img
                    src="/Assets/logo.png"
                    alt="meeting"
                    width={isSidebarOpen ? "40px" : "45px"}
                  />

                  <span
                    style={{
                      display: isSidebarOpen ? "block" : "none",
                      marginLeft: "0px",
                    }}
                  >
                    {t("sidebar.meetings")}
                  </span>
                </button>
              </NavLink>
            }
            {
              <NavLink
                className={`nav-link ${isActiveGuest ? "active" : ""}`}
                activeClassName={role === "User" ? "active" : ""}
                to="/Invities"
                activeStyle={{ color: "#069AF3" }}
              >
                <button
                  style={{ padding: isSidebarOpen ? "15px 30px" : "15px 20px" }}
                >
                  <img
                    src="/Assets/participants.png"
                    alt="participants"
                    width={isSidebarOpen ? "22px" : "25px"}
                  />

                  <span
                    style={{
                      display: isSidebarOpen ? "block" : "none",
                      marginLeft: "10px",
                    }}
                  >
                    {t("sidebar.guests")}
                  </span>
                </button>
              </NavLink>
            }
          </div>
          <div style={{ position: "absolute", bottom: "20px" }}>
            {
              <NavLink
                className="nav-link"
                to="/"
                activeClassName="active"
                activeStyle={{ color: "#069AF3" }}
              >
                <button
                  style={{
                    padding: isSidebarOpen ? "15px 30px" : "15px 20px",
                  }}
                  onClick={handleLogout}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.945 0.25C12.578 0.25 11.475 0.25 10.608 0.367C9.70796 0.487 8.94996 0.747 8.34796 1.348C7.82396 1.873 7.55796 2.518 7.41896 3.276C7.28396 4.013 7.25796 4.914 7.25196 5.996C7.2509 6.19491 7.3289 6.3861 7.46881 6.5275C7.60871 6.6689 7.79905 6.74894 7.99796 6.75C8.19688 6.75106 8.38806 6.67306 8.52947 6.53316C8.67087 6.39326 8.7509 6.20291 8.75196 6.004C8.75796 4.911 8.78596 4.136 8.89396 3.547C8.99896 2.981 9.16596 2.652 9.40896 2.409C9.68596 2.132 10.075 1.952 10.809 1.853C11.564 1.752 12.565 1.75 14 1.75H15C16.436 1.75 17.437 1.752 18.192 1.853C18.926 1.952 19.314 2.133 19.592 2.409C19.868 2.686 20.048 3.074 20.147 3.809C20.249 4.563 20.25 5.565 20.25 7V15C20.25 16.435 20.249 17.436 20.147 18.192C20.048 18.926 19.868 19.314 19.591 19.591C19.314 19.868 18.926 20.048 18.192 20.147C17.437 20.248 16.436 20.25 15 20.25H14C12.565 20.25 11.564 20.248 10.808 20.147C10.075 20.048 9.68596 19.867 9.40896 19.591C9.16596 19.347 8.99896 19.019 8.89396 18.453C8.78596 17.864 8.75796 17.089 8.75196 15.996C8.75144 15.8975 8.73152 15.8001 8.69334 15.7093C8.65517 15.6185 8.59948 15.5361 8.52947 15.4668C8.45945 15.3976 8.37648 15.3428 8.28528 15.3056C8.19409 15.2684 8.09646 15.2495 7.99796 15.25C7.89947 15.2505 7.80205 15.2704 7.71126 15.3086C7.62046 15.3468 7.53808 15.4025 7.46881 15.4725C7.39953 15.5425 7.34473 15.6255 7.30752 15.7167C7.27032 15.8079 7.25144 15.9055 7.25196 16.004C7.25796 17.086 7.28396 17.987 7.41896 18.724C7.55896 19.482 7.82396 20.127 8.34896 20.652C8.94996 21.254 9.70896 21.512 10.609 21.634C11.475 21.75 12.578 21.75 13.945 21.75H15.055C16.423 21.75 17.525 21.75 18.392 21.634C19.292 21.512 20.05 21.254 20.652 20.652C21.254 20.05 21.512 19.292 21.634 18.392C21.75 17.525 21.75 16.422 21.75 15.055V6.945C21.75 5.578 21.75 4.475 21.634 3.608C21.513 2.708 21.254 1.95 20.652 1.348C20.05 0.746 19.292 0.488 18.392 0.367C17.525 0.25 16.422 0.25 15.055 0.25H13.945Z"
                      fill="white"
                    />
                    <path
                      d="M13.9999 10.25C14.1989 10.25 14.3896 10.329 14.5303 10.4697C14.6709 10.6103 14.7499 10.8011 14.7499 11C14.7499 11.1989 14.6709 11.3897 14.5303 11.5303C14.3896 11.671 14.1989 11.75 13.9999 11.75H3.02695L4.98795 13.43C5.13912 13.5594 5.23269 13.7436 5.24807 13.942C5.26344 14.1404 5.19937 14.3368 5.06995 14.488C4.94052 14.6392 4.75634 14.7327 4.55793 14.7481C4.35952 14.7635 4.16312 14.6994 4.01195 14.57L0.511947 11.57C0.429613 11.4996 0.363509 11.4122 0.318184 11.3138C0.272859 11.2154 0.24939 11.1083 0.24939 11C0.24939 10.8917 0.272859 10.7846 0.318184 10.6862C0.363509 10.5878 0.429613 10.5004 0.511947 10.43L4.01195 7.43C4.0868 7.36591 4.17354 7.3172 4.26722 7.28664C4.3609 7.25607 4.45969 7.24426 4.55793 7.25188C4.65617 7.25949 4.75196 7.28638 4.83981 7.33101C4.92766 7.37565 5.00586 7.43714 5.06995 7.512C5.13403 7.58685 5.18275 7.67359 5.21331 7.76727C5.24387 7.86095 5.25568 7.95973 5.24807 8.05798C5.24045 8.15622 5.21356 8.25201 5.16893 8.33986C5.1243 8.42771 5.0628 8.50591 4.98795 8.57L3.02795 10.25H13.9999Z"
                      fill="white"
                    />
                  </svg>

                  <span
                    style={{
                      display: isSidebarOpen ? "block" : "none",
                      marginLeft: "10px",
                    }}
                  >
                    {t("sidebar.logout")}
                  </span>
                </button>
              </NavLink>
            }
          </div>
        </div>
      </div>{" "}
    </div>
  );
}
export default Sidebar;
