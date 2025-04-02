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

const LayerPanel = ({
  layers,
  onLayerToggle,
  onLayerSelect,
  selectedLayer,
}) => {
  const layerConfigs = [
    { id: "metal1", name: "Metal 1", color: "#FF0000" },
    { id: "metal2", name: "Metal 2", color: "#00FF00" },
    { id: "poly", name: "Poly", color: "#0000FF" },
    { id: "diffusion", name: "Diffusion", color: "#FFFF00" },
    { id: "well", name: "Well", color: "#FF00FF" },
    { id: "contact", name: "Contact", color: "#00FFFF" },
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
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={layers[layer.id]?.visible}
                onChange={() => onLayerToggle(layer.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </ListItemIcon>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SquareIcon sx={{ color: layer.color }} />
              <ListItemText primary={layer.name} />
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LayerPanel;
