import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import Base from "./Components/Layout/Base";
import Presentation from "./Components/Elements/Meeting/Presentation";
import Signup from "./Components/Elements/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Components/Elements/Login";
import PrivateRoute from "./Components/Elements/PrivateRoute";
import Preview from "./Components/Elements/Preview";
import Profile from "./Components/Elements/User/Profile";
import Presentationreport from "./Components/Elements/Meeting/Presentationreport";
import Contract from "./Components/Elements/Contract/Contract";
import Enterprises from "./Components/Elements/Enterprises/Enterprises";
import NewEnterprises from "./Components/Elements/Enterprises/NewEnterprises";
import Team from "./Components/Elements/Team/Team";
import Invities from "./Components/Elements/Invities/Invities";
import UpdateContract from "./Components/Elements/Contract/UpdateContract";
import UpdateEntreprises from "./Components/Elements/Enterprises/UpdateEntreprises";
import UpdateTeam from "./Components/Elements/Team/UpdateTeam";
import Users from "./Components/Elements/User/Users";
import ContractLinkEntreprises from "./Components/Elements/LinkPages/ContractLinkEntreprises";
import ContractToTeam from "./Components/Elements/LinkPages/ContractToTeam";
import EntreprisesToTeam from "./Components/Elements/LinkPages/EntreprisesToTeam";
import global_en from "./translations/en/global.json";
import global_fr from "./translations/fr/global.json";
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";
import CopyContract from "./Components/Elements/Contract/CopyContract";
import CopyClosedContract from "./Components/Elements/Contract/CopyClosedContract";
import ReadContract from "./Components/Elements/Contract/ReadContract";
import UpdateUser from "./Components/Elements/User/UpdateUser";
import ContractToUser from "./Components/Elements/LinkPages/ContractToUser";
import EnterprisesToUser from "./Components/Elements/LinkPages/EnterprisesToUser";
import MeetingTabs from "./Components/Elements/Meeting/MeetingTabs";
import ValidateMeeting from "./Components/Elements/Meeting/ValidateMeeting";
import UpdateMeeting from "./Components/Elements/Meeting/UpdateMeeting";
import MeetingCopy from "./Components/Elements/Meeting/MeetingCopy";
import Play from "./Components/Elements/Meeting/Play";
import ViewMeeting from "./Components/Elements/Meeting/ViewMeeting";
import Draft from "./Components/Elements/Meeting/Draft";
import PlayMeeting from "./Components/Elements/Meeting/PlayMeeting/PlayMeeting";
import { CounterContextProvider } from "./Components/Elements/Meeting/context/CounterContext";
import ViewEndMeeting from "./Components/Elements/Meeting/ViewEndMeeting";
import ParticipantToAction from "./Components/Elements/Invities/ParticipantToAction/ParticipantToAction";
import UpdateParticipant from "./Components/Elements/Invities/ParticipantToAction/UpdateParticipant";
import StepDetails from "./Components/Elements/Meeting/StepDetails";
i18next.init({
  interpolation: { escapevalue: false },
  lng: "fr",
  resources: {
    en: {
      global: global_en,
    },
    fr: {
      global: global_fr, // Corrected key name
    },
  },
});

function App() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(() => {
    return localStorage.getItem("isSignedIn") === "true";
  });

  const [removeLogo, setRemoveLogo] = useState(false);

  const signin = () => {
    setIsSignedIn(true);
    setRemoveLogo(true);
  };

  const signout = () => {
    setIsSignedIn(false);
    setRemoveLogo(false);
    localStorage.removeItem("isSignedIn");
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    localStorage.setItem("isSignedIn", isSignedIn.toString());
  }, [isSignedIn]);

  return (
    <div>
      <I18nextProvider i18n={i18next}>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login onLogin={signin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <Base
                isAuthenticated={isSignedIn}
                onLogout={signout}
                onLogin={signin}
                onRemove={removeLogo}
              />
            }
          >
            {sessionStorage.getItem("type") === "MasterAdmin" &&
              sessionStorage.getItem("type") != "SuperAdmin" &&
              sessionStorage.getItem("type") != "Admin" && (
                <Route
                  path="/contract"
                  element={
                    <PrivateRoute isSignedIn={isSignedIn}>
                      <Contract onLogout={signout} />
                    </PrivateRoute>
                  }
                />
              )}
            <Route
              path="/CopyContract/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <CopyContract onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/CopyClosedContract/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <CopyClosedContract onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/ModifierContract/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <UpdateContract onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/ContractLinkEnterprises/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <ContractLinkEntreprises onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/readContract/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <ReadContract onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/ContractToTeam/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <ContractToTeam onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/ContractToUser/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <ContractToUser onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/EntreprisesToTeam/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <EntreprisesToTeam onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/EntreprisesToUsers/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <EnterprisesToUser onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/Enterprises"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Enterprises onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/NewEnterprises"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <NewEnterprises onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/ModifierEnterprises/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <UpdateEntreprises onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/Team"
              exact
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Team onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/ModifierTeam/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <UpdateTeam onLogout={signout} />
                </PrivateRoute>
              }
            />

            <Route
              path="/Users/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Users onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/ModifierUser/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <UpdateUser onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/Invities"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Invities onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/participantToAction/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <ParticipantToAction onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/updateParticipant/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <UpdateParticipant onLogout={signout} />
                </PrivateRoute>
              }
            />

            <Route
              path="/meeting"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <MeetingTabs onLogout={signout} />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Profile onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/meetingcopy/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <MeetingCopy onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/meetingDetail/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <ViewEndMeeting onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/presentation/:id"
              element={<Presentation onLogout={signout} />}
            />
            <Route
              path="/participant/:id"
              element={<UpdateParticipant onLogout={signout} />}
            />

            <Route
              path="/presentation/:meetingId"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Presentation onLogout={signout} />
                </PrivateRoute>
              }
            />

            <Route
              path="/preview/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Preview onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/validateMeeting/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  {<ValidateMeeting onLogout={signout} />}
                </PrivateRoute>
              }
            />
            <Route
              path="/updateMeeting/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <UpdateMeeting onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/copyMeeting/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <MeetingCopy onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/play/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <CounterContextProvider>
                    <Play onLogout={signout} />
                  </CounterContextProvider>
                </PrivateRoute>
              }
            />
            <Route
              path="/PlayMeeting/:id"
              element={
                <CounterContextProvider>
                  <PlayMeeting />
                </CounterContextProvider>
              }
            />
            <Route
              path="/view/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <ViewMeeting onLogout={signout} />
                </PrivateRoute>
              }
            />
            <Route
              path="/draft/:id"
              element={
                <PrivateRoute isSignedIn={isSignedIn}>
                  <Draft onLogout={signout} />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
        <Routes>
          <Route
            path="/presentationreport/:id"
            element={<Presentationreport />}
          />
          <Route path="/step-details/:id" element={<StepDetails />} />
        </Routes>
      </I18nextProvider>
    </div>
  );
}

export default App;