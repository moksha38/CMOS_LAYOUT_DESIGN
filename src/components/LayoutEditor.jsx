import React, { useRef, useState, useEffect, forwardRef } from "react";
import { Stage, Layer, Rect, Line, Group, Text } from "react-konva";
import { Box, IconButton, Stack } from "@mui/material";
import { ZoomIn, ZoomOut } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import {
  checkWidthViolations,
  checkSpacingViolations,
  checkEnclosureViolations,
  DRC_RULES,
} from "../utils/drcRules";

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

const LayoutEditor = forwardRef(
  ({ selectedTool, selectedLayer, layers, onDRCCheck }, ref) => {
    const [shapes, setShapes] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newShape, setNewShape] = useState(null);
    const [gridLines, setGridLines] = useState({
      vertical: [],
      horizontal: [],
    });
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [violations, setViolations] = useState([]);
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

    // Expose runDRC to parent component
    useEffect(() => {
      console.log("LayoutEditor useEffect - setting up runDRC");
      console.log("ref:", ref);
      console.log("shapes:", shapes);
      console.log("Current DRC rules:", DRC_RULES);

      if (ref) {
        const runDRCFunction = () => {
          console.log("Running DRC check on shapes:", shapes);
          console.log(
            "Shape details:",
            shapes.map((shape) => ({
              layer: shape.layer,
              width: shape.width,
              height: shape.height,
              x: shape.x,
              y: shape.y,
              minWidth: DRC_RULES.minWidth[shape.layer],
              minSpacing: DRC_RULES.minSpacing[shape.layer],
            }))
          );

          const widthViolations = checkWidthViolations(shapes);
          console.log("Width violations:", widthViolations);

          const spacingViolations = checkSpacingViolations(shapes);
          console.log("Spacing violations:", spacingViolations);

          const enclosureViolations = checkEnclosureViolations(shapes);
          console.log("Enclosure violations:", enclosureViolations);

          const allViolations = [
            ...widthViolations,
            ...spacingViolations,
            ...enclosureViolations,
          ];
          console.log("All violations:", allViolations);

          setViolations(allViolations);
          onDRCCheck(allViolations);
        };

        console.log("Setting up runDRC function in LayoutEditor");
        ref.current = {
          runDRC: runDRCFunction,
        };
        console.log("runDRC function set up:", ref.current.runDRC);
      }
    }, [shapes, onDRCCheck, ref]);

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
          -(
            mousePointTo.x -
            stageRef.current.getPointerPosition().x / newScale
          ) * newScale,
        y:
          -(
            mousePointTo.y -
            stageRef.current.getPointerPosition().y / newScale
          ) * newScale,
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
            id: uuidv4(),
            x: newShape.width < 0 ? newShape.x + newShape.width : newShape.x,
            y: newShape.height < 0 ? newShape.y + newShape.height : newShape.y,
            width: Math.abs(newShape.width),
            height: Math.abs(newShape.height),
            layer: newShape.layer,
          };
          console.log("Adding new shape:", normalizedShape);
          setShapes([...shapes, normalizedShape]);
        }
        setNewShape(null);
      }
    };

    const handleShapeDragStart = (e) => {
      const shapeId = e.target.attrs.id;
      console.log("Drag start for shape with ID:", shapeId);
      const shape = e.target;
      console.log("Drag start:", {
        shapeLayer: shape.attrs.layer,
        selectedLayer,
        isVisible: layers[shape.attrs.layer]?.visible,
        selectedTool,
      });
    };

    const handleShapeDragMove = (e) => {
      const shapeId = e.target.attrs.id; // Get the ID of the shape being dragged
      const pos = e.target.getStage().getPointerPosition();
      const scaledPos = {
        x: (pos.x - position.x) / scale,
        y: (pos.y - position.y) / scale,
      };

      // Update the position of the dragged shape
      setShapes((prevShapes) =>
        prevShapes.map((shape) => {
          if (shape.id === shapeId) {
            const newShape = {
              ...shape,
              x: snapToGrid(scaledPos.x),
              y: snapToGrid(scaledPos.y),
            };
            console.log("Updating shape position:", newShape);
            return newShape;
          }
          return shape;
        })
      );
    };
    const handleShapeDragEnd = (e) => {
      const shape = e.target;
      console.log("Drag end:", {
        shapeLayer: shape.attrs.layer,
        selectedLayer,
        isVisible: layers[shape.attrs.layer]?.visible,
      });
    };

    // Get shapes that have violations
    const getViolatingShapes = () => {
      const violatingShapes = new Set();
      violations.forEach((violation) => {
        if (violation.shape) violatingShapes.add(violation.shape);
        if (violation.shape1) violatingShapes.add(violation.shape1);
        if (violation.shape2) violatingShapes.add(violation.shape2);
      });
      return Array.from(violatingShapes);
    };

    const violatingShapes = getViolatingShapes();

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
          draggable={false}
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
            {shapes.map((shape) =>
              layers[shape.layer]?.visible ? (
                <Group key={shape.id}>
                  <Rect
                    id={shape.id}
                    {...shape}
                    {...LAYER_COLORS[shape.layer]}
                    draggable={true}
                    onDragStart={handleShapeDragStart}
                    onDragMove={handleShapeDragMove}
                    onDragEnd={handleShapeDragEnd}
                    stroke={
                      violatingShapes.includes(shape)
                        ? "#ff0000"
                        : LAYER_COLORS[shape.layer].stroke
                    }
                    strokeWidth={violatingShapes.includes(shape) ? 2 : 1}
                  />
                  <Text
                    x={shape.x + shape.width / 2 - 30}
                    y={shape.y + shape.height / 2}
                    text={`${Math.round(shape.width / LAMBDA)}λ x ${Math.round(
                      shape.height / LAMBDA
                    )}λ`}
                    fontSize={12}
                    fill="#000"
                    align="center"
                  />
                </Group>
              ) : null
            )}

            {/* Draw shape being created */}
            {newShape && layers[newShape.layer]?.visible && (
              <Group>
                <Rect {...newShape} {...LAYER_COLORS[newShape.layer]} />
                <Text
                  x={newShape.x + newShape.width / 2 - 30}
                  y={newShape.y + newShape.height / 2}
                  text={`${Math.round(
                    Math.abs(newShape.width) / LAMBDA
                  )}λ x ${Math.round(Math.abs(newShape.height) / LAMBDA)}λ`}
                  fontSize={12}
                  fill="#000"
                  align="center"
                />
              </Group>
            )}
          </Layer>
        </Stage>
      </Box>
    );
  }
);

export default LayoutEditor;
