// @ts-ignore
import Benchmark from "benchmark";
const suite = new Benchmark.Suite("XML parsing benchmarks");

import grabXml from "../src/grabXml.js";
import { XMLParser } from "fast-xml-parser";
import * as txml from "txml";
//import xml2js from "xml2js";
//import { convert } from "xmlbuilder2";

import * as fs from "fs";

const fileName = "sample.xml";
const xmlData = fs.readFileSync(fileName).toString();

const fxpParser = new XMLParser();

console.log("");

suite
  // Add tests
  .add("fast-xml-parser", function () {
    fxpParser.parse(xmlData);
  })
  .add("grab-xml", function () {
    grabXml(xmlData);
  })
  .add("txml", function () {
    txml.parse(xmlData, { noChildNodes: [] });
  })
  //.add("xmlbuilder2", function () {
  //  convert(xmlData);
  //})
  //.add("xml2js ", function () {
  //  xml2js.parseString(xmlData, function (err, result) {
  //    if (err) throw err;
  //  });
  //})

  // Add listeners
  .on("start", function () {
    console.log("Running Suite: " + this.name);
  })
  .on("error", function (e: Error) {
    console.log("Error in Suite: " + this.name, e);
  })
  .on("abort", function (e: Error) {
    console.log("Aborting Suite: " + this.name, e);
  })
  .on("complete", function () {
    const sorted = this.sort((a: Benchmark, b: Benchmark) => b.hz - a.hz);
    for (let j = 0; j < sorted.length; j++) {
      console.log(sorted[j].name + " : " + sorted[j].hz + " requests/second");
    }
  })

  // Run async
  .run({ async: true });
