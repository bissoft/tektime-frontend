import React, { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";

function CreateContract({ setActiveTab }) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContractData({
      ...contractData,
      [name]: value,
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const createContract = async () => {
    const token = sessionStorage.getItem("token");
    const errors = {};

    if (contractData.name === "") {
      errors.name = t("messages.contract.create.nameFieldError");
      toast.error(t("messages.contract.create.nameFieldError"));
      return;
    }
    if (contractData.start_date === "") {
      errors.start_date = t("messages.contract.create.startDateFieldError");
      toast.error(t("messages.contract.create.startDateFieldError"));
      return;
    }
    if (contractData.end_date === "") {
      errors.end_date = t("messages.contract.create.endDateFieldError");
      toast.error(t("messages.contract.create.endDateFieldError"));
      return;
    }
    if (contractData.no_of_licenses === "") {
      errors.no_of_licenses = t("messages.contract.create.licenseFieldError2");
      toast.error(t("messages.contract.create.licenseFieldError2"));
      return;
    }
    if (contractData.price === "") {
      errors.price = t("messages.contract.create.priceFieldError");
      toast.error(t("messages.contract.create.priceFieldError"));
      return;
    }
    if (contractData.currency === "") {
      errors.currency = t("messages.contract.create.currencyFieldError");
      toast.error(t("messages.contract.create.currencyFieldError"));
      return;
    }
    if (contractData.payment_type === "") {
      errors.payment_type = t("messages.contract.create.paymentTypeFieldError");
      toast.error(t("messages.contract.create.paymentTypeFieldError"));
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/contracts`,
        contractData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success(t("messages.contract.create.success"));
        setActiveTab("Abonnements en cours");
        setContractData(initialContractData);
      }
    } catch (error) {
      toast.error(error?.response?.data?.errors || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const goBack = () => {
    setActiveTab("Abonnements en cours");
  };
  return (
    <div className="create">
      <div className="container-fluid">
        <div className="row justify-content-center ">
          <div className="col-md-5 mb-5">
            <div className="card p-5">
              <div className="mb-4">
                <label className="form-label">{t("newContract.name")}</label>
                <input
                  required
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
                  required
                  type="date"
                  className="form-control"
                  //   placeholder="Nom du Contrat"
                  name="start_date"
                  value={contractData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">{t("newContract.endDate")}</label>
                <input
                  required
                  type="date"
                  className="form-control"
                  name="end_date"
                  value={contractData.end_date}
                  onChange={handleInputChange}
                  //   placeholder="Nom du Contrat"
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
                  <option value="0" selected>
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
                  required
                  min={1}
                  type="number"
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
                <label className="form-label">{t("newContract.price")}</label>
                <input
                  required
                  type="number"
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
                  <option value="0" selected>
                    {t("newContract.currency")}
                  </option>
                  <option value="Dollar"> Dollars</option>
                  <option value="Euro"> Euros</option>
                </select>
              </div>

              <div className="d-flex justify-content-center gap-4 mt-4">
                {isLoading ? (
                  <div style={{ width: "40%" }}>
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
                  <button className="btn btn-primary" onClick={createContract}>
                    {t("newContract.create")}
                  </button>
                )}

                <button className="btn btn-danger" onClick={goBack}>
                  {t("newContract.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateContract;