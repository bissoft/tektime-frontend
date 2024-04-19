import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";

const PlanDChart = ({ meetingId }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const id = useParams().id || meetingId;

  // Function to get color based on status
  const getColorByStatus = (status) => {
    switch (status) {
      case "Todo":
        return "#007bff"; // Blue
      case "InProgress":
        return "#ffc107"; // Yellow
      case "Finished":
        return "#28a745"; // Green
      default:
        return "#000000"; // Default color
    }
  };

  useEffect(() => {
    const fetchMeetingData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/showPublicMeeting/${id}`
        );
        if (response.data.success) {
          const { plan_d_actions } = response.data.data;
          const data = plan_d_actions?.slice(0, 11).map((action, index) => ({
            x: action.action_days?.split(".")[0], // Action days on x-axis
            y: index < plan_d_actions.length ? index : index % 10, // Static order from 0 to 10
            name: action.action, // Action name
            color: getColorByStatus(action.status), // Assign color based on status
          }));
          setChartData(data);
        }
      } catch (error) {
        console.error("Error fetching meeting data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMeetingData();
  }, [id]);
  
  // Function to get color based on status

  const options = {
    xaxis: {
      title: {
        text: "Action Days",
      },
    },
    yaxis: {
      title: {
        text: "Order of Actions",
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
      rangeBar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        formatter: function (val) {
          return val + " day(s)";
        },
      },
    },
    title: {
      text: "Plan D Actions",
      align: "center",
    },
  };

  return (
    <div className="chart">
      <ReactApexChart
        options={options}
        series={[{ data: chartData }]}
        type="bar"
        height={500}
      />
    </div>
  );
};

export default PlanDChart;
