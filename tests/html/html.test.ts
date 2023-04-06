import { test } from "uvu";
import htmlDocument from "./html-document";

addTest(htmlDocument);

function addTest(x: any) {
  test(x.name, x.test);
}

test.run();
