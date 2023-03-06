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
}

export default XmlNodeType;
