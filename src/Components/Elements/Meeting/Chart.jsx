import React, { useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Editor } from "@tinymce/tinymce-react";
import { API_BASE_URL, Assets_URL, NODE_API } from "../../Apicongfig";
import { useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { useTotalTime } from "../../../context/TotalTimeContext";
import cheerio from "cheerio";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import { useDropzone } from "react-dropzone";

// Function to extract base64 image sources from HTML string
function extractBase64SrcFromHTML(htmlString) {
  const base64SrcArray = [];

  // Load the HTML string into cheerio
  const $ = cheerio.load(htmlString);

  // Find all elements with 'src' attribute
  $("[src]").each((index, element) => {
    const srcValue = $(element).attr("src");

    // Check if the src starts with 'data:image'
    if (srcValue.startsWith("data:image")) {
      // If src is a base64 image, push it into base64SrcArray
      base64SrcArray.push(srcValue);
    }
  });

  return base64SrcArray;
}

// Function to replace base64 image sources with cloud URLs in HTML string
function replaceBase64SrcWithLinks(htmlString, imageLinks) {
  // Load the HTML string into cheerio
  const $ = cheerio.load(htmlString);

  // Find all elements with 'src' attribute
  $("[src]").each((index, element) => {
    const srcValue = $(element).attr("src");

    // Check if the src starts with 'data:image'
    if (srcValue.startsWith("data:image")) {
      // Replace the src with the corresponding link from imageLinks
      $(element).attr("src", imageLinks[index]);
    }
  });

  // Return the modified HTML string
  return $.html();
}

// Function to convert base64 strings to File objects
const base64toFile = (base64Strings) => {
  return base64Strings.map((dataurl, index) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    // Convert binary string to Uint8Array
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // Generate a unique filename for each file
    const filename = `file_${index}.${mime.split("/")[1]}`;

    // Create a File object
    return new File([u8arr], filename, { type: mime });
  });
};

// Main function to optimize editor content by replacing base64 images with cloud URLs
//Using NodeAPI - Cloudinary

// export const optimizeEditorContent = async (editorContent) => {
//   // Check if editor content exists
//   if (!editorContent) {
//     return "";
//   }

//   // Initialize variable to store optimized editor content
//   let optimizedEditorContent = "";

//   // Extract base64 image sources from editor content
//   const base64Array = extractBase64SrcFromHTML(editorContent);

//   // Check if there are base64 images in the editor content
//   if (!base64Array.length > 0) {
//     // If no base64 images found, return the original content
//     optimizedEditorContent = editorContent;
//     return optimizedEditorContent;
//   } else {
//     // If base64 images exist, proceed with cloud optimization
//     const API_URL = NODE_API;

//     // Convert base64 strings to File objects
//     const files = base64toFile(base64Array);
//     const formData = new FormData();

//     // Append files to FormData object
//     files.forEach((file, index) => {
//       formData.append(`images`, files[index]);
//     });

//     // Send FormData to cloud service and receive image URLs
//     const imagesResponse = await axios.post(API_URL, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     // Extract image URLs from the response
//     const imageSRCArray = imagesResponse?.data?.images?.map(
//       (image) => image.url
//     );

//     // Replace base64 image sources with cloud URLs in the editor content
//     const editorContentWithCloudLinks = replaceBase64SrcWithLinks(
//       editorContent,
//       imageSRCArray
//     );

//     // Update optimized editor content
//     optimizedEditorContent = editorContentWithCloudLinks;
//     return optimizedEditorContent;
//   }
// };

