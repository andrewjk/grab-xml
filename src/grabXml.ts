import Options from "../types/Options";
import XmlNode from "../types/XmlNode";
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
  /** Inside a CDATA node */
  INSIDE_CDATA,
  /** Inside a comment node */
  INSIDE_COMMENT,
  /** Inside a DOCTYPE node */
  INSIDE_DOCTYPE,
  /** Inside an instruction node, such as <?xml ... ?> */
  INSIDE_INSTRUCTION,
  /** Inside a literal node, such as <script> or <style> in HTML */
  INSIDE_LITERAL,
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
 * Parses XML into a root element node with the XML's elements as children.
 * @param content The XML content to parse
 * @returns A root element node with the XML's elements as children
 */
export default function grabXml(content: string, options: Options = {}) {
  const root: XmlNode = {
    type: XmlNodeType.ELEMENT,
    parent: null,
    tag: "#root",
    attributes: {},
    children: [],
    text: "",
  };

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
            const child: XmlNode = {
              type: XmlNodeType.TEXT,
              parent: state.node,
              tag: "",
              attributes: {},
              children: [],
              text: "",
            };
            state.node.children.push(child);
            updateState(state, ParseLocation.INSIDE_TEXT, i, child);
            textNeedsDecoding = false;
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
              const child: XmlNode = {
                type: XmlNodeType.COMMENT,
                parent: state.node,
                tag: "",
                attributes: {},
                children: [],
                text: "",
              };
              state.node.children.push(child);
              updateState(state, ParseLocation.INSIDE_COMMENT, i + 3, child);
              i += 2;
              break;
            } else if (
              content.charCodeAt(i + 1) === openSquareCode &&
              content.charCodeAt(i + 7) === openSquareCode &&
              content.substring(i + 2, i + 7).toLowerCase() === "cdata"
            ) {
              const child: XmlNode = {
                type: XmlNodeType.TEXT,
                parent: state.node,
                tag: "",
                attributes: {},
                children: [],
                text: "",
              };
              state.node.children.push(child);
              updateState(state, ParseLocation.INSIDE_CDATA, i + 8, child);
              i += 7;
              break;
            }
            // Fallthrough to default processing to include the exclamation mark in the tag
          }
          default: {
            const child: XmlNode = {
              type: XmlNodeType.ELEMENT,
              parent: state.node,
              tag: "",
              attributes: {},
              children: [],
              text: "",
            };
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
            maybeSelfClose(state, options);
            maybeConvertToLiteral(state, i, options);
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
            maybeSelfClose(state, options);
            maybeConvertToLiteral(state, i, options);
            break;
          }
          case questionCode: {
            // Ignore this -- it's probably at the end of the xml definition node and shouldn't cause a
            // change in the parse state
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
            maybeSelfClose(state, options);
            maybeConvertToLiteral(state, i, options);
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
            updateState(state, ParseLocation.ATTRIBUTE_VALUE, i);
            break;
          }
        }
        break;
      }
      case ParseLocation.ATTRIBUTE_VALUE: {
        // Check for quotes or spaces to end the attribute's value
        switch (content.charCodeAt(i)) {
          case singleQuoteCode:
          case doubleQuoteCode: {
            if (quote === content[i]) {
              state.node.attributes[attribute] = content.substring(state.start, i);
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            if (!quote) {
              state.node.attributes[attribute] = content.substring(state.start, i);
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
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
            setTextContent(content, i, state, textNeedsDecoding, options.trimWhitespace);
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
      case ParseLocation.INSIDE_CDATA: {
        // Check for the CDATA end chars to close the text and move on
        if (
          content.charCodeAt(i) === closeSquareCode &&
          content.charCodeAt(i + 1) === closeSquareCode &&
          content.charCodeAt(i + 2) === closeTriangleCode
        ) {
          setTextContent(content, i, state, false, options.trimWhitespace);
          updateState(state, ParseLocation.NONE, i + 3, state.node.parent);
          i += 2;
        }
        break;
      }
      case ParseLocation.INSIDE_COMMENT: {
        // Check for the comment end chars to close the comment and move on
        if (
          content.charCodeAt(i) === dashCode &&
          content.charCodeAt(i + 1) === dashCode &&
          content.charCodeAt(i + 2) === closeTriangleCode
        ) {
          closeIgnorableNode(content, i, state, options.ignoreComments);
          state.start = i + 3;
          i += 2;
        }
        break;
      }
      case ParseLocation.INSIDE_DOCTYPE: {
        // Check for the DOCTYPE end chars to close the text and move on, or the entities
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
              closeIgnorableNode(content, i, state, options.ignoreInstructions);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_INSTRUCTION: {
        // Check for the comment end chars to close the comment and move on
        if (
          content.charCodeAt(i) === questionCode &&
          content.charCodeAt(i + 1) === closeTriangleCode
        ) {
          closeIgnorableNode(content, i, state, options.ignoreInstructions);
          state.start = i + 2;
          i += 1;
        }
        break;
      }
      case ParseLocation.INSIDE_LITERAL: {
        // Check for the node end tag to close the node and move on
        if (content.charCodeAt(i) === openTriangleCode && content.charCodeAt(i + 1) === slashCode) {
          const tagLength = state.node.tag.length;
          if (content.substring(i + 2, i + 2 + tagLength) === state.node.tag) {
            state.node.text = content.substring(state.start, i);
            updateState(state, ParseLocation.NONE, i + 3 + tagLength, state.node.parent);
            i += 2 + tagLength;
          }
        }
        break;
      }
    }
  }

  // Finish off any text that was located at the end
  // I think it's safe to ignore other types of nodes as they would be unclosed and in error here
  if (state.location === ParseLocation.INSIDE_TEXT) {
    setTextContent(content, content.length, state, textNeedsDecoding, options.trimWhitespace);
  }

  return root;
}

function setTextContent(
  content: string,
  i: number,
  state: ParseState,
  textNeedsDecoding: boolean,
  trimWhitespace?: boolean
) {
  state.node.text = content.substring(state.start, i);
  if (textNeedsDecoding) {
    state.node.text = state.node.text
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&")
      .replaceAll("&apos;", "'")
      .replaceAll("&quot;", '"');
  }
  if (trimWhitespace) {
    state.node.text = state.node.text.trim();
    if (!state.node.text) {
      state.node.parent.children.pop();
    }
  }
}

function maybeSelfClose(state: ParseState, options: Options) {
  // Automatically self-close instruction nodes and void elements like <link> in HTML
  if (
    state.node.tag.startsWith("?") ||
    (options.voidElements && options.voidElements.includes(state.node.tag))
  ) {
    state.node = state.node.parent;
  }
}

function maybeConvertToLiteral(state: ParseState, i: number, options: Options) {
  // Maybe convert this element to a literal
  if (options.literalElements && options.literalElements.includes(state.node.tag)) {
    state.node.type = XmlNodeType.LITERAL;
    updateState(state, ParseLocation.INSIDE_LITERAL, i + 1);
  } else {
    updateState(state, ParseLocation.NONE, i);
  }
}

function closeIgnorableNode(content: string, i: number, state: ParseState, ignoreNode: boolean) {
  if (ignoreNode) {
    state.node.parent.children.pop();
  } else {
    state.node.text = content.substring(state.start, i);
  }
  updateState(state, ParseLocation.NONE, i, state.node.parent);
}

function updateState(state: ParseState, location: ParseLocation, breakPos: number, node?: XmlNode) {
  state.location = location;
  state.start = breakPos;
  if (node) {
    state.node = node;
  }
}
