export const addVector3Editor = (parent, property, min, max, step) => {
  parent.add(property, "x").min(min).max(max).step(step);
  parent.add(property, "y").min(min).max(max).step(step);
  parent.add(property, "z").min(min).max(max).step(step);
};
export const addPositionRotationGui = (
  parent,
  object,
  min = -10,
  max = 10,
  step = 0.1
) => {
  let positionGui = parent.addFolder("Position");
  addVector3Editor(positionGui, object.position, min, max, step);
  let rotationGui = parent.addFolder("Rotation");
  addVector3Editor(rotationGui, object.rotation, min, max, step);
};
