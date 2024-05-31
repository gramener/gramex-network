import { layer, getSVG } from "@gramex/chartbase";

/* Store default forces for each D3 instance. */
const defaultForces = new Map();
/* Store simulations for each SVG. */
const simulationMap = new Map();

/**
 * Creates a network visualization.
 *
 * @param {string|HTMLElement} el - The selector or HTML element for the SVG.
 * @param {Object} params - Parameters for the visualization.
 * @param {Array} params.nodes - list of node objects.
 * @param {Array} params.links - list of {source, target} link objects.
 * @param {number} [params.width] - width of the SVG.
 * @param {number} [params.height] - height of the SVG.
 * @param {number} [params.linkCurvature=0] - curvature of the links. 0 = straight, 1 = half-circle.
 * @param {string} [params.nodeTag="circle"] - SVG tag to use for nodes.
 * @param {Object} [params.forces] - forces to apply to the simulation.
 * @param {Function} [params.brush] - callback function to handle brush events.
 * @param {string} [params.id] - unique identifier for the simulation. Uses `el.id` if not specified.
 * @param {Object} [params.d3=window.d3] - D3 instance to use.
 * @returns {Graph} Object containing D3.js selections for nodes and links.
 */
export function network(
  el,
  { nodes, links, width, height, linkCurvature = 0, nodeTag = "circle", forces, brush, id, d3 = globalThis.d3 },
) {
  // If el is already a D3 element, use it (with it's version of D3). Else use the provided D3
  let container;
  ({ el, container, width, height } = getSVG(el._groups ? el.node() : el, width, height));
  const svg = d3.select(el);

  if (!defaultForces.has(d3))
    defaultForces.set(d3, {
      link: ({ nodes, links }) => {
        const force = d3.forceLink(links);
        return nodes?.[0]?.id ? force.id((d) => d.id) : force;
      },
      charge: () => d3.forceManyBody(),
      x: ({ width }) => d3.forceX(width / 2),
      y: ({ height }) => d3.forceY(height / 2),
    });

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
            brush(nodes.filter((node) => node.x >= x0 && node.x <= x1 && node.y >= y0 && node.y <= y1));
          } else {
            brush([]);
          }
        }),
    );
  }

  const simulation = d3.forceSimulation(nodes);
  id = id || el.getAttribute("id") || el;
  if (simulationMap.has(id)) simulationMap.get(id).stop();
  simulationMap.set(id, simulation);

  for (let [name, force] of Object.entries(Object.assign({}, defaultForces.get(d3), forces)))
    if (force) simulation.force(name, force({ nodes, links, width, height }));

  const linkGroup = layer(svg, "g", "links");
  const linksLayer = layer(linkGroup, "path", "link", links).attr("fill", "none");
  const nodeGroup = layer(svg, "g", "nodes");
  const nodesLayer = layer(nodeGroup, nodeTag, "node", nodes)
    .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
    .on("dblclick", releaseNode);

  // Clicking the background releases all nodes
  d3.select(container).on("dblclick", releaseAllNodes);

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

  function releaseNode(event, d) {
    event.stopPropagation();
    d.fx = d.fy = null;
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

  /**
   * Define the returned graph
   * @typedef {Object} Graph
   * @property {Object} nodes - D3.js selection for nodes.
   * @property {Object} links - D3.js selection for links.
   * @property {Object} nodeGroup - D3.js selection for the node group.
   * @property {Object} linkGroup - D3.js selection for the link group.
   * @property {Object} simulation - D3.js simulation object.
   */
  return { nodes: nodesLayer, links: linksLayer, nodeGroup, linkGroup, simulation };
}
