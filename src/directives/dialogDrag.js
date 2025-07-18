export default {
  bind(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    if (!dialogHeaderEl || !dragDom) return;
    dialogHeaderEl.style.cursor = 'move';

    // 获取原有属性，避免第一次拖动跳到左上角
    const getStyle = (function() {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr];
      } else {
        return (dom, attr) => getComputedStyle(dom, false)[attr];
      }
    })();

    dialogHeaderEl.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const startX = e.clientX;
      const startY = e.clientY;

      // 注意：初始left/top可能是auto或百分比
      let styL = getStyle(dragDom, 'left');
      let styT = getStyle(dragDom, 'top');
      if (styL.includes('%')) {
        styL = document.body.clientWidth * parseFloat(styL) / 100;
      } else {
        styL = parseFloat(styL) || 0;
      }
      if (styT.includes('%')) {
        styT = document.body.clientHeight * parseFloat(styT) / 100;
      } else {
        styT = parseFloat(styT) || 0;
      }

      const disX = startX - styL;
      const disY = startY - styT;

      document.onmousemove = function(e) {
        let l = e.clientX - disX;
        let t = e.clientY - disY;
        // 允许弹窗左、上最多超出-300px，右、下也可多出300px
        const minL = -50;
        const minT = -300;
        const maxL = document.body.clientWidth - dragDom.offsetWidth + 50;
        const maxT = document.body.clientHeight - dragDom.offsetHeight + 300;
        l = Math.max(minL, Math.min(l, maxL));
        t = Math.max(minT, Math.min(t, maxT));
        dragDom.style.left = `${l}px`;
        dragDom.style.top = `${t}px`;
      };

      document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }
} 