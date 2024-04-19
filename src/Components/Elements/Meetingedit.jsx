import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Editor } from "@tinymce/tinymce-react";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { GoPlusCircle } from "react-icons/go";
import { AiOutlineClose } from "react-icons/ai";
import { API_BASE_URL } from "../Apicongfig";
import Spinner from "react-bootstrap/Spinner";
import { RxCross2 } from "react-icons/rx";

function Graph() {
  const [buttonClicked, setButtonClicked] = useState(false);
  let navigate = useNavigate();
  const { id: meetingID } = useParams();
  console.log("meetingId", meetingID);
  const [chartData, setChartData] = useState([]);
  const [inputData, setInputData] = useState([]);
  const [lastCountSum, setLastCountSum] = useState(0);
  const [countSum, setCountSum] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  // const [stageStart, setStageStart] = useState("");
  const [selectedIndex, setSelectedIndex] = useState();
  const [data, setData] = useState([]);
  const [storedStartTime, setStoredStartTime] = useState(0);
  const [totalSelectedCount, setTotalSelectedCount] = useState(0);
  const [accumulatedSelectedCounts, setAccumulatedSelectedCounts] = useState(
    []
  );
  const [modifiedFileText, setModifiedFileText] = useState([]);
  useEffect(() => {
    if (inputData && inputData.steps) {
      setModifiedFileText(inputData.steps.map((step) => step.fileText));
    }
  }, [inputData]);
  const today = new Date().toISOString().split("T")[0];
  const [buttonClick, setButtonClick] = useState(false);
  const [buttonClick1, setButtonClick1] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/meetings/${meetingID}/edit`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch data:", response);
          // Handle the error, show a message, etc.
        } else {
          const data = await response.json();
          console.log(data.data);
          handleAdditionalActions(data.data);
          setInputData(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingID]);

  const handleAdditionalActions = (data) => {
    setStoredStartTime(moment(data.start_time, "HH:mm").format("hh:mm a"));
    const { steps, lastCountSum } = data;
    setLastCountSum(lastCountSum);
    const countSum = steps.reduce((sum, slide) => sum + slide.count2, 0);
    setCountSum(countSum);
    const formattedData = steps
      ?.map((item) => ({
        x: item.step_title,
        y: [item.count1, item.count1 + item.count2, item.count2],
      }))
      .reverse();
    setChartData(formattedData);
  };

  useEffect(() => {
    setChartData((prevChartData) => {
      console.log("input", inputData);
      return prevChartData;
    });
  }, [inputData]);
  const inputDataRef = useRef(inputData);

  useEffect(() => {
    inputDataRef.current = inputData;
  }, [inputData]);

  const options = {
    xaxis: {
      type: "category",
      labels: {
        formatter: function (val) {
          return Math.abs(val) + " Min";
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
      zoom: false,
      height: 650,
      type: "rangeBar",
      events: {
        click: function (event, chartContext, config) {
          const { dataPointIndex } = config;
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

              if (
                clickedChartData &&
                clickedChartData.y &&
                clickedChartData.y.length === 3
              ) {
                const bar2 = clickedChartData.y;
                const selectedCounts = prevChartData
                  .slice(dataPointIndex + 1)
                  .map((item) =>
                    item.y && item.y.length === 3 ? item.y[2] : 0
                  );

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
                setIsModalOpen(true);
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
      // offsetX: 110,
      // offsetY: -5,
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

  const closeModal = () => {
    if (!isModalOpen) {
      // toast.error("Modal is not open");
    }
    setSelectedBar(null);
    setSelectedValue(null);
    setSelectedCount(null);
    setIsModalOpen(false);
  };

  const handleChange1 = (e) => {
    setSelectedValue(e.target.value);
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
    // Subtract the count2 of the deleted step from countSum
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
      lastCountSum: newLastCountSum,
    };

    const formattedData = updatedSteps
      .map((item) => ({
        x: item.step_title,
        y: [item.count1, item.count1 + item.count2, item.count2],
      }))
      .reverse();
    setChartData(formattedData);
    setInputData(updatedMeetingData);
    setLastCountSum(newLastCountSum);
    setIsModalOpen(false);
    setSelectedIndex(null);
    toast.success("L'étape a été supprimée");
  };

  const handleCopyStep = () => {
    const updatedSlides = [...(inputData.steps || [])];
    const selectedStep = updatedSlides[selectedIndex];
    const isUnique = updatedSlides.every(
      (slide, index) =>
        index === selectedIndex || slide.step_title !== selectedValue
    );

    if (!isUnique) {
      toast.error("Le nom de l'étape doit être unique.");
      return;
    }

    updatedSlides[selectedIndex] = {
      ...selectedStep,
      fileText: modifiedFileText[selectedIndex],
    };

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

      for (let i = insertIndex + 1; i < updatedSlides.length; i++) {
        const currentSlide = updatedSlides[i];
        const nextSlide = updatedSlides[i - 1];
        currentSlide.count1 = nextSlide.count1 + nextSlide.count2;
      }

      if (selectedSlide.step_title !== selectedValue) {
        // If the user has changed the step title, use the selectedValue
        copiedSlide.step_title = selectedValue;
      } else {
        // If the user has not changed the step title, find a unique name
        let copyNumber = 1;
        let uniqueTitle = selectedValue + " (" + copyNumber + ")";

        // Check for uniqueness
        while (
          updatedSlides.some((slide) => slide.step_title === uniqueTitle)
        ) {
          copyNumber++;
          uniqueTitle = selectedValue + " (" + copyNumber + ")";
        }

        copiedSlide.step_title = uniqueTitle;
      }

      copiedSlide.step_time = selectedCount;

      const newCountSum = countSum + copiedSlide.count2;
      setCountSum(newCountSum);

      const newLastCountSum = updatedSlides.reduce(
        (sum, slide) => sum + slide.count1 + slide.count2,
        0
      );

      const updatedMeetingData = {
        ...inputData,
        steps: updatedSlides,
        lastCountSum: newLastCountSum,
      };

      const formattedData = updatedSlides
        .map((item) => ({
          x: item.step_title,
          y: [item.count1, item.count1 + item.count2, item.count2],
        }))
        .reverse();

      setChartData(formattedData);
      setLastCountSum(newLastCountSum);
      setInputData(updatedMeetingData);
      setSelectedIndex(insertIndex);
      setSelectedValue(copiedSlide.step_title);
      setSelectedCount(copiedSlide.count2);
      // setIsModalOpen(false);
      // setSelectedIndex(null);
      // setSelectedValue(null);
      // setSelectedCount(null);
      toast.success("L'étape a été copiée");
    } else {
      toast.error("Échec de la copie de l'étape");
    }
  };

  const handleEdit = () => {
    const updatedSteps = [...(inputData.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];
    const previousCount2 = selectedStep.count2;
    const isStepNameUnique = updatedSteps.every(
      (step, index) =>
        index === selectedIndex || step.step_title !== selectedValue
    );

    if (!isStepNameUnique) {
      toast.error("Le nom de l'étape doit être unique.");
      return;
    }

    updatedSteps[selectedIndex] = {
      ...selectedStep,
      fileText: modifiedFileText[selectedIndex],
    };

    const selectedSlide = updatedSteps[selectedIndex];
    if (selectedSlide) {
      selectedSlide.value = selectedValue;
      selectedSlide.count2 = parseInt(selectedCount, 10);

      const nextSlideIndex = selectedIndex + 1;
      if (nextSlideIndex < updatedSteps.length) {
        const nextSlide = updatedSteps[nextSlideIndex];
        nextSlide.count1 = selectedSlide.count2;
      }
    }

    if (
      selectedIndex !== null &&
      selectedIndex >= 0 &&
      selectedIndex < updatedSteps.length
    ) {
      const selectedStep = updatedSteps[selectedIndex];
      selectedStep.step_title = selectedValue;
      selectedStep.count2 = parseInt(selectedCount, 10);

      const count2Difference = selectedStep.count2 - previousCount2;

      // Update countSum only if the count2 values are not equal
      if (count2Difference !== 0) {
        const newCountSum = countSum + count2Difference;
        setCountSum(newCountSum);
      }

      const updatedChartData = [...chartData];
      const slideIndex = updatedChartData.length - selectedIndex - 1;
      updatedChartData[slideIndex].x = selectedValue;

      // Accumulate the previous selectedCount values
      let accumulatedSelectedCount = 0;
      for (let i = 0; i < selectedIndex + 1; i++) {
        accumulatedSelectedCount += updatedSteps[i].count2;
      }

      // Calculate new storedStartTime by adding accumulatedSelectedCount
      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");

      // Update the state with new storedStartTime
      setStoredStartTime(newStoredStartTime);

      // Update count1 of subsequent slides based on the updated step
      for (let i = selectedIndex + 1; i < updatedSteps.length; i++) {
        const currentSlide = updatedSteps[i];
        const previousSlide = updatedSteps[i - 1];
        currentSlide.count1 = previousSlide.count1 + previousSlide.count2;
      }

      // Calculate newLastCountSum
      const newLastCountSum = updatedSteps.reduce(
        (sum, step) => sum + step.count1 + step.count2,
        0
      );
      const updatedMeetingData = {
        ...inputData,
        steps: updatedSteps,
        lastCountSum: newLastCountSum,
      };
      const formattedData = updatedSteps
        .map((item) => ({
          x: item.step_title,
          y: [item.count1, item.count1 + item.count2, item.count2],
        }))
        .reverse();

      setChartData(formattedData);
      setInputData(updatedMeetingData);
      // Fetch data for the next index
      const nextIndex = selectedIndex + 1;
      if (nextIndex < updatedSteps.length) {
        const nextStep = updatedSteps[nextIndex];
        const nextChartDataIndex = updatedChartData.length - nextIndex - 1;
        const nextSelectedBar = updatedChartData[nextChartDataIndex].x;
        const nextSelectedValue = nextStep.step_title;
        const nextSelectedCount = nextStep.count2;

        setSelectedBar(nextSelectedBar);
        setSelectedValue(nextSelectedValue);
        setSelectedCount(nextSelectedCount);
        setSelectedIndex(nextIndex);
      } else {
        setIsModalOpen(false);
        setSelectedIndex(null);
        setSelectedValue(null);
        setSelectedCount(null);
      }
    }
  };
  const meetingPage = async () => {
    if (buttonClicked) {
      return; // Return early if button already clicked
    }
    setButtonClicked(true); // Mark button as clicked

    try {
      const newParticipants = inputData.participant.map((user) => ({
        id: user.id ? user.id : "",
        name: user.name,
      }));
      const postData = {
        title: inputData.title,
        objective: inputData.objective,
        description: inputData.description,
        type: inputData.type,
        fieldType: inputData.fieldType,
        date: inputData.date,
        start_time: inputData.start_time,
        total_time: countSum,
        slides: inputData.steps.map((slide) => ({
          id: slide.id,
          slideName: slide.step_title,
          slideTime: slide.count1 + slide.count2 - slide.count1,
          count1: slide.count1,
          count2: slide.count2,
          fileText: slide.fileText,
        })),
        participants: newParticipants,
      };

      const token = sessionStorage.getItem("token");
      console.log(token);
      const meetingId = inputData.id;
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      console.log("i am post Data", postData);

      if (!response.ok) {
        toast.error("Échec de la mise à jour de la réunion.");
      } else {
        const data = await response.json();
        setInputData(data);
        // console.log("i am updated data", data);
        navigate("/meeting");
        toast.success("Réunion mise à jour avec succès.");
        // localStorage.removeItem(`meetingData_${meetingId}`);
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Échec de la mise à jour de la réunion.");
    } finally {
      setButtonClicked(false);
    }
  };

  const handleChange3 = (e) => {
    const updatedInputData = {
      ...inputData,
      [e.target.name]: e.target.value,
    };
    updatedInputData.steps = updatedInputData.steps.map((step, index) => {
      if (index === selectedIndex) {
        return {
          ...step,
          fileText: e.target.value,
        };
      }
      return step;
    });
    // console.log("steps", updatedInputData)
    setInputData(updatedInputData);
    // setInputData(updatedInputData);
    // Save to local storage with the specific meeting ID as part of the key
    // localStorage.setItem(`meetingData_${inputData.id}`, JSON.stringify(updatedInputData));
  };
  useEffect(() => {
    const userIdFromSession = sessionStorage.getItem("user_id");
    if (userIdFromSession) {
      setUserId(userIdFromSession);
    }
  }, []);

  const handleCopy = async (e) => {
    e.preventDefault();
    if (buttonClick) {
      return; // Return early if button already clicked
    }
    setButtonClick(true); // Mark button as clicked
    try {
      const newParticipants = inputData.participant.map((user) => ({
        id: user.id ? user.id : "",
        name: user.name,
      }));
      const postData = {
        user_id: userId,
        title: inputData.title,
        objective: inputData.objective,
        description: inputData.description,
        fieldType: inputData.fieldType,
        type: inputData.type,
        date: inputData.date,
        start_time: inputData.start_time,
        total_time: countSum,
        slides: inputData.steps.map((slide) => ({
          id: slide.id,
          slideName: slide.step_title,
          slideTime: slide.count1 + slide.count2 - slide.count1,
          count1: slide.count1,
          count2: slide.count2,
          fileText: slide.fileText,
        })),
        participants: newParticipants,
      };
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        console.log(response.status, response.statusText);
        toast.error("Request failed:", response.status, response.statusText);
        toast.error("Failed to save meeting data. Please try again later.");
      } else {
        const data = response.json();
        navigate("/meeting");
        toast.success("Réunion copiée avec succès");
      }
    } catch (error) {
      toast.error("Échec de la copie de la réunion");
    } finally {
      setButtonClick(false); // Reset button clicked state after API call
    }
  };
  const handleDelete = async () => {
    try {
      const meetingId = inputData.id;

      // Show a confirmation dialog to the user
      const userConfirmed = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette réunion ?"
      );
      if (!userConfirmed) {
        return; // If the user cancels the deletion, exit the function
      }
      // Make the DELETE API request using the fetch API or Axios (replace the API_URL with your actual API endpoint)
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          // Add any required headers, e.g., Authorization
        },
      });
      // Handle the API response status
      if (!response.ok) {
        toast.error("Échec de la suppression de la réunion");
      } else {
        toast.success("Réunion supprimée avec succès.");
        setData((prevData) => prevData.filter((item) => item.id !== meetingId));
        navigate("/meeting");
      }
    } catch (error) {
      // console.error("Error deleting data:", error);
      toast.error("Échec de la suppression de la réunion");
    }
  };
  const handleLeftNavigation = () => {
    const updatedSteps = [...(inputData.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];
    const previousCount2 = selectedStep.count2;

    const isUnique = updatedSteps.every(
      (step, index) =>
        index === selectedIndex || step.step_title !== selectedValue
    );

    if (!isUnique) {
      toast.error("Le nom de l'étape doit être unique.");
      return;
    }
    updatedSteps[selectedIndex] = {
      ...selectedStep,
      fileText: modifiedFileText[selectedIndex],
    };

    if (selectedIndex > 0) {
      const newSelectedIndex = selectedIndex - 1;
      const dataPointIndex = chartData.length - 1 - newSelectedIndex;

      setSelectedIndex(newSelectedIndex);
      setSelectedBar(chartData[dataPointIndex].x);
      setSelectedValue(chartData[dataPointIndex].x);
      setSelectedCount(chartData[dataPointIndex].y[2]);

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
    if (
      selectedIndex !== null &&
      selectedIndex >= 0 &&
      selectedIndex < updatedSteps.length
    ) {
      const selectedStep = updatedSteps[selectedIndex];
      selectedStep.step_title = selectedValue;
      selectedStep.count2 = parseInt(selectedCount, 10);

      const count2Difference = selectedStep.count2 - previousCount2;

      // Update countSum only if the count2 values are not equal
      if (count2Difference !== 0) {
        const newCountSum = countSum + count2Difference;
        setCountSum(newCountSum);
      }

      const updatedChartData = [...chartData];
      const slideIndex = updatedChartData.length - selectedIndex - 1;
      updatedChartData[slideIndex].x = selectedValue;

      // Accumulate the previous selectedCount values
      let accumulatedSelectedCount = 0;
      for (let i = 0; i < selectedIndex + 1; i++) {
        accumulatedSelectedCount += updatedSteps[i].count2;
      }

      // Calculate new storedStartTime by adding accumulatedSelectedCount
      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");

      // Update the state with new storedStartTime
      setStoredStartTime(newStoredStartTime);

      // Update count1 of subsequent slides based on the updated step
      for (let i = selectedIndex + 1; i < updatedSteps.length; i++) {
        const currentSlide = updatedSteps[i];
        const previousSlide = updatedSteps[i - 1];
        currentSlide.count1 = previousSlide.count1 + previousSlide.count2;
      }

      // Calculate newLastCountSum
      const newLastCountSum = updatedSteps.reduce(
        (sum, step) => sum + step.count1 + step.count2,
        0
      );
      const updatedMeetingData = {
        ...inputData,
        steps: updatedSteps,
        lastCountSum: newLastCountSum,
      };
      const formattedData = updatedSteps
        .map((item) => ({
          x: item.step_title,
          y: [item.count1, item.count1 + item.count2, item.count2],
        }))
        .reverse();

      setChartData(formattedData);
      setInputData(updatedMeetingData);
      // Fetch data for the previous index
      const previousIndex = selectedIndex - 1;
      if (previousIndex >= 0) {
        const previousStep = updatedSteps[previousIndex];
        const previousChartDataIndex =
          updatedChartData.length - previousIndex - 1;
        const previousSelectedBar = updatedChartData[previousChartDataIndex].x;
        const previousSelectedValue = previousStep.step_title;
        const previousSelectedCount = previousStep.count2;

        setSelectedBar(previousSelectedBar);
        setSelectedValue(previousSelectedValue);
        setSelectedCount(previousSelectedCount);
        setSelectedIndex(previousIndex);
      } else {
        setIsModalOpen(false);
        setSelectedIndex(null);
        setSelectedValue(null);
        setSelectedCount(null);
      }
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  const handleParticipantDelete = async (id) => {
    console.log("Button clicked for deletion with ID:", id);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/deleteParticipant/${id}`
      );
      if (response.status === 200) {
        // If the API call is successful, update your state
        const updatedParticipants = inputData.participant.filter(
          (item) => item.id !== id
        );
        console.log(updatedParticipants);

        // Update the local storage
        setInputData({
          ...inputData,
          participant: updatedParticipants,
        });
        const updatedInputData = {
          ...inputData,
          participant: updatedParticipants,
        };
        localStorage.setItem(
          `meetingData_${inputData.id}`,
          JSON.stringify(updatedInputData)
        );
        console.log("new input", inputData);
        // toast.success("Participant deleted successfully.");
      } else {
        console.error("Échec de la suppression du participant.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const handleEditParticipant = (e, index) => {
    const editedName = e.target.value;
    const updatedParticipants = inputData.participant.map((participant, i) => {
      if (i === index) {
        return {
          ...participant,
          name: editedName,
        };
      }
      return participant;
    });
    const updatedInputData = {
      ...inputData,
      participant: updatedParticipants,
    };

    setInputData(updatedInputData);
    localStorage.setItem(
      `meetingData_${inputData.id}`,
      JSON.stringify(updatedInputData)
    );
  };
  const handleButtonClick = () => {
    const newParticipant = {
      name: "",
    };
    const updatedParticipants = [...inputData.participant, newParticipant];
    setInputData({ ...inputData, participant: updatedParticipants });
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="meetingedit">
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div className="container-fluid py-3">
          <div className="row">
            <div className="col-md-4">
              <div className="card p-3 graph-card">
                <div className="mb-4">
                  <label className="form-label">Objectif</label>
                  <input
                    type="text"
                    name="objective"
                    value={inputData.objective}
                    className="form-control"
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Type d'échange</label>
                  <br />
                  <select
                    className="select"
                    name="fieldType"
                    onChange={handleChange3}
                    value={inputData.fieldType}
                  >
                    <option value="0">
                      Choisissez le type d'activité qui va répondre à votre
                      problématique
                    </option>
                    <option value="1"> Autre</option>
                    <option value="2"> Entretien d'embauche</option>
                    <option value="3"> Entretien en tête-à-tête</option>
                    <option value="4"> Formation</option>
                    <option value="5">Partage d'informations</option>
                    <option value="6"> Présentation commerciale</option>
                    <option value="7"> Présentation de pitchs</option>
                    <option value="8"> Réunion collaborative</option>
                    <option value="9">Résolution de problèmes</option>
                    <option value="10">Suivi de projet</option>
                    <option value="11"> Séminaire</option>
                    <option value="12"> Suivi d'accompagnement</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Titre</label>
                  <input
                    type="text"
                    name="title"
                    value={inputData.title}
                    className="form-control"
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Priorité</label>
                  <br />
                  <select
                    className="select"
                    value={inputData.type}
                    name="type"
                    onChange={handleChange3}
                  >
                    <option value="0">Critique </option>
                    <option value="1">Majeure </option>
                    <option value="2"> Moyenne </option>
                    <option value="3">Mineure</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Contexte</label>
                  <textarea
                    type="text"
                    name="description"
                    value={inputData.description}
                    className="form-control resume"
                    rows={3}
                    placeholder="contexte"
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Invité</label> <br />
                  <div className="card card2 px-2 py-3 resume">
                    <div>
                      <ul className="list-unstyled ">
                        {inputData?.participant?.map((item, index) => (
                          <li key={index} className="d-flex">
                            <input
                              type="text"
                              name="participant"
                              value={item.name}
                              onChange={(e) => handleEditParticipant(e, index)}
                            />
                            <AiOutlineClose
                              size={"18px"}
                              color="red"
                              className="mt-2"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleParticipantDelete(item.id)}
                            />
                          </li>
                        ))}
                      </ul>
                      <div className="d-flex justify-content-center text-center mt-2 gap-2">
                        <div>
                          <GoPlusCircle
                            size="25px"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => handleButtonClick(e)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    min={today}
                    name="date"
                    value={inputData.date}
                    className="form-control"
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Heure de début</label>
                  <input
                    type="time"
                    name="start_time"
                    value={inputData.start_time}
                    className="form-control "
                    onChange={handleChange3}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Durée estimée à :</label>
                  <p>{countSum + " Min"}</p>
                </div>
              </div>
            </div>
            <div className="col-md-8 mt-2">
              <div className="card graph-card2 p-3">
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
                              <button
                                className="cross-btn"
                                onClick={handleCloseModal}
                              >
                                <RxCross2 size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="modal-body ">
                            <div className="container-fluid">
                              <div className="row d-flex justify-content-center">
                                <div className="col-md-7">
                                  <div>
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
                                      <div
                                        className="mod-input"
                                        style={{
                                          flexGrow: 1,
                                          textAlign: "center",
                                        }}
                                      >
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
                                  </div>
                                </div>
                              </div>
                              <div className="row text-center colwraper ">
                                <div className="col-md-2 col-12 data2 ">
                                  <div className="card timecard p-2">
                                    <p>L’étape démarre à :</p>
                                    <h5>{storedStartTime}</h5>
                                  </div>
                                  <br />
                                  <div className="card timecard p-2 ">
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
                                      <span>{selectedCount} Min</span>
                                      &nbsp;&nbsp;
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
                                      {selectedIndex <
                                        inputData.steps.length - 1 && (
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
                                </div>

                                <div className="col-md-10  col-12 data3 ">
                                  {inputData.steps.map((step, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        display:
                                          index === selectedIndex
                                            ? "block"
                                            : "none",
                                      }}
                                    >
                                      <Editor
                                        apiKey="d37lz7euudv3qj0gxw0v2ki9hxit30psx226v35l2v6y7nlv"
                                        value={modifiedFileText[index]} // Use modifiedFileText for value
                                        init={{
                                          branding: false,
                                          height: 600,
                                          menubar: true,
                                          language: "fr_FR",
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
                                              input.setAttribute(
                                                "type",
                                                "file"
                                              );
                                              input.setAttribute(
                                                "accept",
                                                "image/*"
                                              );

                                              input.onchange = function () {
                                                const file = input.files[0];
                                                const reader = new FileReader();

                                                reader.onload = function (e) {
                                                  const img = new Image();
                                                  img.src = e.target.result;

                                                  img.onload = function () {
                                                    const canvas =
                                                      document.createElement(
                                                        "canvas"
                                                      );
                                                    const ctx =
                                                      canvas.getContext("2d");
                                                    const maxWidth = 700;
                                                    const maxHeight = 394;

                                                    let newWidth = img.width;
                                                    let newHeight = img.height;

                                                    if (img.width > maxWidth) {
                                                      newWidth = maxWidth;
                                                      newHeight =
                                                        (img.height *
                                                          maxWidth) /
                                                        img.width;
                                                    }

                                                    if (newHeight > maxHeight) {
                                                      newHeight = maxHeight;
                                                      newWidth =
                                                        (img.width *
                                                          maxHeight) /
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
                                                      canvas.toDataURL(
                                                        file.type
                                                      );

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
                                          // Update modifiedFileText when the content changes
                                          const updatedModifiedFileText = [
                                            ...modifiedFileText,
                                          ];
                                          updatedModifiedFileText[index] =
                                            content;
                                          setModifiedFileText(
                                            updatedModifiedFileText
                                          );
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center my-5 d-flex justify-content-between  editbutton">
            <div className="d-flex gap-3 edit2">
              <button
                className="btn add1 mb-3"
                onClick={() => navigate("/meeting")}
              >
                Fermer
              </button>
              <button
                className="btn btn-danger del  mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => handleDelete()}
              >
                Supprimer
              </button>
            </div>
            <div className="d-flex gap-3 edit2">
              {/* <button
              className="btn add2 mb-3 "
              onClick={() => previewMeeting(inputData)}
              disabled={buttonClick1}
            >
              {buttonClick1 ? " Regarder l’aperçu...." : " Regarder l’aperçu"}
            </button> */}

              <button
                className="btn add2 mb-3 "
                onClick={meetingPage}
                disabled={buttonClicked}
              >
                {buttonClicked
                  ? "Valider les modifications..."
                  : "Valider les modifications"}
              </button>

              <button
                className="btn add3 mb-3"
                onClick={handleCopy}
                disabled={buttonClick}
              >
                {buttonClick ? "Dupliquer..." : "Dupliquer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Graph;
