/**
 * Generates a D3 compatible node-link structure from a data frame (array of objects).
 *
 * @param {Array} data - array of objects containing the data.
 * @param {Object|Array} keys - object of {key: column/accessor} pairs or an array of [key, column/accessor] pairs
 * @param {Object} values - object of accessor functions for link values.
 * @returns {NodeLink} - `{ nodes, links }` arrays with the node-link structure.
 *
 * @example
 * const data = [
 *   { "Country": "USA", "Religion": "Christian" },
 *   { "Country": "UK", "Religion": "Christian" },
 *   { "Country": "Iran", "Religion": "Muslim" }
 * ];
 * // List nodes to extract from each row
 * const keys = {
 *   "Country": "Country",        // Create node from "Country" field
 *   "Religion": d => d.Religion  // Create node from "Religion" field
 * };
 * // Define attributes to add to each node / link
 * const values = {
 *  count: 1,                     // Sum "1" to count the number of rows matching each node / link
 *  Population: "Population"      // Sum the "Population" field from rows matching each node / link
 * };
 * const { nodes, links } = kpartite(data, keys, values);
 */
// https://chat.openai.com/share/3046fae8-d85d-4c95-a650-6703040b36bb

export function kpartite(data, keys, values = {}) {
  const nodesMap = new Map();
  const linkMap = new Map();
  const initialValues = Object.fromEntries(Object.keys(values).map((key) => [key, 0]));

  // Ensure keys and values have only accessors
  keys = (Array.isArray(keys) ? keys : Object.entries(keys)).map(([key, val]) => [
    key,
    typeof val === "function" ? val : (d) => d[val],
  ]);
  values = Object.entries(values).map(([key, value]) => [
    key,
    typeof value === "function" ? value : typeof value == "string" ? (d) => d[value] : () => value,
  ]);

  // Loop through each data element
  data.forEach((d) => {
    // Calculate values to be summed
    const vals = values.map(([key, accessor]) => [key, accessor(d)]);

    // Create the node objects for this row
    const keyValues = keys.map(([key, accessor]) => {
      const value = accessor(d);
      return { key, value, id: JSON.stringify([key, value]) };
    });

    // Add nodes to nodes map if required
    keyValues.forEach((kv) => {
      if (!nodesMap.has(kv.id)) nodesMap.set(kv.id, { ...kv, ...initialValues });
    });

    // Create links for each pair of keys
    for (let i = 0; i < keyValues.length; i++) {
      for (let j = i + 1; j < keyValues.length; j++) {
        const sourceNode = nodesMap.get(keyValues[i].id);
        const targetNode = nodesMap.get(keyValues[j].id);
        const linkId = JSON.stringify([sourceNode.id, targetNode.id]);
        if (!linkMap.has(linkId))
          linkMap.set(linkId, {
            source: sourceNode,
            target: targetNode,
            id: linkId,
            ...Object.fromEntries(vals),
          });
        vals.forEach(([key, val]) => {
          sourceNode[key] += val;
          targetNode[key] += val;
        });
      }
    }
  });

  /**
   * @typedef {Object} NodeLink
   * @property {Array} nodes - unique nodes for each key in each data element
   * @property {Array} links - unique links for each PAIR of keys in each data element
   * @property {string} nodes[].key - key of the node.
   * @property {string} nodes[].value - value of the node.
   * @property {string} nodes[].id - JSON.stringify([key, value]).
   * @property {Object} links[].source - link to the nodes object corresponding to the first key.
   * @property {Object} links[].target - link to the nodes object corresponding to the second key.
   * @property {string} links[].id - JSON.stringify([source.id, target.id]).
   */
  return { nodes: Array.from(nodesMap.values()), links: Array.from(linkMap.values()) };
}
