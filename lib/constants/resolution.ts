/**
 * Maximum number of characters (UTF-16 code units) allowed in a ticket resolution.
 * Drives the editor's native maxLength, the counter limit, AI-solution truncation
 * and the panel's over-limit check.
 */
export const RESOLUTION_MAX_LENGTH = 5000;

/**
 * Fraction of the limit above which the counter switches to the warning state.
 */
export const RESOLUTION_WARNING_RATIO = 0.9;
