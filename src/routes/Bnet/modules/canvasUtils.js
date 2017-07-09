

export function v2f(viewArea, p) {
  return {
    x : p.x * viewArea.scale + viewArea.left,
    y : p.y * viewArea.scale + viewArea.top,
  }
}
export function f2v(viewArea, p) {
  return {
    x : (p.x - viewArea.left) / viewArea.scale,
    y : (p.y - viewArea.top) / viewArea.scale,
  }
}

/**
 * 表示エリアを最適化する
 * @param {*} nodeMap ノードマップ
 * @param {Number} viewWidth 表示領域幅
 * @param {Number} viewHeight 表示領域高さ
 * @return {*} 表示領域情報
 */
export function getAdjustedViewArea(nodeMap, viewWidth, viewHeight) {
    // 原点を中心としたノードの縦横で最も遠い距離を取得
    let maxW = 200;
    let maxH = 200;
    for (let k in nodeMap) {
        let n = nodeMap[k];
        maxW = Math.max(maxW, Math.abs(n.x));
        maxH = Math.max(maxH, Math.abs(n.y));
    }

    // 最も遠い点が収まるスケール計算
    let scaleW = maxW / ((viewWidth-50)/2);
    let scaleH = maxH / ((viewHeight-50)/2);
    let scale = Math.max(scaleW, scaleH);

    return {
        scale : scale,
        left : -viewWidth / 2 * scale,
        top : -viewHeight / 2 * scale,
    };
}

export function wheelCanvas(state, deltaX, p) {
    let delta = deltaX < 0 ? 1.8 : -1.8;
    let scale = state.viewArea.scale / Math.pow(1.03, delta);
    scale = Math.max(scale, 0.1);
    scale = Math.min(scale, 10);

    // カーソル位置を基準にスケール変更
    let tmpViewArea = Object.assign({}, state.viewArea, {
        scale : scale,
    });
    let f = v2f(state.viewArea, p);
    let f2 = v2f(tmpViewArea, p);
    let dx = f.x - f2.x;
    let dy = f.y - f2.y;

    return Object.assign({}, state.viewArea, {
        scale : scale,
        left : state.viewArea.left + dx,
        top : state.viewArea.top + dy,
    });
}

export function pinchCanvas(state, p0, p1) {
    let center = {
        x : (p0.x + p1.x) / 2,
        y : (p0.y + p1.y) / 2,
    }

    let scale = state.viewArea.scale
    let d = Math.pow(Math.pow((p0.x - p1.x), 2) + Math.pow((p0.y - p1.y), 2), 1/2)
    if (state.cursorState.pinchDistance > 0) {
        let delta = state.cursorState.pinchDistance - d;

        scale = state.viewArea.scale / Math.pow(1.01, -delta / 2);
        scale = Math.max(scale, 0.1);
        scale = Math.min(scale, 10);
    }

    // カーソル位置を基準にスケール変更
    let tmpViewArea = Object.assign({}, state.viewArea, {
        scale : scale,
    });
    let f = v2f(state.viewArea, center);
    let f2 = v2f(tmpViewArea, center);
    let dx = f.x - f2.x;
    let dy = f.y - f2.y;

    return [
        Object.assign({}, state.viewArea, {
            scale : scale,
            left : state.viewArea.left + dx,
            top : state.viewArea.top + dy,
        }),
        d
    ];
}