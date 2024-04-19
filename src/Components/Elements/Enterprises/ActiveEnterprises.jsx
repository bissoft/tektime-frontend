import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi2";
import { Table } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { Assets_URL } from "../../Apicongfig";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";

// Annuelle (12 mois) 1 year
// Mensuelle (1 mois) 1 month
// Trimestrielle (3 mois) 3 month
// Semestrielle  (6 mois) 6 month

const ActiveEnterprises = ({ setActiveTab }) => {
  const [enterprises, setEnterprises] = useState([]); //enterprises list
  const [t] = useTranslation("global");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setHeaderTitle } = useHeaderTitle();
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
  const handleArhciveClick = async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/enterprises/${id}/status`,
        {
          status: "closed",
          _method: "put",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Enterprise archived successfully!");
        setActiveTab("Entreprises archivées");
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    const fetchAllEnterprises = async () => {
      try {
        const URL = `${API_BASE_URL}/enterprises`;
        const response = await axios.get(URL, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (response.status === 200) {
          if (getUserRoleID() == 1) {
            // No need to filter
            setEnterprises(response?.data?.data);
          } else {
            // Filter enterprises
            const filteredEnterprises = response?.data?.data?.filter(
              (enterprise) =>
                enterprise.created_by.id.toString() ===
                sessionStorage.getItem("user_id").toString()
            );
            setEnterprises(filteredEnterprises);
          }
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    fetchAllEnterprises();
  }, []);

  const sortedEnterprises = enterprises.sort((a, b) => (a.id < b.id ? 1 : -1)); // sorting enterprises by id in order of creation (newest to oldest)
  const handlelinkEnterprises = (id) => {
    navigate(`/EntreprisesToTeam/${id}`);
  };
  return (
    <div className="enterprise">
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          <div className="col-md-12 py-3">
            {loading ? (
              <Spinner
                animation="border"
                variant="primary"
                className="center-spinner"
              />
            ) : sortedEnterprises?.length === 0 ? (
              <NoContent title="Active Enterpirse" />
            ) : (
              sortedEnterprises.map((item) => {
                return (
                  // item.status !== "closed" && ( // do not show archived enterprises
                  <div className="card my-4" key={item.id}>
                    <div className="card-body">
                      <div className="cardbody">
                        <Table responsive>
                          <thead>
                            <tr>
                              {tableHeadText.map((item, index) => {
                                return (
                                  <th className="table-head" key={index}>
                                    {item}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody style={{ padding: "10px 10px" }}>
                            <tr>
                              <td className="table-data">
                                {item.logo === null ? (
                                  <HiUserCircle size={"40px"} />
                                ) : (
                                  <img
                                    className="logo"
                                    src={`${Assets_URL}${item.logo}`}
                                    alt="logo"
                                    width={50}
                                    height={50}
                                  />
                                )}
                              </td>
                              <td className="table-data">{item.name}</td>
                              <td className="table-data">
                                {item?.created_by?.name +
                                  " " +
                                  item?.created_by?.last_name}
                              </td>
                              <td className="table-data">
                                {item.contract?.name}
                              </td>
                              <td className="table-data">
                                {item.users.length} /
                                {item.contract?.no_of_licenses}
                              </td>
                              <td className="table-data">
                                {item?.activity_area}
                              </td>
                              <td className="table-data">{}</td>
                              <td className="table-data">
                                {
                                  new Date(item?.created_at)
                                    .toISOString()
                                    .split("T")[0]
                                }
                              </td>
                              {/* <td className="table-data">
                                {
                                  new Date(item.contract?.created_at)
                                    .toISOString()
                                    .split("T")[0]
                                }
                              </td> */}
                              <td className="table-data">
                                {item.contract?.payment_type ===
                                  "Annuelle (12 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(item.created_at);
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
                                {item.contract?.payment_type ===
                                  "Mensuelle (1 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(item.created_at);
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
                                {item.contract?.payment_type ===
                                  "Trimestrielle (3 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(item.created_at);
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
                                {item.contract?.payment_type ===
                                  "Semestrielle (6 mois)" && (
                                  <>
                                    {(() => {
                                      let createdAt = new Date(item.created_at);
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
                                        titleText: "Entreprises Actives",
                                        link: "/Enterprises",
                                      },
                                      {
                                        titleText: item?.name,
                                        link: `/EntreprisesToTeam/${item?.id}`,
                                      },
                                    ]);
                                    handlelinkEnterprises(item?.id);
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
                                      <Link
                                        to={`/ModifierEnterprises/${item.id}`}
                                        className="dropdown-item"
                                        style={{ cursor: "pointer" }}
                                      >
                                        <CiEdit size={"20px"} /> &nbsp;
                                        {t("Entreprise.modify")}
                                      </Link>
                                    </li>
                                    {/* <li>
                                        <a
                                          className="dropdown-item"
                                          style={{ cursor: "pointer" }}
                                          onClick={() => {
                                            handleDuplicateClick(item?.id);
                                          }}
                                        >
                                          <MdContentCopy size={"20px"} /> &nbsp;
                                          Dupliquer
                                        </a>
                                      </li> */}
                                    <li>
                                      <a
                                        className="dropdown-item"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          handleArhciveClick(item?.id);
                                        }}
                                      >
                                        <RiDeleteRow size={"20px"} /> &nbsp;
                                        {t("Entreprise.close")}
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
                  // )
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveEnterprises;
