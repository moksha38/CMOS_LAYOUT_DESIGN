import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import LayoutEditor from "./components/LayoutEditor";
import Toolbar from "./components/Toolbar";
import LayerPanel from "./components/LayerPanel";
import DRCPanel from "./components/DRCPanel";

const initialLayers = {
  metal1: { visible: true, selected: false },
  metal2: { visible: true, selected: false },
  poly: { visible: true, selected: false },
  diffusion: { visible: true, selected: false },
  well: { visible: true, selected: false },
  contact: { visible: true, selected: false },
};

function App() {
  const [selectedTool, setSelectedTool] = useState("select");
  const [layers, setLayers] = useState(initialLayers);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const handleToolSelect = (tool) => {
    console.log("Tool selected:", tool);
    setSelectedTool(tool);
  };

  const handleLayerToggle = (layerId) => {
    console.log("Layer toggled:", layerId);
    setLayers((prev) => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        visible: !prev[layerId].visible,
      },
    }));
  };

  const handleLayerSelect = (layerId) => {
    console.log("Layer selected:", layerId);
    setSelectedLayer(layerId);
  };

  const handleRunDRC = () => {
    // This will be implemented later with actual DRC logic
    console.log("Running DRC...");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <Toolbar onToolSelect={handleToolSelect} selectedTool={selectedTool} />
      <Box sx={{ flex: 1, display: "flex" }}>
        <LayoutEditor
          selectedTool={selectedTool}
          selectedLayer={selectedLayer}
          layers={layers}
        />
        <LayerPanel
          layers={layers}
          onLayerToggle={handleLayerToggle}
          onLayerSelect={handleLayerSelect}
          selectedLayer={selectedLayer}
        />
        <DRCPanel onRunDRC={handleRunDRC} />
      </Box>
    </Box>
  );
}

export default App;
