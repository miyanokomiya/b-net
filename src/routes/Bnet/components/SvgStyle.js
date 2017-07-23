/**
 * スタイルマージ(可変長引数)
 */
export function m() {
  var res = {};
  for (var i=0; i < arguments.length; ++i) {
    if (arguments[i]) Object.assign(res, arguments[i]);
  }
  return res;
}

export const svgStyle = {
  fontFamily : "sans-serif",
}

export const lineStyle = {
  crossLine : {
    fill: "#999",
    stroke: "#999",
    strokeWidth: 8,
  },
  nodeLine : {
    fill: "#09d",
    stroke: "#09d",
    strokeWidth: 4,
  },
  ancestorLine : {
    fill: "#ff7f50",
    stroke: "#ff7f50",
    strokeWidth: 8,
  }
}

export const nodeStyle = {
  g : {
    cursor : "pointer"
  },
  shape : {
    stroke : "#666",
    strokeWidth : 4,
  },
  text : {
    fill : "black",
    stroke : "black",
    textAnchor : "middle",
  },
  shapeTarget : {
    stroke : "#000080",
    strokeWidth : 10,
  },
  shapeFamily : {
    stroke : "#000080",
    strokeWidth : 8,
  },
  star : {
    fill : "gold",
    strokeWidth : 2,
    stroke : "black",
  }
}