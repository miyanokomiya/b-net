import {v2f, f2v} from './canvasUtils'

export function generateUuid() {
    // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
    // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
    for (let i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case "x":
                chars[i] = Math.floor(Math.random() * 16).toString(16);
                break;
            case "y":
                chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                break;
        }
    }
    return chars.join("");
}

export function createNode() {
  return {
    x : 0,
    y : 0,
    parentId : null,
    text : "",
    id : "",
    childIdList : [],
    shape : 0,
  };
}

// nodeの不足プロパティを補う
export function assignNode(node) {
  let init = createNode();
  return Object.assign({}, init, node);
}

export function createNewNode(state) {
  let node = createNode();
  let parent = state.nodeMap[state.target];
  if (parent) {
    node.parentId = state.target;
    let parent = state.nodeMap[node.parentId];

    let p = getBetterPoint(state, node);

    node.x = p.x;
    node.y = p.y;
  } else {
    let p = v2f(state.viewArea, state.menuPoint)
    node.x = p.x;
    node.y = p.y;
  }

  return node;
}

// 既存位置と重複にしくい良い点を取得する
export function getBetterPoint(state, node) {
  let parent = state.nodeMap[node.parentId];
  if (parent) {
    let grandParent = state.nodeMap[parent.parentId];
    let nodeList = [];

    // 親の親がいる場合は取得
    if (grandParent) {
      nodeList.push(grandParent);
    }
    
    // 自分以外の兄弟を取得
    for (let k in state.nodeMap) {
      let n = state.nodeMap[k];
      if (n.parentId === parent.id && n.id !== node.id) {
        nodeList.push(n);
      }
    }

    if (nodeList.length > 0) {
      // 重複を避けるノード達と親とのラジアンを取得
      let radList = nodeList.map(n => {
        let rad = Math.atan2(n.y - parent.y, n.x - parent.x);
        return rad;
      });

      // 重複しにくい点を候補から探す
      let dList = [];
      for (let i = 0; i < 60; i++) {
        let rad = Math.PI * 2 * i / 60 - Math.PI;
        // 重複しにくさの指標
        let d = 0;
        radList.forEach((r, index) => {
          // ラジアン距離を計算する
          let tmp = Math.abs(rad - r);
          if (tmp > Math.PI) {
            tmp -= Math.PI * 2;
          }
          // 親の親周辺は優先して避ける
          if (grandParent && index === 0) {
            if (Math.abs(tmp) > Math.PI / 3) {
              d += 1.5;
            }
          } else {
            if (Math.abs(tmp) > Math.PI / 10) {
              d++;
            } else if (Math.abs(tmp) > Math.PI / 30) {
              d += 0.5;
            }
          }
        });
        // 重複しにくさの指標とラジアンをセットで収集
        dList.push({
          d : d,
          rad : rad,
        });
      }

      // 重複しにくさの指標が最大のものを採用する
      dList = dList.sort((a, b) => {
        return b.d - a.d;
      });

      let rad = dList[0].rad;
      let dx = 300 * Math.cos(rad);
      let dy = 300 * Math.sin(rad);

      return {
        x : parent.x + dx,
        y : parent.y + dy,
      }
    } else {
      // 兄弟はいないので真下にしておく
      return {
        x : parent.x,
        y : parent.y + 200,
      }
    }
  } else {
    // 親なしなら調整しない
    return {
      x : node.x,
      y : node.y,
    }
  }
}

export function moveNode(state, x, y, node, notConnect) {
  let dx = x - state.cursorState.x;
  let dy = y - state.cursorState.y;
  dx *= state.viewArea.scale;
  dy *= state.viewArea.scale;
  
  // node移動
  let nextNode = Object.assign({}, node, {
    x : node.x + dx,
    y : node.y + dy,
  });

  if (!notConnect) {
    for (let k in state.nodeMap) {
      let other = state.nodeMap[k];
      // 自分と子供は除外
      if (other !== node && other.parentId !== node.id) {
        let d2 = Math.pow(nextNode.x - other.x, 2) + Math.pow(nextNode.y - other.y, 2);
        if (d2 / state.viewArea.scale < 1000) {
          nextNode.parentId = other.id;
          break;
        }
      }
    }
  }

  return nextNode;
}

export function moveNodeAtPoint(state, x, y, node, notConnect) {
  let fP = v2f(state.viewArea, {x:x,y:y});
  
  // node移動
  let nextNode = Object.assign({}, node, fP);

  if (!notConnect) {
    for (let k in state.nodeMap) {
      let other = state.nodeMap[k];
      // 自分と子供は除外
      if (other !== node && other.parentId !== node.id) {
        let d2 = Math.pow(nextNode.x - other.x, 2) + Math.pow(nextNode.y - other.y, 2);
        if (d2 / state.viewArea.scale < 1000) {
          // さらに子孫も除外する
          let ancestorMap = getAncestorMap(state.nodeMap, other.id, true);
          if (!ancestorMap[nextNode.id]) {
            nextNode.parentId = other.id;
          }
          break;
        }
      }
    }
  }

  return nextNode;
}

/**
 * 先祖ノードマップを取得する
 * @param nodeMap {Object} ノードマップ
 * @param targetId {String} 探査対象ノードID
 * @param parent2Child {Boolean} trueなら戻り値マップを、親IDをkey、子IDをvalueとする
 * @return {Object} 子IDをkey、親IDをvalueとしたIDマップ
 */
export function getAncestorMap(nodeMap, targetId, parent2Child) {
  let ancestorMap = {};
  let current = nodeMap[targetId];

  while (current) {
    let parent = nodeMap[current.parentId];
    if (parent && parent !== current) {
      let key = parent2Child ? current.parentId : current.id;
      // 循環対策
      if (!(key in ancestorMap)) {
        ancestorMap[key] = parent2Child ? current.id : current.parentId;
        current = parent;
      } else {
        current = null;
      }
    } else {
      current = null;
    }
  }

  return ancestorMap;
}

/**
 * 子孫ノードマップを取得する
 * @param nodeMap {Object} ノードマップ
 * @param targetId {String} 探査対象ノードID
 * @param withMyself {Boolean} 戻り値マップにtargetIdも含めるフラグ
 * @return {Object} 子IDをkey、親IDをvalueとしたIDマップ
 */
export function getDescentMap(nodeMap, targetId, withMyself) {
  let root = nodeMap[targetId];

  // ルート含めた全子孫マップ
  let allFamily = {};
  allFamily[targetId] = true;

  // 探査対象マップ
  let lestNodeMap = Object.assign({}, nodeMap);
  delete lestNodeMap[targetId];

  let loop = true;
  while (loop) {
    loop = false;
    for (let k in lestNodeMap) {
      let n = lestNodeMap[k];
      if (n.parentId && allFamily[n.parentId]) {
        // 循環対策
        if (!(k in allFamily)) {
          allFamily[k] = true;
          delete lestNodeMap[k];
          loop = true;
        }
      }
    }

    // 探査終了
    if (!loop) {
      break;
    }
  }

  if (!withMyself) {
    delete allFamily[targetId];
  }

  return allFamily;
}

export function getSizeMap(nodeMap) {
  let sizeMap = {};
  for (let k in nodeMap) {
    let node = nodeMap[k];
    if (node.parentId) {
      if (sizeMap[node.parentId]) {
        sizeMap[node.parentId]++;
      } else {
        sizeMap[node.parentId] = 1;
      }
    }
  }

  return sizeMap;
}