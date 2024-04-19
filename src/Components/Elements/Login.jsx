import axios from "axios";
import React, { useState } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../Apicongfig";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleLoginSubmit = async (event) => {
    // setShow(false);
    event.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: email,
        password: password,
      });

      if (response) {
        const { id, name, email } = response.data.user;
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user_id", id);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("type", response.data.user.role.name);
        sessionStorage.setItem("role", JSON.stringify(response.data.user.role));

        const userRole = response.data.user.role.name;
        if ((userRole === "MasterAdmin", "SuperAdmin", "Admin")) {
          toast.success("Connexion réussie");
          navigate("/meeting");
        } else {
          navigate("/meeting");
        }
      } else {
        toast.error("La connexion a échoué");
      }
    } catch (error) {
      // console.log("error while logging in", error);
      // toast.error("Veuillez vérifier votre email et votre mot de passe");
      if (
        error?.response?.status === 403 &&
        error?.response?.data?.success === false &&
        error?.response?.data?.message === "Enterprise Status Closed!"
      ) {
        // toast.error(error.response.data.message);
        setShow(true);
      } else {
        toast.error("Veuillez vérifier votre email et votre mot de passe");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleEmailClick = () => {
    const email = "portal@tektime.fr";
    window.open(`mailto:${email}`);
  };
  return (
    <>
      <div className="login">
        <div className="container-fluid pb-5">
          <div className={`row justify-content-center ${show ? `blur` : ""}`}>
            <div className="col-md-4">
              <div className="card px-5 py-4">
                <form
                  onSubmit={handleLoginSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent form submission
                      handleLoginSubmit(e); // Pass the event object to the function
                    }
                  }}
                >
                  <div>
                    <div className="text-center">
                      <img
                        src="/Assets/logo5.png"
                        alt="none"
                        className="img-fluid"
                        width={180}
                      />
                      {/* <p className="">Connexion</p> */}
                    </div>
                    <div className="mb-3">
                      <label for="exampleInputEmail1" className="form-label">
                        E-mail
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={show ? true : false}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleInputPassword1"
                        className="form-label pass-lab"
                      >
                        Mot de passe
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={togglePasswordVisibility}
                        >
                          {passwordVisible ? (
                            <BiHide color="#145CB8" />
                          ) : (
                            <BiShow color="#145CB8" />
                          )}
                        </button>
                      </label>
                      <div className="input-group">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          className="form-control"
                          id="exampleInputPassword1"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={show ? true : false}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        type="submit"
                        className="btn btn-login"
                        disabled={show ? true : false}
                        // onKeyDown={(e)=>handleKeyDown(e)}
                      >
                        Connexion
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {show && (
        <>
          <div className="box" style={{ width: "100%", height: "100%" }}>
            <div className={`row justify-content-center`}>
              <div
                className="col-md-4"
                style={{
                  position: "absolute",
                  top: "22%",
                }}
              >
                <div className="card px-4 py-4">
                  <div className="text-center">
                    <img
                      src="/Assets/logo5.png"
                      alt="none"
                      className="img-fluid"
                      width={180}
                    />
                  </div>
                  <div className="alert alert-danger  pr-0">
                    <h6 className="text-center">
                      Votre abonnement TekTIME vient de toucher à sa fin
                    </h6>
                    <small>
                      Ce n'est pas perdu je vous invite à vous rapprocher de
                      votre administrateur pour prolonger l'aventure ou
                      d'envoyer un mail à{" "}
                      <a href="" onClick={handleEmailClick}>
                        portal@tektime.fr
                      </a>
                      . Je vous dit à très vite
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* )} */}
    </>
  );
};

export default Login;
