import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Creates a D3.js layer on a given element with specified attributes.
 *
 * @param {d3.Selection} el - The parent D3 selection.
 * @param {string} tag - The HTML/SVG tag to create.
 * @param {string} cls - The class to apply to new elements.
 * @param {Function} [data=(d) => [d]] - The data-binding function.
 * @returns {d3.Selection} The D3.js selection.
 */
export const layer = (el, tag, cls, data = (d) => [d]) =>
  el.selectAll(`${tag}.${cls}`).data(data).join(tag).attr("class", cls);

/**
 * Retrieves the closest SVG element, along with its width and height
 *
 * @param {string|HTMLElement} el - The selector or HTML element.
 * @param {number} [width] - The width of the SVG. Optional, fallback to the closest SVG parent.
 * @param {number} [height] - The height of the SVG. Optional, fallback to the closest SVG parent.
 * @returns {Object} Object containing the SVG element and dimensions.
 */
export function getSVG(el, width, height) {
  el = typeof el == "string" ? document.querySelector(el) : el;
  // If width and height are not specified, get them from the closest SVG parent.
  const container = el.closest("svg");
  width = width ?? (container?.viewBox?.animVal?.width || container?.width?.animVal?.value || 0);
  height =
    height ?? (container?.viewBox?.animVal?.height || container?.height?.animVal?.value || 0);
  return { el, container, width, height };
}

const defaultForces = {
  link: ({ nodes, links }) => {
    const force = d3.forceLink(links);
    return nodes?.[0]?.id ? force.id((d) => d.id) : force;
  },
  charge: () => d3.forceManyBody(),
  x: ({ width }) => d3.forceX(width / 2),
  y: ({ height }) => d3.forceY(height / 2),
};

/**
 * Creates a network visualization.
 *
 * @async
 * @param {string|HTMLElement} el - The selector or HTML element for the SVG.
 * @param {Object} params - Parameters for the visualization.
 * @param {Array} params.nodes - list of node objects.
 * @param {Array} params.links - list of {source, target} link objects.
 * @param {number} [params.width] - width of the SVG.
 * @param {number} [params.height] - height of the SVG.
 * @param {number} [params.linkCurvature=0] - curvature of the links. 0 = straight, 1 = half-circle.
 * @param {Object} [params.forces] - forces to apply to the simulation.
 * @param {Function} [params.brush] - callback function to handle brush events.
 * @returns {Object} Object containing D3.js selections for nodes and links.
 */
export async function network(
  el,
  { nodes, links, width, height, linkCurvature = 0, forces, brush },
) {
  let container;
  ({ el, container, width, height } = getSVG(el, width, height));
  const svg = d3.select(el);

  const arc = Math.sqrt(2 * (1 - Math.cos(Math.PI * linkCurvature)));

  if (brush) {
    layer(svg, "g", "brush").call(
      d3
        .brush()
        .extent([
          [0, 0],
          [width, height],
        ])
        .filter((event) => !event.target.matches(".node.dragging"))
        .on("end", function (event) {
          if (event.selection) {
            const [[x0, y0], [x1, y1]] = event.selection;
            brush(
              nodes.filter((node) => node.x >= x0 && node.x <= x1 && node.y >= y0 && node.y <= y1),
            );
          } else {
            brush([]);
          }
        }),
    );
  }

  const simulation = d3.forceSimulation(nodes);
  for (let [name, force] of Object.entries(Object.assign({}, defaultForces, forces)))
    if (force) simulation.force(name, force({ nodes, links, width, height }));

  const linkGroup = layer(svg, "g", "links");
  const linksLayer = layer(linkGroup, "path", "link", links).attr("fill", "none");
  const nodeGroup = layer(svg, "g", "nodes");
  const nodesLayer = layer(nodeGroup, "circle", "node", nodes)
    .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
    .on("dblclick", releaseNode);

  d3.select(container).on("dblclick", releaseAllNodes); // Added double-click listener to the SVG background

  simulation.on("tick", () => {
    linksLayer.attr("d", (d) => {
      // linkCurvature == 1 => 180° curve. 0.5 => 90° curve. 0 => straight line.
      const r = arc == 0 ? 0 : Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y) / arc;
      return `M${d.source.x},${d.source.y}A${r},${r} 0 0,1 ${d.target.x},${d.target.y}`;
    });
    nodesLayer.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    d3.select(this).classed("dragging", true);
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    d3.select(this).classed("dragging", false).classed("pinned", true);
  }

  function releaseNode(d) {
    d.fx = null;
    d.fy = null;
    d3.select(this).classed("pinned", false);
  }

  function releaseAllNodes() {
    for (let node of nodes) {
      node.fx = null;
      node.fy = null;
    }
    nodesLayer.classed("pinned", false);
    simulation.alphaTarget(0.3).restart(); // Restart the simulation to reflect the changes
  }

  return { nodes: nodesLayer, links: linksLayer, nodeGroup, linkGroup };
}
