export class Utils {
    static pushNoRepeat(out: any[], add: any) {
        if (add.length) {
            for (let i = 0; i < add.length; ++i) {
                if (out.indexOf(add[i]) == -1)
                    out.push(add[i]);
            }
        } else {
            if (out.indexOf(add) == -1)
                out.push(add);
        }
    }
}