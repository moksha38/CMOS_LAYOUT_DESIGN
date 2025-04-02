import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Divider,
} from "@mui/material";
import { Layers as LayerIcon, Square as SquareIcon } from "@mui/icons-material";

const LAYER_COLORS = {
  metal1: { fill: "rgba(255, 0, 0, 0.3)", stroke: "#ff0000" },
  metal2: { fill: "rgba(0, 255, 0, 0.3)", stroke: "#00ff00" },
  poly: { fill: "rgba(0, 0, 255, 0.3)", stroke: "#0000ff" },
  diffusion: { fill: "rgba(255, 255, 0, 0.3)", stroke: "#ffff00" },
  well: { fill: "rgba(255, 0, 255, 0.3)", stroke: "#ff00ff" },
  contact: { fill: "rgba(0, 255, 255, 0.3)", stroke: "#00ffff" },
};

const LayerPanel = ({
  layers,
  onLayerToggle,
  onLayerSelect,
  selectedLayer,
}) => {
  const layerConfigs = [
    { id: "metal1", name: "Metal 1", color: LAYER_COLORS.metal1.stroke },
    { id: "metal2", name: "Metal 2", color: LAYER_COLORS.metal2.stroke },
    { id: "poly", name: "Poly", color: LAYER_COLORS.poly.stroke },
    {
      id: "diffusion",
      name: "Diffusion",
      color: LAYER_COLORS.diffusion.stroke,
    },
    { id: "well", name: "Well", color: LAYER_COLORS.well.stroke },
    { id: "contact", name: "Contact", color: LAYER_COLORS.contact.stroke },
  ];

  return (
    <Box sx={{ width: "250px", borderLeft: "1px solid #ccc", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Layers
      </Typography>
      <List>
        {layerConfigs.map((layer) => (
          <ListItem
            key={layer.id}
            button
            selected={selectedLayer === layer.id}
            onClick={() => onLayerSelect(layer.id)}
            sx={{
              backgroundColor:
                selectedLayer === layer.id
                  ? "rgba(25, 118, 210, 0.08)"
                  : "transparent",
            }}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={layers[layer.id]?.visible}
                onChange={() => onLayerToggle(layer.id)}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  color: layer.color,
                  "&.Mui-checked": {
                    color: layer.color,
                  },
                }}
              />
            </ListItemIcon>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SquareIcon sx={{ color: layer.color }} />
              <ListItemText
                primary={layer.name}
                sx={{
                  color: layers[layer.id]?.visible
                    ? "text.primary"
                    : "text.disabled",
                }}
              />
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LayerPanel;
