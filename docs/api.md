<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## kpartite

Generates a D3 compatible node-link structure from a data frame (array of objects).

### Parameters

- `data` **[Array][1]** array of objects containing the data.
- `keys` **([Object][2] | [Array][1])** object of {key: column/accessor} pairs or an array of \[key, column/accessor] pairs
- `values` **[Object][2]** object of accessor functions for link values. (optional, default `{}`)

### Examples

```javascript
const data = [
  { Country: "USA", Religion: "Christian" },
  { Country: "UK", Religion: "Christian" },
  { Country: "Iran", Religion: "Muslim" },
];
// List nodes to extract from each row
const keys = {
  Country: "Country", // Create node from "Country" field
  Religion: (d) => d.Religion, // Create node from "Religion" field
};
// Define attributes to add to each node / link
const values = {
  count: 1, // Sum "1" to count the number of rows matching each node / link
  Population: "Population", // Sum the "Population" field from rows matching each node / link
};
const { nodes, links } = kpartite(data, keys, values);
```

Returns **[NodeLink][3]** `{ nodes, links }` arrays with the node-link structure.

## NodeLink

Type: [Object][2]

### Properties

- `nodes` **[Array][1]** unique nodes for each key in each data element

  - `nodes[].key` **[string][4]** key of the node.
  - `nodes[].value` **[string][4]** value of the node.
  - `nodes[].id` **[string][4]** JSON.stringify(\[key, value]).

- `links` **[Array][1]** unique links for each PAIR of keys in each data element

  - `links[].source` **[Object][2]** link to the nodes object corresponding to the first key.
  - `links[].target` **[Object][2]** link to the nodes object corresponding to the second key.
  - `links[].id` **[string][4]** JSON.stringify(\[source.id, target.id]).

## network

Creates a network visualization.

### Parameters

- `el` **([string][4] | [HTMLElement][5])** The selector or HTML element for the SVG.
- `params` **[Object][2]** Parameters for the visualization.

  - `params.nodes` **[Array][1]** list of node objects.
  - `params.links` **[Array][1]** list of {source, target} link objects.
  - `params.width` **[number][6]?** width of the SVG.
  - `params.height` **[number][6]?** height of the SVG.
  - `params.linkCurvature` **[number][6]** curvature of the links. 0 = straight, 1 = half-circle. (optional, default `0`)
  - `params.nodeTag` **[string][4]** SVG tag to use for nodes. (optional, default `"circle"`)
  - `params.forces` **[Object][2]?** forces to apply to the simulation.
  - `params.brush` **[Function][7]?** callback function to handle brush events.
  - `params.id` **[string][4]?** unique identifier for the simulation. Uses `el.id` if not specified.
  - `params.d3` **[Object][2]** D3 instance to use. (optional, default `window.d3`)

Returns **[Graph][8]** Object containing D3.js selections for nodes and links.

## Graph

Define the returned graph

Type: [Object][2]

### Properties

- `nodes` **[Object][2]** D3.js selection for nodes.
- `links` **[Object][2]** D3.js selection for links.
- `nodeGroup` **[Object][2]** D3.js selection for the node group.
- `linkGroup` **[Object][2]** D3.js selection for the link group.
- `simulation` **[Object][2]** D3.js simulation object.

[1]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
[2]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
[3]: #nodelink
[4]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
[5]: https://developer.mozilla.org/docs/Web/HTML/Element
[6]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number
[7]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function
[8]: #graph
