import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import CreateUsers from "./CreateUsers";
import ActiveUser from "./ActiveUser";
import ClosedUsers from "./ClosedUsers";
import { useTranslation } from "react-i18next";

function EntrepriseTabs() {
  const [activeTab, setActiveTab] = useState("Utilisateurs actifs");

  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
  };
  const [t] = useTranslation("global");
 
  return (
    <div className="tektimetabs">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        defaultActiveKey={"Utilisateurs actifs"}
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab
          className="tabs"
          eventKey="Utilisateurs désactivés"
          title={t("userTabs.close")}
        >
          {activeTab === "Utilisateurs désactivés" && (
            <ClosedUsers
              eventKey="Utilisateurs désactivés"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Utilisateurs actifs" title={t("userTabs.active")}>
          {activeTab === "Utilisateurs actifs" && (
            <ActiveUser
              eventKey="Utilisateurs actifs"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Nouvel utilisateur" title={t("userTabs.new")}>
          {activeTab === "Nouvel utilisateur" && (
            <CreateUsers
              eventKey="Nouvel utilisateur"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default EntrepriseTabs;
