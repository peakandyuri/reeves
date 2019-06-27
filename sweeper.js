
function mineSweeper(elId, xCount, yCount, mineCount) {
    const totalBox = xCount * yCount;
    const box = new Array(totalBox).fill(0, 0, totalBox);
    const matrix = [];
    const links = [];
    let _mineCount = 0;
    let boomLazy = 0;
    let sweepCount = 0;
    /**
     * 随机生成雷
     */
    function randomMine() {
        let next = parseInt(Math.random() * totalBox);
        if (box[next]) {
            randomMine();
        } else {
            box[next] = 1;
            _mineCount++;

            if (_mineCount < mineCount) {
                randomMine();
            } else {
                for (let i = 0, max = totalBox / xCount; i < max; i++) {
                    matrix.push(box.splice(0, xCount));
                    links.push([]);
                }
            }
        }
    }
    /**
     * 计算周围雷的数量
     * @param {*} row 
     * @param {*} col 
     */
    function calcMineCount(row, col) {
        let mineCount = 0;
        const maxRow = matrix.length;
        const maxCol = matrix[0].length;
        for (let i = row - 1; i <= row + 1; i++) {
            if (i < 0 || i === maxRow) {
                continue;
            }
            const __row = matrix[i];
            for (let j = col - 1; j <= col + 1; j++) {
                if (j < 0 || j === maxCol) {
                    continue;
                }
                if (i == row && j == col) {   //元素自身
                    continue;
                }

                mineCount += __row[j];
            }
        }
        return mineCount;
    }
    /**
     * 辐射周围空白格子
     * @param {*} el 
     */
    function radiate(el) {
        let col = el.col;
        let row = el.row;
        const maxRow = links.length;
        const maxCol = links[0].length;
        for (let i = row - 1; i <= row + 1; i++) {
            if (i < 0 || i === maxRow) {
                continue;
            }
            for (let j = col - 1; j <= col + 1; j++) {
                if (j < 0 || j === maxCol) {
                    continue;
                }
                const linkInfo = links[i][j];

                if (i == row && j == col) {   //元素自身
                    if (linkInfo.isBlank) {
                        linkInfo.el.removeAttribute("class");
                        linkInfo.clicked = true;
                        linkInfo.el.addEventListener("dblclick", elDblClick);
                    }
                } else if (linkInfo.clicked === false && linkInfo.flag === false) {
                    if (linkInfo.isBlank)
                        radiate(linkInfo.el);
                    else if (linkInfo.isMine === false){                        
                        linkInfo.el.click();
                    }
                }
            }
        }
    }
    /**
     * 格子单击
     */
    function elClick() {

        this.removeEventListener("click", elClick);
        const linkInfo = links[this.row][this.col];
        if(linkInfo.flag)
            return;
        if (linkInfo.isMine === false) {    //非地雷        
            if (linkInfo.isBlank) {
                radiate(this);  //辐射周围的空白格子
            } else {
                this.className = 'n' + linkInfo.mineCount;
                this.innerHTML = linkInfo.mineCount;
                linkInfo.clicked = true;
                this.addEventListener("dblclick", elDblClick);
            }

        } else {
            boomOver(this);
        }
    }
    /**
     * 格子双击
     */
    function elDblClick() {

        openOther(this);
    }
    /**
     * 监听动画结束
     */
    function animationend() {
        this.removeEventListener("animationend", animationend);
        this.className = this.className.replace("animate", "");
    }
    /**
     * 打开周围已确定无雷的格子
     * @param {*} el 
     */
    function openOther(el) {
        let col = el.col;
        let row = el.row;
        const maxRow = links.length;
        const maxCol = links[0].length;

        let mineCount = 0;
        let thisElLink;
        const unOpen = [];
        for (let i = row - 1; i <= row + 1; i++) {
            if (i < 0 || i === maxRow) {
                continue;
            }
            for (let j = col - 1; j <= col + 1; j++) {
                if (j < 0 || j === maxCol) {
                    continue;
                }
                const linkInfo = links[i][j];

                if (i == row && j == col) {   //元素自身
                    thisElLink = linkInfo;
                    continue;
                } else if (linkInfo.flag) {     //标记了雷
                    mineCount++;
                } else if (linkInfo.clicked === false) {    //未点击过
                    unOpen.push(linkInfo);
                }
            }
        }
        if (mineCount == thisElLink.mineCount) {    //周围的雷被探测完了

            //查找是否有被探错了的雷
            let mine = unOpen.find(lnk => lnk.isMine);
            if (mine) {
                mine.el.click();    //触发爆炸
            } else {
                unOpen.forEach(({ el }) => el.click()); //打开所有的格子
            }
        } else {
            //雷没有被探测完，周围格子闪烁
            unOpen.forEach(({ el }) => {
                el.className += " animate";
                el.addEventListener("animationend", animationend);
            });
        }
    }


    /**
     * 爆炸结束
     * @param {*} boomEl 
     */
    function boomOver(boomEl) {
        let col = boomEl.col;
        let row = boomEl.row;
        const maxRow = links.length;
        const maxCol = links[0].length;
        for (let i = row - 1; i <= row + 1; i++) {
            if (i < 0 || i === maxRow) {
                continue;
            }
            for (let j = col - 1; j <= col + 1; j++) {
                if (j < 0 || j === maxCol) {
                    continue;
                }
                const linkInfo = links[i][j];

                if (i == row && j == col) {   //元素自身
                    linkInfo.check = true;
                    if (linkInfo.isMine && linkInfo.flag === false) {
                        setTimeout(function () {
                            linkInfo.el.className = "unclick error iconfont iconbaozha";
                        }, boomLazy);
                        boomLazy += 100;
                    } else if (!!!linkInfo.isMine && linkInfo.flag) {
                        setTimeout(function () {
                            linkInfo.el.className += " error";
                        }, boomLazy);
                        boomLazy += 100;
                    }
                    continue;
                }
                if (linkInfo.check === false) {
                    linkInfo.check = true;
                    setTimeout(boomOver, 10, linkInfo.el);

                    let el = linkInfo.el;

                    el.removeEventListener("click", elClick);
                    el.removeEventListener("contextmenu", rightClick);
                    el.removeEventListener("dblclick", elDblClick);
                }
            }
        }
    }

    /**
     * 右键
     * @param {} event 
     */
    function rightClick(event) {
        event.preventDefault();
        const link = links[this.row][this.col];
        if (link.clicked)
            return;
        if (this.className && this.className.indexOf("hongqi") != -1) {
            this.className = this.className.replace(" iconfont iconhongqi", "");
            link.flag = false;
            sweepCount--;
        } else {
            this.className = this.className.replace(" iconfont icondilei", "");
            link.flag = true;
            sweepCount++;
            this.className += " iconfont iconhongqi";
        }
        mineCountEl.innerHTML = "Mine Count:" + (mineCount - sweepCount);
        if (sweepCount === mineCount) {
            for (let i = 0; i < yCount; i++) {
                for (let j = 0; j < xCount; j++) {
                    const box = links[i][j];
                    let el = box.el;
                    if (box.isMine && box.flag === false) {
                        el.click();
                        return;
                    }
                    el.removeEventListener("click", elClick);
                    el.removeEventListener("contextmenu", rightClick);
                    el.removeEventListener("dblclick", elDblClick);
                }
            }
            setTimeout(alert, 100, 'you win!');            
        }
    }


    let container = document.querySelector(elId);
    container.style.width = xCount * 34;
    container.innerHTML = '';

    randomMine();
    for (let i = 0; i < yCount; i++) {
        const row = matrix[i];
        const linkInfo = links[i];
        for (let j = 0; j < xCount; j++) {
            let el = document.createElement("div");
            el.className = 'unclick';
            el.row = i;
            el.col = j;
            calcMineCount(el);
            let isMine = false;
            let isBlank = false;
            let mineCount = 0;
            if (row[j]) {
                //el.className += " iconfont icondilei";
                isMine = true;
            } else {
                mineCount = calcMineCount(i, j);
                if (mineCount === 0) {
                    isBlank = true;
                }
            }
            linkInfo[j] = {
                el,
                mineCount,
                clicked: false,
                isMine,
                isBlank,
                /**
                 * 爆炸辐射未检查
                 */
                check: false,
                /**
                 * 是否标有红旗
                 */
                flag: false
            };
            el.addEventListener("click", elClick);
            el.addEventListener("contextmenu", rightClick);
            container.appendChild(el);
        }
    }

    const operatEl = document.createElement("div");
    operatEl.style.marginBottom = '10px';
    const mineCountEl = document.createElement("span");
    mineCountEl.innerHTML = "Mine Count:" + mineCount;
    operatEl.appendChild(mineCountEl);
    const btn = document.createElement("button");
    btn.innerHTML = "Replay";
    btn.onclick = function () {
        container.parentNode.removeChild(operatEl);
        mineSweeper(elId, xCount, yCount, mineCount);
    }
    const easy = document.createElement("button");
    easy.innerHTML = "Easy";
    easy.onclick = function () {
        container.parentNode.removeChild(operatEl);
        mineSweeper(elId, 10, 13, 20);
    }
    const medium = document.createElement("button");
    medium.innerHTML = "Medium";
    medium.onclick = function () {
        container.parentNode.removeChild(operatEl);
        mineSweeper(elId, 12, 18, 40);
    }
    const hard = document.createElement("button");
    hard.innerHTML = "Hard";
    hard.onclick = function () {
        container.parentNode.removeChild(operatEl);
        mineSweeper(elId, 15, 20, 60);
    }
    operatEl.appendChild(btn);
    operatEl.appendChild(easy);
    operatEl.appendChild(medium);
    operatEl.appendChild(hard);
    container.parentNode.insertBefore(operatEl, container);
}

window.onload = function () {

    mineSweeper('#container', 10, 13, 20);
}