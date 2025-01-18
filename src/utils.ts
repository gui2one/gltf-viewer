export function isTouchDevice() {
    return (
      'ontouchstart' in window || // Most browsers
      (navigator.maxTouchPoints > 0) // Pointer Events API
    );
}
