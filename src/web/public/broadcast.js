//需和 queue.js 一起引用

class Broadcast {
    constructor() {
        this.available = false; // 变量：是否可用
        this.stream = null; // 内部对象：数据流
    }

    async start() {
        if (this.available) return;
        try {
            this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        } catch {
            console.warn("User canceled the recorder.")
            return false;
        }
        this.available = true;
        return true;
    }

    pause() {
        if (!this.available) return;
        this._stream = this.stream.clone();
        this.stream = null;
        this.available = false;
    }

    reseum() {
        if (this.available) return;
        this.stream = this._stream.clone();
        this._stream = null;
        this.available = true;
    }
}