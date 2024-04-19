import React from "react";

const PDFUploader = () => {
  return (
    <div className="pdf-uploader">
      <input type="file" id="pdf" name="pdf" accept="application/pdf" />
    </div>
  );
};

export default PDFUploader;


// ------Speech To Text- Start--------
// const [stepNotes, setStepNotes] = useState([]);
// const [myNotes, setMyNotes] = useState("");
// console.log("my notes", myNotes);
// const { isListening, transcript, startListening, stopListening } =
//   useSpeechToText({
//     initialListening: meeting?.prise_de_notes === "Automatic",
//     continuous: true,
//   });
// const startStopListening = () => {
//   isListening ? stopVoiceInput() : startListening();
// };

// const stopVoiceInput = () => {
  
//   // setMyNotes((prevVal) =>
//   //   prevVal ? prevVal + " " + transcript : transcript
//   // );
//   setMyNotes(prevNotes => prevNotes + ' ' + transcript);
//   stopListening();
// };

// // Automatically start/stop listening based on `prise_de_notes`
// useEffect(() => {
//   if (meeting && meeting.prise_de_notes === "Automatic") {
//     startListening();
//   } else {
//     stopListening();
//   }
// }, [meeting?.prise_de_notes]); // Added meeting.prise_de_notes as a dependency