/**
 * Generates a D3 compatible node-link structure based on given data and keys.
 *
 * @param {Array} data - An array of objects containing the data.
 * @param {Object} keys - An object of accessor keys or functions.
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
 * const result = kpartite(data, keys);
 * console.log(result.nodes, result.links);
 *
 * The `nodes` array has all unique nodes -- for each key in each data element. It has:
 *
 * - `key`: the key in the `keys` object, e.g. `Country`, `Religion`
 * - `value`: the value of the `keys` object, e.g. `data[0]["Country"]`, `data[0].Religion`
 * - `id`: JSON.stringify([key, value])
 *
 * The `links` array counts unique links -- for each PAIR of keys in each data element. It has:
 *
 * - `source`: link to the nodes object corresponding to the first key
 * - `target`: link to the nodes object corresponding to the second key
 * - `count`: number of times the pair occured
 */
// https://chat.openai.com/share/3046fae8-d85d-4c95-a650-6703040b36bb
export function kpartite(data, keys) {
  const nodesMap = new Map();
  const linkMap = new Map();

  // Loop through each data element
  data.forEach((d) => {
    const keyValues = Object.entries(keys).map(([key, accessor]) => {
      const value = typeof accessor === "function" ? accessor(d) : d[accessor];
      return { key, value, id: JSON.stringify([key, value]) };
    });

    // Create nodes and update nodes map
    keyValues.forEach((kv) => {
      if (!nodesMap.has(kv.id)) nodesMap.set(kv.id, kv);
    });

    // Create links for each pair of keys
    for (let i = 0; i < keyValues.length; i++) {
      for (let j = i + 1; j < keyValues.length; j++) {
        const sourceNode = nodesMap.get(keyValues[i].id);
        const targetNode = nodesMap.get(keyValues[j].id);
        const linkId = JSON.stringify([sourceNode.id, targetNode.id]);
        if (linkMap.has(linkId)) linkMap.get(linkId).count++;
        else linkMap.set(linkId, { source: sourceNode, target: targetNode, count: 1, id: linkId });
      }
    }
  });

  return { nodes: Array.from(nodesMap.values()), links: Array.from(linkMap.values()) };
}
