import React, { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useLocation } from "react-router-dom";
import NewMeeting from "./NewMeeting";
import { useTranslation } from "react-i18next";
import ScheduledMeeting from "./ScheduledMeeting";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import CompleteMeeting from "./CompleteMeeting";

/**
 * Represents a component for managing meeting tabs.
 * @component
 * @example
 * return (
 *   <MeetingTabs />
 * )
 */

function MeetingTabs() {
  /**
   * Custom hook for managing header title.
   * @name useHeaderTitle
   * @type {Object}
   * @property {string} title - The title of the header.
   * @property {function} pushHeaderTitle - Function to push a new title to the header.
   * @property {function} popHeaderTitle - Function to pop the last title from the header.
   * @property {function} resetHeaderTitle - Function to reset the header title.
   */
  const { resetHeaderTitle } = useHeaderTitle();
  /**
   * Resets the header title on component mount.
   */
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  const location = useLocation();
  const [t] = useTranslation("global");
  const [activeTab, setActiveTab] = useState("Evènements programmés");
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
  };

  const queryParams = new URLSearchParams(location.search);
  const fromPresentation2 = queryParams.get("from") === "presentation";
  const fromPresentation3 = queryParams.get("from") === "completeedit";

  /**IF LAST URL IS PLAY THEN NAVIGATE TO TERMINATED MEETINGS TAB. */
  const lastUrl = localStorage.getItem("lastURL");
  useEffect(() => {
    if (fromPresentation2) {
      setActiveTab("Evènements terminés");
    }
    if (fromPresentation3) {
      setActiveTab("Evènements terminés");
    }
    if (lastUrl === "/play") {
      setActiveTab("Evènements terminés");
      localStorage.removeItem("lastURL");
    }
  }, []);

  return (
    <div className="tektimetabs">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        defaultActiveKey={"Evènements programmés"}
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab
          className="tabs"
          eventKey="Evènements terminés"
          title={t("meeting.completedMeetingsTab")}
        >
          {activeTab === "Evènements terminés" && (
            <CompleteMeeting
              eventKey="Evènements terminés"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab
          eventKey="Evènements programmés"
          title={t("meeting.activeMeetingsTab")}
        >
          {activeTab === "Evènements programmés" && (
            <ScheduledMeeting
              eventKey="Evènements programmés"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Nouvel évènement" title={t("meeting.newMeetingTab")}>
          {activeTab === "Nouvel évènement" && (
            <NewMeeting
              eventKey="Nouvel évènement"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default MeetingTabs;
