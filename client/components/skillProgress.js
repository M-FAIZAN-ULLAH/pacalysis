import React from "react";
import { Progress, Tooltip, Button } from "antd";
import { CheckOutlined, ClockCircleOutlined } from "@ant-design/icons";

const SkillProgress = ({ skill, progress, color = "blue" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg shadow-md bg-gray-100 hover:shadow-lg">
      <h3 className="text-lg font-semibold mb-2">{skill}</h3>
      <Progress
        className="w-full rounded-lg"
        percent={progress}
        strokeColor={color}
        showInfo={false}
      />
      <div className="flex items-center mt-4">
        <Tooltip title="Progress">
          <ClockCircleOutlined className="text-gray-400 mr-2" />
        </Tooltip>
        <span className="text-gray-600">{progress}%</span>
      </div>
      <Button type="primary" className="mt-4 focus:outline-none">
        <CheckOutlined /> Master This Skill
      </Button>
    </div>
  );
};

export default SkillProgress;
