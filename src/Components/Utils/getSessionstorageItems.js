export const getUserID = () => {
  return sessionStorage.getItem("user_id");
};

export const getLoggedInUser = () => {
  return JSON.parse(sessionStorage.getItem("user"));
};

export const getUserRoleID = () => {
  return JSON.parse(sessionStorage.getItem("user")).role_id;
};

export const getLoggedInUserId = () => {
  return JSON.parse(sessionStorage.getItem("user")).id;
};
