import React from "react";
import TeamTabs from "./TeamTabs";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

const Team = () => {
  const {resetHeaderTitle} = useHeaderTitle();
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  return (
    <>
      <TeamTabs />
    </>
  );
}

export default Team;
