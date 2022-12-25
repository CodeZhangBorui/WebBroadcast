// 配置
const chunkSize = 4096; // 单个直播包大小
const sendInterval = 1000; // 直播包发送间隔
const recordInterval = 100; // 直播fps
// ========

const socket = io();
var params = {}
window.location.search.slice(1).split('&').forEach(v => {
    var _ = v.split('=');
    params[_[0]] = _[1];
})
if (!params.type || !params.bid || !params.name) window.location.pathname = '/';

if (params.type == 'create') {
    document.querySelector('#show').style = 'display: none;';
} else {
    document.querySelector('#broadcast').style = 'display: none;';
}

function getImg() {
    var player = document.getElementById('broadcast');
    var canvas = document.createElement('canvas');
    canvas.width = document.querySelector('#broadcast').videoWidth;
    canvas.height = document.querySelector('#broadcast').videoHeight;
    var ctx = canvas.getContext("2d");

    ctx.drawImage(player, 0, 0)

    return canvas.toDataURL(undefined, 0.5);
}

function start() {
    navigator.mediaDevices.getDisplayMedia({
        video: true
    }).then(stream => {
        var player = document.getElementById('broadcast')
        if ("srcObject" in player) {
            player.srcObject = stream;
        } else {
            player.src = window.URL.createObjectURL(stream);
        }
        player.onloadedmetadata = function(e) {
            player.play();
        }
    }).catch(err => {
        socket.emit('chat', `There's an error ocurrated in host. Error content:${err}. Can't broadcast!`)
    })

    var frames = [];
    setInterval(() => {
        var img = getImg();
        frames.push(img);
    }, recordInterval);
    setInterval(() => {
        for (let frameId = 0; frameId < frames.length; frameId++) {
            const img = frames[frameId];
            var chunks = [];

            var i = 0;

            while (i <= img.length - chunkSize) {
                chunks.push(img.slice(i, i + chunkSize));
                i += chunkSize;
            }

            for (let chunkId = 0; chunkId < chunks.length; chunkId++) {
                const chunk = chunks[chunkId];
                socket.emit('data', {
                    chunk,
                    chunkId,
                    frameId,
                    timestamp: (new Date()).valueOf(),
                    width: document.querySelector('#broadcast').videoWidth,
                    height: document.querySelector('#broadcast').videoHeight
                })
            }

        }
        frames = [];
    }, sendInterval);
}

socket.on("auth", () => {
    socket.emit("auth", {
        type: params.type,
        bid: params.bid,
        name: params.name
    });
})

socket.on("err_auth", () => {
    alert("Auth failed, Please rejoin!");
    window.location.pathname = '/'
});
socket.on("room_using", () => {
    alert("Room is in using, Please change broadcast id!");
    window.location.pathname = '/create'
})
socket.on("room_not_found", () => {
    alert("Room not found, Please check broadcast id!");
    window.location.pathname = '/join'
})
socket.on("authed", () => {
    alert("Successfully login, enjoy :)");
    if (params.type == 'create') {
        start();
    }
})
socket.on('user_join', (name) => {
    var dom = document.createElement("li");
    dom.innerText = name + ' join the room.';
    document.querySelector('#msg').appendChild(dom);
})
socket.on("user_leave", (data) => {
    var dom = document.createElement("li");
    dom.innerText = data.name + ' left the room. Reason: ' + data.reason;
    document.querySelector('#msg').appendChild(dom);
})
socket.on('message', (data) => {
    var dom = document.createElement("li");
    dom.innerText = data.name + ' : ' + data.msg;
    document.querySelector('#msg').appendChild(dom);
})

if (params.type == 'join') {
    var media = document.querySelector('#show');
    var frameQueue = [];
    var currentFrame = 0;

    socket.on('data', ({
        chunk,
        chunkId,
        frameId,
        timestamp,
        width,
        height
    }) => {
        if (chunkId == 0) {
            frameQueue[frameId] = chunk;
        } else {
            frameQueue[frameId] += chunk;
        }
    })
    setInterval(() => {
        currentFrame++;
        media.src = frameQueue[currentFrame] || '';
        if (currentFrame > Math.floor(sendInterval / recordInterval)) {
            currentFrame = 0;
        }
    }, recordInterval);
}

window.addEventListener("keypress", ({
    code
}) => {
    if (code == 'Enter') sendMsg();
})

function sendMsg() {
    var msg = document.querySelector('#chat');
    var v = msg.value;
    socket.emit('chat', v);
    var dom = document.createElement("li");
    dom.innerText = params.name + ' : ' + v;
    document.querySelector('#msg').appendChild(dom);
    msg.value = '';
}