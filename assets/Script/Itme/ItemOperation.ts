import Item from "./Item";
import { Utils } from "../Utils/Utils";
const { ccclass, property } = cc._decorator;
export enum ItemEventType {
    //Item 清除动画停止
    CLEAR_ANI_STOP = "CLEAR_ANI_STOP",
    //Item 出现动画停止
    APPEAR_ANI_STOP = "APPEAR_ANI_STOP"
}


@ccclass
export class ItemOperation extends cc.Component {

    /**
     * item的prefab
     */
    @property(cc.Prefab)
    public itemPrefab: cc.Prefab = null;
    /**
     * 地图的最大行数
     */
    @property
    public itemsRow = 0;
    /**
     * 地图的最大列数
     */
    @property
    public itemsColumn = 0;
    /**
     * 地图使用item的种类数
     */
    @property
    public itemsTypeCount = 0;

    //列行表示数值
    public items: Item[][] = [];
    //item事件分发类
    public itemEvent: cc.EventTarget;
    //开始画item的位置  后续可能需要开发为@property属性
    private startPos: cc.Vec2;
    //需要销毁的节点池;
    private eliPool: Item[];
    //等待消除判断池
    private eliJudgePool: Item[];
    //记录 item 出现的动画 是否播放完毕
    private appearEnd: boolean;
    //记录 item 清除的动画 是否播放完毕
    private clearEnd: boolean;
    //记录现在是否进入清除节点状态  如果为true update就会执行清除节点的逻辑
    private isCleared: boolean;

    onLoad() {
        //初始化各个状态
        this.appearEnd = true;
        this.clearEnd = true;
        this.isCleared = false;
        //初始化item 事件控制对象
        this.itemEvent = new cc.EventTarget();
        //初始化item出现的位置
        this.initItemStartPos();
        //初始化池
        this.eliPool = [];
        this.eliJudgePool = [];

        if (Item.MAX_TYPE_COUNT < this.itemsTypeCount) {
            this.itemsTypeCount = Item.MAX_TYPE_COUNT;
        }
        //初始化地图 item
        //列行表示数值 i表示列 j表示行
        for (let i = 0; i < this.itemsColumn; ++i) {
            this.items[i] = [];
            for (let j = 0; j < this.itemsRow; ++j) {
                let item = this.createItem(j, i);
            }
        }
        //监听动画事件
        let count = 0;
        let target = this;
        let appearAniEndFunc = function (tar) {
            ++count;
            if (count >= target.itemsRow * target.itemsColumn) {
                console.log("所有item appear动画播放完毕");
                target.appearEnd = true;
                console.log(target);
                target.itemEvent.off(ItemEventType.APPEAR_ANI_STOP, appearAniEndFunc);
            }
        }
        this.itemEvent.on(ItemEventType.APPEAR_ANI_STOP, appearAniEndFunc);
        //播放节点的出现动画,并判断是否有可消除的对象
        this.appearEnd = false;
        for (let i = 0; i < this.itemsColumn; ++i) {
            for (let j = 0; j < this.itemsRow; ++j) {
                this.judgeEli(this.items[i][j]);

            }
        }
        if (this.eliPool.length > 0)
            this.isCleared = true;
        console.log(this.eliPool);
    }

    private initItemStartPos() {
        -this.itemsRow * 50 / 2
        this.startPos = cc.v2(- this.itemsColumn * 50 / 2, -this.itemsRow * 50 / 2);
    }
    /**
     * 根据位置创建初始化节点
     * @param row 行
     * @param column 列
     */
    private createItem(row: number, column: number): Item {
        let itemNode = cc.instantiate(this.itemPrefab);
        let item = itemNode.getComponent("Item");
        item.itemRow = row;
        item.itemColumn = column;
        item.type = Math.floor(Math.random() * this.itemsTypeCount) + 1;
        item.ItemOperation = this;
        this.node.addChild(item.node);
        item.itemEvent = this.itemEvent;
        this.items[column][row] = item;
        this.initPos(item);
        item.appear();

        return item;
    }
    /**
     * 以item为中心 找四周是否有可以消除的对象
     * @param item 
     */
    private judgeEli(item: Item) {
        if (this.eliPool.indexOf(item) != -1) {
            return;
        }
        let rowArr = [];
        let columnArr = [];
        //以item为中心 横找
        for (let i = item.itemRow + 1; i < this.itemsRow; ++i) {
            if (item.type == this.items[item.itemColumn][i].type) {
                rowArr.push(this.items[item.itemColumn][i]);
            } else {
                break;
            }
        }
        for (let i = item.itemRow - 1; i >= 0; --i) {
            if (item.type == this.items[item.itemColumn][i].type) {
                rowArr.push(this.items[item.itemColumn][i]);
            } else {
                break;
            }
        }

        //以item为中心 竖找
        for (let i = item.itemColumn + 1; i < this.itemsColumn; ++i) {
            if (item.type == this.items[i][item.itemRow].type) {
                columnArr.push(this.items[i][item.itemRow]);
            } else {
                break;
            }
        }
        for (let i = item.itemColumn - 1; i >= 0; --i) {
            if (item.type == this.items[i][item.itemRow].type) {
                columnArr.push(this.items[i][item.itemRow]);
            } else {
                break;
            }
        }

        if (rowArr.length >= 2 || columnArr.length >= 2) {
            this.eliPool.push(item);
        }
        if (rowArr.length >= 2) {
            Utils.pushNoRepeat(this.eliPool, rowArr);
        }
        if (columnArr.length >= 2) {
            Utils.pushNoRepeat(this.eliPool, columnArr);
        }
    }

    private initPos(item: Item) {
        item.node.x = this.startPos.x + item.node.width * (item.itemColumn + 0.5);
        item.node.y = this.startPos.y + item.node.height * (item.itemRow + 0.5)
    }
    /**
     * 对象消除后 item下降的逻辑
     */
    private itemDrop() {

    }
    /**
     * 以池中的对象为中心判断是否有需要消除的对象
     */
    private judgeEliByPool() {

    }

    start() {
        for (let item of this.eliPool) {
            this.items[item.itemColumn][item.itemRow] = null;
            item.destroy();
        }
    }

    update(dt) {
        //判断现在是否是消除状态 如果是 就进行消除逻辑
        if (this.isCleared && this.appearEnd) {
            console.log(!this.isCleared && this.appearEnd);
            let target = this;
            let count = 0;
            let clearEndFunc = function () {
                ++count;
                if (count >= target.eliPool.length) {
                    console.log(clearEndFunc);
                    target.itemEvent.off(ItemEventType.CLEAR_ANI_STOP, clearEndFunc);
                    target.itemDrop();
                    for (let item of target.eliPool) {
                        item.destroy();
                    }
                    target.eliPool = [];
                }
            }
            this.itemEvent.on(ItemEventType.CLEAR_ANI_STOP, clearEndFunc);
            for (let item of this.eliPool) {
                item.clear();
            }
            this.isCleared = true;
        }
    }
}
