import React, { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { BsPlay } from "react-icons/bs";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";

function CurrentContract() {
  const navigate = useNavigate();

  const handleUpdateContract = () => {
    navigate("/ModifierContract");
  };

  const handlelinkEnterprises = () => {
    navigate("/ContractLinkEntreprises");
  };
  return (
    <div className="scheduled">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            <div className="card">
              <div className="card-body">
                <div className="cardbody">
                  <div className="row subtitle card2 py-4 px-4">
                    <div className="col-md-1 text-start obj">
                      <span>Nom</span>
                    </div>
                    <div className="col-md-1 text-center obj">
                      <span>Debut</span>
                    </div>
                    <div className="col-md-1 text-center obj">
                      <span>FIN</span>
                    </div>
                    <div className="col-md-1 text-center obj">
                      <span>Frequence</span>
                    </div>
                    <div className="col-md-2 text-center obj">
                      <span>Nombre de licences</span>
                    </div>
                    <div className="col-md-2 text-center obj">
                      <span>Nombre de licences</span>
                    </div>
                    <div className="col-md-2 text-center obj">
                      <span>Prix </span>
                    </div>
                    <div className="col-md-2 text-end obj">
                      <span>Actions</span>
                    </div>
                  </div>

                  <div className="row py-4 pb-5 text-body-dark px-3">
                    <div className="col-md-1 text-start obj1">
                      <h6>Contrat 1</h6>
                    </div>
                    <div className="col-md-1 text-center obj1">
                      <h6>7/11/23</h6>
                    </div>
                    <div className="col-md-1 text-center obj1">
                      <h6>7/11/23</h6>
                    </div>
                    <div className="col-md-1 text-center obj1">
                      <h6>1</h6>
                    </div>
                    <div className="col-md-2 text-center obj1">
                      <h6>1</h6>
                    </div>
                    <div className="col-md-2 text-center obj1">
                      <h6>1</h6>
                    </div>
                    <div className="col-md-2 text-center obj1">
                      <h6>1</h6>
                    </div>
                    <div className="col-md-2 text-end  d-flex justify-content-end ">
                      <div className="">
                        {/* <BsPlay
                          size={"28px"}
                          style={{ cursor: "pointer" }}
                          title="Démarrer"
                        /> */}
                        <IoEyeOutline
                          size={"22px"}
                          style={{ cursor: "pointer" }}
                          onClick={() => handlelinkEnterprises()}
                        />
                      </div>
                      <div className="dropdown dropstart">
                        <button
                          className="btn btn-secondary"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            padding: "0px",
                          }}
                        >
                          <BiDotsVerticalRounded color="black" size={"25px"} />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleUpdateContract()}
                            >
                              <CiEdit size={"20px"} /> &nbsp; Modifier
                            </a>
                          </li>
                          <li>
                            <a
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                              //   onClick={() => handleCopy(item)}
                            >
                              <RiDeleteRow size={"20px"} /> &nbsp; Clôturer
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <span
                      className={`badge ${
                        moment().isAfter(
                          moment(
                            `${item.date} ${item.start_time}`,
                            "YYYY-MM-DD HH:mm"
                          )

                          // .add(1, 'hour')
                        )
                          ? "bg-danger"
                          : "bg-success"
                      }`}
                    >
                      {moment().isAfter(
                        moment(
                          `${item.date} ${item.start_time}`,
                          "YYYY-MM-DD HH:mm"
                        )
                        // .add(1, 'hour')
                      )
                        ? "En retard"
                        : "A venir"}
                    </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentContract;


 // const handleAddInputGroup = (index) => {
  //   const updatedGroups = [...inputGroups];
  //   console.log(updatedGroups);
  //   const count = updatedGroups[index].count;
  //   console.log(`adding ${count}`);

  //   // Check if the current group's title is empty
  //   if (updatedGroups[index].title.trim() === "") {
  //     toast.error("Please enter a step title before adding more steps.");
  //     return;
  //   }

  //   let totalSteps = 1; // Initialize with 1 since step starts from 1

  //   // Calculate the total steps covered by existing groups
  //   for (let i = 0; i < updatedGroups.length; i++) {
  //     totalSteps += updatedGroups[i].count;
  //   }
  //   console.log("total steps covered by existing groups: " + totalSteps);

  //   const newGroups = [];
  //   for (let i = 0; i < count; i++) {
  //     const newStep = totalSteps + i + 1; // Increment steps for each new group
  //     newGroups.push({
  //       step: newStep,
  //       title: "",
  //       count: 0,
  //     });
  //   }

  //   // Insert the new groups into the updatedGroups array at the appropriate index
  //   updatedGroups.splice(index + 1, 0, ...newGroups);

  //   // Rearrange steps to start from 1 and maintain sequential order
  //   let stepCount = 1;
  //   updatedGroups.forEach((group) => {
  //     group.step = stepCount++;
  //   });

  //   console.log("new steps:", updatedGroups);
  //   setInputGroups(updatedGroups);
  // };