//FrontEnd - Cloudinary
export const optimizeEditorContent = async (editorContent) => {
  if (!editorContent) {
    return "";
  }
  //-------- CLOUD LOGIC ------------------------------
  let optimizedEditorContent = "";
  const base64Array = extractBase64SrcFromHTML(editorContent);
  if (!base64Array.length > 0) {
    optimizedEditorContent = editorContent;
    return optimizedEditorContent;
  } else {
    const cloudinaryUploads = base64Array.map(async (base64Image) => {
      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/drrk2kqvy/upload",
          {
            method: "POST",
            body: JSON.stringify({
              file: base64Image,
              upload_preset: "chat-application",
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        return data.secure_url;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return null;
      }
    });

    const uploadedImageUrls = await Promise.all(cloudinaryUploads);
    const editorContentWithCloudLinks = replaceBase64SrcWithLinks(
      editorContent,
      uploadedImageUrls
    );

    optimizedEditorContent = editorContentWithCloudLinks;
    return optimizedEditorContent;
  }
  //   // ------- CLOUD LOGIC END -------------------------
};

//----------------------------------------------

const Chart = ({ meetingId, puller, participants }) => {
  // console.log("participants", participants);
  const location = window.location.href;
  const fromReport = location.includes("step-details")
    ? true
    : location.includes("meetingDetail")
    ? true
    : false;
  const [t] = useTranslation("global");

  const [isDisabled, setIsDisabled] = useState(false);
  const id = useParams().id || meetingId;
  const [inputData, setInputData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const stepRef = useRef();
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
  const [addBtnText, setAddBtnText] = useState("Ajouter une étape");
  const [copyBtnText, setCopyBtnText] = useState("Copier l’étape");
  const [nextBtnText, setNextBtnText] = useState("Suivant");
  const [prevBtnText, setPrevBtnText] = useState("Précédent");
  const [validateBtnText, setValidateBtnText] = useState("Valider");

  const inputDataRef = useRef(inputData);
  const [fileUpload, setFileUpload] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isUpload, setIsUpload] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const allowedFileTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (file && allowedFileTypes.includes(file.type)) {
      // setFileUpload(file);
      // setFileName(file.path);
      setIsDisabled(false);

      const updatedSteps = [...(inputData?.steps || [])];
      const selectedStep = updatedSteps[selectedIndex];
      // const formData = new FormData();
      // formData.append("file", file);
      // formData.append("editor_content", null);
      // formData.append("editor_type", "File");
      // formData.append("_method", "put");
      // formData.append("title", selectedStep.title);
      // formData.append("count1", selectedStep.count1);
      // formData.append("count2", selectedStep.count2);
      // formData.append("time", selectedStep.time);

      const filePayload = {
        title: selectedStep.title,
        count1: selectedStep.count1,
        count2: selectedStep.count2,
        time: selectedStep.count2,
        editor_type: "File",
        file: file,
        editor_content: null,
        _method: "put",
      };
      try {
        const response = await axios.post(
          `${API_BASE_URL}/steps/${selectedStep?.id}`,
          filePayload,
          // formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        console.log("response--> file uploaded", response);
        if (response.status === 200) {
          setFileName(response.data.data.file);
          setIsUpload(false);
        }
      } catch (error) {
        console.log("error while uploading file", error);
        setIsUpload(false);
      }
    } else {
      alert("Please select a PDF file.");
      event.target.value = null;
      setFileUpload(null);
      setFileName("");
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

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    // console.log("file: ", file);
    setIsUpload(true);
    const allowedFileTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file && allowedFileTypes.includes(file.type)) {
      try {
        setIsDisabled(false);

        const updatedSteps = [...(inputData?.steps || [])];
        const selectedStep = updatedSteps[selectedIndex];

        const filePayload = {
          title: selectedStep.title,
          count1: selectedStep.count1 || 0,
          count2: selectedStep.count2,
          time: selectedStep.count2, // Ensure this is correct
          editor_type: "File",
          file: file,
          editor_content: null,
          _method: "put",
        };

        const formData = new FormData();
        formData.append("title", filePayload.title);
        formData.append("count1", filePayload.count1);
        formData.append("count2", filePayload.count2);
        formData.append("time", filePayload.time);
        formData.append("editor_type", filePayload.editor_type);
        formData.append("file", filePayload.file);
        formData.append("editor_content", filePayload.editor_content);
        formData.append("_method", filePayload._method);

        const response = await axios.post(
          `${API_BASE_URL}/steps/${selectedStep?.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          setFileName(response.data.data.file);
          setIsUpload(false);
        }
      } catch (error) {
        console.log("error while uploading file", error);
        setIsUpload(false);
      }
    } else {
      alert(
        "Please select a valid file type: PDF, Excel, PowerPoint, or Word."
      );
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf,.xlsx,.xls,.ppt,.pptx,.doc,.docx",
    onDrop,
  });

  const [user, setUser] = useState(null);
  const handleUserSelect = (e) => {
    setUser(e.target.value);
    setInputData((prev) => {
      let updatedSteps = [...prev?.steps];
      updatedSteps[selectedIndex].assigned_to = user;
      updatedSteps[selectedIndex].assigned_to_name =
        e.target.selectedOptions[0]?.text;
      return { ...prev, steps: updatedSteps };
    });
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

  const getMeetingbyId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      console.log("steps when modal closed-->", response.data?.data?.steps);
      const updatedSteps = response.data?.data?.steps;
      if (puller !== undefined) {
        puller(updatedSteps);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getMeetingbyId();
  }, [id, isModalOpen]);

  const closeModal = async () => {
    setIsDisabled(true);
    setUser("");
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];
    const count2Difference = parseInt(selectedCount, 10) - selectedStep?.count2;
    if (puller !== undefined) {
      puller(updatedSteps);
    }
    const isUnique = updatedSteps.every(
      (step, index) => index === selectedIndex || step.title !== selectedValue
    );
    if (!isUnique) {
      // toast.error("Le nom de l'étape doit être unique.");
      toast.error(t("meeting.chart.error.unique"));

      setIsDisabled(false);
      setNextBtnText("Suivant");
      return;
    }
    selectedStep.editor_content = modifiedFileText[selectedIndex];
    if (modalType === "Editeur") {
      selectedStep.editor_type = "Editeur";
      setModalType("Editeur");
    } else if (modalType === "Url") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "Url";
      selectedStep.editor_content = link;
      setLink(link);
      setModalType("Url");
    } else if (modalType === "File") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "File";
      // selectedStep.file = fileUpload;
      // setFileUpload(fileUpload);
    }
    selectedStep.title = selectedValue;
    selectedStep.count2 = parseInt(selectedCount, 10);

    for (let i = selectedIndex + 1; i < updatedSteps?.length; i++) {
      const currentStep = updatedSteps[i];
      currentStep.count1 += count2Difference;
    }
    // Update the time value for each step based on count1 and count2
    // let currentTime = selectedStep?.count1 + selectedStep?.count2;
    let currentTime = selectedStep?.count2;
    selectedStep.time = currentTime;

    for (let i = selectedIndex + 1; i < updatedSteps.length; i++) {
      const currentStep = updatedSteps[i];
      currentTime += currentStep?.count2;
      currentStep.time = currentTime;
    }

    const countSum = updatedSteps.reduce((sum, step) => sum + step.count2, 0);
    setTotalTime(countSum);

    const myStep = updatedSteps[selectedIndex + 1]?.count2;
    let accumulatedSelectedCount = myStep;
    for (let i = 0; i < selectedIndex + 1; i++) {
      accumulatedSelectedCount += updatedSteps[i]?.count2;
    }

    const newStoredStartTime = moment(inputData.start_time, "HH:mm")
      .add(accumulatedSelectedCount, "minutes")
      .format("hh:mm a");
    console.log("newStoredStartTime--->", newStoredStartTime);
    setStoredStartTime(newStoredStartTime);

    //-------- CLOUD LOGIC ------------------------------
    const optimizedEditorContent = await optimizeEditorContent(
      selectedStep?.editor_content
    );
    // ------- CLOUD LOGIC END -------------------------

    // return;
    const updatedMeetingData = {
      title: selectedStep.title,
      count1: selectedStep.count1,
      count2: selectedStep.count2,
      time: selectedStep.count2,
      editor_type: selectedStep.editor_type,
      editor_content: fileName ? fileName : optimizedEditorContent,

      // editor_content: optimizedEditorContent.startsWith("<p>")
      //   ? fileName
      //   : optimizedEditorContent ? fileName : optimizedEditorContent,

      file: fileName ? fileName : null,
      assigned_to: user,
      order_no: selectedStep.order_no,
      _method: "put",
    };

    try {
      setIsDisabled(true);
      const response = await axios.post(
        `${API_BASE_URL}/steps/${selectedStep?.id}`,
        updatedMeetingData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.status) {
        console.log("response--> on forward", response.data.data);
        updateTotalTime(countSum);
        setUser(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      setIsModalOpen(false);

      // console.log("errors", error);
      // setIsDisabled(true);
      // toast.error("Échec de la copie de l'étape");
      toast.error(t("meeting.chart.error.failed"));
    } finally {
      setIsDisabled(false);
    }
  };

  // =================================> USE EFFECTS <=================================
  useEffect(() => {
    // console.clear();
    console.log("participants", participants);
    setInputData((prev) => {
      return { ...prev, participants: participants };
    });
  }, [participants]);
  useEffect(() => {
    if (fromReport) {
      setIsModalOpen(true);
    }
  }, [fromReport]);
  useEffect(() => {
    const getMeeting = async () => {
      try {
        setLoading(true);
        setIsDisabled(true);
        const REQUEST_URL = fromReport
          ? `${API_BASE_URL}/showPublicMeeting/${meetingId}`
          : `${API_BASE_URL}/meetings/${meetingId}`;
        const response = await axios.get(REQUEST_URL, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (response.status) {
          const updatedSteps = response.data?.data.steps;
          setInputData({ ...response.data?.data, steps: updatedSteps });
          setLoading(false);
        }
      } catch (error) {
        // console.log("error", error);
        setLoading(false);
      } finally {
        setIsDisabled(false);
      }
    };

    getMeeting();
  }, [id, meetingId, isModalOpen, participants]);

  const [allData, setAllData] = useState([]);
  useEffect(() => {
    if (inputData && inputData?.steps) {
      setModifiedFileText(inputData?.steps?.map((step) => step.editor_content));
    }
    if (inputData) {
      const { steps } = inputData;
      let accumulatedCount2 = steps?.length > 0 ? steps[0]?.count2 : 0;
      let storedTime = moment(inputData.start_time, "HH:mm"); // Initialize stored time
      console.log("accumulatedCount2->", accumulatedCount2);
      const formattedData = steps
        ?.map((step, index) => {
          let count1 = 0;
          let count2 = step.count2;

          if (index > 0) {
            accumulatedCount2 += step.count2;
            count1 = accumulatedCount2 - count2;
          }

          // Calculate new stored time if selectedIndex > 0
          if (index === selectedIndex) {
            storedTime.add(count1, "minutes");
          }

          return {
            x: step.title,
            y: [count1, count1 + count2, count2],
          };
        })
        .reverse();

      // Set stored time only if selectedIndex > 0
      if (selectedIndex > 0) {
        setStoredStartTime(storedTime.format("hh:mm a"));
      } else {
        setStoredStartTime(
          moment(inputData.start_time, "HH:mm").format("hh:mm a")
        );
      }

      console.log("formattedChartData-->", formattedData);
      setChartData(formattedData);
      setAllData(inputData.steps);
    }
  }, [inputData, selectedIndex]);

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
          setChartData((prevChartData) => {
            if (
              dataPointIndex !== undefined &&
              dataPointIndex >= 0 &&
              dataPointIndex < prevChartData?.length
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
                // setStoredStartTime(startTime);
                setAccumulatedSelectedCounts(newAccumulatedSelectedCounts);
                setIsModalOpen(true);

                // if (clickedChartData && clickedChartData.id) {
                //   const clickedStepId = clickedChartData.id;
                // }
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
      enabled: false,
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

  //Cloudinary API
  // const optimizeEditorContent = async (editorContent) => {
  //   if (!editorContent) {
  //     return "";
  //   }
  //   //-------- CLOUD LOGIC ------------------------------
  //   let optimizedEditorContent = "";
  //   const base64Array = extractBase64SrcFromHTML(editorContent);
  //   if (!base64Array.length > 0) {
  //     optimizedEditorContent = editorContent;
  //     return optimizedEditorContent;
  //   } else {
  //     const cloudinaryUploads = base64Array.map(async (base64Image) => {
  //       try {
  //         const response = await fetch("https://api.cloudinary.com/v1_1/drrk2kqvy/upload", {
  //           method: "POST",
  //           body: JSON.stringify({ file: base64Image, upload_preset: "chat-application" }),
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         });
  //         const data = await response.json();
  //         return data.secure_url;
  //       } catch (error) {
  //         console.error("Error uploading image to Cloudinary:", error);
  //         return null;
  //       }
  //     });

  //     const uploadedImageUrls = await Promise.all(cloudinaryUploads);
  //     const editorContentWithCloudLinks = replaceBase64SrcWithLinks(
  //       editorContent,
  //       uploadedImageUrls
  //     );

  //     optimizedEditorContent = editorContentWithCloudLinks;
  //     return optimizedEditorContent;
  //   }
  // //   // ------- CLOUD LOGIC END -------------------------
  // };
  const [assignUser, setAssignUser] = useState(null);
  const [stepOrder, setStepOrder] = useState(null);
  useEffect(() => {
    if (inputData && inputData?.steps && selectedIndex >= 0) {
      const updatedStep = [...(inputData?.steps || [])];
      const selectedStep = updatedStep[selectedIndex];
      console.log("selected-----------------", selectedStep);
      const currentStep = updatedStep[selectedIndex]?.count2;
      setFileName(selectedStep?.file);
      // setFileName(
      //   selectedStep?.file !== null
      //     ? selectedStep?.editor_content
      //     : selectedStep?.file
      // );
      // setType(selectedStep?.editor_content);
      setSelectedCount(currentStep);
      setStepOrder(selectedStep?.order);
      setModalType(
        selectedStep?.editor_type !== null
          ? selectedStep?.editor_type
          : "Editeur"
      );

      setAssignUser(
        selectedStep?.assigned_to_name === null
          ? inputData?.user?.last_name !== null
            ? inputData?.user?.name + " " + inputData?.user?.last_name
            : inputData?.user?.name
          : selectedStep?.assigned_to_name
      );
    }
  }, [inputData, selectedIndex, user, assignUser]);

  // -------------------------OPTIMIZE EDITOR CONTENT-------------------------
  const [mySteps, setMySteps] = useState([]);
  const getMeeting = async () => {
    try {
      setLoading(true);
      setIsDisabled(true);
      const REQUEST_URL = fromReport
        ? `${API_BASE_URL}/showPublicMeeting/${meetingId}`
        : `${API_BASE_URL}/meetings/${meetingId}`;
      const response = await axios.get(REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status) {
        const updatedSteps = response.data?.data.steps;
        setInputData({ ...response.data?.data, steps: updatedSteps });
        const { steps } = response.data?.data;
        setMySteps(steps);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setIsDisabled(false);
    }
  };
  const { total_Time, updateTotalTime } = useTotalTime();

  const [isEdited, setIsEdited] = useState(false);
  const [nextId, setNextId] = useState(null);
  const handleEdit = async () => {
    setIsEdited(true);
    setIsDisabled(true);
    setFileUpload(null);
    // setModalType("Editeur")
    // setNextBtnText("Suivant...");
    setUser("");
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];
    const count2Difference = parseInt(selectedCount, 10) - selectedStep?.count2;
    if (puller !== undefined) {
      puller(updatedSteps);
    }
    const isUnique = updatedSteps.every(
      (step, index) => index === selectedIndex || step.title !== selectedValue
    );
    if (!isUnique) {
      // toast.error("Le nom de l'étape doit être unique.");
      toast.error(t("meeting.chart.error.unique"));
      setIsEdited(false);

      setIsDisabled(false);
      setNextBtnText("Suivant");
      return;
    }
    // setEditorContent(selectedStep?.editor_content);
    selectedStep.editor_content = modifiedFileText[selectedIndex];
    if (modalType === "Editeur") {
      selectedStep.editor_type = "Editeur";
      setModalType("Editeur");
    } else if (modalType === "Url") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "Url";
      selectedStep.editor_content = link;
      setLink(link);
      setModalType("Url");
    } else if (modalType === "File") {
      // selectedStep.editor_type = modalType;
      selectedStep.editor_type = "File";
      // selectedStep.file = fileUpload;
      // setFileUpload(fileUpload);
    }
    selectedStep.title = selectedValue;
    selectedStep.count2 = parseInt(selectedCount, 10);
    // console.log("time->", selectedCount);
    // selectedStep.count1 = selectedCount;
    for (let i = selectedIndex + 1; i < updatedSteps?.length; i++) {
      const currentStep = updatedSteps[i];
      currentStep.count1 += count2Difference;
    }
    // Update the time value for each step based on count1 and count2
    // let currentTime = selectedStep?.count1 + selectedStep?.count2;
    let currentTime = selectedStep?.count2;
    selectedStep.time = currentTime;

    for (let i = selectedIndex + 1; i < updatedSteps.length; i++) {
      const currentStep = updatedSteps[i];
      currentTime += currentStep?.count2;
      currentStep.time = currentTime;
    }

    const countSum = updatedSteps.reduce((sum, step) => sum + step.count2, 0);
    setTotalTime(countSum);

    const myStep = updatedSteps[selectedIndex + 1]?.count2;
    // let accumulatedSelectedCount = myStep;
    let accumulatedSelectedCount = 0;
    for (let i = 0; i < selectedIndex + 1; i++) {
      accumulatedSelectedCount += updatedSteps[i]?.count2;
    }
    console.log("accumulatedSelectedCount--->", accumulatedSelectedCount);

    // if (selectedIndex > 0) {
    const newStoredStartTime = moment(inputData.start_time, "HH:mm")
      .add(accumulatedSelectedCount, "minutes")
      .format("hh:mm a");
    console.log("newStoredStartTime--->", newStoredStartTime);
    setStoredStartTime(newStoredStartTime);
    // }

    //-------- CLOUD LOGIC ------------------------------
    const optimizedEditorContent = await optimizeEditorContent(
      selectedStep.editor_content
    );

    console.log("optimizedEditorContent: ", optimizedEditorContent);
    // ------- CLOUD LOGIC END -------------------------

    console.log("count1 after add time-->", accumulatedSelectedCount);
    console.log("selectedStep.count1-->", selectedStep.count1);
    // return;
    const updatedMeetingData = {
      title: selectedStep.title,
      count1: selectedStep.count1,
      count2: selectedStep.count2,
      time: selectedStep.count2,
      editor_type: selectedStep.editor_type,
      editor_content: fileName ? fileName : optimizedEditorContent,

      // editor_content: optimizedEditorContent.startsWith("<p>")
      //   ? fileName
      //   : optimizedEditorContent ? fileName : optimizedEditorContent,

      file: fileName ? fileName : null,
      assigned_to: user,
      order_no: selectedStep.order_no,
      _method: "put",
    };

    try {
      // setIsDisabled(true);
      const response = await axios.post(
        `${API_BASE_URL}/steps/${selectedStep?.id}`,
        updatedMeetingData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.status) {
        setIsEdited(false);
        setIsDisabled(false);

        setNextId(response.data.data?.id);
        await getStep();

        updateTotalTime(countSum);
        setNextBtnText("Suivant");
        setUser(null);

        // LOGIC FOR GOIG TO NEXT STEP ----------------
        const nextIndex = selectedIndex + 1;
        const index = selectedIndex;
        if (nextIndex < updatedSteps?.length) {
          const nextStep = updatedSteps[nextIndex];
          setNextId(nextStep.id);
          const step = updatedSteps[index];
          const nextSelectedValue = nextStep?.title;
          const nextSelectedCount = nextStep?.count2;
          const count = step.count2;
          setSelectedValue(nextSelectedValue);
          setSelectedCount(nextSelectedCount);
          setSelectedIndex(nextIndex);
          setStoredStartTime(newStoredStartTime);
          setFileName(nextStep?.editor_content);
          // setAssignUser(step?.assigned_to_name);
          // setModalType("Editeur");
        } else {
          setModalType("");
          setFileUpload(null);
          setFileName("");
          setIsModalOpen(false);
          setSelectedIndex(null);
          setSelectedValue(null);
          setSelectedCount(null);
        }
        // --------------------------------------------
      }
    } catch (error) {
      // console.log("errors", error);
      setNextBtnText("Suivant");
      // toast.error("Échec de la copie de l'étape");
      toast.error(t("meeting.chart.error.failed"));
    } finally {
      setIsEdited(false);
      setIsDisabled(false);
    }
  };

  const getStep = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/steps/${nextId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      // console.clear("clear");
      if (response.status) {
        setFileName(response.data.data.file);
      }
    } catch (error) {
      console.log("error while processing get step", error);
    }
  };

  useEffect(() => {
    getStep();
  }, [nextId]);
  const [isAdd, setIsAdd] = useState(false);
  const handleAddStep = async () => {
    setIsAdd(true);
    setUser(null);
    // setAddBtnText("Ajouter une étape");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/steps`,
        {
          title: "new step",
          count1: 0,
          count2: 1,
          time: 1,
          editor_type: "Editeur",
          editor_content: "",
          file: null,
          assigned_to: null,
          order_no: stepOrder,
          // _method: "post",
          meeting_id: meetingId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        setIsAdd(false);
        setNextId(response.data.data.id);
        await getMeeting();
        setUser(null);
        // setIsModalOpen(false)
      }
    } catch (error) {
      console.log("Error: ", error);
      setIsAdd(false);
    }
  };

  const [isCopied, setIsCopied] = useState(false);
  const handleCopyStep = async () => {
    setIsCopied(true);
    setUser(null);
    setCopyBtnText("Copier l’étape...");
    const updatedSlides = [...(inputData.steps || [])];
    const selectedStep = updatedSlides[selectedIndex];
    const isUnique = updatedSlides.every(
      (step, index) => index === selectedIndex || step.title !== selectedValue
    );
    if (!isUnique) {
      // toast.error(t("meeting.chart.error.unqiue"));
      toast.error(t("meeting.chart.error.unique"));
      setIsCopied(false);
      setIsDisabled(false);
      return;
    }

    // Determine the editor type based on the format of the editor content
    let editorType = "Editeur"; // Default to Editeur
    if (
      selectedStep.editor_content &&
      selectedStep.editor_content.startsWith("<p>")
    ) {
      editorType = "File"; // If editor content starts with <p>, set editor type to File
    }

    selectedStep.editor_content = modifiedFileText[selectedIndex];
    if (modalType === "Editeur") {
      selectedStep.editor_type = "Editeur";
      setModalType("Editeur");
    } else if (modalType === "Url") {
      selectedStep.editor_type = "Url";
      selectedStep.editor_content = link;
      setModalType("Url");
      setLink(link);
    } else if (modalType === "File") {
      selectedStep.editor_type = "File";
      // selectedStep.file = fileUpload;
      // setModalType("File");
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
      // const newCount1 = previousSlide.count1 + previousSlide.count2;
      const newCount1 = previousSlide.count2;

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
        // currentSlide.count1 = nextSlide.count1 + nextSlide.count2;
        currentSlide.count1 = nextSlide.count2;
        // currentSlide.fileText = modifiedFileText[i - 1];
      }
      if (selectedSlide.title !== selectedValue) {
        copiedSlide.title = selectedValue;
      }

      copiedSlide.time = selectedCount;
      const newCountSum = countSum + copiedSlide.count2;
      setCountSum(newCountSum);

      const newLastCountSum = updatedSlides.reduce(
        (sum, step) => sum + step.count2,
        0
      );
      //-------- CLOUD LOGIC ------------------------------
      const optimizedEditorContent = await optimizeEditorContent(
        copiedSlide.editor_content
      );
      // ------- CLOUD LOGIC END -------------------------
      const duplicateStepData = {
        title: copiedSlide.title,
        count1: copiedSlide.count1 || 0,
        count2: copiedSlide.count2,
        time: copiedSlide.count2,
        // editor_type: fileName || type ? "File" : "Editeur",
        editor_type: fileName ? "File" : "Editeur",
        editor_content: fileName ? fileName : optimizedEditorContent,
        order_no: selectedStep.order_no,
        assigned_to: user,
        file: fileName ? fileName : null,
        _method: "put",
        duplicate: true,
        meeting_id: meetingId,
      };
      const formattedData = updatedSlides
        .map((item) => ({
          x: item.title,
          y: [item.count1, item.count1 + item.count2, item.count2],
        }))
        .reverse();
      // setChartData(formattedData);
      try {
        setIsDisabled(true);
        const response = await axios.post(
          `${API_BASE_URL}/steps/${selectedStep?.id}`,
          duplicateStepData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        if (response.status) {
          setPreviousId(response.data.data?.id);
          setIsCopied(false);
          setCopyBtnText("Copier l’étape");
          // setChartData(formattedData);
          setTotalTime(newLastCountSum);
          updateTotalTime(newLastCountSum);
          getMeeting();
          // setType(response.data?.data?.editor_content);
          setFileName(response.data?.data?.file);
          // setFileUpload(response?.data?.data?.editor_content);
          // setFileName(response?.data?.data?.editor_content);
          setSelectedIndex(insertIndex);
          setSelectedValue(response.data?.data.title);
          setSelectedCount(copiedSlide.count2);
          setUser(null);
        }
      } catch (error) {
        setCopyBtnText("Copier l’étape");
        toast.error(error.response.data.message);
        // toast.error("Échec de la copie de l'étape");
      } finally {
        setIsDisabled(false);
        setIsCopied(false);
      }
    } else {
      toast.error(t("meeting.chart.error.failed"));
      setIsDisabled(false);
    }
  };

  useEffect(() => {
    getMeeting();
  }, [id, meetingId]);

  const handleChange1 = (event) => {
    setSelectedValue(event.target.value);
  };
  const handleIncrementCount = () => {
    setSelectedCount((prevCount) => prevCount + 1);
  };
  const handleDecrementCount = () => {
    setSelectedCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
  };

  const [isDeleted, setIsDeleted] = useState(false);

  const handleModalDelete = async () => {
    setIsDeleted(true);
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
      (sum, step) => sum + step.count2,
      0
    );
    const formattedData = updatedSteps
      .map((item) => ({
        x: item.title,
        y: [item.count1, item.count1 + item.count2, item.count2],
        // y: [item.counts[0], item.counts[0] + item.counts[1], item.counts[1]],
      }))
      .reverse();
    try {
      setIsDisabled(true);
      const response = await axios.delete(
        `${API_BASE_URL}/steps/${deletedStep?.id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.status) {
        setIsDeleted(false);
        toast.success(t("meeting.chart.error.delete"));
        setChartData(formattedData);
        // setInputData(updatedMeetingData);
        setTotalTime(newLastCountSum);
        updateTotalTime(newLastCountSum);
        // setIsModalOpen(false);
        // setSelectedValue(selectedStep.title)
        setSelectedValue(updatedSteps[selectedIndex - 1].title);
        setSelectedIndex(selectedIndex - 1);
        getMeeting();
      }
    } catch (error) {
      // console.log("error: ", error);
    } finally {
      setIsDisabled(false);
      setIsDeleted(false);
    }
    // toast.success("Data has been deleted permanently.");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [previousId, setPreviousId] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const handleLeftNavigation = async () => {
    // setFileName("")
    setIsUpdated(true);
    setIsDisabled(true);
    setUser("");

    // const previousStep = inputData?.steps[selectedIndex - 1];
    // setPreviousId(previousStep?.id);
    // console.log("previous step", previousStep);

    setAssignUser(previousStep?.assigned_to_name);
    // setPrevBtnText("Précédent...");
    if (selectedIndex > 0) {
      const updatedSteps = [...(inputData?.steps || [])];
      const selectedStep = updatedSteps[selectedIndex];
      const count2Difference =
        parseInt(selectedCount, 10) - selectedStep?.count2;

      const isUnique = updatedSteps.every(
        (step, index) => index === selectedIndex || step.title !== selectedValue
      );
      if (!isUnique) {
        // toast.error("Le nom de l'étape doit être unique.");
        toast.error(t("meeting.chart.error.unique"));

        setIsDisabled(false);
        setIsUpdated(false);

        setPrevBtnText("Précédent");
        return;
      }

      selectedStep.editor_content = modifiedFileText[selectedIndex];

      if (modalType === "Editeur") {
        selectedStep.editor_type = "Editeur";
        setModalType("Editeur");
      } else if (modalType === "Url") {
        selectedStep.editor_type = "Url";
        selectedStep.editor_content = link;
        setLink(link);
        setModalType("Url");
      } else if (modalType === "File") {
        selectedStep.editor_type = "File";
        // selectedStep.file = fileUpload;
        // setModalType("File");
      }
      selectedStep.title = selectedValue;
      selectedStep.count2 = parseInt(selectedCount, 10);

      const newSelectedIndex = selectedIndex - 1;
      const dataPointIndex = chartData.length - 1 - newSelectedIndex;

      // // Update the time value for each step based on count1 and count2
      // for (let i = selectedIndex; i < updatedSteps.length; i++) {
      //   const currentStep = updatedSteps[i];
      //   const previousStep = updatedSteps[i - 1];
      //   // Update time value for each step
      // }

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
      const myStep = updatedSteps[selectedIndex - 1]?.count2;
      // Calculate the accumulated time up to the selected step
      let accumulatedSelectedCount = 0;
      for (let i = 0; i < newSelectedIndex; i++) {
        accumulatedSelectedCount += updatedSteps[i]?.count2;
      }

      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");

      setStoredStartTime(newStoredStartTime);
      // const newAccumulatedSelectedCounts = accumulatedSelectedCounts
      //   .slice(0, newSelectedIndex)
      //   .concat(totalSelectedCount);

      // const start_Time = moment(inputData.start_time, "HH:mm")
      //   .add(
      //     newAccumulatedSelectedCounts.reduce((sum, count) => sum + count, 0),
      //     "minutes"
      //   )
      //   .format("hh:mm a");

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
      // setStoredStartTime(start_Time);
      // setAccumulatedSelectedCounts(newAccumulatedSelectedCounts);
      setIsModalOpen(true);

      const countSum = updatedSteps.reduce((sum, step) => sum + step.count2, 0);

      const optimized_EditorContent = await optimizeEditorContent(
        selectedStep.editor_content
      );

      const updatedMeetingData = {
        title: selectedStep.title,
        count1: selectedStep.count1,
        count2: selectedStep.count2,
        time: selectedStep.count2,
        editor_type: selectedStep.editor_type,
        editor_content: fileName ? fileName : optimized_EditorContent,
        // file: fileUpload ? null : fileUpload,
        // file: optimized_EditorContent ? null : fileName,
        file: fileName ? fileName : null,
        assigned_to: user,
        _method: "put",
      };

      try {
        // setIsDisabled(true);
        const response = await axios.post(
          `${API_BASE_URL}/steps/${selectedStep?.id}`,
          updatedMeetingData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        if (response.status) {
          const id = response.data.data?.id - 1;
          setPrevBtnText("Précédent");
          setIsUpdated(false);
          setIsDisabled(false);
          // const nextStep = mySteps[newSelectedIndex];
          const nextStep = updatedSteps[newSelectedIndex];
          // setPreviousId(nextStep?.id);
          const nextSelectedValue = nextStep?.title;
          const nextSelectedCount = nextStep?.count2;
          updateTotalTime(countSum);
          setUser(null);
          setSelectedValue(nextSelectedValue);
          setSelectedValue(nextSelectedValue);
          // await getPreviousStep();

          try {
            const response = await axios.get(
              `${API_BASE_URL}/steps/${nextStep?.id}`,
              {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
              }
            );
            // console.clear("clear");
            console.log("previous step data--->", response.data.data);
            if (response.status) {
              setFileName(response.data.data.file);
            }
          } catch (error) {
            // console.log(error);
          }

          // setFileName(nextStep?.editor_content);
          // setFileUpload(nextStep?.editor_content);
        }
      } catch (error) {
        // toast.error("Échec de la copie de l'étape");
        toast.error(t("meeting.chart.error.failed"));
        setIsDisabled(false);
      } finally {
        setIsDisabled(false);
        setIsUpdated(false);
      }
    }
  };

  const getPreviousStep = async () => {
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex];

    try {
      const response = await axios.get(`${API_BASE_URL}/steps/${previousId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      // console.clear("clear")
      if (response.status) {
        setFileName(response.data.data.file);
        // setModifiedFileText[previousId](response.data?.data?.editor_content);
      }
    } catch (error) {
      console.log("error while processing get step", error);
    }
  };

  useEffect(() => {
    getPreviousStep();
  }, []);

  const nextStep = () => {
    const updatedSteps = [...(inputData?.steps || [])];
    const selectedStep = updatedSteps[selectedIndex + 1]?.count2;

    const updatedChartData = [...chartData];
    const slideIndex = updatedChartData.length - selectedIndex - 1;
    updatedChartData[slideIndex].x = selectedValue;

    let accumulatedSelectedCount = selectedStep;
    for (let i = 0; i < selectedIndex + 1; i++) {
      accumulatedSelectedCount += updatedSteps[i]?.count2;
    }

    const newStoredStartTime = moment(inputData.start_time, "HH:mm")
      .add(accumulatedSelectedCount, "minutes")
      .format("hh:mm a");
    // Update the state with new storedStartTime
    setStoredStartTime(newStoredStartTime);
    // LOGIC FOR GOIG TO NEXT STEP ----------------

    const nextIndex = selectedIndex + 1;
    if (nextIndex < updatedSteps?.length) {
      const nextStep = updatedSteps[nextIndex];
      const nextChartDataIndex = updatedChartData.length - nextIndex - 1;
      const nextSelectedBar = updatedChartData[nextChartDataIndex].x;
      const nextSelectedValue = nextStep?.title;
      const nextSelectedCount = nextStep?.count2;

      setSelectedBar(nextSelectedBar);
      setSelectedValue(nextSelectedValue);
      setSelectedCount(nextSelectedCount);
      setSelectedIndex(nextIndex);
      // setStoredStartTime(newStoredStartTime);
    } else {
      setIsModalOpen(false);
      setSelectedIndex(null);
      setSelectedValue(null);
      setSelectedCount(null);
    }
  };

  const previousStep = () => {
    if (selectedIndex > 0) {
      const updatedSteps = [...(inputData?.steps || [])];
      const selectedStep = updatedSteps[selectedIndex - 1]?.count2;

      const newSelectedIndex = selectedIndex - 1;
      const dataPointIndex = chartData.length - 1 - newSelectedIndex;

      // Calculate the accumulated time up to the selected step
      let accumulatedSelectedCount = selectedStep;
      for (let i = 0; i < newSelectedIndex; i++) {
        accumulatedSelectedCount += updatedSteps[i]?.count2;
      }

      const newStoredStartTime = moment(inputData.start_time, "HH:mm")
        .add(accumulatedSelectedCount, "minutes")
        .format("hh:mm a");

      setSelectedIndex(newSelectedIndex);
      setSelectedBar(chartData[dataPointIndex].x);
      setSelectedValue(chartData[dataPointIndex].x);
      setSelectedCount(chartData[dataPointIndex].y[2]);

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
      setIsModalOpen(true);
      setStoredStartTime(newStoredStartTime); // Update the stored start time

      setPrevBtnText("Précédent");
      updateTotalTime(countSum);
      setUser(null);
    }
  };

  return (
    <>
      <div
        id="chart-container"
        className="chart-content"
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
                    {
                      <h4>
                        {location.includes("step-details")
                          ? ""
                          : t("meeting.newMeeting.Edit a step")}
                      </h4>
                    }
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      disabled={isDisabled}
                      className="cross-btn"
                      onClick={handleCloseModal}
                    >
                      <RxCross2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="row d-flex justify-content-center">
                  <div className="col-md-7">
                    <div className="d-flex justify-content-arround align-items-center gap-4">
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
                            disabled={
                              window.location.href.includes("/meetingDetail") ||
                              fromReport
                                ? true
                                : false
                            }
                          />
                        </div>
                        <div
                          style={{
                            flexGrow: 1,
                            textAlign: "right",
                            paddingRight: "10px",
                          }}
                        >
                          {selectedIndex + 1}/{chartData?.length}
                        </div>
                      </div>
                      {/* <br /> */}
                      <select
                        className="form-select"
                        style={{
                          width: "13rem",
                        }}
                        value={modalType === "Editeur" ? "Editeur" : "File"}
                        onChange={(e) => setModalType(e.target.value)}
                        disabled={fromReport}
                      >
                        <option value={"Editeur"}>Editeur</option>
                        <option value={"File"}>File Upload</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-3 modal-body">
                  <div className="container-fluid">
                    <div className="row">
                      <div className="text-center col-md-2 col-6">
                        <div className="p-2 card timecard">
                          <p>{t("meeting.newMeeting.The stage starts at")}</p>
                          {/* <h5>{storedStartTime}</h5> */}

                          <h5>
                            {/* {moment(inputData.start_time, "HH:mm").format(
                              "hh:mm a"
                            )}  */}
                            {storedStartTime}
                          </h5>
                        </div>
                        <br />
                        {!window.location.href.includes("/meetingDetail") && (
                          <div className="p-2 card timecard ">
                            <p>
                              {t(
                                "meeting.newMeeting.Estimated time of the stage"
                              )}
                            </p>
                            <div>
                              <img
                                src="/Assets/minus1.svg"
                                alt="minus"
                                className="img-fluid "
                                width={"15px"}
                                style={{ cursor: "pointer" }}
                                // onClick={handleDecrementCount}
                                onClick={() => {
                                  if (fromReport) return;
                                  handleDecrementCount();
                                }}
                              />{" "}
                              &nbsp; &nbsp;
                              {/* <input type="text" value={selectedCount} /> */}
                              <span>{selectedCount} Min</span>&nbsp;&nbsp;
                              <img
                                src="/Assets/plus1.svg"
                                alt="plus"
                                className="img-fluid"
                                width={"15px"}
                                style={{ cursor: "pointer" }}
                                // onClick={handleIncrementCount}
                                onClick={() => {
                                  if (fromReport) {
                                    return;
                                  }
                                  handleIncrementCount();
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="p-2 mt-3 card timecard">
                          <p>Guide</p>

                          <label className="form-label">
                            {/* assigned_to:{" "} */}
                            {assignUser === null
                              ? `${inputData?.user?.name} ${
                                  inputData?.user?.last_name !== null
                                    ? inputData.user.last_name
                                    : " "
                                }`
                              : assignUser}
                          </label>

                          <select
                            hidden={fromReport}
                            className="select"
                            value={user}
                            onChange={handleUserSelect}
                            disabled={
                              window.location.href.includes("/meetingDetail") ||
                              fromReport
                                ? true
                                : false
                            }
                          >
                            {/* <option value="">
                              {participants?.length === 0
                                ? t("No Guests Available")
                                : t("meeting.newMeeting.Select Guests")}
                            </option> */}
                            <option value="">
                              {inputData.participants.filter(
                                (participant) => participant.isCreator !== 1
                              ).length === 0
                                ? t("No Guests Available")
                                : t("meeting.newMeeting.Select Guests")}
                            </option>
                            {inputData?.participants &&
                              participants
                                ?.reduce((uniqueParticipants, item) => {
                                  const isDuplicate = uniqueParticipants.some(
                                    (participant) =>
                                      participant.first_name ===
                                        item.first_name &&
                                      participant.last_name ===
                                        item.last_name &&
                                      participant.email === item.email &&
                                      participant.post === item.post
                                  );

                                  if (!isDuplicate) {
                                    uniqueParticipants.push(item);
                                  }
                                  return uniqueParticipants;
                                }, [])
                                .map((item, index) => {
                                  if (item?.isCreator === 1) {
                                    return;
                                  }
                                  return (
                                    <>
                                      {(item.first_name === null) &
                                        (item.last_name === null) &&
                                      item.email === null &&
                                      item.post === null ? (
                                        <>
                                          <option value="" disabled>
                                            {t(
                                              "meeting.newMeeting.No Guest Available"
                                            )}
                                          </option>
                                        </>
                                      ) : (
                                        <option key={index} value={item.id}>
                                          {/* {item.first_name} */}
                                          {`${item.first_name} ${item.last_name}`}
                                        </option>
                                      )}
                                    </>
                                  );
                                })}

                            {/* {inputData?.participants &&
                              inputData?.participants?.map((item, index) => (
                                <>
                                  {(item.first_name === null) &
                                    (item.last_name === null) &&
                                  item.email === null &&
                                  item.post === null ? (
                                    <>
                                      <option value="" disabled>
                                        {t(
                                          "meeting.newMeeting.No Guest Available"
                                        )}
                                      </option>
                                    </>
                                  ) : (
                                    <option key={index} value={item.id}>
                                      {`${item.first_name} ${item.last_name}`}
                                    </option>
                                  )}
                                </>
                              ))} */}
                          </select>
                        </div>
                        <div className="mt-4 modal-button">
                          {/* Add Step button */}
                          {/* {window.location.href.includes("/meetingDetail") ? (
                            <div>
                              <button
                                className="btn btn-primary"
                                // onClick={handleCopyStep}
                                // onClick={handleEdit}
                                style={{ width: "100%" }}
                                disabled={
                                  fromReport === true ||
                                  window.location.href.includes(
                                    "/meetingDetail"
                                  )
                                    ? true
                                    : false
                                }
                              >
                                {addBtnText}
                              </button>
                            </div>
                          ) : (
                            <>
                              {isAdd ? (
                                <>
                                  <div>
                                    <Button
                                      variant="blue"
                                      disabled
                                      className="w-100"
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <button
                                    disabled={isDisabled || fromReport}
                                    hidden={fromReport}
                                    className="btn btn-primary"
                                    onClick={handleAddStep}
                                    style={{ width: "100%" }}
                                  >
                                    {addBtnText}
                                  </button>
                                </div>
                              )}
                            </>
                          )} */}
                          {/* Copy Step button */}

                          {window.location.href.includes("/meetingDetail") ? (
                            <div>
                              <button
                                className="btn btn-primary"
                                // onClick={handleCopyStep}
                                // onClick={handleEdit}
                                style={{ width: "100%" }}
                                disabled={
                                  fromReport === true ||
                                  window.location.href.includes(
                                    "/meetingDetail"
                                  )
                                    ? true
                                    : false
                                }
                              >
                                {/* {copyBtnText} */}
                                {t("meeting.chart.buttons.copy")}
                              </button>
                            </div>
                          ) : (
                            <>
                              {isCopied ? (
                                <>
                                  <div>
                                    <Button
                                      variant="blue"
                                      disabled
                                      className="w-100"
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <button
                                    disabled={isDisabled || fromReport}
                                    hidden={fromReport}
                                    className="btn btn-primary"
                                    onClick={handleCopyStep}
                                    style={{ width: "100%" }}
                                  >
                                    {/* {copyBtnText} */}
                                    {t("meeting.chart.buttons.copy")}
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {window.location.href.includes("/meetingDetail") ? (
                            <div>
                              <button
                                //  disabled={isDisabled}
                                className="btn btn-danger"
                                // onClick={handleModalDelete}
                                style={{ width: "100%" }}
                                disabled={
                                  window.location.href.includes(
                                    "/meetingDetail"
                                  ) || fromReport
                                    ? true
                                    : false
                                }
                              >
                                {t("meeting.chart.buttons.delete")}
                              </button>
                            </div>
                          ) : (
                            <>
                              {isDeleted ? (
                                <>
                                  <div>
                                    <Button
                                      variant="dark"
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                      disabled
                                      className="w-100"
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <button
                                    disabled={isDisabled || fromReport}
                                    className="btn btn-danger"
                                    onClick={handleModalDelete}
                                    style={{ width: "100%" }}
                                    hidden={fromReport}
                                  >
                                    {/* Supprimer */}
                                    {t("meeting.chart.buttons.delete")}
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {window.location.href.includes("/meetingDetail") ? (
                            <>
                              <div>
                                {selectedIndex <
                                  inputData?.steps?.length - 1 && (
                                  <button
                                    // disabled={isDisabled}
                                    className="btn btn-primary buttons"
                                    onClick={nextStep}
                                    style={{ width: "100%" }}
                                    // disabled={
                                    //   window.location.href.includes(
                                    //     "/meetingDetail"
                                    //   )
                                    //     ? true
                                    //     : false
                                    // }
                                  >
                                    {/* {nextBtnText} */}
                                    {t("meeting.chart.buttons.next")}
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <div>
                              {isEdited &&
                              selectedIndex < inputData?.steps.length - 1 ? (
                                <>
                                  <>
                                    <div>
                                      <Button
                                        variant="dark"
                                        disabled
                                        style={{
                                          backgroundColor: "#3aa5ed",
                                          border: "none",
                                        }}
                                        className="w-100"
                                      >
                                        <Spinner
                                          as="span"
                                          variant="light"
                                          size="sm"
                                          role="status"
                                          aria-hidden="true"
                                          animation="border"
                                        />
                                      </Button>
                                    </div>
                                  </>
                                </>
                              ) : (
                                selectedIndex <
                                  inputData?.steps?.length - 1 && (
                                  <button
                                    disabled={isDisabled}
                                    className="btn btn-primary buttons"
                                    // onClick={handleRightNavigation}
                                    onClick={() => {
                                      if (fromReport) {
                                        nextStep();
                                        return;
                                      }
                                      handleEdit();
                                    }}
                                    style={{ width: "100%" }}
                                  >
                                    {/* {nextBtnText} */}
                                    {t("meeting.chart.buttons.next")}
                                  </button>
                                )
                              )}
                            </div>
                          )}

                          {window.location.href.includes("/meetingDetail") ? (
                            <>
                              <div>
                                {selectedIndex > 0 && (
                                  <button
                                    className="btn btn-primary buttons"
                                    onClick={previousStep}
                                    style={{ width: "100%" }}
                                    // disabled={
                                    //   window.location.href.includes(
                                    //     "/meetingDetail"
                                    //   )
                                    //     ? true
                                    //     : false
                                    // }
                                  >
                                    {/* {prevBtnText} */}
                                    {t("meeting.chart.buttons.previous")}
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              {isUpdated ? (
                                <>
                                  <div>
                                    <Button
                                      variant="dark"
                                      disabled
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                      className="w-100"
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  {selectedIndex > 0 && (
                                    <button
                                      disabled={isDisabled}
                                      className="btn btn-primary buttons"
                                      // onClick={handleLeftNavigation}
                                      onClick={() => {
                                        if (fromReport) {
                                          previousStep();
                                          return;
                                        }
                                        handleLeftNavigation();
                                      }}
                                      style={{ width: "100%" }}
                                    >
                                      {/* {prevBtnText} */}
                                      {t("meeting.chart.buttons.previous")}
                                    </button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {window.location.href.includes("/meetingDetail") ? (
                          <>
                            {selectedIndex === inputData?.steps?.length - 1 &&
                            !fromReport ? (
                              <button
                                // disabled={isDisabled}
                                hidden={fromReport}
                                className="mt-3 btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={nextStep}
                              >
                                {/* {validateBtnText} */}
                                {t("meeting.chart.buttons.validate")}
                              </button>
                            ) : (
                              <button
                                // disabled={isDisabled}
                                className="mt-3 btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={closeModal}
                              >
                                {t("meeting.chart.buttons.close")}
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {selectedIndex === inputData?.steps?.length - 1 &&
                            !fromReport ? (
                              <>
                                {isEdited ? (
                                  <div>
                                    <Button
                                      variant="dark"
                                      disabled
                                      style={{
                                        backgroundColor: "#3aa5ed",
                                        border: "none",
                                      }}
                                      className="w-100 mt-3"
                                    >
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    disabled={isDisabled}
                                    className="mt-3 btn btn-primary"
                                    style={{ width: "100%" }}
                                    onClick={handleEdit}
                                  >
                                    {/* {validateBtnText} */}
                                    {t("meeting.chart.buttons.validate")}
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                disabled={isDisabled}
                                className="mt-3 btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={closeModal}
                              >
                                {t("meeting.chart.buttons.close")}
                              </button>
                            )}
                          </>
                        )}
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
                                disabled={fromReport}
                                // apiKey="d37lz7euudv3qj0gxw0v2ki9hxit30psx226v35l2v6y7nlv"
                                apiKey="igbodkmd5ctops1j5kyglicj63lj9ce0owhl897jaecicb7c"
                                value={modifiedFileText[index]}
                                name="text"
                                init={{
                                  branding: false,
                                  height: 600,
                                  menubar: true,
                                  language: "fr_FR",
                                  // language: "en_EN",
                                  plugins:
                                    "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                                  toolbar:
                                    "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                                  image_advtab: true,
                                  file_picker_types: "image",

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

                                            // Pass the resized image data to the callback function
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
                            {!isUpload ? (
                              <>
                                {/* <div className="d-flex align-items-center gap-4">
                                  <input
                                    accept=".pdf,.xlsx,.xls,.ppt,.pptx,.doc,.docx"
                                    type="file"
                                    placeholder="https://www.google.com"
                                    onChange={(e) => {
                                      handleFileUpload(e);
                                      e.target.value = "";
                                    }}
                                    style={{
                                      border: "1px solid #cccccc",
                                      padding: "5px 7px",
                                      width: "auto",
                                      borderRadius: "6px",
                                      outline: "none",
                                    }}
                                  />
                                  {fileName && (
                                    <div>Selected file: {fileName}</div>
                                  )}
                                </div>
                                <div>
                                  <div className="pdf-preview">
                                    {fileName !== "" && fileName !== null && (
                                      <iframe
                                        title="PDF Preview"
                                        src={Assets_URL + fileName}
                                        width="100%"
                                        height="500px"
                                      />
                                    )}
                                  </div>
                                </div> */}
                                <div
                                  className={`d-flex align-items-center gap-4 ${
                                    fileName ? "" : "h-100"
                                  }`}
                                >
                                  <div
                                    {...getRootProps()}
                                    style={{
                                      border: "1px solid #cccccc",
                                      padding: "5px 7px",
                                      width: fileName ? "auto" : "100%", // Set width to auto when a file is uploaded
                                      borderRadius: "6px",
                                      outline: "none",
                                      margin: fileName ? "" : "0 auto",
                                      height: "100%",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input {...getInputProps()} />
                                    {isUpload ? (
                                      <p>Uploading...</p>
                                    ) : fileName ? (
                                      <div>Selected file: {fileName}</div>
                                    ) : (
                                      <p
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          height: "inherit",
                                        }}
                                      >
                                        Drag 'n' drop files here, or click to
                                        select files
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {fileName && (
                                  <div className="mt-2">
                                    <div className="pdf-preview">
                                      <iframe
                                        title="PDF Preview"
                                        src={Assets_URL + fileName}
                                        width="100%"
                                        height="500px"
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <Spinner
                                  animation="border"
                                  role="status"
                                  className="center-spinner"
                                ></Spinner>
                              </>
                            )}
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
                                  disabled={isDisabled}
                                  className="my-3 btn btn-danger"
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