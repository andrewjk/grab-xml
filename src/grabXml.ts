import {
  XmlNodeType,
  XmlNode,
  XmlElementNode,
  XmlTextNode,
  XmlCommentNode,
  XmlInstructionNode,
} from "../types/XmlNode";

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
  /** Inside a comment node */
  INSIDE_COMMENT,
  /** Inside a CDATA node */
  INSIDE_CDATA,
  /** Inside a DOCTYPE node */
  INSIDE_DOCTYPE,
  /** Inside DOCTYPE entities */
  INSIDE_DOCTYPE_ENTITIES,
  /** Inside an instruction node, such as <?xml ... ?> */
  INSIDE_INSTRUCTION_NODE,
}

interface ParseState {
  /** The type of location we are currently parsing */
  location: ParseLocation;
  /** The index where the parsing location started */
  start: number;
  /** The node we are currently parsing */
  node: XmlNode;
  /** The name of the attribute we are currently parsing, if applicable */
  attribute: string;
  /** The type of quote that started the attribute value we are currently parsing, if applicable */
  quote: string;
}

// Character codes that we will need to check
const openBracketCode = "<".charCodeAt(0);
const closeBracketCode = ">".charCodeAt(0);
const slashCode = "/".charCodeAt(0);
const equalsCode = "=".charCodeAt(0);
const singleQuoteCode = "'".charCodeAt(0);
const doubleQuoteCode = '"'.charCodeAt(0);
const spaceCode = " ".charCodeAt(0);
const tabCode = "\t".charCodeAt(0);
const carriageReturnCode = "\r".charCodeAt(0);
const newLineCode = "\n".charCodeAt(0);
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
export default function grabXml(content: string) {
  const root: XmlElementNode = {
    type: XmlNodeType.ELEMENT,
    tagName: "#root",
    attributes: {},
    parent: null,
    children: [],
  };

  const state: ParseState = {
    location: ParseLocation.NONE,
    start: 0,
    node: root,
    attribute: "",
    quote: "",
  };

  for (let i = 0; i < content.length; i++) {
    switch (state.location) {
      case ParseLocation.NONE: {
        // Check for opening brackets to start a comment or element, or chars to start a text element
        switch (content.charCodeAt(i)) {
          case openBracketCode: {
            if (content.charCodeAt(i + 1) === exclamationCode) {
              if (
                content.charCodeAt(i + 2) === dashCode &&
                content.charCodeAt(i + 3) === dashCode
              ) {
                const child: XmlCommentNode = {
                  type: XmlNodeType.COMMENT,
                  parent: state.node,
                  text: "",
                };
                (state.node as XmlElementNode).children.push(child);
                updateState(state, ParseLocation.INSIDE_COMMENT, i + 4, child);
                i += 3;
              } else if (
                content.charCodeAt(i + 2) === openSquareCode &&
                content.charCodeAt(i + 8) === openSquareCode &&
                content.substring(i + 3, i + 8).toLowerCase() === "cdata"
              ) {
                const child: XmlTextNode = {
                  type: XmlNodeType.TEXT,
                  parent: state.node,
                  text: "",
                };
                (state.node as XmlElementNode).children.push(child);
                updateState(state, ParseLocation.INSIDE_CDATA, i + 9, child);
                i += 8;
              } else {
                const child: XmlInstructionNode = {
                  type: XmlNodeType.INSTRUCTION,
                  parent: state.node,
                  // HACK: Just being lazy
                  tagName: content.substring(i + 1, content.indexOf(" ", i + 1)),
                  text: "",
                };
                (state.node as XmlElementNode).children.push(child);
                updateState(
                  state,
                  ParseLocation.INSIDE_DOCTYPE,
                  i + 1 + child.tagName.length,
                  child
                );
              }
            } else {
              updateState(state, ParseLocation.ELEMENT_OPENED, i);
            }
            break;
          }
          default: {
            const child: XmlTextNode = {
              type: XmlNodeType.TEXT,
              parent: state.node,
              text: "",
            };
            (state.node as XmlElementNode).children.push(child);
            updateState(state, ParseLocation.INSIDE_TEXT, i, child);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_OPENED: {
        // Check for a slash to indicate a closing element, or chars to start the element's name
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
          default: {
            const child: XmlElementNode = {
              type: XmlNodeType.ELEMENT,
              parent: state.node,
              tagName: "",
              attributes: {},
              children: [],
            };
            (state.node as XmlElementNode).children.push(child);
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
          case closeBracketCode: {
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_OPEN_NAME: {
        // Check for a closing bracket to move onto the next thing, or spaces to start gathering attributes
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
            (state.node as XmlElementNode).tagName = content.substring(state.start, i);
            updateState(state, ParseLocation.NONE, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            (state.node as XmlElementNode).tagName = content.substring(state.start, i);
            if ((state.node as XmlElementNode).tagName.charCodeAt(0) === questionCode) {
              state.node.type = XmlNodeType.INSTRUCTION;
              updateState(state, ParseLocation.INSIDE_INSTRUCTION_NODE, i);
            } else {
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.ELEMENT_CLOSE_NAME: {
        // Check for a closing bracket to move onto the next thing
        switch (content.charCodeAt(i)) {
          case closeBracketCode: {
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
          case closeBracketCode: {
            // TODO: Handle other types of automatically self-closing nodes, like <link> in HTML
            if ((state.node as XmlElementNode).tagName.startsWith("?")) {
              state.node = state.node.parent;
            }
            updateState(state, ParseLocation.NONE, i);
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
            state.attribute = content.substring(state.start, i);
            updateState(state, ParseLocation.BEFORE_ATTRIBUTE_VALUE, i);
            break;
          }
          case closeBracketCode: {
            (state.node as XmlElementNode).attributes[content.substring(state.start, i)] = "";
            updateState(state, ParseLocation.NONE, i);
            break;
          }
          case slashCode: {
            (state.node as XmlElementNode).attributes[content.substring(state.start, i)] = "";
            updateState(state, ParseLocation.ELEMENT_CLOSING, i);
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            state.attribute = content.substring(state.start, i);
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
            (state.node as XmlElementNode).attributes[state.attribute] = "";
            updateState(state, ParseLocation.ELEMENT_SELF_CLOSING, i);
            break;
          }
          default: {
            (state.node as XmlElementNode).attributes[state.attribute] = "";
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
            state.quote = content[i];
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
            state.quote = "";
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
            if (state.quote === content[i]) {
              (state.node as XmlElementNode).attributes[state.attribute] = content.substring(
                state.start,
                i
              );
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
          case spaceCode:
          case tabCode:
          case carriageReturnCode:
          case newLineCode: {
            if (!state.quote) {
              (state.node as XmlElementNode).attributes[state.attribute] = content.substring(
                state.start,
                i
              );
              updateState(state, ParseLocation.INSIDE_ELEMENT, i);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_TEXT: {
        // Check for an open bracket to start a comment or an element
        switch (content.charCodeAt(i)) {
          case openBracketCode: {
            (state.node as XmlTextNode).text = content.substring(state.start, i);
            if (content.charCodeAt(i + 1) === exclamationCode) {
              if (
                content.charCodeAt(i + 2) === dashCode &&
                content.charCodeAt(i + 3) === dashCode
              ) {
                const child: XmlCommentNode = {
                  type: XmlNodeType.COMMENT,
                  parent: state.node.parent,
                  text: "",
                };
                (state.node.parent as XmlElementNode).children.push(child);
                updateState(state, ParseLocation.INSIDE_COMMENT, i + 4, child);
                i += 3;
              } else if (
                content.charCodeAt(i + 2) === openSquareCode &&
                content.charCodeAt(i + 8) === openSquareCode &&
                content.substring(i + 3, i + 8).toLowerCase() === "cdata"
              ) {
                const child: XmlTextNode = {
                  type: XmlNodeType.TEXT,
                  parent: state.node.parent,
                  text: "",
                };
                (state.node.parent as XmlElementNode).children.push(child);
                updateState(state, ParseLocation.INSIDE_CDATA, i + 9, child);
                i += 8;
              } else {
                const child: XmlInstructionNode = {
                  type: XmlNodeType.INSTRUCTION,
                  parent: state.node.parent,
                  // HACK: Just being lazy
                  tagName: content.substring(i + 1, content.indexOf(" ", i + 1)),
                  text: "",
                };
                (state.node.parent as XmlElementNode).children.push(child);
                updateState(
                  state,
                  ParseLocation.INSIDE_DOCTYPE,
                  i + 1 + child.tagName.length,
                  child
                );
              }
            } else {
              updateState(state, ParseLocation.ELEMENT_OPENED, i, state.node.parent);
            }
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_COMMENT: {
        // Check for the comment end chars to close the comment and move on
        if (
          content.charCodeAt(i) === dashCode &&
          content.charCodeAt(i + 1) === dashCode &&
          content.charCodeAt(i + 2) === closeBracketCode
        ) {
          // Just trim comments, I don't think the surrounding whitespace is ever going to be interesting
          (state.node as XmlCommentNode).text = content.substring(state.start, i).trim();
          updateState(state, ParseLocation.NONE, i + 3, state.node.parent);
          i += 2;
        }
        break;
      }
      case ParseLocation.INSIDE_CDATA: {
        // Check for the CDATA end chars to close the text and move on
        if (
          content.charCodeAt(i) === closeSquareCode &&
          content.charCodeAt(i + 1) === closeSquareCode &&
          content.charCodeAt(i + 2) === closeBracketCode
        ) {
          // Just trim CDATA
          (state.node as XmlTextNode).text = content.substring(state.start, i).trim();
          updateState(state, ParseLocation.NONE, i + 3, state.node.parent);
          i += 2;
        }
        break;
      }
      case ParseLocation.INSIDE_DOCTYPE: {
        // Check for the entities start char, or DOCTYPE end chars to close the text and move on
        switch (content.charCodeAt(i)) {
          case openSquareCode: {
            state.location = ParseLocation.INSIDE_DOCTYPE_ENTITIES;
            break;
          }
          case closeBracketCode: {
            // Just trim DOCTYPE
            (state.node as XmlInstructionNode).text = content.substring(state.start, i).trim();
            updateState(state, ParseLocation.NONE, i, state.node.parent);
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_DOCTYPE_ENTITIES: {
        // Check for the entities end char to move on
        switch (content.charCodeAt(i)) {
          case closeSquareCode: {
            state.location = ParseLocation.INSIDE_DOCTYPE;
            break;
          }
        }
        break;
      }
      case ParseLocation.INSIDE_INSTRUCTION_NODE: {
        // Check for the comment end chars to close the comment and move on
        if (
          content.charCodeAt(i) === questionCode &&
          content.charCodeAt(i + 1) === closeBracketCode
        ) {
          // Just trim instructions
          (state.node as XmlInstructionNode).text = content.substring(state.start, i).trim();
          updateState(state, ParseLocation.NONE, i + 2, state.node.parent);
          i += 1;
        }
        break;
      }
    }
  }

  return root;
}

function updateState(state: ParseState, location: ParseLocation, breakPos: number, node?: XmlNode) {
  state.location = location;
  state.start = breakPos;
  if (node) {
    state.node = node;
  }
}
