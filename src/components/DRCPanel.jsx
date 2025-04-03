import React from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { CheckCircle as DRCIcon } from "@mui/icons-material";

const DRCPanel = ({ violations, onRunDRC }) => {
  console.log("DRCPanel received violations:", violations);

  const handleRunDRC = () => {
    console.log("Run DRC button clicked in DRCPanel");
    if (typeof onRunDRC === "function") {
      onRunDRC();
    } else {
      console.error("onRunDRC is not a function:", onRunDRC);
    }
  };

  return (
    <Box sx={{ width: "250px", borderLeft: "1px solid #ccc", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        DRC Results
      </Typography>
      <Button
        variant="contained"
        startIcon={<DRCIcon />}
        onClick={handleRunDRC}
        sx={{ mb: 2 }}
      >
        Run DRC
      </Button>
      <Divider sx={{ mb: 2 }} />
      {!violations || violations.length === 0 ? (
        <Typography color="success.main">No DRC violations found</Typography>
      ) : (
        <List>
          {violations.map((violation, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={violation.message}
                secondary={`Type: ${violation.type} | Layer: ${violation.layer}`}
                sx={{
                  color: "error.main",
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DRCPanel;
