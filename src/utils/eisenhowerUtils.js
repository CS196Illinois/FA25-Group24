/**
 * Calculates which Eisenhower quadrant a task belongs to
 * based on its importance and difficulty (urgency).
 * 
 * @param {number} difficulty - Urgency level (1-5)
 * @param {number} importance - Importance level (1-5)
 * @returns {number} Quadrant number (1-4)
 */
export const calculateQuadrant = (difficulty, importance) => {
  // Normalize values to 0-1 range
  const U = difficulty / 5;       // Urgency proxy
  const I_norm = importance / 5;  // Importance normalized

  // Threshold for high/low (0.6 means 3+ on 1-5 scale)
  const threshold = 0.6;

  // Classify into quadrants
  if (I_norm >= threshold && U >= threshold) {
    return 1;  // Do First (Important + Urgent)
  } else if (I_norm >= threshold && U < threshold) {
    return 2;  // Schedule (Important + Not Urgent)
  } else if (I_norm < threshold && U >= threshold) {
    return 3;  // Delegate (Not Important + Urgent)
  } else {
    return 4;  // Eliminate (Not Important + Not Urgent)
  }
};

/**
 * Maps quadrant numbers to their display names
 * @param {number} quadrant - Quadrant number (1-4)
 * @returns {string} Quadrant name
 */
export const getQuadrantName = (quadrant) => {
  const names = {
    1: "Do Now",
    2: "Schedule",
    3: "Keep in Mind",
    4: "Eliminate"
  };
  return names[quadrant] || "Unknown";
};