# gramex-network

A force-directed network or graph visualization.

## Example

Given this [table of countries and religions](docs/country-religion.json):

[![Country-religion dataset screenshot](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/country-religion.png)](docs/country-religion.json)

... we can render the following network:

[![Religion network visual](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/country-religion.png)](docs/religion.html ":include")

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
  import { network } from "https://cdn.jsdelivr.net/npm/@gramex/network@1/dist/network.js";
</script>
```

Use via CDN as a script:

```html
<script src="https://cdn.jsdelivr.net/npm/@gramex/network@1/dist/network.min.js"></script>
<script>
  gramex.network(...)
</script>
```

## API

The `network()` function creates a network visualization. It accepts the following parameters:

- `el`: {string|HTMLElement} - The selector or HTML element for the SVG.
- `params`: {Object} - Parameters for the visualization.
  - `nodes`: {Array} - list of node objects.
  - `links`: {Array} - list of {source, target} link objects.
  - `width`: {number} - width of the SVG.
  - `height`: {number} - height of the SVG.
  - `linkCurvature`: {number} - curvature of the links. 0 = straight, 1 = half-circle.
  - `forces`: {Object} - forces to apply to the simulation.
  - `brush`: {Function} - (optional) Callback function to handle brush events.

It returns an object with 2 keys:

- `nodes`: a D3 join of the nodes
- `links`: a D3 join of the links

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

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/simple.png)](docs/simple.html ":include height=120px")

[Source code](docs/simple.html ":include :type=code")

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
const graph = await network("#network", data);
graph.nodes.attr("r", (d) => d.depth);
```

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/style.png)](docs/style.html ":include")

[Source code](docs/style.html ":include :type=code")

## Curved links

To draw curved links, set `linkCurvature` to a number between -1 and 1. 0 is a straight line. 1 is a half-circle. -1 is a half-circle in the opposite direction.

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/curved.png)](docs/curved.html ":include")

[Source code](docs/curved.html ":include :type=code")

## Add tooltips

You can use [Bootstrap tooltips](https://getbootstrap.com/docs/5.3/components/tooltips/).

1. Add a `data-bs-toggle="tooltip" title="..."` attribute to each feature using `update`
2. Call `new bootstrap.Tooltip(element, {selector: '[data-bs-toggle="tooltip"]'})` to initialize tooltips

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/tooltip.png)](docs/tooltip.html ":include")

[Source code](docs/tooltip.html ":include :type=code")

## Filter nodes and links

To dynamically filter nodes and links, pass a subset of the nodes and links.

Make sure the nodes and links are the same objects as the original nodes and links. This ensures that the simulation is not restarted.

In this example, when you move the slider, the country - religion links are filtered based on population. Any isolated nodes are also removed.

[![Example](https://code.gramener.com/cto/gramex-network/-/raw/main/docs/filter.png)](docs/filter.html ":include")

[Source code](docs/filter.html ":include :type=code")

## K-partite data

## Forces

## Brushing

## Animate features

## Zoom to fit

## Documentation

- [**Home page**](https://gramener.com/gramex-network/)
- [**Source**](https://code.gramener.com/cto/gramex-network.git)

## Release notes

- 1.0.0: 6 Sep 2023. Initial release

## Authors

Anand S <s.anand@gramener.com>

## License

[AGPL-3.0-only](https://spdx.org/licenses/AGPL-3.0-only.html)
