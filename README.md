# @gramex/network

A force-directed network or graph visualization.

## Example

Given this [table of countries and religions](docs/country-religion.json ":ignore"):

[![Country-religion dataset screenshot](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/country-religion.png)](docs/country-religion.json ":ignore")

... we can render the following network:

[![Religion network visual](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/religion.png)](docs/religion.html ":include")

[Here is the source code for the network above](docs/religion.html ":include :type=code")

## Installation

Install via `npm`:

```bash
npm install @gramex/network
```

Use locally as an ES module:

```html
<script type="module">
  import { network } from "./node_modules/@gramex/network/dist/network.js";
</script>
```

Use locally as a script:

```html
<script src="./node_modules/@gramex/network/network.min.js"></script>
<script>
  gramex.network(...)
</script>
```

Use via CDN as an ES Module:

```html
<script type="module">
  import { network } from "https://cdn.jsdelivr.net/npm/@gramex/network@1";
</script>
```

Use via CDN as a script:

```html
<script src="https://cdn.jsdelivr.net/npm/@gramex/network@1/dist/network.min.js"></script>
<script>
  gramex.network(...)
</script>
```

## Use a node-link dataset

The `network()` function accepts a `{ nodes, links }` object.

- `nodes` is an array of objects.
- `links` is an array of `{ source, target }` objects that to the node by index number or by reference.

```json
{
  "nodes": [{ "id": "Alice" }, { "id": "Bob" }, { "id": "Carol" }],
  "links": [
    { "source": 0, "target": 1 },
    { "source": 1, "target": 2 }
  ]
}
```

If `nodes` has an `id` key, you can specify the links using `id`:

```json
{
  "nodes": [{ "id": "Alice" }, { "id": "Bob" }, { "id": "Carol" }],
  "links": [
    { "source": "Alice", "target": "Bob" },
    { "source": "Bob", "target": "Carol" }
  ]
}
```

Here is a simple network that draws the above dataset:

```js
const graph = network("#network", data);
```

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/simple.png)](docs/simple.html ":include height=120px")

[See how to use network()](docs/simple.html ":include :type=code")

## Style nodes and links

Update the attributes and styles of the returned `.nodes` and `.links` joins to style the nodes and links.

By default, the nodes are rendered as `<circle>` elements and links as `<line>` elements.

You can apply the D3 [`.attr`](https://github.com/d3/d3-selection#selection_attr),
[`.classed`](https://github.com/d3/d3-selection#selection_classed),
[`.style`](https://github.com/d3/d3-selection#selection_style),
[`.text`](https://github.com/d3/d3-selection#selection_text),
and any other [selection methods](https://github.com/d3/d3-selection) to style the elements.

You can use any node/link keys in the styles. For example:

```js
const graph = network("#network", data);
graph.nodes.attr("r", (d) => d.depth);
```

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/style.png)](docs/style.html ":include")

[See how to style nodes and links](docs/style.html ":include :type=code")

## Add tooltips

You can use [Bootstrap tooltips](https://getbootstrap.com/docs/5.3/components/tooltips/).

1. Add a `data-bs-toggle="tooltip" title="..."` attribute to each feature using `update`
2. Call `new bootstrap.Tooltip(element, {selector: '[data-bs-toggle="tooltip"]'})` to initialize tooltips

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/tooltip.png)](docs/tooltip.html ":include")

[See how to add tooltips](docs/tooltip.html ":include :type=code")

## Dragging and pinning

Dragging a node pins it where you release it. Double-click a pinned node to unpin. To unpin all nodes, double-click on the background.

When dragging, the node gets a `dragging` class. When pinned, it gets a `pinned` class. You can use this to style nodes that are dragged or pinned. For example:

```css
.dragging {
  stroke: black;
  stroke-width: 5;
}
.pinned {
  stroke: black;
  stroke-width: 3;
}
```

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/drag.png)](docs/drag.html ":include")

[See how to highlight dragged and pinned nodes](docs/drag.html ":include :type=code")

## Filter nodes and links

To dynamically filter nodes and links, pass a subset of the nodes and links.

Make sure the nodes and links are the same objects as the original nodes and links. This ensures that the simulation is not restarted.

In this example, when you move the slider, the country - religion links are filtered based on population. Any isolated nodes are also removed.

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/filter.png)](docs/filter.html ":include")

[See how to filter nodes and links](docs/filter.html ":include :type=code")

## Tabular data

If you have tabular data (a flat array of objects) like this [table of countries and religions](docs/country-religion.json ":ignore"):

[![Country-religion dataset screenshot](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/country-religion.png)](docs/country-religion.json ":ignore")

... you can convert it to a node-link dataset using `kpartite()`. It accepts 3 parameters:

1. `data` - array of objects containing the data.
2. `keys` - object of `{key: column}` pairs or an array of `[key, column]` pairs.
   - `key` is a string node type
   - `column` is the string name of a field in data, or a function(object) that returns the field, or a static value.
3. `values` - object of accessor functions for link values that are aggregated across links and nodes

It returns an object with `nodes` and `links` arrays.

