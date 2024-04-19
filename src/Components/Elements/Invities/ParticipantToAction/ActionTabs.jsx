import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Todo from "./Todo";
import { useTranslation } from "react-i18next";
import InProgress from "./InProgress";
import Finished from "./Finished";

const ActionTabs = () => {
  const [activeTab, setActiveTab] = useState("Todo Action");
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
  };
  const [t] = useTranslation("global");

 
  return (
    <div className="tektimetabs">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        defaultActiveKey={"Todo Action"}
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab
          className="tabs"
          eventKey="Finished Action"
          title={t("actions.finished")}
        >
          <Finished
            eventKey="Finished Action"
            setActiveTab={handleTabChange}
          />
        </Tab>

        <Tab eventKey="InProgress Action"
          title={t("actions.inprogress")}
        >
          <InProgress
            eventKey="InProgress Action"
            setActiveTab={handleTabChange}
          />
        </Tab>

        <Tab eventKey="Todo Action"
          title={t("actions.todo")}
        >
          <Todo eventKey="Todo Action" setActiveTab={handleTabChange} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default ActionTabs;
