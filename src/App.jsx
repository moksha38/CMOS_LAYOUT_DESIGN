import React, { useState, useRef, useEffect } from "react";
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
  const [drcViolations, setDrcViolations] = useState([]);
  const layoutEditorRef = useRef(null);

  useEffect(() => {
    console.log("App component mounted");
    console.log("layoutEditorRef:", layoutEditorRef.current);
  }, []);

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
    // First, deselect all layers
    setLayers((prev) => {
      const updatedLayers = {};
      Object.keys(prev).forEach((key) => {
        updatedLayers[key] = {
          ...prev[key],
          selected: key === layerId,
        };
      });
      return updatedLayers;
    });
    // Then set the selected layer
    setSelectedLayer(layerId);
  };

  const handleDRCCheck = (violations) => {
    console.log("DRC violations received in App:", violations);
    setDrcViolations(violations);
  };

  const handleRunDRC = () => {
    console.log("handleRunDRC called in App");
    console.log("layoutEditorRef.current:", layoutEditorRef.current);
    if (layoutEditorRef.current?.runDRC) {
      console.log("Calling runDRC on layout editor");
      layoutEditorRef.current.runDRC();
    } else {
      console.error("runDRC not available on layout editor");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <Toolbar onToolSelect={handleToolSelect} selectedTool={selectedTool} />
      <Box sx={{ flex: 1, display: "flex" }}>
        <LayoutEditor
          ref={layoutEditorRef}
          selectedTool={selectedTool}
          selectedLayer={selectedLayer}
          layers={layers}
          onDRCCheck={handleDRCCheck}
        />
        <LayerPanel
          layers={layers}
          onLayerToggle={handleLayerToggle}
          onLayerSelect={handleLayerSelect}
          selectedLayer={selectedLayer}
        />
        <DRCPanel violations={drcViolations} onRunDRC={handleRunDRC} />
      </Box>
    </Box>
  );
}

export default App;
