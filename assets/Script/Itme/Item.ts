import { ItemEventType, ItemOperation } from "./ItemOperation";
const { ccclass, property } = cc._decorator;
@ccclass
export default class Item extends cc.Component {
    @property(cc.SpriteFrame)
    sprite1 = null;
    @property(cc.SpriteFrame)
    sprite2 = null;
    @property(cc.SpriteFrame)
    sprite3 = null;
    @property(cc.SpriteFrame)
    sprite4 = null;
    @property(cc.SpriteFrame)
    sprite5 = null;

    public static get MAX_TYPE_COUNT(): number {
        return 5;
    }

    private _type: number = 1;
    set type(type: number) {
        this._type = type;
        let sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame = this["sprite" + type];
    }

    get type(): number {
        return this._type;
    }

    private animation: cc.Animation;

    public itemEvent: cc.EventTarget;

    public itemRow = 0;
    public itemColumn = 0;

    public ItemOperation: ItemOperation;

    //节点是否下降
    public isDrop: boolean = false;

    public appear() {
        this.animation.on("stop", this.onAppearStop, this);
        let state = this.animation.play("itemAppear");
        return;
    }

    private onAppearStop() {

        this.itemEvent.emit(ItemEventType.APPEAR_ANI_STOP, this);
        this.animation.off("stop", this.onAppearStop, this);
    }

    public clear() {
        this.animation.on("stop", this.onClearStop, this);
        this.animation.play("itemClear");
    }

    public onClearStop() {
        this.itemEvent.emit(ItemEventType.CLEAR_ANI_STOP, this);
        this.animation.off("stop", this.onClearStop, this);
    }

    public drop() {
        
    }

    onLoad() {
        this.animation = this.getComponent(cc.Animation);
    }

    start() {
    }

    onDestroy() {
        this.animation.off("stop", this.onAppearStop, this)
    }
    update (dt) {

    }
}
