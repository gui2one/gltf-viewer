export function isTouchDevice() {
  return (
    "ontouchstart" in window || // Most browsers
    navigator.maxTouchPoints > 0 // Pointer Events API
  );
}
export function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}
