/**
 * Generates a D3 compatible node-link structure based on given data and keys.
 *
 * @param {Array} data - An array of objects containing the data.
 * @param {Object} keys - An object of {key: column/accessor} pairs or an array of [key, column/accessor] pairs
 * @param {Object} values - An object of accessor functions for link values.
 * @returns {Object} An object with `nodes` and `links` arrays representing the node-link structure.
 *
 * @example
 * const data = [
 *   { "Country": "USA", "Religion": "Christian" },
 *   { "Country": "UK", "Religion": "Christian" },
 *   { "Country": "Iran", "Religion": "Muslim" }
 * ];
 *
 * const keys = {
 *   "Country": "Country",
 *   "Religion": d => d.Religion
 * };
 *
 * const values = {
 *  count: 1,
 *  Population: "Population"
 * };
 *
 * const result = kpartite(data, keys, values);
 * console.log(result.nodes, result.links);
 *
 * The `nodes` array has all unique nodes -- for each key in each data element. It has:
 *
 * - `key`: the key in the `keys` object, e.g. `Country`, `Religion`
 * - `value`: the value of the `keys` object, e.g. `data[0]["Country"]`, `data[0].Religion`
 * - `id`: JSON.stringify([key, value])
 * - `count`: number of links the node has
 * - `Population`: sum of the `Population` values for all links the node has
 *
 * The `links` array counts unique links -- for each PAIR of keys in each data element. It has:
 *
 * - `source`: link to the nodes object corresponding to the first key
 * - `target`: link to the nodes object corresponding to the second key
 * - `count`: number of times the pair occurred
 * - `Population`: sum of the `Population` values for all links the pair occurred
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

  return { nodes: Array.from(nodesMap.values()), links: Array.from(linkMap.values()) };
}
