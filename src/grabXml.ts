import Options from "../types/Options";
import XmlNode from "./XmlNode";
import XmlNodeType from "../types/XmlNodeType";

enum ParseLocation {
  /** Nothing interesting has been encountered yet */
  NONE,
  /** An element has been opened with an angled bracket */
  ELEMENT_OPENED,
  /** An element will close as we have encountered the start of a close tag */
  ELEMENT_CLOSING,
  /** An element will close itself, without any children */
  ELEMENT_SELF_CLOSING,
  /** Inside an element's opening tag name */
  ELEMENT_OPEN_NAME,
  /** Inside an element's closing tag name */
  ELEMENT_CLOSE_NAME,
  /** Inside an element node, between the attributes */
  INSIDE_ELEMENT,
  /** Inside an attribute's name */
  ATTRIBUTE_NAME,
  /** After an attribute's name, but before the equals sign (if applicable) */
  AFTER_ATTRIBUTE_NAME,
  /** After an attribute's equals sign, but before its value */
  BEFORE_ATTRIBUTE_VALUE,
  /** Inside an attribute's value */
  ATTRIBUTE_VALUE,
  /** Inside a text node */
  INSIDE_TEXT,
  /** Inside a DOCTYPE node */
  INSIDE_DOCTYPE,
  /** Inside an instruction node, such as <?xml ... ?> */
  INSIDE_INSTRUCTION,
}

interface ParseState {
  /** The type of location we are currently parsing */
  location: ParseLocation;
  /** The index where the parsing location started */
  start: number;
  /** The node we are currently parsing */
  node: XmlNode;
}

// Character codes that we will need to check
const openTriangleCode = "<".charCodeAt(0);
const closeTriangleCode = ">".charCodeAt(0);
const slashCode = "/".charCodeAt(0);
const equalsCode = "=".charCodeAt(0);
const singleQuoteCode = "'".charCodeAt(0);
const doubleQuoteCode = '"'.charCodeAt(0);
const spaceCode = " ".charCodeAt(0);
const tabCode = "\t".charCodeAt(0);
const carriageReturnCode = "\r".charCodeAt(0);
const newLineCode = "\n".charCodeAt(0);
const ampersandCode = "&".charCodeAt(0);
const questionCode = "?".charCodeAt(0);
const exclamationCode = "!".charCodeAt(0);
const dashCode = "-".charCodeAt(0);
const openSquareCode = "[".charCodeAt(0);
const closeSquareCode = "]".charCodeAt(0);

/**
 * Parses XML into a root node with all of the XML's nodes as children.
 * @param content The XML content to parse.
 * @returns A root node with all of the XML's nodes as children.
 */
