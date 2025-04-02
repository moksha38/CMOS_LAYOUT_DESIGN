import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Line, Group } from "react-konva";
import { Box, IconButton, Stack } from "@mui/material";
import { ZoomIn, ZoomOut } from "@mui/icons-material";

const LAMBDA = 20; // 20 pixels per lambda unit
const GRID_COLOR = "#ddd";
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

const LAYER_COLORS = {
  metal1: { fill: "rgba(255, 0, 0, 0.3)", stroke: "#ff0000" },
  metal2: { fill: "rgba(0, 255, 0, 0.3)", stroke: "#00ff00" },
  poly: { fill: "rgba(0, 0, 255, 0.3)", stroke: "#0000ff" },
  diffusion: { fill: "rgba(255, 255, 0, 0.3)", stroke: "#ffff00" },
  well: { fill: "rgba(255, 0, 255, 0.3)", stroke: "#ff00ff" },
  contact: { fill: "rgba(0, 255, 255, 0.3)", stroke: "#00ffff" },
};

const LayoutEditor = ({ selectedTool, selectedLayer, layers }) => {
  const [shapes, setShapes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState(null);
  const [gridLines, setGridLines] = useState({ vertical: [], horizontal: [] });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);

  // Create grid lines
  useEffect(() => {
    const width = window.innerWidth - 550;
    const height = window.innerHeight;

    const verticalLines = [];
    const horizontalLines = [];

    // Create vertical lines
    for (let x = 0; x < width; x += LAMBDA) {
      verticalLines.push({
        points: [x, 0, x, height],
        stroke: GRID_COLOR,
        strokeWidth: x % (LAMBDA * 5) === 0 ? 0.5 : 0.2, // Thicker lines every 5λ
      });
    }

    // Create horizontal lines
    for (let y = 0; y < height; y += LAMBDA) {
      horizontalLines.push({
        points: [0, y, width, y],
        stroke: GRID_COLOR,
        strokeWidth: y % (LAMBDA * 5) === 0 ? 0.5 : 0.2, // Thicker lines every 5λ
      });
    }

    setGridLines({ vertical: verticalLines, horizontal: horizontalLines });
  }, []);

  const snapToGrid = (value) => {
    return Math.round(value / LAMBDA) * LAMBDA;
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const oldScale = scale;
    const mousePointTo = {
      x:
        stageRef.current.getPointerPosition().x / oldScale -
        position.x / oldScale,
      y:
        stageRef.current.getPointerPosition().y / oldScale -
        position.y / oldScale,
    };

    // Calculate new scale
    let newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

    // Calculate new position
    const newPos = {
      x:
        -(mousePointTo.x - stageRef.current.getPointerPosition().x / newScale) *
        newScale,
      y:
        -(mousePointTo.y - stageRef.current.getPointerPosition().y / newScale) *
        newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  const handleZoomIn = () => {
    const oldScale = scale;
    const newScale = Math.min(oldScale * 1.2, MAX_SCALE);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const oldScale = scale;
    const newScale = Math.max(oldScale / 1.2, MIN_SCALE);
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    console.log("Mouse down event:", {
      selectedTool,
      selectedLayer,
      layers,
      isDrawing,
    });

    if (selectedTool === "rectangle" && selectedLayer) {
      console.log("Starting to draw rectangle");
      const pos = e.target.getStage().getPointerPosition();
      const scaledPos = {
        x: (pos.x - position.x) / scale,
        y: (pos.y - position.y) / scale,
      };

      setIsDrawing(true);
      setNewShape({
        x: snapToGrid(scaledPos.x),
        y: snapToGrid(scaledPos.y),
        width: 0,
        height: 0,
        layer: selectedLayer,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    console.log("Mouse move event:", {
      isDrawing,
      newShape,
      selectedTool,
      selectedLayer,
    });

    const pos = e.target.getStage().getPointerPosition();
    const scaledPos = {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale,
    };

    if (newShape) {
      const snappedX = snapToGrid(scaledPos.x);
      const snappedY = snapToGrid(scaledPos.y);
      setNewShape({
        ...newShape,
        width: snappedX - newShape.x,
        height: snappedY - newShape.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    console.log("Mouse up event:", {
      isDrawing,
      newShape,
      selectedTool,
      selectedLayer,
    });

    setIsDrawing(false);
    if (newShape) {
      // Only add shapes that have non-zero dimensions
      if (Math.abs(newShape.width) > 0 && Math.abs(newShape.height) > 0) {
        // Normalize negative dimensions
        const normalizedShape = {
          x: newShape.width < 0 ? newShape.x + newShape.width : newShape.x,
          y: newShape.height < 0 ? newShape.y + newShape.height : newShape.y,
          width: Math.abs(newShape.width),
          height: Math.abs(newShape.height),
          layer: newShape.layer,
        };
        setShapes([...shapes, normalizedShape]);
      }
      setNewShape(null);
    }
  };

  const handleShapeDragStart = (e) => {
    // Only allow dragging if the shape's layer is selected and visible
    if (
      e.target.attrs.layer === selectedLayer &&
      layers[e.target.attrs.layer]?.visible
    ) {
      e.target.draggable(true);
    } else {
      e.target.draggable(false);
    }
  };

  const handleShapeDragMove = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const scaledPos = {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale,
    };

    // Update shape position with grid snapping
    const updatedShapes = shapes.map((shape) => {
      if (shape === e.target.attrs) {
        return {
          ...shape,
          x: snapToGrid(scaledPos.x),
          y: snapToGrid(scaledPos.y),
        };
      }
      return shape;
    });
    setShapes(updatedShapes);
  };

  const handleShapeDragEnd = () => {
    // Reset draggable state
    shapes.forEach((shape) => {
      if (shape.layer === selectedLayer && layers[shape.layer]?.visible) {
        shape.draggable = true;
      }
    });
  };

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: 1,
          borderRadius: 1,
        }}
      >
        <IconButton onClick={handleZoomIn} size="small">
          <ZoomIn />
        </IconButton>
        <IconButton onClick={handleZoomOut} size="small">
          <ZoomOut />
        </IconButton>
      </Stack>
      <Stage
        width={window.innerWidth - 550}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        <Layer>
          {/* Draw grid */}
          {gridLines.vertical.map((line, i) => (
            <Line key={`v${i}`} {...line} />
          ))}
          {gridLines.horizontal.map((line, i) => (
            <Line key={`h${i}`} {...line} />
          ))}

          {/* Draw existing shapes */}
          {shapes.map(
            (shape, i) =>
              layers[shape.layer]?.visible && (
                <Rect
                  key={i}
                  {...shape}
                  {...LAYER_COLORS[shape.layer]}
                  draggable={
                    selectedTool === "select" && shape.layer === selectedLayer
                  }
                  onDragStart={handleShapeDragStart}
                  onDragMove={handleShapeDragMove}
                  onDragEnd={handleShapeDragEnd}
                />
              )
          )}

          {/* Draw shape being created */}
          {newShape && layers[newShape.layer]?.visible && (
            <Rect {...newShape} {...LAYER_COLORS[newShape.layer]} />
          )}
        </Layer>
      </Stage>
    </Box>
  );
};

export default LayoutEditor;
