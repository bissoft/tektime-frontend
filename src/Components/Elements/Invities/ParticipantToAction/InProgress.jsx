import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi2";
import { API_BASE_URL } from "../../../Apicongfig";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import NoContent from "../../Meeting/NoContent";
import { useTranslation } from "react-i18next";

const InProgress = () => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const { id } = useParams();
  const [action, setAction] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const getParticipantAction = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/participants/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (response) {
        setAction(response.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const handleUpdateEnterprises = () => {
    navigate("/ModifierEnterprises");
  };
  useEffect(() => {
    getParticipantAction();
  }, []);

  return (
    <div className="scheduled">
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          {isLoading ? (
            <Spinner
              animation="border"
              role="status"
              className="center-spinner"
            ></Spinner>
          ) : (
            <>
              {/* {action?.participant?.meeting?.plan_d_actions?.length > 0 ? */}
              {action?.participant?.meeting?.plan_d_actions?.filter(
                (item) => item.status === "InProgress"
              ).length > 0 ? (
                action?.participant?.meeting?.plan_d_actions
                  .filter((item) => item.status === "InProgress")
                  .map((item, index) => (
                    <>
                      <div className="col-md-12 py-3" key={index}>
                        <div className="card">
                          <div className="card-body">
                            <div className="cardbody">
                              <div className="row subtitle card2 py-4 px-3">
                                <div className="col-md-1 text-start obj">
                                  <span>{t("actions.order")}</span>
                                </div>
                                <div className="col-md-2 text-center obj">
                                    <span>
                                      {t("actions.title")}
                                    </span>
                                  </div>
                                <div className="col-md-3 text-center obj">
                                  <span>{t("actions.pname")}</span>
                                </div>
                                <div className="col-md-2 text-center obj">
                                  <span>Action</span>
                                </div>
                                <div className="col-md-2 text-center obj">
                                  <span>{t("actions.days")}</span>
                                </div>
                                <div className="col-md-2 text-end obj">
                                  <span>{t("actions.status")}</span>
                                </div>
                              </div>
                              <div className="row py-4 pb-5 text-body-dark px-3">
                                <div className="col-md-1 text-start obj1">
                                  {/* <h6>{item.order}</h6> */}
                                  <h6>{item.order || 0}</h6>
                                </div>
                                <div className="col-md-2 text-center obj1">
                                    <h6>
                                    {action?.participant?.meeting?.title}
                                    </h6>
                                  </div>
                                <div className="col-md-3 text-center obj1">
                                  <h6>
                                    {action.participant.first_name}{" "}
                                    {action.participant.last_name}
                                  </h6>
                                </div>
                                <div className="col-md-2 text-center obj1">
                                  <h6>{item.action}</h6>
                                </div>
                                <div className="col-md-2 text-center obj1">
                                  <h6>{item.action_days === 0 ? item.action_days : (item.action_days).substr(0, 1)}</h6>

                                </div>
                                <div className="col-md-2 text-end obj1">
                                  <h6>{item.status}</h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))
              ) : (
                <>
                  <NoContent
                    title={`InProgress Action of ${action.participant.first_name} ${action.participant.last_name}`}
                  />
                </>
              )}
            </>
          )}

          <button className="btn btn-primary w-25" onClick={() => {
            navigate(-1)
          }}>
            Revenir à la page précédente
          </button>
        </div>
      </div>
    </div>
  );
};

export default InProgress;
