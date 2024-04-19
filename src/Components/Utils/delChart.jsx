import React, { useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Editor } from "@tinymce/tinymce-react";
import "react-quill/dist/quill.snow.css";
import { API_BASE_URL } from "../../Apicongfig";
import { useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";

const Chart = ({ meetingId, formData, data }) => {
  const { id } = useParams();
  const [inputData, setInputData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [accumulatedSelectedCounts, setAccumulatedSelectedCounts] = useState(
    []
  );
  const [storedStartTime, setStoredStartTime] = useState(null);
  const [totalSelectedCount, setTotalSelectedCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [countSum, setCountSum] = useState(0);
  const [modifiedFileText, setModifiedFileText] = useState([]);
  const [modalType, setModalType] = useState("Editeur");
  const [editorContent, setEditorContent] = useState("");

  const inputDataRef = useRef(inputData);
  const [fileUpload, setFileUpload] = useState({});
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setFileUpload(file);
      console.log("file after condition: ", file);
    } else {
      alert("Please select a PDF file.");
      event.target.value = null;
      setFileUpload(null);
    }
  };
  const previewFile = () => {
    if (fileUpload) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const pdfContent = reader.result;
        document.getElementById("pdfPreview").src = pdfContent;
      };
      reader.readAsDataURL(fileUpload);
    } else {
      alert("Please select a PDF file first.");
    }
  };

  const [link, setLink] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleLinkUpload = (event) => {
    setLink(event.target.value);
    setShowPreview(false);
  };

  const previewUrlResult = () => {
    setPreviewUrl(link);
    setShowPreview(true);
  };
  useEffect(() => {
    const getMeeting = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/meetings/${id ? id : meetingId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        console.log("response chart.jsx", response.data.data);
        if (response.status) {
          console.log("response", response.data?.data);
          setInputData(response?.data?.data);
          setLoading(false);
        }
      } catch (error) {
        console.log("error", error);
        setLoading(false);
      }
    };

    getMeeting();
  }, [id, meetingId]);
  const [allData, setAllData] = useState([]);
  useEffect(() => {
    if (inputData && inputData?.steps) {
      setModifiedFileText(inputData?.steps?.map((step) => step.editor_content));
    }
    if (inputData) {
      setStoredStartTime(
        moment(inputData.start_time, "HH:mm").format("hh:mm a")
      );
      const { steps } = inputData;
      let accumulatedCount2 = steps?.length > 0 ? steps[0]?.count2 : 0;

      const formattedData = steps
        ?.map((step, index) => {
          let count1 = 0;
          let count2 = step.count2;

          if (index > 0) {
            accumulatedCount2 += step.count2;
            count1 = accumulatedCount2 - count2;
          }

          return {
            x: step.title,
            y: [count1, count1 + count2, count2],
          };
        })
        .reverse();

      setChartData(formattedData);
      setAllData(inputData.steps);
    }
  }, [inputData]);

  const options = {
    xaxis: {
      type: "category",
      labels: {
        formatter: function (val) {
          return val + " Min";
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        formatter: function (val, index) {
          return val;
        },
      },
    },
    chart: {
      height: 650,
      zoom: false,
      type: "rangeBar",
      events: {
        click: function (event, chartContext, config) {
          const { dataPointIndex } = config;
          console.log("event: ", config);
          console.log("chartContext: ", chartContext);
          setChartData((prevChartData) => {
            if (
              dataPointIndex !== undefined &&
              dataPointIndex >= 0 &&
              dataPointIndex < prevChartData.length
            ) {
              const updatedSelectedIndex =
                prevChartData.length - 1 - dataPointIndex;
              setSelectedIndex(updatedSelectedIndex);

              const clickedChartData = prevChartData[dataPointIndex];
              console.log("All Data: ", allData);

              if (
                clickedChartData &&
                clickedChartData.y &&
                clickedChartData.y.length === 3
                // inputData && inputData.steps
              ) {
                const bar2 = clickedChartData.y;
                // console.log("inputData[clickedChartData]===>",inputData)

                const selectedCounts = prevChartData
                  .slice(dataPointIndex + 1)
                  .map((item) =>
                    item.y && item.y.length === 3 ? item.y[2] : 0
                  );
                  console.log("selectedCounts--->",selectedCounts)

                const totalSelectedCount = selectedCounts.reduce(
                  (sum, count) => sum + count,
                  0
                );

                const newAccumulatedSelectedCounts = [
                  ...accumulatedSelectedCounts,
                  totalSelectedCount,
                ];

                const startTime = moment(
                  inputDataRef.current["start_time"],
                  "HH:mm"
                )
                  .add(
                    newAccumulatedSelectedCounts.reduce(
                      (sum, count) => sum + count,
                      0
                    ),
                    "minutes"
                  )
                  .format("hh:mm a");

                setSelectedBar(clickedChartData.x);
                setSelectedValue(clickedChartData.x);
                setSelectedCount(bar2[2]);
                setTotalSelectedCount(totalSelectedCount);
                setStoredStartTime(startTime);
                setAccumulatedSelectedCounts(newAccumulatedSelectedCounts);
                // console.log("================================",event)
                // const clickedChartData = prevChartData[dataPointIndex]; // Assuming this object contains the ID field
                console.log("prevChartData", clickedChartData);
                setIsModalOpen(true);
                if (clickedChartData && clickedChartData.id) {
                  const clickedStepId = clickedChartData.id;
                  console.log("Clicked Step ID:", clickedStepId);
                }
              }
            }

            return prevChartData;
          });
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 15,
        barHeight: 35,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
        formatter: function (val) {
          return val;
        },
      },
    },
    grid: {
      row: {
        colors: ["#fff", "#fff"],
        opacity: 1,
      },
    },
    dataLabels: {
      enabled: true,
      position: "center",
      style: {
        colors: ["black"],
      },
      formatter: function (val, opts) {
        var label = opts.w.globals.labels[opts.dataPointIndex];
        return label;
      },
    },
    colors: [
      "#008FFB",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
      "#FF4560",
      "#775DD0",
      "#546E7A",
      "#26a69a",
      "#D10CE8",
      "#0082c8",
      "#FF0266",
      "#00E396",
      "#FEB019",
    ],
  };

  
  //Update Step API
  const handleEdit = async () => {
    // setLink("");
    // setPreviewUrl("");
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];
    console.log("selected step: ", selectedStep);
    const count2Difference = parseInt(selectedCount, 10) - selectedStep?.count2;

    // // Update the selected step
    if (modalType === "Editeur" || selectedStep.editor_type === "Editeur") {
      selectedStep.editor_type = "Editeur";
      selectedStep.editor_content = modifiedFileText[selectedIndex];
      setModalType("Editeur");
    } else if (modalType === "Url" || selectedStep.editor_type === "Url") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "Url";
      selectedStep.editor_content = link;
      setLink(link);
      setModalType("Url");
    } else if (modalType === "File"  || selectedStep.editor_type === "File") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "File";
      selectedStep.file = fileUpload;
      setFileUpload(fileUpload);
      setModalType("File");
    }
    selectedStep.title = selectedValue;
    selectedStep.count2 = parseInt(selectedCount, 10);

    for (let i = selectedIndex + 1; i < updatedSteps?.length; i++) {
      const currentStep = updatedSteps[i];
      currentStep.count1 += count2Difference;
    }

    // Update the time value for each step based on count1 and count2
    let currentTime = selectedStep?.count1 + selectedStep?.count2;
    selectedStep.time = currentTime;

    for (let i = selectedIndex + 1; i < updatedSteps.length; i++) {
      const currentStep = updatedSteps[i];
      currentTime += currentStep?.count1 + currentStep?.count2;
      currentStep.time = currentTime;
    }

    // Fetch data for the next step if available
    const nextIndex = selectedIndex + 1;
    if (nextIndex < updatedSteps?.length) {
      const nextStep = updatedSteps[nextIndex];
      const nextSelectedValue = nextStep?.title;
      const nextSelectedCount = nextStep?.count2;

      setSelectedValue(nextSelectedValue);
      setSelectedCount(nextSelectedCount);
      setSelectedIndex(nextIndex);
    } else {
      setIsModalOpen(false);
      setSelectedIndex(null);
      setSelectedValue(null);
      setSelectedCount(null);
    }

    const countSum = updatedSteps.reduce((sum, step) => sum + step.count2, 0);

    const updatedMeetingData = {
      // ...inputData,
      // steps: JSON.parse(localStorage.getItem("updatedStepData")),
      steps: updatedSteps,
      // total_time: countSum,
      _method: "put",
    };
    const updateMeetingPageData = {
      ...data,
      steps: updatedSteps,
      total_time: countSum,
      _method: "put",
    };
    setInputData(updatedMeetingData);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/steps/${id ? id : meetingId}}`,
        // updatedMeetingData, --->validateMeeting
        // updateMeetingPageData, ->updateMeetingPage
        meetingId ? updatedMeetingData : updateMeetingPageData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        console.log("update step", response);
        toast.success(response?.data?.message);
        localStorage.setItem(
          "updatedStepData",
          JSON.stringify(response?.data?.data.steps)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopyStep = async () => {
    const updatedSlides = [...(inputData.steps || [])];
    const selectedStep = updatedSlides[selectedIndex];
    const isUnique = updatedSlides.every(
      (step, index) => index === selectedIndex || step.title !== selectedValue
    );
    if (!isUnique) {
      toast.error("Le nom de l'étape doit être unique.");
      return;
    }

    if (modalType === "Editeur") {
      selectedStep.editor_type = modalType;
      selectedStep.editor_content = modifiedFileText[selectedIndex];
    } else if (modalType === "Url") {
      selectedStep.editor_type = modalType;
      selectedStep.editor_content = link;
    } else if (modalType === "File") {
      selectedStep.editor_type = modalType;
      selectedStep.file = fileUpload;
      // selectedStep.editor_content = {
      //   name: fileUpload.name,
      //   lastModified: fileUpload.lastModified,
      //   lastModifiedDate: fileUpload.lastModifiedDate,
      //   webkitRelativePath: fileUpload.webkitRelativePath,
      //   size: fileUpload.size,
      // };
    }

    const selectedSlide = updatedSlides[selectedIndex];

    if (selectedSlide) {
      const copiedSlide = { ...selectedSlide };
      const insertIndex = selectedIndex + 1;

      if (insertIndex < updatedSlides.length) {
        updatedSlides.splice(insertIndex, 0, copiedSlide);
      } else {
        updatedSlides.push(copiedSlide);
      }

      const previousSlide = updatedSlides[insertIndex - 1];
      const newCount1 = previousSlide.count1 + previousSlide.count2;

      copiedSlide.count1 = newCount1;
      copiedSlide.count2 = selectedCount;
      let accumulatedSelectedCount = 0;
      for (let i = 0; i < selectedIndex + 1; i++) {
        accumulatedSelectedCount += updatedSlides[i].count2;
      }

      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");
      setStoredStartTime(newStoredStartTime);

      for (let i = insertIndex + 1; i < updatedSlides.length; i++) {
        const currentSlide = updatedSlides[i];
        const nextSlide = updatedSlides[i - 1];
        currentSlide.count1 = nextSlide.count1 + nextSlide.count2;
        // currentSlide.fileText = modifiedFileText[i - 1];
      }
      if (selectedSlide.title !== selectedValue) {
        copiedSlide.title = selectedValue;
      } else {
        let copyNumber = 1;
        let uniqueTitle = selectedValue + " (" + copyNumber + ")";

        // Check for uniqueness
        while (updatedSlides.some((step) => step.title === uniqueTitle)) {
          copyNumber++;
          uniqueTitle = selectedValue + " (" + copyNumber + ")";
        }

        copiedSlide.title = uniqueTitle;
      }

      copiedSlide.step_time = selectedCount;
      const newCountSum = countSum + copiedSlide.count2;
      setCountSum(newCountSum);

      const newLastCountSum = updatedSlides.reduce(
        (sum, step) => sum + step.count1 + step.count2,
        0
      );

      const updatedMeetingData = {
        ...inputData,
        steps: updatedSlides,
        total_time: newLastCountSum,
        _method: "put",
      };
      const formattedData = updatedSlides
        .map((item) => ({
          x: item.title,
          y: [item.count1, item.count1 + item.count2, item.count2],
        }))
        .reverse();

      setChartData(formattedData);
      setTotalTime(newLastCountSum);
      setInputData(updatedMeetingData);
      setSelectedIndex(insertIndex);
      setSelectedValue(copiedSlide.value);
      setSelectedCount(copiedSlide.count2);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/meetings/${id ? id : meetingId}`,
          updatedMeetingData,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        if (response.status) {
          toast.success(response?.data?.message);
          setIsModalOpen(false);
        }
      } catch (error) {
        console.log("error occured", error);
      }
    } else {
      toast.error("Échec de la copie de l'étape");
    }
  };

  const closeModal = () => {
    if (!isModalOpen) {
      // toast.error("Modal is not open");
    }
    setSelectedBar(null);
    setSelectedValue(null);
    setSelectedCount(null);
    setIsModalOpen(false);
  };
  const handleChange1 = (event) => {
    setSelectedValue(event.target.value);
  };
  const handleIncrementCount = () => {
    setSelectedCount((prevCount) => prevCount + 1);
  };
  const handleDecrementCount = () => {
    setSelectedCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
  };

  const handleModalDelete = () => {
    // const inputData = location.state || {};
    const updatedSteps = [...(inputData.steps || [])];
    const deletedStep = updatedSteps.splice(selectedIndex, 1)[0];
    setCountSum((prevCountSum) => prevCountSum - deletedStep.count2);

    // Update the subsequent steps' count1 values
    for (let i = selectedIndex; i < updatedSteps.length; i++) {
      const currentStep = updatedSteps[i];
      const previousStep = updatedSteps[i - 1];

      if (previousStep) {
        currentStep.count1 = previousStep.count1 + previousStep.count2;
      } else {
        // If there is no previous step, set the count1 to 0
        currentStep.count1 = 0;
      }
    }

    const newLastCountSum = updatedSteps.reduce(
      (sum, step) => sum + step.count1 + step.count2,
      0
    );
    const updatedMeetingData = {
      ...inputData,
      steps: updatedSteps,
      total_time: newLastCountSum,
    };
    const formattedData = updatedSteps
      .map((item) => ({
        x: item.title,
        y: [item.count1, item.count1 + item.count2, item.count2],
        // y: [item.counts[0], item.counts[0] + item.counts[1], item.counts[1]],
      }))
      .reverse();
    setChartData(formattedData);
    setInputData(updatedMeetingData);
    setTotalTime(newLastCountSum);
    setIsModalOpen(false);
    setSelectedIndex(null);
    toast.success("Data has been deleted permanently.");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLeftNavigation = () => {
    if (selectedIndex > 0) {
      const newSelectedIndex = selectedIndex - 1;
      const dataPointIndex = chartData.length - 1 - newSelectedIndex;

      setSelectedIndex(newSelectedIndex);
      setSelectedBar(chartData[dataPointIndex].x);
      setSelectedValue(chartData[dataPointIndex].x);
      setSelectedCount(chartData[dataPointIndex].y[2]);
      console.log("selectedCount = ", chartData[dataPointIndex].y[2]);

      const selectedCounts = chartData
        .slice(dataPointIndex + 1)
        .map((item) => item.y[2]);
      const totalSelectedCount = selectedCounts.reduce(
        (sum, count) => sum + count,
        0
      );

      const newAccumulatedSelectedCounts = accumulatedSelectedCounts
        .slice(0, newSelectedIndex)
        .concat(totalSelectedCount);

      const start_Time = moment(inputData.start_time, "HH:mm")
        .add(
          newAccumulatedSelectedCounts.reduce((sum, count) => sum + count, 0),
          "minutes"
        )
        .format("hh:mm a");

      // Update the editor data and slide time for the newly selected index
      if (editorContent.length > newSelectedIndex) {
        setEditorContent((prevContents) =>
          prevContents.map((content, index) =>
            index === newSelectedIndex
              ? content
              : editorContent[chartData.length - 1 - index]
          )
        );
      }

      setSelectedCount(chartData[dataPointIndex].y[2]);
      setTotalSelectedCount(totalSelectedCount);
      setStoredStartTime(start_Time);
      setAccumulatedSelectedCounts(newAccumulatedSelectedCounts);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        id="chart-container"
        style={{ width: "100%", height: "500px", overflow: "hidden" }}
      >
        <ReactApexChart
          options={options}
          series={[{ data: chartData }]}
          type="rangeBar"
          height={500}
        />
        {isModalOpen && selectedBar !== null && (
          <div>
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-nav">
                  <div>
                    <h4>Modifier une étape</h4>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button className="cross-btn" onClick={handleCloseModal}>
                      <RxCross2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="row d-flex justify-content-center">
                  <div className="col-md-7">
                    <div className="d-flex justify-content-arround align-items-center">
                      <div className="input-field">
                        <div
                          style={{
                            flexGrow: 1,
                            textAlign: "left",
                            paddingLeft: "10px",
                          }}
                        >
                          <img
                            src="/Assets/Vector.svg"
                            alt="Edit"
                            className="img-fluid edit-icon"
                          />
                        </div>
                        <div style={{ flexGrow: 1, textAlign: "center" }}>
                          <input
                            className="text-center step-name"
                            type="text"
                            placeholder="Entrez le titre de l'étape"
                            value={selectedValue}
                            onChange={handleChange1}
                          />
                        </div>
                        <div
                          style={{
                            flexGrow: 1,
                            textAlign: "right",
                            paddingRight: "10px",
                          }}
                        >
                          {selectedIndex + 1}/{chartData.length}
                        </div>
                      </div>
                      <br />
                      <div>
                        <label htmlFor="" className="form-label">
                          Type d'etape
                        </label>
                        <select
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            width: "100%",
                            padding: "5px",
                          }}
                          name="select"
                          id="select"
                          value={modalType}
                          onChange={(e) => setModalType(e.target.value)}
                        >
                          <option value="" disabled>
                            Choisissez le type southaite
                          </option>
                          <option value="Editeur">Editeur</option>
                          <option value="Url">URL</option>
                          <option value="File">Fichier</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-body mt-3">
                  <div className="container-fluid">
                    <div className="row">
                      <div className="col-md-2 col-6 text-center">
                        <div className="card timecard p-2">
                          <p>L’étape démarre à :</p>
                          {/* <h5>{storedStartTime}</h5> */}

                          <h5>
                            {moment(inputData.start_time, "HH:mm").format(
                              "hh:mm a"
                            )}
                          </h5>
                        </div>
                        <br />
                        <div className="card timecard p-2  ">
                          <p>Temps prévu de l’étape</p>
                          <div>
                            <img
                              src="/Assets/minus1.svg"
                              alt="minus"
                              className="img-fluid "
                              width={"15px"}
                              style={{ cursor: "pointer" }}
                              onClick={handleDecrementCount}
                            />{" "}
                            &nbsp; &nbsp;
                            <span>{selectedCount} Min</span>&nbsp;&nbsp;
                            <img
                              src="/Assets/plus1.svg"
                              alt="plus"
                              className="img-fluid"
                              width={"15px"}
                              style={{ cursor: "pointer" }}
                              onClick={handleIncrementCount}
                            />
                          </div>
                        </div>
                        <br />
                        <div className="modal-button mt-4">
                          <div>
                            <button
                              className="btn btn-primary"
                              style={{ width: "100%" }}
                              onClick={handleEdit}
                            >
                              Enregistrer l’étape
                            </button>
                          </div>

                          <div>
                            <button
                              className="btn btn-primary"
                              onClick={handleCopyStep}
                              style={{ width: "100%" }}
                            >
                              Copier l’étape
                            </button>
                          </div>

                          <div>
                            <button
                              className="btn btn-danger"
                              onClick={handleModalDelete}
                              style={{ width: "100%" }}
                            >
                              Supprimer
                            </button>
                          </div>
                          <div>
                            {selectedIndex < inputData?.steps?.length - 1 && (
                              <button
                                className="btn btn-primary buttons"
                                // onClick={handleRightNavigation}
                                onClick={handleEdit}
                                style={{ width: "100%" }}
                              >
                                Suivant
                              </button>
                            )}
                          </div>
                          <div>
                            {selectedIndex > 0 && (
                              <button
                                className="btn btn-primary buttons"
                                onClick={handleLeftNavigation}
                                style={{ width: "100%" }}
                              >
                                Précédent
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <button
                            className="btn btn-primary mt-3"
                            style={{ width: "100%" }}
                            onClick={closeModal}
                          >
                            Fermer
                          </button>
                        </div>
                      </div>
                      {modalType === "Editeur" ? (
                        <div className="col-md-10">
                          {inputData?.steps?.map((step, index) => (
                            <div
                              key={index}
                              style={{
                                display:
                                  index === selectedIndex ? "block" : "none",
                              }}
                            >
                              <Editor
                                apiKey="d37lz7euudv3qj0gxw0v2ki9hxit30psx226v35l2v6y7nlv"
                                value={modifiedFileText[index]} // Use modifiedFileText for value
                                name="text"
                                init={{
                                  branding: false,
                                  height: 600,
                                  menubar: true,
                                  // language: "fr_FR",
                                  language: "en_EN",
                                  plugins:
                                    "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                                  toolbar:
                                    "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                                  image_advtab: true,
                                  file_picker_callback: function (
                                    callback,
                                    value,
                                    meta
                                  ) {
                                    if (meta.filetype === "image") {
                                      const input =
                                        document.createElement("input");
                                      input.setAttribute("type", "file");
                                      input.setAttribute("accept", "image/*");

                                      input.onchange = function () {
                                        const file = input.files[0];
                                        const reader = new FileReader();

                                        reader.onload = function (e) {
                                          const img = new Image();
                                          img.src = e.target.result;

                                          img.onload = function () {
                                            const canvas =
                                              document.createElement("canvas");
                                            const ctx = canvas.getContext("2d");
                                            const maxWidth = 700;
                                            const maxHeight = 394;

                                            let newWidth = img.width;
                                            let newHeight = img.height;

                                            if (img.width > maxWidth) {
                                              newWidth = maxWidth;
                                              newHeight =
                                                (img.height * maxWidth) /
                                                img.width;
                                            }

                                            if (newHeight > maxHeight) {
                                              newHeight = maxHeight;
                                              newWidth =
                                                (img.width * maxHeight) /
                                                img.height;
                                            }

                                            canvas.width = newWidth;
                                            canvas.height = newHeight;

                                            ctx.drawImage(
                                              img,
                                              0,
                                              0,
                                              newWidth,
                                              newHeight
                                            );

                                            const resizedImageData =
                                              canvas.toDataURL(file.type);

                                            callback(resizedImageData, {
                                              alt: file.name,
                                            });
                                          };

                                          img.src = e.target.result;
                                        };

                                        reader.readAsDataURL(file);
                                      };

                                      input.click();
                                    }
                                  },
                                }}
                                onEditorChange={(content) => {
                                  const updatedModifiedFileText = [
                                    ...modifiedFileText,
                                  ];
                                  updatedModifiedFileText[index] = content;
                                  setModifiedFileText(updatedModifiedFileText);
                                }}
                              />
                            </div>
                          ))}
                          <div></div>
                        </div>
                      ) : modalType === "File" ? (
                        <>
                          <div className="col-md-10">
                            <div className="box">
                              <input
                                type="file"
                                placeholder="https://www.google.com"
                                onChange={handleFileUpload}
                                name="file"
                                value={fileUpload}
                              />
                              {fileUpload && (
                                <div>Selected file: {fileUpload.name}</div>
                              )}
                              <div className="text-center">
                                <button
                                  className="btn btn-danger my-3"
                                  onClick={previewFile}
                                >
                                  Afficher la page
                                </button>
                              </div>
                              <div style={{ height: "400px" }}>
                                <div className="pdf-preview">
                                  <iframe
                                    id="pdfPreview"
                                    title="PDF Preview"
                                    width="100%"
                                    height="400px"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : modalType === "Url" ? (
                        <>
                          <div className="col-md-10">
                            <div className="box">
                              <input
                                type="text"
                                placeholder="https://www.google.com"
                                value={link}
                                onChange={handleLinkUpload}
                                width={100}
                                name="url"
                              />
                              <div className="text-center">
                                <button
                                  className="btn btn-danger my-3"
                                  onClick={previewUrlResult}
                                >
                                  Afficher la page
                                </button>
                              </div>
                              {showPreview && (
                                <div className="preview-container">
                                  <iframe
                                    title="Preview"
                                    src={previewUrl}
                                    width="100%"
                                    height="500px"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chart;
