import React, { createContext, useContext, useState, useEffect } from "react";
const HeaderTitleContext = createContext();

export const useHeaderTitle = () => {
  const context = useContext(HeaderTitleContext);
  if (!context) {
    throw new Error("useHeaderTitle must be used within a HeaderTitleProvider");
  }
  return context;
};

export const HeaderTitleProvider = ({ children }) => {
  const [title, setTitle] = useState(
    JSON.parse(sessionStorage.getItem("headerTitle")) || []
  );
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    console.log('profileImage', profileImage)
  }, [profileImage]);

  const pushHeaderTitle = (newTitle) => {
    setTitle((prevHeaderTitle) => [...prevHeaderTitle, newTitle]);
  };

  const popHeaderTitle = () => {
    setTitle((prevHeaderTitle) => {
      const newHeaderTitle = [...prevHeaderTitle];
      newHeaderTitle.pop();
      return newHeaderTitle;
    });
  };

  const resetHeaderTitle = () => {
    sessionStorage.removeItem("headerTitle");
    setTitle([]);
  };

  const setHeaderTitle = (newTitle) => {
    setTitle(newTitle);
  };

  useEffect(() => {
    if (title.length === 0) {
      sessionStorage.removeItem("headerTitle");
    }
    sessionStorage.setItem("headerTitle", JSON.stringify(title));
  }, [title]);
  return (
    <HeaderTitleContext.Provider
      value={{
        title,
        profileImage,
        setProfileImage,
        pushHeaderTitle,
        popHeaderTitle,
        setHeaderTitle,
        resetHeaderTitle,
      }}
    >
      {children}
    </HeaderTitleContext.Provider>
  );
};
