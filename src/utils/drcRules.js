// DRC Rules
const LAMBDA = 20; // 20 pixels per lambda unit

export const DRC_RULES = {
  minWidth: {
    metal1: 2 * LAMBDA, // 2λ minimum width
    metal2: 2 * LAMBDA,
    poly: 2 * LAMBDA,
    diffusion: 2 * LAMBDA,
    well: 2 * LAMBDA,
    contact: 1 * LAMBDA,
  },
  minSpacing: {
    metal1: 2 * LAMBDA, // 2λ minimum spacing
    metal2: 2 * LAMBDA,
    poly: 2 * LAMBDA,
    diffusion: 2 * LAMBDA,
    well: 2 * LAMBDA,
    contact: 1 * LAMBDA,
  },
  minEnclosure: {
    contact: {
      metal1: 1 * LAMBDA, // 1λ enclosure
      metal2: 1 * LAMBDA,
      poly: 1 * LAMBDA,
      diffusion: 1 * LAMBDA,
    },
  },
};

// Function to check for width violations
export const checkWidthViolations = (shapes) => {
  const violations = [];
  shapes.forEach((shape) => {
    const minWidth = DRC_RULES.minWidth[shape.layer];
    console.log(`Checking width for ${shape.layer}:`, {
      shapeWidth: shape.width,
      shapeHeight: shape.height,
      minWidth: minWidth,
    });
    if (shape.width < minWidth || shape.height < minWidth) {
      violations.push({
        type: "width",
        layer: shape.layer,
        message: `${shape.layer} width/height is less than ${
          minWidth / LAMBDA
        }λ`,
        shape: shape,
      });
    }
  });
  return violations;
};

// Function to check for spacing violations
export const checkSpacingViolations = (shapes) => {
  const violations = [];
  shapes.forEach((shape1, i) => {
    shapes.forEach((shape2, j) => {
      if (i === j || shape1.layer !== shape2.layer) return;

      const minSpacing = DRC_RULES.minSpacing[shape1.layer];
      const spacing = calculateSpacing(shape1, shape2);

      console.log(`Checking spacing between shapes:`, {
        layer: shape1.layer,
        spacing: spacing,
        minSpacing: minSpacing,
        shape1: {
          x: shape1.x,
          y: shape1.y,
          width: shape1.width,
          height: shape1.height,
        },
        shape2: {
          x: shape2.x,
          y: shape2.y,
          width: shape2.width,
          height: shape2.height,
        },
      });

      if (spacing < minSpacing) {
        violations.push({
          type: "spacing",
          layer: shape1.layer,
          message: `${shape1.layer} spacing is less than ${
            minSpacing / LAMBDA
          }λ`,
          shape1: shape1,
          shape2: shape2,
        });
      }
    });
  });
  return violations;
};

// Function to check for enclosure violations
export const checkEnclosureViolations = (shapes) => {
  const violations = [];
  const contacts = shapes.filter((s) => s.layer === "contact");
  const metals = shapes.filter(
    (s) => s.layer === "metal1" || s.layer === "metal2"
  );
  const polys = shapes.filter((s) => s.layer === "poly");
  const diffusions = shapes.filter((s) => s.layer === "diffusion");

  console.log("Checking enclosure violations:", {
    contacts: contacts.length,
    metals: metals.length,
    polys: polys.length,
    diffusions: diffusions.length,
  });

  contacts.forEach((contact) => {
    // Check metal1 enclosure
    const metal1Enclosure = checkEnclosure(
      contact,
      metals.filter((s) => s.layer === "metal1")
    );
    if (!metal1Enclosure) {
      violations.push({
        type: "enclosure",
        layer: "metal1",
        message: "Contact not properly enclosed by Metal1",
        shape: contact,
      });
    }

    // Check metal2 enclosure
    const metal2Enclosure = checkEnclosure(
      contact,
      metals.filter((s) => s.layer === "metal2")
    );
    if (!metal2Enclosure) {
      violations.push({
        type: "enclosure",
        layer: "metal2",
        message: "Contact not properly enclosed by Metal2",
        shape: contact,
      });
    }

    // Check poly enclosure
    const polyEnclosure = checkEnclosure(contact, polys);
    if (!polyEnclosure) {
      violations.push({
        type: "enclosure",
        layer: "poly",
        message: "Contact not properly enclosed by Poly",
        shape: contact,
      });
    }

    // Check diffusion enclosure
    const diffusionEnclosure = checkEnclosure(contact, diffusions);
    if (!diffusionEnclosure) {
      violations.push({
        type: "enclosure",
        layer: "diffusion",
        message: "Contact not properly enclosed by Diffusion",
        shape: contact,
      });
    }
  });

  return violations;
};

// Helper function to calculate spacing between two shapes
const calculateSpacing = (shape1, shape2) => {
  const x1 = shape1.x;
  const y1 = shape1.y;
  const x2 = shape2.x;
  const y2 = shape2.y;
  const w1 = shape1.width;
  const h1 = shape1.height;
  const w2 = shape2.width;
  const h2 = shape2.height;

  // Calculate horizontal spacing
  const horizontalSpacing = Math.min(
    Math.abs(x1 + w1 - x2),
    Math.abs(x2 + w2 - x1)
  );

  // Calculate vertical spacing
  const verticalSpacing = Math.min(
    Math.abs(y1 + h1 - y2),
    Math.abs(y2 + h2 - y1)
  );

  console.log("Spacing calculation:", {
    shape1: { x: x1, y: y1, width: w1, height: h1 },
    shape2: { x: x2, y: y2, width: w2, height: h2 },
    horizontalSpacing,
    verticalSpacing,
    minSpacing: Math.min(horizontalSpacing, verticalSpacing),
  });

  return Math.min(horizontalSpacing, verticalSpacing);
};

// Helper function to check if a contact is properly enclosed
const checkEnclosure = (contact, enclosingShapes) => {
  if (!enclosingShapes.length) return false;

  const minEnclosure = DRC_RULES.minEnclosure.contact[enclosingShapes[0].layer];
  if (!minEnclosure) return true;

  console.log("Checking enclosure:", {
    contact: {
      x: contact.x,
      y: contact.y,
      width: contact.width,
      height: contact.height,
    },
    minEnclosure,
    enclosingShapes: enclosingShapes.map((s) => ({
      layer: s.layer,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
    })),
  });

  return enclosingShapes.some((enclosing) => {
    return (
      contact.x >= enclosing.x - minEnclosure &&
      contact.y >= enclosing.y - minEnclosure &&
      contact.x + contact.width <=
        enclosing.x + enclosing.width + minEnclosure &&
      contact.y + contact.height <=
        enclosing.y + enclosing.height + minEnclosure
    );
  });
};
