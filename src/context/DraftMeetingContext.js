import React, { createContext, useContext, useState } from 'react';

const DraftMeetingsContext = createContext();

export const useDraftMeetings = () => useContext(DraftMeetingsContext);

export const DraftMeetingsProvider = ({ children }) => {
  const [draftMeetings, setDraftMeetings] = useState([]);

  const updateDraftMeetings = (newMeetings) => {
    setDraftMeetings(newMeetings);
  };

  return (
    <DraftMeetingsContext.Provider value={{ draftMeetings, updateDraftMeetings }}>
      {children}
    </DraftMeetingsContext.Provider>
  );
};
