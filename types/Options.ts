export default interface Options {
  /** Whether to  trim whitespace from text elements and omit text elements that contain only whitespace  */
  trimWhitespace?: boolean;
  /** Whether to omit comment nodes */
  ignoreComments?: boolean;
  /** Whether to omit processing instruction nodes */
  ignoreInstructions?: boolean;
}
