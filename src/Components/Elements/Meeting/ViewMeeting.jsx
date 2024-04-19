import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import ShowIF from "../../Utils/ShowIF";

function addIframesToLinks(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const links = Array.from(doc.querySelectorAll("a"));

  links.forEach((linkElement) => {
    const linkURL = linkElement.getAttribute("href");
    const iframe = createIframeForLink(linkURL);

    // Replace the link element with the iframe
    linkElement.parentNode.replaceChild(iframe, linkElement);
  });

  return doc.documentElement.outerHTML;
}

function createIframeForLink(linkURL) {
  const iframe = document.createElement("iframe");
  iframe.src = linkURL;
  iframe.width = "100%";
  iframe.height = "500px"; // Adjust the height as needed
  iframe.title = "Embedded Content";
  iframe.style.scrollSnapType = "none";
  iframe.style.border = "none";
  iframe.style.textAlign = "center";
  return iframe;
}

const ViewMeeting = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inputData, setInputData] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [slideTime, setSlideTime] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [stepTitle1, setStepTitle1] = useState("");
  const [nextSlideTime, setNextSlideTime] = useState("");
  const [showNextCounter, setShowNextCounter] = useState(false);
  const [htmlString, setHtmlString] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMeetingById = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (response) {
          setInputData(response.data?.data);
          setHtmlString(
            response.data?.data?.steps[currentStepIndex]?.editor_content
          );
          setLoading(false);
        }
      } catch (error) {
        // console.error(error);
      }
    };
    getMeetingById();
  }, [id]);

  useEffect(() => {
    if (inputData && inputData.steps && inputData.steps.length > 0) {
      if (
        inputData.steps[currentStepIndex] &&
        inputData.steps[currentStepIndex].time
      ) {
        const formattedStartTime = new Date(
          inputData.steps[currentStepIndex].time
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setStartTime(formattedStartTime);
        setSlideTime(inputData.steps[currentStepIndex].time);

        setNextSlideTime(
          currentStepIndex < inputData.steps.length - 1
            ? inputData.steps[currentStepIndex + 1]?.time || ""
            : ""
        );
      }
      setStepTitle(
        currentStepIndex < inputData.steps.length - 1
          ? inputData.steps[currentStepIndex + 1]?.title || ""
          : ""
      );
      setStepTitle1(
        currentStepIndex < inputData.steps.length
          ? inputData.steps[currentStepIndex].title || ""
          : ""
      );
    }
  }, [inputData, currentStepIndex]);

  // Show preview of Links in Iframe:
  useEffect(() => {
    if (inputData && inputData.steps && inputData.steps.length > 0) {
      const originialHtml = inputData.steps[currentStepIndex].editor_content;
      const modifiedHtml = addIframesToLinks(originialHtml);
      setInputData((prevData) => ({
        ...prevData,
        steps: prevData.steps.map((step, index) => {
          if (index === currentStepIndex) {
            return {
              ...step,
              editor_content: modifiedHtml,
            };
          }
          return step;
        }),
      }));
    }
  }, [htmlString, currentStepIndex]);
  const previousPage = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handlenextPage = () => {
    if (currentStepIndex < inputData.steps.length - 1) {
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
      setShowNextCounter(false);
    } else {
      window.history.back();
    }
  };

  const GradientSvg = (
    <svg>
      <defs>
        <linearGradient id="your-unique-id" x1="1" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#F2E358" />
          <stop offset="90%" stopColor="#CB690F" />
        </linearGradient>
      </defs>
    </svg>
  );
  const GradientSlideSvg = (
    <svg>
      <defs>
        <linearGradient id="slide-unique-id" x1="0" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#5882F2" />
          <stop offset="90%" stopColor="#0FB8CB" />
        </linearGradient>
      </defs>
    </svg>
  );
  const goBackToMeeting = () => {
    window.history.back();
  };

  function formatMinutesToMMSS(totalMinutes) {
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes % 1) * 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return (
    <div className="preview">
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div className="container-fluid mx-auto card mt-3 mb-5 py-3">
          <div className="row">
            <button className="btn1 btn-primary" onClick={goBackToMeeting}>
              <AiOutlineArrowLeft /> &nbsp; Sortir
            </button>
          </div>
          <div className="text-center mb-4">
            <h3>Aperçu de la réunion</h3> <br />
            <h4>
              {inputData.objective}&nbsp; {">"} &nbsp; {inputData.title}&nbsp;
              {" >"} &nbsp; {stepTitle1} &nbsp;{" "}
            </h4>
          </div>
          <div className="row justify-content-center ">
            <div className="col-md-8 ">
              <div className="card mt-4 mb-4">
                <ShowIF
                  condition={
                    inputData.steps[currentStepIndex].editor_type === "File"
                  }
                >
                  <div>
                    <iframe
                      src={Assets_URL + inputData.steps[currentStepIndex].file}
                      width="100%"
                      height="500px"
                    />
                  </div>
                </ShowIF>
                <ShowIF
                  condition={
                    inputData.steps[currentStepIndex].editor_type !== "File"
                  }
                >
                  <div className="card-body ">
                    <div
                      className="rendered-content"
                      dangerouslySetInnerHTML={{
                        __html:
                          inputData &&
                          inputData.steps &&
                          inputData.steps[currentStepIndex] &&
                          inputData.steps[currentStepIndex].editor_content
                            ? inputData.steps[currentStepIndex].editor_content
                            : "",
                      }}
                    />
                  </div>
                </ShowIF>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex justify-content-center p-3">
                <div
                  className="pt-3"
                  style={{
                    zIndex: 0,
                  }}
                >
                  <CountdownCircleTimer
                    size={95}
                    strokeWidth={4}
                    isPlaying={true}
                    colors="url(#your-unique-id)"
                    onComplete={() => {}}
                  >
                    {({ remainingTime }) => (
                      <div className="text-center">
                        <span className="start-at">Démarrage à</span> <br />
                        <h5>
                          {moment(inputData.start_time, "HH:mm").format(
                            "HH[h]mm"
                          )}
                        </h5>
                      </div>
                    )}
                  </CountdownCircleTimer>
                </div>

                <div
                  className=""
                  style={{
                    zIndex: 5,
                  }}
                >
                  <CountdownCircleTimer
                    size={130}
                    strokeWidth={5}
                    isPlaying={true}
                    colors="url(#slide-unique-id)"
                    onComplete={() => {}}
                  >
                    {({ remainingTime }) => (
                      <div className="text-center">
                        <h4> {formatMinutesToMMSS(slideTime)}</h4>
                        <h6>min</h6>
                      </div>
                    )}
                  </CountdownCircleTimer>
                </div>

                <div className="pt-3">
                  <CountdownCircleTimer
                    size={95}
                    strokeWidth={4}
                    isPlaying={true}
                    colors="url(#your-unique-id)"
                    onComplete={() => {}}
                  >
                    {({ remainingTime }) => (
                      <div className="text-center">
                        <span className="start-at">Fin estimée à</span> <br />
                        <h5>
                          {moment(inputData.start_time, "HH:mm")
                            .add(inputData.total_time, "minutes")
                            .format("HH[h]mm")}
                        </h5>
                      </div>
                    )}
                  </CountdownCircleTimer>
                </div>
              </div>
              <br />
              {currentStepIndex !== inputData?.steps?.length - 1 ? (
                <>
                  <div className="mb-3">
                    <label className="form-label mb-3">
                      <img
                        src="/Assets/Ellipse 8.png"
                        className="img-fluid pb-1"
                        alt="circle"
                      />{" "}
                      &nbsp; Prochaine étape
                    </label>
                    <input
                      type="text"
                      className="form-control txt"
                      readOnly
                      value={stepTitle}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label mb-3">
                      <img
                        src="/Assets/Ellipse 8.png"
                        className="img-fluid pb-1"
                        alt="circle"
                      />{" "}
                      &nbsp; Temps prévu de la prochaine étape
                    </label>
                    <input
                      type="text"
                      className="form-control txt"
                      readOnly
                      value={Math.abs(nextSlideTime) + " Mins"}
                    />
                  </div>
                  <div className="d-flex justify-content-center text-center mb-3 ">
                    {currentStepIndex > 0 && (
                      <button
                        className="btn btn-primary"
                        onClick={previousPage}
                      >
                        Précédent
                      </button>
                    )}{" "}
                    &nbsp; &nbsp; &nbsp;
                    <button
                      className={` btn ${
                        currentStepIndex === inputData?.steps?.length - 1
                          ? "btn-danger"
                          : "btn-primary"
                      }`}
                      onClick={handlenextPage}
                    >
                      {currentStepIndex === inputData?.steps?.length - 1
                        ? "Exit Preview"
                        : "Suivant"}
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="form-label mb-3">
                      <img
                        src="/Assets/Ellipse 8.png"
                        className="img-fluid pb-1"
                        alt="circle"
                      />{" "}
                      &nbsp; Prendre des notes
                    </label>
                    <textarea className="form-control txt" rows="3"></textarea>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  <div className="d-flex justify-content-center text-center mb-3">
                    {currentStepIndex > 0 && (
                      <button
                        className="btn btn-primary"
                        onClick={previousPage}
                      >
                        Précédent
                      </button>
                    )}{" "}
                    &nbsp; &nbsp; &nbsp;
                    <button
                      className={` btn ${
                        currentStepIndex === inputData?.steps?.length - 1
                          ? "btn-danger"
                          : "btn-primary"
                      }`}
                      onClick={handlenextPage}
                    >
                      {currentStepIndex === inputData?.steps?.length - 1
                        ? "Exit Preview"
                        : "Suivant"}
                    </button>
                  </div>
                  <label className="form-label mb-3">
                    <img
                      src="/Assets/Ellipse 8.png"
                      className="img-fluid pb-1"
                      alt="circle"
                    />{" "}
                    &nbsp; Prendre des notes
                  </label>
                  <textarea className="form-control txt" rows="11"></textarea>
                </div>
              )}
              <br />
            </div>
          </div>
        </div>
      )}
      <div className="">
        {GradientSvg}
        {GradientSlideSvg}
      </div>
    </div>
  );
};
export default ViewMeeting;
