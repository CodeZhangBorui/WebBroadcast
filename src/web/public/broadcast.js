//需和 queue.js 一起引用

function Broadcast() {
    this.start = start; // 函数：开始
    this.getChunk = getChunk; // 函数：从帧缓存区获得帧
    this.stop = stop; // 函数：结束

    this.available = false; // 变量：是否可用
    this.chunkCacheLength = 300; // 变量：设置帧缓存区大小（60fps, 300=5s）
    this.replayUrl = ""; // 变量：最终直播完毕后下载直播回放的 URL

    this.chunkQueue = new Queue(); // 内部对象：帧缓存区
    this.stream = null; // 内部对象：数据流
    this.mime = null; // 内部对象：媒体类别
    this.srcRecorder = null; // 内部对象：屏幕录制器
    this.replayData = []; // 内部对象：回放数据储存
}

async function start() {
    try {
        this.stream = await navigator.mediaDevices.getDisplayMedia({video:true});
    } catch {
        console.warn("User canceled the recorder.")
        return false;
    }
    this.mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") ? "video/webm; codecs=vp9" : "video/webm";
    this.scrRecorder = new MediaRecorder(this.stream, {mimeType:this.mime});
    this.scrRecorder.addEventListener("dataavailable", function(e) {
        this.replayData.push(e.data);
        this.chunkQueue.push_back(e.data);
        if(chunkQueue.length > this.chunkCacheLength) {
            chunkQueue.pop();
        }
    });
    this.scrRecorder.addEventListener("stop", function() {
        this.available = false;
        var blob = new Blob(this.replayData, {type:this.replayData[0].type});
        this.replayUrl = URL.createObjectURL(blob);
    })
    this.scrRecorder.start();
    this.available = true;
    return true;
}

function getChunk() {
    return this.chunkQueue.front();
}

function stop() {
    this.scrRecorder.stop();
    this.available = false;
    var blob = new Blob(this.replayData, {type:this.replayData[0].type});
    this.replayUrl = URL.createObjectURL(blob);
}