import React from "react";
import { Box, IconButton, Tooltip, Divider } from "@mui/material";
import {
  Mouse as SelectIcon,
  Rectangle as RectangleIcon,
  Timeline as WireIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as DRCIcon,
} from "@mui/icons-material";

const Toolbar = ({ onToolSelect, selectedTool }) => {
  const tools = [
    { id: "select", icon: <SelectIcon />, tooltip: "Select" },
    { id: "rectangle", icon: <RectangleIcon />, tooltip: "Draw Rectangle" },
    { id: "wire", icon: <WireIcon />, tooltip: "Draw Wire" },
    { id: "add", icon: <AddIcon />, tooltip: "Add Component" },
    { id: "delete", icon: <DeleteIcon />, tooltip: "Delete" },
    { id: "drc", icon: <DRCIcon />, tooltip: "Design Rule Check" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1,
        borderRight: "1px solid #ccc",
        backgroundColor: "#f5f5f5",
        height: "100%",
      }}
    >
      {tools.map((tool) => (
        <Tooltip key={tool.id} title={tool.tooltip} placement="right">
          <IconButton
            onClick={() => onToolSelect(tool.id)}
            color={selectedTool === tool.id ? "primary" : "default"}
            sx={{
              backgroundColor:
                selectedTool === tool.id
                  ? "rgba(25, 118, 210, 0.08)"
                  : "transparent",
            }}
          >
            {tool.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default Toolbar;
