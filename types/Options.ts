export default interface Options {
  /** Whether to  trim whitespace from text elements and omit text elements that contain only whitespace  */
  trimWhitespace?: boolean;
  /** Whether to omit comment nodes */
  ignoreComments?: boolean;
  /** Whether to omit processing instruction nodes */
  ignoreInstructions?: boolean;
  /** The tags of elements that do not have any children, such as <input> and <br> in HTML documents */
  voidElements?: string[];
  /** The tags of elements that should be extracted with their unprocessed text content, such as <script> and <style> in HTML documents */
  literalElements?: string[];
}
