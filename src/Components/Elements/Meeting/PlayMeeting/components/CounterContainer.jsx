import { Spinner } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCounterContext } from "../../context/CounterContext";
import ErrorBoundary from "../../../../Utils/ErrorBoundary";
import { useTranslation } from "react-i18next";
import moment from "moment";

// CUSTOM HOOK:

// const useAudio = (url) => {
//   const [audio] = useState(new Audio(url));
//   const [playing, setPlaying] = useState(false);

//   const toggle = () => setPlaying(!playing);

//   useEffect(() => {
//     playing ? audio.play() : audio.pause();
//   }, [playing]);

//   useEffect(() => {
//     audio.addEventListener("ended", () => setPlaying(false));
//     return () => {
//       audio.removeEventListener("ended", () => setPlaying(false));
//     };
//   }, []);

//   return [playing, toggle];
// };

/**
 * KEY POINTS:
 * NEGATIVE TIME OF EACH STEP WILL BE STORED IN negativeTimes ARRAY that is in the Context.
 * IF THE NEGATIVE TIME FOR ACTIVE STEP EXISTS i.e. > 0 , THEN THE DURATION OF THE CENTER COUNTER WILL BE SET TO 7200 SECONDS.
 * IF THERE IS NO NEGATIVE TIME => THE DURATION OF THE CENTER COUNTER WILL BE SET TO THE SAVED TIME OF THE ACTIVE STEP.
 * IF THERE IS NO SAVED TIME THE DURATION OF THE CENTER COUNTER WILL BE SET TO THE TIME OF THE ACTIVE STEP.
 * IMPORTANT : COUNTER MUST BE GIVEN A KEY PROP TO RE-RENDER ITSELF WHEN THE ACTIVE STEP CHANGES OTHERWISE EVERYTHING WILL BE MESSED UP.
 *
 */
/**--------------------------------------------------------------------------------------------------- */

/**
 * CounterContainer Component
 *
 * This component renders a countdown timer container with three counters:
 * - Left Counter: Displays the scheduled start time of the meeting and provides color-coded alerts based on the meeting's start time.
 * - Center Counter: Displays the countdown timer for the active step of the meeting. If the step has negative time, it displays the negative time.
 * - Right Counter: Displays the estimated end time of the meeting based on the scheduled start time and the total duration of all steps.
 *
 * Key Functionality:
 * - Calculates the duration and color of each counter based on the active step index, meeting data, and negative times.
 * - Updates the counters dynamically based on the changing state of the meeting and step data.
 *
 * @component
 */

function formatTimeMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Add leading zeros if needed
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// LEFT DURATION:

// const formatStartTime = (time) => {
//   const hours = time.getHours();
//   const minutes = time.getMinutes();
//   return `${hours}h${minutes}`;
// };

