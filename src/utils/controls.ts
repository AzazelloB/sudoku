export const canRedefineControls = () => {
  return document.activeElement?.tagName !== 'BUTTON';
};
