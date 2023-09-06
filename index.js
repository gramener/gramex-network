import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const layer = (el, tag, cls, data = (d) => [d]) =>
  el.selectAll(`${tag}.${cls}`).data(data).join(tag).attr("class", cls);

export function getSVG(el, width, height) {
  el = typeof el == "string" ? document.querySelector(el) : el;
  // If width and height are not specified, get them from the closest SVG parent.
  const container = el.closest("svg");
  width = width ?? (container?.viewBox?.animVal?.width || container?.width?.animVal?.value || 0);
  height =
    height ?? (container?.viewBox?.animVal?.height || container?.height?.animVal?.value || 0);
  return { el, container, width, height };
}

export async function network(
  el,
  { data, width, height, nodes, links, onBrush }
) {
  let container;
  ({ el, container, width, height } = getSVG(el, width, height));
  const svg = d3.select(el);

  if (onBrush) {
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
            onBrush(
              nodes.filter(
                (node) => node.x >= x0 && node.x <= x1 && node.y >= y0 && node.y <= y1
              )
            );
          } else {
            onBrush([]);
          }
        })
    );
  }

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("x", d3.forceX(width / 2))
    .force("y", d3.forceY(height / 2));

  const linkGroup = layer(svg, "g", "links");
  const linksLayer = layer(linkGroup, "line", "link", links);
  const nodeGroup = layer(svg, "g", "nodes");
  const nodesLayer = layer(nodeGroup, "circle", "node", nodes)
    .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
    .on("dblclick", releaseNode);

  d3.select(container).on("dblclick", releaseAllNodes); // Added double-click listener to the SVG background

  simulation.on("tick", () => {
    linksLayer
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    nodesLayer.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
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
    d3.select(this).classed("dragging", false);
  }

  function releaseNode(d) {
    d.fx = null;
    d.fy = null;
  }

  function releaseAllNodes() {
    for (let node of nodes) {
      node.fx = null;
      node.fy = null;
    }
    simulation.alphaTarget(0.3).restart(); // Restart the simulation to reflect the changes
  }

  return { nodes: nodesLayer, links: linksLayer, nodeGroup, linkGroup };
}
