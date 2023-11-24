import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { network } from "@gramex/network";

const NetworkComponent = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const json = await fetch("https://gramener.com/gramex-network/docs/flare.json").then((r) => r.json());
      setData(json);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.name) {
      var root = d3.hierarchy(data);
      const graph = network("#network", { links: root.links(), nodes: root.descendants(), d3 });
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      graph.nodes.attr("fill", (d) => color(d.depth)).attr("r", (d) => 10 - d.depth * 2);
      graph.links.attr("stroke", "rgba(0,0,0,0.2)");
    }
  }, [data]);

  return <svg id="network" width="600" height="380"></svg>;
};

export default NetworkComponent;