For example, given the following data:

```js
const data = [
  { Country: "USA", Religion: "Christian", Population: 100 },
  { Country: "UK", Religion: "Christian", Population: 90 },
  { Country: "Iran", Religion: "Muslim", Population: 80 },
];
```

... you can convert it to a node-link dataset using `kpartite()` as follows:

```js
const { nodes, links } = kpartite(
  data,
  {
    Country: "Country", // Create a node for each country
    Religion: (d) => d.Religion, // Create a node for each religion
  },
  {
    count: 1, // Count the number of links between countries and religions
    Population: "Population", // Sum the population of countries and religions
  },
);
```

This creates the following `nodes`:

```js
[
  {
    key: "Country",
    value: "USA",
    id: '["Country","USA"]',
    count: 1,
    Population: 100,
  },
  {
    key: "Religion",
    value: "Christian",
    id: '["Religion","Christian"]',
    count: 2,
    Population: 190,
  },
  // ... etc.
];
```

... and the following links:

```js
[
  {
    source: {}, // link to USA source node
    target: {}, // link to Christian target node
    id: '["[\\"Country\\",\\"USA\\"]","[\\"Religion\\",\\"Christian\\"]"]',
    count: 1,
    Population: 100,
  },
  // ... etc.
];
```

## Forces

By default, the network uses the following forces:

- `link`: a `d3.forceLink()` force that links the nodes and links
- `charge`: a `d3.forceManyBody()` that pushes nodes apart
- `x`: a `d3.forceX()` that centers the nodes horizontally
- `y`: a `d3.forceY()` that centers the nodes vertically

To disable these or modify the forces, pass a `force` object with the required forces. For example,
this network uses a `d3.forceCenter()` force instead of `x` and `y`:

```js
forces: {
  x: false,
  y: false,
  center: ({ width, height }) => d3.forceCenter(width / 2, height / 2),
}
```

Each force is a function that accepts the `nodes`, `links`, `width` and `height` of the SVG, and returns a D3 force.

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/forces.png)](docs/forces.html ":include")

[See how to modify forces](docs/forces.html ":include :type=code")

## Brushing

Passing a `brush` function enables brushing. The `brush` function is called with the selected nodes as parameters. You can use this to update other visualizations.

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/brush.png)](docs/brush.html ":include")

[See how to handle brushing](docs/brush.html ":include :type=code")

## Node shapes and labels

By default, nodes are `<circle>` elements. Change `nodeTag` for a different shape. For example, to use `<text>` elements:

```js
const graph = network("#network", { nodes, links, nodeTag: "text" });
graph.nodes.text((d) => d.id);
```

Here is a detailed example on how to draw labels with text and a rectangle background:

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/shapes.png)](docs/shapes.html ":include")

[See how to use different node shapes](docs/shapes.html ":include :type=code")

## Curved links

To draw curved links, set `linkCurvature` to a number between -1 and 1. 0 is a straight line. 1 is a half-circle. -1 is a half-circle in the opposite direction.

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/curved.png)](docs/curved.html ":include")

[See how to draw curved links](docs/curved.html ":include :type=code")

## Bring your own D3

If you already have D3 loaded, or want to use a specific version / instance of D3, pass it to `network(el, { d3 })`:

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/simple.png)](docs/d3.html ":include height=120")

[See how to use your own D3 version](docs/d3.html ":include :type=code")

## React usage

Use the following pattern when using `network()`` with React:

```js
const { useEffect } = React;
function App() {
  useEffect(() => network("#network", { ... }), []);
  return React.createElement("svg", { id: "network", width: 600, height: 380 });
}
const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
```

[![Example](https://code.gramener.com/cto/gramex-documap/-/raw/main/docs/religion.png)](docs/religion-react.html ":include height=400")

[See how to use network with React](docs/religion-react.html ":include :type=code")

Here are instructions to create a React Component:

```shell
npx create-react-app network-react
cd network-react
npm install d3 @gramex/network
```

Create `src/NetworkComponent.js` with this code:

[See NetworkComponent.js code](docs/network-react/src/NetworkComponent.js ":include :type=code")

Modify `src/App.js` as follows:

[See App.js code](docs/network-react/src/App.js ":include :type=code")

Then run `npm start` or `npm run build`.

[Explore the code](https://code.gramener.com/cto/gramex-network/-/tree/main/docs/network-react ":ignore").

## API

[See API documentation](docs/api.md ":include :type=markdown")

## Release notes

- 2.0.0: 24 Nov 2023. Synchronous API. Bring your own D3.
- 1.0.8: 14 Sep 2023. Stop past simulations on re-run. Use MIT license
- 1.0.7: 7 Sep 2023. Support any node shape.
- 1.0.6: 6 Sep 2023. Enable styles on pinned nodes
- 1.0.5: 6 Sep 2023. Initial release

## Authors

- Anand S <s.anand@gramener.com>
- Aayush Thakur <aayush.thakur@gramener.com>
- Chandana Sagar <chandana.sagar@gramener.com>

## License

[MIT](https://spdx.org/licenses/MIT.html)
