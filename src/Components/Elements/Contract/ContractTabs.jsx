import React, { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useLocation } from "react-router-dom";
import CreateContract from "./CreateContract";
import CurrentContract from "./CurrentContract";
import ClosedContract from "./ClosedContract";
import { useTranslation } from "react-i18next";

const ContractTabs = () => {
  const location = useLocation();
  const [t] = useTranslation("global");
  const [activeTab, setActiveTab] = useState("Abonnements en cours");
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
  };
  const queryParams = new URLSearchParams(location.search);
  const fromPresentation = queryParams.get("from") === "play";
  const fromPresentation1 = queryParams.get("from") === "completeedit";
  const fromPresentation2 = queryParams.get("from") === "presentation";
  const fromPresentation3 = queryParams.get("from") === "schedule";

  const defaultActiveKey =
    fromPresentation || fromPresentation1 || fromPresentation2
      ? "Contrats clôturés"
      : fromPresentation3
      ? "Contrats en cours"
      : "Nouveau contrat";
  return (
    <div className="tektimetabs">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        defaultActiveKey={"Abonnements en cours"}
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab
          className="tabs"
          eventKey="Abonnements clôturés"
          title={t("contractTabs.close")}
        >
          {activeTab === "Abonnements clôturés" && (
            <ClosedContract
              eventKey="Abonnements clôturés"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Abonnements en cours" title={t("contractTabs.active")}>
          {activeTab === "Abonnements en cours" && (
            <CurrentContract
              eventKey="Abonnements en cours"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Nouvel Abonnement" title={t("contractTabs.new")}>
          {activeTab === "Nouvel Abonnement" && (
            <CreateContract
              eventKey="Nouvel Abonnement"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default ContractTabs;
