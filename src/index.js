import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "./style/main.scss";
import { HeaderTitleProvider } from "./context/HeaderTitleContext";
import { DraftMeetingsProvider } from "./context/DraftMeetingContext";
import { TotalTimeProvider } from "./context/TotalTimeContext";
import { StepProvider } from "./context/stepContext";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <StepProvider>
    <TotalTimeProvider>
      <DraftMeetingsProvider>
        <HeaderTitleProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HeaderTitleProvider>
      </DraftMeetingsProvider>
    </TotalTimeProvider>
  </StepProvider>
);
