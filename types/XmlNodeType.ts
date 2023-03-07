/** XML node types */
enum XmlNodeType {
  /** An element node, which has a tag and optionally attributes and child nodes */
  ELEMENT,
  /** A text node */
  TEXT,
  /** A comment node */
  COMMENT,
  /** A processing instruction node, such as <!DOCTYPE> or <?xml> */
  INSTRUCTION,
  /** An element that has been extracted with its unprocessed text content */
  LITERAL,
}

export default XmlNodeType;
