import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";

function UpdateContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [t] = useTranslation("global");

  const initialContractData = {
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
  };
  const [contractData, setContractData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
  });

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getDataFromId = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/contracts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log("dataaa", data?.data);
        setContractData({
          name: data?.data?.name,
          start_date: data?.data?.start_date,
          end_date: data?.data?.end_date,
          no_of_licenses: data?.data?.no_of_licenses,
          price: data?.data?.price,
          currency: data?.data?.currency,
          payment_type: data?.data?.payment_type,
        });
      } catch (error) {
        // console.error("Error fetching contract data:", error);
        toast.error(t("messages.dataFetchError"));
      } finally {
        setLoading(false);
      }
    };

    getDataFromId();
  }, [id]);

  const goBack = () => {
    window.history.back();
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContractData({
      ...contractData,
      [name]: value,
    });
    // }
  };

  const [isLoading, setIsLoading] = useState(false);
  const updateContract = async () => {
    const token = sessionStorage.getItem("token");
    if (
      contractData.name === "" ||
      contractData.start_date === "" ||
      contractData.end_date === "" ||
      contractData.no_of_licenses === "" ||
      contractData.price === "" ||
      contractData.currency === "" ||
      contractData.payment_type === ""
    ) {
      toast.error(t("messages.contract.create.allFieldsError"));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // const contractId = '';
      const response = await axios.post(
        `${API_BASE_URL}/contracts/${id}`,
        {
          name: contractData.name,
          start_date: contractData.start_date,
          end_date: contractData.end_date,
          no_of_licenses: contractData.no_of_licenses,
          price: contractData.price,
          currency: contractData.currency,
          payment_type: contractData.payment_type,
          _method: "put",
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json", // Update Content-Type
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status) {
        toast.success(t("messages.contract.update.success"));
        setContractData(initialContractData);
        navigate("/contract");
      }
    } catch (error) {
      toast.error(t("messages.contract.update.error"));
    } finally {
      setIsLoading(false);
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
        <div className="create">
          <div className="container-fluid">
            <div className="row justify-content-center ">
              <div className="col-md-5 mb-5">
                <div className="card p-5">
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.name")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t("newContract.name")}
                      name="name"
                      value={contractData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.startDate")}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      //   placeholder="Nom du Contrat"
                      name="start_date"
                      value={contractData.start_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {" "}
                      {t("newContract.endDate")}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      //   placeholder="Nom du Contrat"
                      name="end_date"
                      value={contractData.end_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.paymentFrequency")}
                    </label>
                    <br />
                    <select
                      className="select"
                      name="payment_type"
                      value={contractData.payment_type}
                      onChange={handleInputChange}
                    >
                      <option value="0" selected disabled>
                        {t("newContract.paymentFrequency")}
                      </option>
                      <option value="Mensuelle (1 mois)">
                        {" "}
                        {t("newContract.paymentMethod.monthly")}
                      </option>
                      <option value="Trimestrielle (3 mois)">
                        {" "}
                        {t("newContract.paymentMethod.3month")}
                      </option>
                      <option value="Semestrielle  (6 mois)">
                        {" "}
                        {t("newContract.paymentMethod.6month")}
                      </option>
                      <option value="Annuelle (12 mois)">
                        {" "}
                        {t("newContract.paymentMethod.yearly")}
                      </option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.numberOfLicenses")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      onFocus={(e) =>
                        e.target.addEventListener(
                          "wheel",
                          function (e) {
                            e.preventDefault();
                          },
                          { passive: false }
                        )
                      }
                      className="form-control"
                      placeholder={t("newContract.numberOfLicenses")}
                      name="no_of_licenses"
                      value={contractData.no_of_licenses}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.price")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t("newContract.price")}
                      name="price"
                      value={contractData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.currency")}
                    </label>
                    <br />
                    <select
                      className="select"
                      name="currency"
                      value={contractData.currency}
                      onChange={handleInputChange}
                    >
                      <option value="0" disabled selected>
                        {t("newContract.currency")}
                      </option>
                      <option value="Euro"> Euros</option>
                      <option value="Dollar"> Dollars</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-center gap-4 mt-4 ">
                   {isLoading ? <>
                    <div style={{ width: "47%" }}>
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
                   </> :  <button
                      className="btn btn-primary"
                      onClick={updateContract}
                    >
                      {t("newContract.update")}
                    </button>}
                    <button className="btn btn-danger" onClick={goBack}>
                      {t("newContract.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UpdateContract;