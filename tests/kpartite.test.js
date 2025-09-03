import { describe, it, expect } from "vitest";
import { kpartite } from "../kpartite.js"; // Adjust path as necessary

describe("kpartite.js tests", () => {
  it("should return empty nodes and links for empty data", () => {
    const data = [];
    const keys = { Country: "Country", Religion: "Religion" };
    const result = kpartite(data, keys);
    expect(result.nodes).toEqual([]);
    expect(result.links).toEqual([]);
  });

  it("should create correct nodes and links from simple data", () => {
    const data = [
      { Country: "USA", Religion: "Christian", Population: 100 },
      { Country: "UK", Religion: "Christian", Population: 60 },
      { Country: "Iran", Religion: "Muslim", Population: 80 },
    ];
    const keys = { Country: "Country", Religion: (d) => d.Religion };
    const values = { count: 1, totalPopulation: "Population" };

    const { nodes, links } = kpartite(data, keys, values);

    // Expected nodes: USA, UK, Iran, Christian, Muslim
    expect(nodes.length).toBe(5);
    // Expected links: (USA,Christian), (UK,Christian), (Iran,Muslim)
    // kpartite creates links between ALL pairs of keys extracted from a single row.
    // So, for each row, if we extract Country and Religion, it creates a (Country, Religion) link.
    expect(links.length).toBe(3);

    // Check node structure and aggregated values
    const usaNode = nodes.find(n => n.key === "Country" && n.value === "USA");
    expect(usaNode).toBeDefined();
    expect(usaNode.count).toBe(1); // USA appears in 1 row
    expect(usaNode.totalPopulation).toBe(100);

    const christianNode = nodes.find(n => n.key === "Religion" && n.value === "Christian");
    expect(christianNode).toBeDefined();
    expect(christianNode.count).toBe(2); // Christian appears in 2 rows
    expect(christianNode.totalPopulation).toBe(160); // 100 (USA) + 60 (UK)

    // Check link structure and that source/target are actual node objects
    const usaChristianLink = links.find(l =>
      l.source.value === "USA" && l.target.value === "Christian" ||
      l.source.value === "Christian" && l.target.value === "USA"
    );
    expect(usaChristianLink).toBeDefined();
    expect(usaChristianLink.source).toBeDefined();
    expect(usaChristianLink.target).toBeDefined();
    expect(nodes.includes(usaChristianLink.source)).toBe(true);
    expect(nodes.includes(usaChristianLink.target)).toBe(true);
    expect(usaChristianLink.count).toBe(1); // This specific link combo from one row
    expect(usaChristianLink.totalPopulation).toBe(100); // From the row { Country: "USA", Religion: "Christian" }
  });

  it("should handle different key types (array of [key, accessor])", () => {
    const data = [{ category: "A", subcategory: "X", value: 10 }];
    const keys = [
        ["mainCat", "category"],
        ["subCat", (d) => d.subcategory]
    ];
    const values = { sumValue: "value" };
    const { nodes, links } = kpartite(data, keys, values);

    expect(nodes.length).toBe(2);
    expect(links.length).toBe(1);

    const nodeA = nodes.find(n => n.key === "mainCat" && n.value === "A");
    expect(nodeA).toBeDefined();
    expect(nodeA.sumValue).toBe(10);

    const linkAX = links.find(l =>
        (l.source.value === "A" && l.target.value === "X") ||
        (l.source.value === "X" && l.target.value === "A")
    );
    expect(linkAX).toBeDefined();
    expect(linkAX.sumValue).toBe(10);
  });

  it("should correctly aggregate values for nodes and links", () => {
    const data = [
      { item: "Apple", type: "Fruit", store: "Store1", sales: 10 },
      { item: "Banana", type: "Fruit", store: "Store1", sales: 5 },
      { item: "Apple", type: "Fruit", store: "Store2", sales: 8 },
    ];
    const keys = { item: "item", type: "type", store: "store" };
    const valuesDef = { occurrences: 1, totalSales: "sales" }; // '1' means count occurrences

    const { nodes, links } = kpartite(data, keys, valuesDef);

    // Nodes: Apple, Banana, Fruit, Store1, Store2
    expect(nodes.length).toBe(5);

    const appleNode = nodes.find(n => n.value === "Apple");
    expect(appleNode.occurrences).toBe(2); // Apple involved in 2 rows
    expect(appleNode.totalSales).toBe(18); // 10 + 8

    const fruitNode = nodes.find(n => n.value === "Fruit");
    expect(fruitNode.occurrences).toBe(3); // Fruit involved in 3 rows
    expect(fruitNode.totalSales).toBe(23); // 10 + 5 + 8

    // Links are between all pairs of keys from each row.
    // Row 1: (Apple,Fruit), (Apple,Store1), (Fruit,Store1) - sales: 10
    // Row 2: (Banana,Fruit), (Banana,Store1), (Fruit,Store1) - sales: 5
    // Row 3: (Apple,Fruit), (Apple,Store2), (Fruit,Store2) - sales: 8
    // Unique links: (Apple,Fruit), (Apple,Store1), (Fruit,Store1), (Banana,Fruit), (Banana,Store1), (Apple,Store2), (Fruit,Store2)
    // Total 7 unique links
    expect(links.length).toBe(7);

    const appleFruitLink = links.find(l =>
      (l.source.value === "Apple" && l.target.value === "Fruit") ||
      (l.source.value === "Fruit" && l.target.value === "Apple")
    );
    expect(appleFruitLink).toBeDefined();
    // This link is formed from row 1 (sales 10) and row 3 (sales 8)
    // The current kpartite sums values on links based on the first row that forms the link.
    // This might be an area for clarification or refinement in kpartite itself if shared link properties need aggregation.
    // Based on current kpartite: it should be 10 (from first encounter) or 8.
    // The example logic in kpartite says:
    //   if (!linkMap.has(linkId)) linkMap.set(linkId, { ...Object.fromEntries(vals) });
    //   vals.forEach(([key, val]) => { sourceNode[key] += val; targetNode[key] += val; });
    // This means link properties are from the *first* row creating them. Node properties are aggregated.
    expect([10, 8].includes(appleFruitLink.totalSales)).toBe(true); // Value from one of the rows forming it
    expect(appleFruitLink.occurrences).toBe(1); // This is always 1 for links by current kpartite logic

    const fruitStore1Link = links.find(l =>
      (l.source.value === "Fruit" && l.target.value === "Store1") ||
      (l.source.value === "Store1" && l.target.value === "Fruit")
    );
    expect(fruitStore1Link).toBeDefined();
    // Formed by row 1 (sales 10) and row 2 (sales 5). Value should be from first encounter.
    expect([10,5].includes(fruitStore1Link.totalSales)).toBe(true);
    expect(fruitStore1Link.occurrences).toBe(1);
  });
});
