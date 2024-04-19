import React from "react";
import { Link, useParams } from "react-router-dom";
import Chart from "./Chart";
import { Card } from "react-bootstrap";

const StepDetails = () => {
  const id = useParams().id;

  return (
    <div className="text-center step-details">
      <div className="mb-4 p-4 header">
        <h5>Détails de l'étape</h5>
      </div>
      <div className="px-4">
        <Card className="">
          <Chart meetingId={id} />
        </Card>
      </div>
      <Link
        className="btn btn-danger mt-5 "
        to={-1}
        //to={`/presentationreport/${id}`}
      >
        Fermer
      </Link>
    </div>
  );
};

export default StepDetails;
