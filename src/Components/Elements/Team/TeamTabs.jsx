import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import CreateTeam from "./CreateTeam";
import ActiveTeam from "./ActiveTeam";
import ClosedTeam from "./ClosedTeam";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

function TeamTabs() {
  const { resetHeaderTitle } = useHeaderTitle();
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);

  const [activeTab, setActiveTab] = useState("Equipes actives");
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
  };
  const [t] = useTranslation("global");

  return (
    <div className="tektimetabs">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        defaultActiveKey={"Equipes actives"}
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab
          className="tabs"
          eventKey="Equipes archivées"
          title={t("teamTabs.close")}
        >
          {activeTab === "Equipes archivées" && (
            <ClosedTeam
              eventKey="Equipes archivées"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Equipes actives" title={t("teamTabs.active")}>
          {activeTab === "Equipes actives" && (
            <ActiveTeam
              eventKey="Equipes actives"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Nouvelle équipe" title={t("teamTabs.new")}>
          {activeTab === "Nouvelle équipe" && (
            <CreateTeam
              eventKey="Nouvelle équipe"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default TeamTabs;
