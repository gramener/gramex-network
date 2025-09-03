import { describe, it, expect, beforeEach, afterEach } from "vitest"; // Added beforeEach, afterEach
import { Browser } from "happy-dom";
import fs from "fs/promises";
import path from "path";

// Helper function to create a new browser instance (keep as is)
const newBrowser = (settings) =>
  new Browser({
    console,
    settings: {
      ...settings,
      fetch: {
        virtualServers: [{ url: "https://test/", directory: path.resolve("./") }],
      },
      enableScripts: true,
    },
  });

// Helper function to load an HTML page and the network.js script (keep as is, but ensure network is globally available)
async function loadPageAndScript(fixturePath, scriptPath) {
  const browser = newBrowser();
  const page = browser.newPage();
  await page.goto(`https://test/${fixturePath}`);
  await page.waitUntilComplete();
  const scriptContent = await fs.readFile(path.resolve(scriptPath), "utf-8");
  // Ensure network.js and its exports (like the 'network' function) are available in the page's global scope.
  // This approach might need refinement if network.js has complex internal module dependencies
  // not resolved by simple eval.
  page.mainFrame.window.eval(scriptContent + "; globalThis.network = typeof network !== 'undefined' ? network : undefined;");

  page.mainFrame.document.dispatchEvent(
    new page.mainFrame.window.Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true,
    })
  );
  return {
    page,
    window: page.mainFrame.window,
    document: page.mainFrame.document,
    body: page.mainFrame.document.body,
    browser, // Return browser to close it later
  };
}

describe("network.js basic rendering", () => {
  let page, window, document, body, browser;

  beforeEach(async () => {
    const loaded = await loadPageAndScript(
      "tests/network.test.html",
      "network.js"
    );
    page = loaded.page;
    window = loaded.window;
    document = loaded.document;
    body = loaded.body;
    browser = loaded.browser;
  });

  afterEach(async () => {
    if (page) await page.close();
    if (browser) await browser.close();
  });

  it("should load the network function", () => {
    expect(window.network).toBeTypeOf("function");
  });

  it("should render an SVG element in the container", () => {
    const container = document.getElementById("chart-container");
    expect(container).not.toBeNull();

    const nodesData = [{ id: "a" }, { id: "b" }];
    const linksData = [{ source: "a", target: "b" }];

    window.network(container, { nodes: nodesData, links: linksData, d3: window.d3 });

    const svgElement = container.querySelector("svg");
    expect(svgElement).not.toBeNull();
    expect(svgElement.tagName.toLowerCase()).toBe("svg");
  });

  it("should render node and link elements", () => {
    const container = document.getElementById("chart-container");
    const nodesData = [{ id: "node1" }, { id: "node2" }, { id: "node3" }];
    const linksData = [
      { source: "node1", target: "node2" },
      { source: "node2", target: "node3" },
    ];

    window.network(container, { nodes: nodesData, links: linksData, d3: window.d3 });

    // Check for nodes (default tag is 'circle', class is 'node')
    const nodeElements = container.querySelectorAll("svg .node");
    expect(nodeElements.length).toBe(nodesData.length);
    nodeElements.forEach(node => {
      // Basic check, could be 'circle' or other if nodeTag is used
      expect(['circle', 'rect', 'path'].includes(node.tagName.toLowerCase())).toBe(true);
    });

    // Check for links (tag is 'path', class is 'link')
    const linkElements = container.querySelectorAll("svg .link");
    expect(linkElements.length).toBe(linksData.length);
    linkElements.forEach(link => {
      expect(link.tagName.toLowerCase()).toBe("path");
    });
  });

  it("should use the specified nodeTag", () => {
    const container = document.getElementById("chart-container");
    const nodesData = [{ id: "r1" }, { id: "r2" }];
    const linksData = [{ source: "r1", target: "r2" }];

    window.network(container, {
      nodes: nodesData,
      links: linksData,
      nodeTag: "rect", // Specify rect as nodeTag
      d3: window.d3
    });

    const nodeElements = container.querySelectorAll("svg .node");
    expect(nodeElements.length).toBe(nodesData.length);
    nodeElements.forEach(node => {
      expect(node.tagName.toLowerCase()).toBe("rect");
    });
  });

  it("should bind data correctly to node elements", () => {
    const container = document.getElementById("chart-container");
    const nodesData = [
      { id: "n1", customData: "value1" },
      { id: "n2", customData: "value2" },
    ];
    const linksData = [{ source: "n1", target: "n2" }];

    window.network(container, { nodes: nodesData, links: linksData, d3: window.d3 });

    const nodeElements = container.querySelectorAll("svg .node");
    expect(nodeElements.length).toBe(nodesData.length);

    nodeElements.forEach((nodeEl, index) => {
      // Access the __data__ property attached by D3
      const boundData = nodeEl.__data__;
      expect(boundData).toBeDefined();
      expect(boundData.id).toBe(nodesData[index].id);
      expect(boundData.customData).toBe(nodesData[index].customData);
      // Verify that D3 adds initial x, y, vx, vy properties after simulation starts
      expect(boundData.x).toBeTypeOf('number');
      expect(boundData.y).toBeTypeOf('number');
      expect(boundData.vx).toBeTypeOf('number');
      expect(boundData.vy).toBeTypeOf('number');
    });
  });

  it("should bind data correctly to link elements", () => {
    const container = document.getElementById("chart-container");
    const nodesData = [{ id: "n1" }, { id: "n2" }, { id: "n3" }];
    const linksData = [
      { source: nodesData[0], target: nodesData[1], type: "A" },
      { source: nodesData[1], target: nodesData[2], type: "B" },
    ];

    window.network(container, { nodes: nodesData, links: linksData, d3: window.d3 });

    const linkElements = container.querySelectorAll("svg .link");
    expect(linkElements.length).toBe(linksData.length);

    linkElements.forEach((linkEl, index) => {
      const boundData = linkEl.__data__;
      expect(boundData).toBeDefined();
      // D3's forceLink often replaces source/target IDs with references to the node objects
      expect(boundData.source.id).toBe(linksData[index].source.id);
      expect(boundData.target.id).toBe(linksData[index].target.id);
      expect(boundData.type).toBe(linksData[index].type);
      // Check for index property added by D3's link force
      expect(boundData.index).toBeTypeOf('number');
    });
  });
});
