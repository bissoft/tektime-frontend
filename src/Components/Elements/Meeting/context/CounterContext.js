import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../Apicongfig";
import axios from "axios";
import ErrorBoundary from "../../../Utils/ErrorBoundary";

const CounterContext = createContext();

export const useCounterContext = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error(
      "useCounterContext must be used within a HeaderTitleProvider"
    );
  }
  return context;
};

export const CounterContextProvider = ({ children }) => {
  //centralized states for count down timer.
  const { id } = useParams();
  const [meetingData, setMeetingData] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [negativeTimes, setNegativeTimes] = useState(Array().fill(0));

  const [nextStepTrigger, setNextStepTrigger] = useState(0);
  const [previousStepTrigger, setPreviousStepTrigger] = useState(0);
  /**------------------------------------------------------------------------------------------------------------------------------------------------ */
  useEffect(() => {
    const getMeetingByID = async (meetingID) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/meetings/${meetingID}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        if (response.status) {
          // console.log("response from getMeeting by ID ->", response?.data?.data);
          setMeetingData(response?.data?.data);
          setActiveStepIndex(0);
          const negativeTimes = response?.data?.data?.steps?.map((step) => {
            if (step.negative_time) return parseInt(step.negative_time);
          });
          // console.log("negativeTimes", negativeTimes);
          setNegativeTimes(negativeTimes);
          return response;
        }
      } catch (error) {
        // console.log("error", error);
        return error.response;
      }
    };
    getMeetingByID(id);
  }, [id]);
  /**------------------------------------------------------------------------------------------------------------------------------------------------ */
  // HANDLER FUNCTIONS:
  const handleSetSavedTime = useCallback((time) => {
    setSavedTime(time);
  }, []);

  const setNextActiveStep = useCallback(() => {
    if (!meetingData) return;
    const stepsArray = meetingData?.steps;
    if (activeStepIndex !== stepsArray?.length - 1) {
      let stepsArray = meetingData?.steps;
      const activeStep = stepsArray[activeStepIndex];
      activeStep.savedTime = parseInt(savedTime);
      stepsArray[activeStepIndex] = activeStep;
      setMeetingData((prevState) => {
        return {
          ...prevState,
          steps: stepsArray,
        };
      });

      // STEP 2: SET ACTIVE STEP:
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
      setNextStepTrigger(nextStepTrigger + 1);
    } else {
      return;
    }
  }, [meetingData, activeStepIndex, savedTime]);

  const setPreviousActiveStep = useCallback(() => {
    if (!meetingData) return;
    // console.log("Saved Time", savedTime);
    const stepsArray = meetingData?.steps;
    if (activeStepIndex !== 0) {
      let stepsArray = meetingData?.steps;
      const activeStep = stepsArray[activeStepIndex];
      activeStep.savedTime = parseInt(savedTime);
      stepsArray[activeStepIndex] = activeStep;
      setMeetingData((prevState) => {
        return {
          ...prevState,
          steps: stepsArray,
        };
      });
      //STEP@: SET ACTIVE STEP:
      const previousIndex = activeStepIndex - 1;
      setActiveStepIndex(previousIndex);
      setPreviousStepTrigger(previousStepTrigger + 1);
    }
  }, [meetingData, activeStepIndex, savedTime]);

  // // const setNextActiveStep = useCallback(, [meetingData]);
  // const setNextActiveStep = () => {
  //     if (!meetingData) return;
  //     const stepsArray = meetingData?.steps;
  //     if (activeStepIndex !== stepsArray?.length - 1) {
  //         let stepsArray = meetingData?.steps;
  //         const activeStep = stepsArray[activeStepIndex];
  //         activeStep.savedTime = parseInt(savedTime);
  //         stepsArray[activeStepIndex] = activeStep;
  //         setMeetingData((prevState) => {
  //             return {
  //                 ...prevState,
  //                 steps: stepsArray,
  //             };
  //         });

  //         // STEP 2: SET ACTIVE STEP:
  //         const nextIndex = activeStepIndex + 1;
  //         setActiveStepIndex(nextIndex);
  //     } else {
  //         return;
  //     }
  // };//
  // // const setPreviousActiveStep = useCallback(, [meetingData]);
  // const setPreviousActiveStep = () => {
  //     if (!meetingData) return;
  //     // console.log("Saved Time", savedTime);
  //     const stepsArray = meetingData?.steps;
  //     if (activeStepIndex !== 0) {
  //         let stepsArray = meetingData?.steps;
  //         const activeStep = stepsArray[activeStepIndex];
  //         activeStep.savedTime = parseInt(savedTime);
  //         stepsArray[activeStepIndex] = activeStep;
  //         setMeetingData((prevState) => {
  //             return {
  //                 ...prevState,
  //                 steps: stepsArray,
  //             };
  //         });
  //         //STEP@: SET ACTIVE STEP:
  //         const previousIndex = activeStepIndex - 1;
  //         setActiveStepIndex(previousIndex);
  //     }
  // };

  return (
    <ErrorBoundary>
      <CounterContext.Provider
        value={{
          // COUNT DOWN TIMER STATES:
          meetingData,
          activeStepIndex,
          savedTime,
          negativeTimes,
          nextStepTrigger,
          previousStepTrigger,

          setNextStepTrigger,
          setPreviousStepTrigger,
          setNegativeTimes,
          setActiveStepIndex,
          setMeetingData,
          setSavedTime,
          handleSetSavedTime,
          setNextActiveStep,
          setPreviousActiveStep,
        }}
      >
        {children}
      </CounterContext.Provider>
    </ErrorBoundary>
  );
};

//const updateStepTime = async () => {
//     try {
//         console.log("API CALL-->");
//         const response = await axios.put(
//             `${API_BASE_URL}/meetings/${id}`,
//             meetingData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//                 },
//             }
//         );
//         if (response.status) {
//             console.log("response from updateMeeting ->", response.data.data);
//             return response;
//         }

//     } catch (error) {
//         console.log("error", error);
//         return error.response;
//     }
// }
