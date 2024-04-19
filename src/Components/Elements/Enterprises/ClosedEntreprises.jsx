import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Spinner, Table } from "react-bootstrap";
import { HiUserCircle } from "react-icons/hi2";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { VscActivateBreakpoints } from "react-icons/vsc";
import { toast } from "react-toastify";
import { MdRestartAlt } from "react-icons/md";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";

function sortByDateDescending(objects) {
  return objects.sort((a, b) => {
    const dateA = new Date(a.updated_at);
    const dateB = new Date(b.updated_at);

    return dateB - dateA; // Sort in descending order (newest first)
  });
}

const ClosedEntreprises = ({ setActiveTab }) => {
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } =
    useHeaderTitle();
  const [enterprises, setEnterprises] = useState([]);
  const [t] = useTranslation("global");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handlelinkEnterprises = (id) => {
    navigate(`/EntreprisesToTeam/${id}`);
  };

  const tableHeadText = [
    "Logo",
    t("Entreprise.fname"),
    t("Entreprise.Creator"),
    t("Entreprise.subscription"),
    t("Entreprise.Number of Licenses"),
    t("Entreprise.Activity area"),
    t("Entreprise.Number of renewals"),
    t("Entreprise.Date of creation"),
    // t("Entreprise.Start date"),
    t("Entreprise.End date"),
    "Action",
  ];

  const handleReactiveClick = async (id) => {
    try {
      setLoading(true);
      const REQUEST_URL = API_BASE_URL + "/enterprises/" + id + "/status";
      const response = await axios.post(
        REQUEST_URL,
        {
          status: "active",
          _method: "put",
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setLoading(false);
        toast.success(t("messages.enterprise.reactivate.success"));
        setActiveTab("Entreprises actives");
      }
    } catch (error) {
      // toast(error.response.data.errors);
      if (
        error.response.data.errors == "Enterprise status is closed" ||
        error.response.status == 500
      ) {
        toast.error(t("errors.contractClosed"));
      }
      // console.log(error);
      // toast.error(t("messages.enterprise.reactivate.error"));
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllEnterprises = async () => {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/closed/enterprises`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      //Filter enterprise by roleID.
      // Only show enterprises created by the user
      if (getUserRoleID() == 1) {
        // No need to filter
        setEnterprises(response?.data?.data);
      } else {
        // Filter enterprises
        const filteredEnterprises = response?.data?.data?.filter(
          (enterprise) =>
            enterprise.created_by.toString() ===
            sessionStorage.getItem("user_id").toString()
        );
        setEnterprises(filteredEnterprises);
        setLoading(false);
      } //
      setLoading(false);
    };
    fetchAllEnterprises();
  }, []);

  const sortedEnterprises = sortByDateDescending(enterprises);

  return loading ? (
    <Spinner animation="border" variant="primary" className="center-spinner" />
  ) : (
    <div className="px-4 enterprise">
      {Array.isArray(sortedEnterprises) && sortedEnterprises.length > 0 ? (
        enterprises.map((enterprise) => {
          return (
            enterprises.status !== "closed" && (
              <div className="p-4 my-4 bg-white rounded-3">
                <Table responsive>
                  <thead>
                    <tr>
                      {tableHeadText.map((text) => (
                        <th className="table-head">{text}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="table-data">
                        {enterprise.logo === null ? (
                          <HiUserCircle size={"40px"} />
                        ) : (
                          <img
                            className="logo"
                            src={`${Assets_URL}${enterprise.logo}`}
                            alt="logo"
                            width={50}
                            height={50}
                          />
                        )}
                      </td>
                      <td className="table-data">{enterprise.name}</td>
                      <td className="table-data">
                        {" "}
                        {enterprise?.created_by?.name}
                      </td>
                      <td className="table-data">{enterprise.contract.name}</td>
                      <td className="table-data">
                        {enterprise.contract.no_of_licenses}
                      </td>
                      <td className="table-data">{enterprise.activity_area}</td>
                      <td className="table-data">{}</td>
                      <td className="table-data">
                        {
                          new Date(enterprise.created_at)
                            .toISOString()
                            .split("T")[0]
                        }
                      </td>
                      {/* <td className="table-data">
                        {
                          new Date(enterprise.contract?.created_at)
                            .toISOString()
                            .split("T")[0]
                        }
                      </td> */}
                      {/* <td className="table-data">
                        {enterprise.updated_at?.split("T")[0]}
                      </td> */}
                        <td className="table-data">
                                {enterprise.contract.payment_type ===
                                  "Annuelle (12 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(enterprise.created_at);
                                      createdAt.setFullYear(
                                        createdAt.getFullYear() + 1
                                      );

                                      let year = createdAt.getFullYear();
                                      let month = String(
                                        createdAt.getMonth() + 1
                                      ).padStart(2, "0");
                                      let day = String(
                                        createdAt.getDate()
                                      ).padStart(2, "0");

                                      let formattedDate = `${year}-${month}-${day}`;
                                      return formattedDate;
                                    })()}
                                  </>
                                )}
                                {enterprise.contract.payment_type ===
                                  "Mensuelle (1 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(enterprise.created_at);
                                      createdAt.setMonth(
                                        createdAt.getMonth() + 1
                                      );

                                      let year = createdAt.getFullYear();
                                      let month = String(
                                        createdAt.getMonth() + 1
                                      ).padStart(2, "0");
                                      let day = String(
                                        createdAt.getDate()
                                      ).padStart(2, "0");

                                      let formattedDate = `${year}-${month}-${day}`;
                                      return formattedDate;
                                    })()}
                                  </>
                                )}
                                {enterprise.contract.payment_type ===
                                  "Trimestrielle (3 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(enterprise.created_at);
                                      createdAt.setMonth(
                                        createdAt.getMonth() + 3
                                      ); // Add 3 months

                                      let year = createdAt.getFullYear();
                                      let month = String(
                                        createdAt.getMonth() + 1
                                      ).padStart(2, "0");
                                      let day = String(
                                        createdAt.getDate()
                                      ).padStart(2, "0");

                                      let formattedDate = `${year}-${month}-${day}`;
                                      return formattedDate;
                                    })()}
                                  </>
                                )}
                                {enterprise.contract.payment_type ===
                                  "Semestrielle (6 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(enterprise.created_at);
                                      createdAt.setMonth(
                                        createdAt.getMonth() + 6
                                      ); // Add 6 months

                                      let year = createdAt.getFullYear();
                                      let month = String(
                                        createdAt.getMonth() + 1
                                      ).padStart(2, "0");
                                      let day = String(
                                        createdAt.getDate()
                                      ).padStart(2, "0");

                                      let formattedDate = `${year}-${month}-${day}`;
                                      return formattedDate;
                                    })()}
                                  </>
                                )}
                              </td>
                      <td className="table-data d-flex align-items-center">
                        <IoEyeOutline
                          size={"22px"}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setHeaderTitle([
                              {
                                titleText: "Entreprises archivées",
                                link: "/Enterprises",
                              },
                              {
                                titleText: enterprise?.name,
                                link: `/EntreprisesToTeam/${enterprise?.id}`,
                              },
                            ]);
                            handlelinkEnterprises(enterprise?.id);
                          }}
                        />
                        <div
                          className="dropdown dropstart"
                          style={{
                            position: "absolute",
                            // marginLeft: "1rem",
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
                                onClick={() => {
                                  handleReactiveClick(enterprise?.id);
                                }}
                              >
                                <MdRestartAlt size={"20px"} /> &nbsp;
                                {t("Entreprise.reactive")}
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            )
          );
        })
      ) : (
        <NoContent title="Closed Enterpirse" />
      )}
    </div>
  );
}

export default ClosedEntreprises;
