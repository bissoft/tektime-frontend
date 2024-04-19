import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useLocation } from "react-router-dom";
import CurrentGoals from "./CurrentGoals";
import { useTranslation } from "react-i18next";
import InProgressGoal from "./InProgressGoals";
import FinishedGoal from "./FinishedGoal";

const InvitiesTabs = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Objectifs en cours");
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
  };
  const [t] = useTranslation("global");
  return (
    <div className="tektimetabs">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        defaultActiveKey={"Objectifs en cours"}
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab
          className="tabs"
          eventKey="Objectifs atteints"
          title={t("guests.achieved")}
        >
          {activeTab === "Objectifs atteints" && (
            <FinishedGoal
              eventKey="Objectifs atteints"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Objectifs en cours" title={t("guests.inprogress")}>
          {activeTab === "Objectifs en cours" && (
            <InProgressGoal
              eventKey="Objectifs en cours"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>
        <Tab
          eventKey="Nouveaux objectifs"
          title={t("guests.newObj")}
        >
          {activeTab === "Nouveaux objectifs" && (
            <CurrentGoals
              eventKey="Nouveaux objectifs"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default InvitiesTabs;