export default function grabXml(content: string, options: Options = {}): XmlNode {
  const root = new XmlNode(XmlNodeType.ELEMENT, null);

  const state: ParseState = {
    location: ParseLocation.NONE,
    start: 0,
    node: root,
  };

  let attribute = "";
  let quote = "";
  let textNeedsDecoding = false;
  let inDocTypeEntities = false;

  for (let i = 0; i < content.length; i++) {
    switch (state.location) {
      case ParseLocation.NONE: {
        // Check for opening brackets to start a comment or element, or chars to start a text element
        switch (content.charCodeAt(i)) {
          case openTriangleCode: {
            updateState(state, ParseLocation.ELEMENT_OPENED, i);
            break;
          }
          default: {
            const child = new XmlNode(XmlNodeType.TEXT, state.node);
            state.node.children.push(child);
            textNeedsDecoding = false;
            updateState(state, ParseLocation.INSIDE_TEXT, i, child);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_OPENED: {
        // Check for a slash to indicate a closing element, an exclamation mark to indicate a
        // comment or doctype, or chars to start the element's name
        switch (content.charCodeAt(i)) {
          case slashCode: {
            updateState(state, ParseLocation.ELEMENT_CLOSING, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            // Ignore spaces
            break;
          }
          case exclamationCode: {
            if (content.charCodeAt(i + 1) === dashCode && content.charCodeAt(i + 2) === dashCode) {
              // It's a comment
              const endIndex = content.indexOf("-->", i);
              if (!options.ignoreComments) {
                if (endIndex !== -1) {
                  const child = new XmlNode(XmlNodeType.COMMENT, state.node);
                  state.node.children.push(child);
                  updateState(state, ParseLocation.NONE, i + 3, child);
                  i = endIndex;
                  setContentText(content, i, state, false, options.trimWhitespace);
                  updateState(state, ParseLocation.NONE, i, state.node.parent);
                  i += 2;
                } else {
                  // TODO: ??
                }
              } else {
                i = endIndex + 2;
                updateState(state, ParseLocation.NONE, i);
              }
              break;
            } else if (
              content.charCodeAt(i + 1) === openSquareCode &&
              content.charCodeAt(i + 7) === openSquareCode &&
              content.substring(i + 2, i + 7).toLowerCase() === "cdata"
            ) {
              // It's CDATA
              const endIndex = content.indexOf("]]>", i);
              if (endIndex !== -1) {
                const child = new XmlNode(XmlNodeType.TEXT, state.node);
                state.node.children.push(child);
                updateState(state, ParseLocation.NONE, i + 8, child);
                i = endIndex;
                setContentText(content, i, state, false, options.trimWhitespace);
                updateState(state, ParseLocation.NONE, i, state.node.parent);
                i += 2;
              } else {
                // TODO: ??
              }
              break;
            } else {
              // It's probably DOCTYPE
              // Fallthrough to default processing to include the exclamation mark in the tag:
              // break;
            }
          }
          default: {
            const child = new XmlNode(XmlNodeType.ELEMENT, state.node);
            state.node.children.push(child);
            updateState(state, ParseLocation.ELEMENT_OPEN_NAME, i, child);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_CLOSING: {
        // Check for chars to start the element's closing name
        switch (content.charCodeAt(i)) {
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            // Ignore spaces
            break;
          }
          default: {
            updateState(state, ParseLocation.ELEMENT_CLOSE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_SELF_CLOSING: {
        // Check for a closing bracket to move onto the next thing
        switch (content.charCodeAt(i)) {
          case closeTriangleCode: {
            state.node.selfClosing = true;
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_OPEN_NAME: {
        // Check for a closing bracket to move onto the next thing, or spaces to start gathering attributes
        switch (content.charCodeAt(i)) {
          case closeTriangleCode: {
            state.node.tag = content.substring(state.start, i);
            i = startElementNode(content, i, state, options);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            state.node.tag = content.substring(state.start, i);
            switch (state.node.tag.charCodeAt(0)) {
              case exclamationCode: {
                state.node.type = XmlNodeType.INSTRUCTION;
                updateState(state, ParseLocation.INSIDE_DOCTYPE, i);
                break;
              }
              case questionCode: {
                state.node.type = XmlNodeType.INSTRUCTION;
                updateState(state, ParseLocation.INSIDE_INSTRUCTION, i);
                break;
              }
              default: {
                updateState(state, ParseLocation.INSIDE_ELEMENT, i);
                break;
              }
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_CLOSE_NAME: {
        // Check for a closing bracket to move onto the next thing
        switch (content.charCodeAt(i)) {
          case closeTriangleCode: {
            // TODO: Check that the tagname matches
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            /*
            // Pop the matching element off the stack
            // If no matching element was found... just ignore it?
            const tag = content.substring(state.start, i);
            let openingNode = state.node;
            while (openingNode && openingNode.tag !== tag) {
              openingNode = openingNode.parent;
            }
            updateState(state, ParseLocation.NONE, i, openingNode ? openingNode.parent : undefined);
            */
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_ELEMENT: {
        // Check for a slash or a close bracket to start closing the element, or chars to start an attribute's name
        switch (content.charCodeAt(i)) {
          case slashCode: {
            updateState(state, ParseLocation.ELEMENT_SELF_CLOSING, i);
            break;
          }
          case closeTriangleCode: {
            i = startElementNode(content, i, state, options);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            // Ignore spaces
            break;
          }
          default: {
            updateState(state, ParseLocation.ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ATTRIBUTE_NAME: {
        // Check for an equals to start the attribute's value, a close bracket to close the element,
        // or spaces to ignore if it turns out the attribute has no value after a bit more processing
        switch (content.charCodeAt(i)) {
          case equalsCode: {
            attribute = content.substring(state.start, i);
            updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
            break;
          }
          case closeTriangleCode: {
            state.node.attributes[content.substring(state.start, i)] = "";
            i = startElementNode(content, i, state, options);
            break;
          }
          case slashCode: {
            state.node.attributes[content.substring(state.start, i)] = "";
            updateState(state, ParseLocation.ELEMENT_CLOSING, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            attribute = content.substring(state.start, i);
            updateState(state, ParseLocation.AFTER_ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.AFTER_ATTRIBUTE_NAME: {
        // Check for an equals to start the attribute's value, a slash to close the element,
        // or chars to start a new attribute
        switch (content.charCodeAt(i)) {
          case equalsCode: {
            updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
            break;
          }
          case slashCode: {
            state.node.attributes[attribute] = "";
            updateState(state, ParseLocation.ELEMENT_SELF_CLOSING, i);
            break;
          }
          default: {
            state.node.attributes[attribute] = "";
            updateState(state, ParseLocation.ATTRIBUTE_NAME, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.BEFORE_ATTRIBUTE_VALUE: {
        // Check for quotes or chars to start the attribute's value
        switch (content.charCodeAt(i)) {
          case singleQuoteCode:
          case doubleQuoteCode: {
            quote = content[i];
            textNeedsDecoding = false;
            updateState(state, ParseLocation.ATTRIBUTE_VALUE, i + 1);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            // Ignore spaces
            break;
          }
          default: {
            quote = "";
            textNeedsDecoding = false;
            updateState(state, ParseLocation.ATTRIBUTE_VALUE, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ATTRIBUTE_VALUE: {
        // Check for quotes or spaces to end the attribute's value, or an ampersand to indicate
        // that the text may need to be decoded
        switch (content.charCodeAt(i)) {
          case singleQuoteCode:
          case doubleQuoteCode: {
            if (quote === content[i]) {
              state.node.attributes[attribute] = getAttributeText(
                content,
                i,
                state,
                textNeedsDecoding
              );
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            if (!quote) {
              state.node.attributes[attribute] = getAttributeText(
                content,
                i,
                state,
                textNeedsDecoding
              );
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
          case ampersandCode: {
            textNeedsDecoding = true;
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_TEXT: {
        // Check for an open bracket to start a comment or an element, or an ampersand to indicate
        // that the text may need to be decoded
        switch (content.charCodeAt(i)) {
          case openTriangleCode: {
            setContentText(content, i, state, textNeedsDecoding, options.trimWhitespace);
            updateState(state, ParseLocation.ELEMENT_OPENED, i, state.node.parent);
            break;
          }
          case ampersandCode: {
            textNeedsDecoding = true;
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_DOCTYPE: {
        // Check for the DOCTYPE end char to close the text and move on, or the entities
        // chars ([ and ]) to prevent closing
        switch (content.charCodeAt(i)) {
          case openSquareCode: {
            inDocTypeEntities = true;
            break;
          }
          case closeSquareCode: {
            inDocTypeEntities = false;
            break;
          }
          case closeTriangleCode: {
            if (!inDocTypeEntities) {
              finishIgnorableNode(content, i, state, options.ignoreInstructions);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_INSTRUCTION: {
        // Check for the instruction end chars to close the instruction and move on
        if (
          content.charCodeAt(i) === questionCode &&
          content.charCodeAt(i + 1) === closeTriangleCode
        ) {
          finishIgnorableNode(content, i, state, options.ignoreInstructions);
          state.start = i + 2;
          i += 1;
        }
        break;
      }
    }
  }

  // Finish off any text that was located at the end
  // I think it's safe to ignore other types of nodes as they would be unclosed and in error here
  if (state.location === ParseLocation.INSIDE_TEXT) {
    setContentText(content, content.length, state, textNeedsDecoding, options.trimWhitespace);
  }

  return root;
}

function getAttributeText(
  content: string,
  i: number,
  state: ParseState,
  textNeedsDecoding: boolean
) {
  let text = content.substring(state.start, i);

  // Maybe decode the text
  if (textNeedsDecoding) {
    text = decodeEntities(text);
  }

  return text;
}

function setContentText(
  content: string,
  i: number,
  state: ParseState,
  textNeedsDecoding: boolean,
  trimWhitespace?: boolean
) {
  // Get the content text from the start to the current position
  state.node.text = content.substring(state.start, i);

  // Maybe decode the text
  if (textNeedsDecoding) {
    state.node.text = decodeEntities(state.node.text);
  }

  // Maybe trim whitespace from around the text
  if (trimWhitespace) {
    state.node.text = state.node.text.trim();
    // If there's no longer any text, remove this node from its parent
    if (!state.node.text) {
      state.node.parent.children.pop();
    }
  }
}

function decodeEntities(text: string) {
  return (
    text
      // Predefined entities that all XML parsers must handle
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&")
      .replaceAll("&apos;", "'")
      .replaceAll("&quot;", '"')
      // Unicode character references in the form of &#nnnn; or &#xhhhh;
      // Adapted from https://stackoverflow.com/a/29824550
      .replace(/&#(\d+|x[a-f0-9]+);/gi, (_, code) => {
        if (code.startsWith("x")) {
          code = parseInt(code.substring(1), 16);
        }
        return String.fromCharCode(code);
      })
  );
}

function startElementNode(content: string, i: number, state: ParseState, options: Options) {
  // Automatically self-close instruction nodes and void elements, like <link> in HTML
  if (
    state.node.tag.startsWith("?") ||
    (options.voidElements && options.voidElements.includes(state.node.tag))
  ) {
    state.node = state.node.parent;
  }

  // Maybe convert this element to a literal, like <script> in HTML
  if (options.literalElements && options.literalElements.includes(state.node.tag)) {
    const endIndex = content.indexOf("</" + state.node.tag + ">", i);
    if (endIndex !== -1) {
      state.node.type = XmlNodeType.LITERAL;
      state.node.text = content.substring(i + 1, endIndex);
      const tagLength = state.node.tag.length;
      updateState(state, ParseLocation.NONE, endIndex + 3 + tagLength, state.node.parent);
      i = endIndex + 2 + tagLength;
    } else {
      // TODO: ??
    }
  }

  updateState(state, ParseLocation.NONE, i);

  // HACK: If we converted the element to a literal, we need to return the jumped-ahead index
  return i;
}

function finishIgnorableNode(content: string, i: number, state: ParseState, ignoreNode: boolean) {
  // If the node is one that should be ignored, remove it from its parent's children
  // Otherwise, set its text
  if (ignoreNode) {
    state.node.parent.children.pop();
  } else {
    state.node.text = content.substring(state.start, i);
  }

  updateState(state, ParseLocation.NONE, i, state.node.parent);
}

function updateState(state: ParseState, location: ParseLocation, startPos: number, node?: XmlNode) {
  state.location = location;
  state.start = startPos;
  if (node) {
    state.node = node;
  }
}
