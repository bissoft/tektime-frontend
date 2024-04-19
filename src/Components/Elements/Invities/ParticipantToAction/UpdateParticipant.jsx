import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../Apicongfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";

const UpdateParticipant = () => {
  const [t] = useTranslation("global");
  const { id } = useParams();
  const navigate = useNavigate();
  const [participantData, setParticipantData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParticipantData({
      ...participantData,
      [name]: value,
    });
  };

  const getParticipantData = async () => {
    const token = sessionStorage.getItem("token");
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/participants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setParticipantData(response?.data?.data.participant);
      }
    } catch (error) {
      // console.log("error message", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getParticipantData();
  }, [id]);

  const [isLoading, setIsLoading] = useState(false);
  const handleUpdate = async () => {
    const formData = {
      first_name: participantData.first_name,
      last_name: participantData.last_name,
      email: participantData.email,
      post: participantData.post,
      attandance: participantData.attandance,
      _method: "put",
    };
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/participants/${id}`,
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
        toast.success("Mise à jour des invités réussie");
        navigate(-1);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      // console.error("Error updating User:", error);
      toast.error(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="profile">
      <div className="container-fluid">
        {loading ? (
          <>
            <Spinner
              animation="border"
              role="status"
              className="center-spinner"
            ></Spinner>
          </>
        ) : (
          <div className="card pt-5 pb-5">
            <div className="row justify-content-center">
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.name")}</h6>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder={t("profile.name")}
                    onChange={handleInputChange}
                    value={participantData.first_name}
                    className="form-control"
                    readOnly={window.location.href.includes("/participant")}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("profile.fname")}</h6>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder={t("profile.fname")}
                    onChange={handleInputChange}
                    value={participantData.last_name}
                    className="form-control"
                    readOnly={window.location.href.includes("/participant")}
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
                    value={participantData.email}
                    readOnly={window.location.href.includes("/participant")}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    <h6>{t("profile.post")}</h6>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="post"
                    placeholder={t("profile.post")}
                    onChange={handleInputChange}
                    value={participantData.post}
                    readOnly={window.location.href.includes("/participant")}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center mt-5 gap-3">
                {!window.location.href.includes("/participant") && (
                  <>
                    {isLoading ? (
                      <div style={{ width: "10%" }}>
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
                      <button
                        className="btn btn-primary"
                        onClick={handleUpdate}
                      >
                        {t("profile.update")}
                      </button>
                    )}
                  </>
                )}
                <button className="btn btn-danger" onClick={() => navigate(-1)}>
                  {t("profile.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateParticipant;