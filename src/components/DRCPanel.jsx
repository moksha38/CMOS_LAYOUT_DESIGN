import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { CheckCircle, Error, Warning } from "@mui/icons-material";

const DRCPanel = ({ onRunDRC }) => {
  const [drcResults, setDrcResults] = useState([]);

  const handleRunDRC = () => {
    // This will be implemented later with actual DRC logic
    const mockResults = [
      {
        id: 1,
        type: "error",
        message: "Minimum width violation in Metal 1",
        location: "x:100, y:200",
      },
      {
        id: 2,
        type: "warning",
        message: "Spacing violation in Poly layer",
        location: "x:300, y:400",
      },
      {
        id: 3,
        type: "success",
        message: "All other rules passed",
        location: "Global",
      },
    ];
    setDrcResults(mockResults);
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case "error":
        return <Error color="error" />;
      case "warning":
        return <Warning color="warning" />;
      case "success":
        return <CheckCircle color="success" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "300px", borderLeft: "1px solid #ccc", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Design Rule Check
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRunDRC}
        sx={{ mb: 2 }}
      >
        Run DRC
      </Button>
      <Divider sx={{ my: 2 }} />
      <List>
        {drcResults.map((result) => (
          <ListItem key={result.id}>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getStatusIcon(result.type)}
                  <Typography variant="body2">{result.message}</Typography>
                </Box>
              }
              secondary={
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Chip
                    label={result.type}
                    size="small"
                    color={
                      result.type === "error"
                        ? "error"
                        : result.type === "warning"
                        ? "warning"
                        : "success"
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {result.location}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DRCPanel;
