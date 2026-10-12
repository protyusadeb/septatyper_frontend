"use client";
// Loaded only in the browser (see ChartCard's dynamic import). The factory build lets us
// ship the full plotly.js-dist-min bundle once; switch to a custom partial bundle
// (bar + choropleth only) later to cut the download size.
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

const Plot = createPlotlyComponent(Plotly);
export default Plot;