/**-----------------------------------------FUNCTIONAL COMPONENT STARTS HERE... -------------------------------------------- */
const CounterContainer = ({ alarm }) => {
  const audioRef = useRef(null);
  const [audio] = useState(new Audio(`https://exoux.com/beep.WAV`));
  const [buzzer] = useState(new Audio(`https://exoux.com/Final-Countdown.mp3`));
  const [t] = useTranslation("global");
  const prevStepRef = useRef(false);
  const nextStepRef = useRef(false);
  const {
    activeStepIndex,
    meetingData,
    handleSetSavedTime,
    negativeTimes,
    setNegativeTimes,
    nextStepTrigger,
    previousStepTrigger,
  } = useCounterContext();
  const [duration, setDuration] = useState(0);
  const [initialRemainingTimeState, setInitialRemainingTimeState] = useState(0);
  const remainingTimeRef = useRef(0);
  const [totalElapsedTimeState, setTotalElapsedTimeState] = useState(0);
  const [meetingStartTime, setMeetingStartTime] = useState(new Date()); // will be set to the start time of the meeting. [hours,minutes]
  const [leftDuration, setLeftDuration] = useState(0);
  const [rightDuration, setRightDuration] = useState(0);
  const [showNegativeCounter, setShowNegativeCounter] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isGrowing, setIsGrowing] = useState(false);
  const [centerColor, setCenterColor] = useState("#5AAFD6");
  // const [centerColor, setCenterColor] = useState('#5AAFD6');
  const [leftColor, setLeftColor] = useState("#eee");
  const [startingAlert, setStartingAlert] = useState("");
  const [startingAlertColor, setStartingAlertColor] = useState("0000");
  const [spareTimes, setSpareTimes] = useState([]);
  // Inititalize the spareTimes array with the length of the steps array. It will be used to store the spare time of each step.

  const [isOnPage, setIsOnPage] = useState(true);
  const [leavingTime, setLeavingTime] = useState(0);
  /**----------------------------------------------------------- SIDE EFFECTS ------------------------------------------------------------------------- */

  useEffect(() => {
    // console.log(spareTimes);
    setShowNegativeCounter(false); // will update conditionally later.
    // Set The Duration of Center Counter.
    if (negativeTimes[activeStepIndex] > 0) {
      setShowNegativeCounter(true);
      /**
       * setShowNegativeCounter STATE WILL BE BY DEFAULT FALSE. ON EVERY UPDATE OF STEP INDEX IT WILL BE SET TO FALSE. AND ...
       * IF THERE IS NEGATIVE TIME FOR THE ACTIVE STEP, setShowNegativeCounter WILL BE SET TO TRUE.
       * IMPORTANT:-> IF THE NEGATIVE TIME FOR ACTIVE STEP EXISTS i.e. > 0 ,
       * THEN THE DURATION OF THE CENTER COUNTER WILL BE SET TO 7200 MINUS THE NEGATIVE TIME OF THAT STEP SO THAT THE NEGATIVE TIME STARTS FROM WHERE IT LEFT
       */
      setDuration(7200 - negativeTimes[activeStepIndex]);
      return;
    }

    // IF THERE IS NO NEGATIVE TIME => THE DURATION OF THE CENTER COUNTER WILL BE SET TO THE SAVED TIME || THE TOTAL TIME OF THE ACTIVE STEP.
    const steps = meetingData.steps;
    if (Array.isArray(steps) && steps.length > 0) {
      const step = steps[activeStepIndex];
      setDuration(step.savedTime || step.time * 60);
    }
    setCenterColor("#5AAFD6"); // reset the color of the center counter.
  }, [activeStepIndex, meetingData]);

  useEffect(() => {
    const handleSwitch = () => {
      // console.log("VISIBILITY CHANGED");
      setIsOnPage(!isOnPage);
      const timeOfSwitching = moment();

      if (document.visibilityState === "hidden") {
        // console.log("Leaving Time: ", timeOfSwitching.format("hh:mm:ss"));
        setLeavingTime(timeOfSwitching);
      } else if (document.visibilityState === "visible" && leavingTime) {
        // console.log("Returning Time: ", timeOfSwitching.format("hh:mm:ss"));
        const timeDifferenceInSeconds = moment
          .duration(timeOfSwitching.diff(leavingTime))
          .asSeconds();
        // console.log("Time Difference in Seconds: ", timeDifferenceInSeconds);

        const ceilingTimeDifference = Math.ceil(timeDifferenceInSeconds);

        setRightDuration((prev) => {
          return prev + ceilingTimeDifference;
        }); // to re-render the right counter.
      }
    };

    document.addEventListener("visibilitychange", handleSwitch);

    return () => {
      document.removeEventListener("visibilitychange", handleSwitch);
    };
  }, [leavingTime]);

  /**------------------------------------------------------------------------------------------------------------------------- */
  // Calculate the Estimated total time of the meeting by adding the time of each step.:->
  useEffect(() => {
    // SET RIGHT DURATION i.e., the time when the meeting will end.:
    if (loaded === false && !meetingData) {
      // For only one time:
      return;
    }
    if (meetingData && loaded === false) {
      //------ Initializing here! ------
      setSpareTimes(new Array(meetingData.steps.length).fill(0));
      //-------
      const totalTimesArray = meetingData?.steps?.map((step) => {
        if (!step.savedTime) {
          // console.log(step.savedTime || "NO SAVED TIME FOR THIS STEP");
          return parseInt(step.time) * 60;
        }
        let elapsedTime = parseInt(step.time) - parseInt(step.savedTime);
        // console.log("ELAPSED TIME: ", elapsedTime);
        return parseInt(step.time) - parseInt(elapsedTime);
      });

      // console.log("TOTAL TIMES ARRAY: ", totalTimesArray);
      let totalTime = totalTimesArray?.reduce((acc, curr) => acc + curr, 0);
      /**
       * HERE WE NEED TO SUBTRACT THE LAST STEP TIME FROM THE TOTAL TIME OF THE MEETING. as per client's requirement.
       * Which is obviuosly a stupid requirement. But we have to do it. So If by any chance, you need to remove this subtraction,
       * then you can remove it. But I am keeping it here for now. Remember, this is a temporary JUGAR and an imperfection to the functionality.
       *  */
      // const lastStepTime = totalTimesArray[totalTimesArray.length - 1];
      // totalTime = totalTime - lastStepTime;
      setRightDuration(totalTime);
      setLoaded(true);
    }
  }, [meetingData, loaded]);

  const stopAudio = () => {
    buzzer.pause(); // Pause the buzzer audio
    buzzer.currentTime = 0; // Reset the playback position to start
    
  };
  useEffect(() => {
    if (nextStepRef.current) {
      stopAudio()
      // console.log("EFFECT RAN FOR NEXT STEP");
      // console.log("ACTIVE STEP INDEX: ", activeStepIndex);
      const spareTimeToBeSubtracted = spareTimes[activeStepIndex - 1];
      // console.log("SPARE TIME TO BE SUBTRACTED: ", spareTimeToBeSubtracted);

      // console.log("Right Duration: ", rightDuration);
      // console.log("Right Duration after Subtraction: ", rightDuration - spareTimeToBeSubtracted);
      // console.log("SPARE TIMES ARRAY: ", spareTimes);
      setRightDuration((prev) => {
        return prev - spareTimeToBeSubtracted;
      });
    }
    return () => {
      nextStepRef.current = true;
    };
  }, [nextStepTrigger]);

  useEffect(() => {
    if (prevStepRef.current) {
      stopAudio()

      // console.log("EFFECT RAN FOR PREVIOUS STEP");
      // console.log("ACTIVE STEP INDEX: ", activeStepIndex);
      const spareTimeToBeAdded = spareTimes[activeStepIndex];
      // If you do activeStepIndex - 1 or +1 . The calculation will be Fucked up. SO Better keep it that way. It works fine this way.
      // console.log("SPARE TIME TO BE Added: ", spareTimeToBeAdded);

      // console.log("SPARE TIMES ARRAY: ", spareTimes);
      // console.log("Right Duration: ", rightDuration);
      // console.log("Right Duration after Adding: ", rightDuration + spareTimeToBeAdded);

      setRightDuration((prev) => {
        return prev + spareTimeToBeAdded;
      });
    }

    return () => {
      prevStepRef.current = true;
    };
  }, [previousStepTrigger]);

  /**------------------------------------------------------------------------------------------------------------------------- */

  // Handlers:
  const playAudio = () => {
    audio.play().catch((err) => {
      console.log("err", err);
    });
  };

 
  const getLeftColors = async (meetingData) => {
    const green = "#39FF14";
    // const red = "#FF0000";
    const red = "url(#your-unique-id2)";
    const orange = "#f67913";

    const scheduledMinutes = parseInt(meetingData.start_time.split(":")[1], 10);

    const minutes = meetingStartTime.getMinutes();

    let delay = minutes - scheduledMinutes;

    /**
     * FOLLOWING CODE EXPLANATION:
     * IF THE MEETING STARTED EARLY, THE LEFT COUNTER WILL BE GREEN.
     * IF THE MEETING STARTED LATE, BUT THE DIFFERENCE BETWEEN TIME IS UP TO 5 MINUTES, THEN THE LEFT COUNTER WILL BE ORANGE.
     * IF THE MEETING STARTED LATE, AND THE DIFFERENCE IS GREATER THAN 5 MINUTES, THEN THE LEFT COUNTER WILL BE RED.
     */

    if (delay === 0 || delay === 1) {
      setStartingAlert(
        ` ${t("The meeting started with")} ${delay} ${t("Minutes in Advance")}.`
      );
      setStartingAlertColor("transparent");
      setLeftColor(green);
      return;
    }
    if (delay > 1 && delay <= 5) {
      // console.log("STARTED LATE BUT THE DIFFERENCE IS UP TO 5 MINUTES");
      setStartingAlert(
        `Le rendez-vous a démarré avec ${delay} minutes de retard.`
      );
      setStartingAlertColor(orange);
      setLeftColor(orange);
      return;
    }
    if (delay > 5) {
      // console.log("STARTED LATE");
      setStartingAlert(
        `Le rendez-vous a démarré avec ${delay} minutes de retard.`
      );
      setStartingAlert(
        `Le rendez-vous a démarré avec ${delay} minutes de retard.`
      );
      setStartingAlertColor(red);
      setLeftColor(red);
      return;
    }
    if (delay < 0) {
      const delayMinutes = -1 * delay; // convert to positive.
      // console.log("STARTED EARLY");
      setLeftColor(green);
      setStartingAlertColor(green);
      setStartingAlert(
        `Le rendez-vous a démarré avec ${delayMinutes} minutes en avance.`
      );
    }
  };
  useEffect(() => {
    if (meetingData) getLeftColors(meetingData);
  }, [meetingData]);

  return (
    <ErrorBoundary>
      <div className="counter-container ">
        <div className="d-flex justify-content-center align-items-center ">
          {/* LEFT COUNTER */}
          <div className="d-flex  flex-column pt-4 ">
            <CountdownCircleTimer
              size={100}
              strokeWidth={5}
              isPlaying={false}
              duration={0}
              colors={leftColor}
            >
              {/* INSIDE LEFT COUNTER */}
              {({ remainingTime }) => {
                return (
                  <>
                    <div className="justify-content-center flex-column d-flex align-items-center">
                      <span className="start-at">{t("Start At")}</span>
                      {meetingStartTime.getHours()}h
                      {meetingStartTime.getMinutes() > 10
                        ? meetingStartTime.getMinutes()
                        : "0" + meetingStartTime.getMinutes()}
                    </div>
                  </>
                );
              }}
            </CountdownCircleTimer>
            <p
              className="starting-alert"
              style={{
                color: startingAlertColor,
              }}
            >
              {startingAlert}
            </p>
          </div>

          {/* -------------------> CENTER COUNTER <--------------------------------------------------------------------------------------------- */}

          <div className="d-flex flex-column pb-5">
            {alarm === "1" ? (
              <div className="remainingTime text-center">
                <p style={{ fontSize: "15px" }}>
                  Alarme par étape
                  <br /> activée
                </p>
              </div>
            ) : (
              <div className="pb-3"></div>
            )}
            <CountdownCircleTimer
              key={activeStepIndex}
              size={130}
              strokeWidth={5}
              isPlaying={true}
              duration={duration}
              // isGrowing={isGrowing}
              onComplete={(totalElapsedTime) => {
                if (alarm === "1") {
                  // PLAY BUZZER AUDIO:
                  buzzer.play().catch((err) => {
                    console.log("err", err);
                  });
                }
                // When Positive Counter is Completed:
                setTotalElapsedTimeState(totalElapsedTime);
                setShowNegativeCounter(true);
                remainingTimeRef.current = 0;
                setDuration(7200 + totalElapsedTime); // if totalElapsedTime is not added, the negative counter will start from -duration seconds.
              }}
              onUpdate={(remainingTime) => {
                // BEEPING SOUND WHEN LAST 10 SECONDS ARE LEFT:
                if (remainingTime < 5 && remainingTime > 0 && alarm === "1") {
                  playAudio();
                }

                setSpareTimes((prev) => {
                  if (showNegativeCounter) {
                    let timesArray = [...prev];
                    timesArray[activeStepIndex] = 0;
                    return timesArray;
                  } // if the counter is negative, don't update the spare times.
                  let timesArray = [...prev];
                  timesArray[activeStepIndex] = remainingTime;
                  return timesArray;
                });

                if (showNegativeCounter) {
                  setCenterColor("url(#your-unique-id2)");
                  setRightDuration((prev) => {
                    return prev + 1;
                  });
                  setNegativeTimes((prev) => {
                    let timesArray = [...prev];
                    timesArray[activeStepIndex] =
                      7200 - remainingTimeRef.current;
                    return timesArray;
                  });

                  return;
                }
                handleSetSavedTime(remainingTime);
              }}
              colors={centerColor}
            >
              {/* INSIDE  of the Center Counter */}
              {({ remainingTime }) => {
                {
                  /* getLeftColors(); */
                }
                remainingTimeRef.current = remainingTime;
                return showNegativeCounter ? (
                  <div className="justify-content-center flex-column d-flex align-items-center">
                    <h3>
                      -
                      {(() => {
                        const formattedNegativeTime = remainingTime - 7200;
                        return formatTimeMMSS(-1 * formattedNegativeTime);
                      })()}
                    </h3>
                    <h6>min</h6>
                  </div>
                ) : (
                  <div>
                    <h3>{formatTimeMMSS(remainingTime)}</h3>
                  </div>
                );
              }}
            </CountdownCircleTimer>
            <h5 className="remainingTime text-center">
              {t("Remaining time of stage")}
            </h5>
          </div>
          <div>
            <audio ref={audioRef} src="/public/Assets/beep.wav" id="beep" />
          </div>
          {/* RIGHT COUNTER */}

          <div className="d-flex flex-column justify-content-center pb-5">
            <CountdownCircleTimer
              colors="url(#your-unique-id)"
              duration={rightDuration}
              size={100}
              strokeWidth={4}
              onComplete={(totalElapsedTime) => [totalElapsedTime > 0]}
            >
              {({ remainingTime }) => {
                return (
                  <>
                    <div>
                      {/* {remainingTime} */}
                      {(() => {
                        const estimatedTime =
                          meetingStartTime.getTime() + rightDuration * 1000;
                        // Explanation of Above lie: The meetingStartTime is the time when the meeting will start
                        const time = new Date(estimatedTime);
                        return (
                          <div className="d-flex justify-content-center align-items-center flex-column">
                            <div>
                              <span className="start-at">
                                {t("Estimated End At")}
                              </span>
                            </div>
                            <h5>{`${time.getHours()}h${
                              time.getMinutes() < 10
                                ? "0" + time.getMinutes()
                                : time.getMinutes()
                            }`}</h5>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                );
              }}
            </CountdownCircleTimer>

            <section></section>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="d-flex justify-content-center gap-2 align-items-center "></div>
      </div>
    </ErrorBoundary>
  );
};

export default CounterContainer;
