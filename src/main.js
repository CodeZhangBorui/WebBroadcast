import chalk from 'chalk';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { getPageFilePath, __staticPath } from './lib/path.js';

const app = express();
const server = http.createServer(app);
const port = 3000;
const io = new Server(server);

/**
 * Record<bid:string, sockets:socket[]>
 */
var rooms = [];

io.on('connection', (socket) => {
    console.log(chalk.grey('New connection found'));

    var isAuthed = false;

    socket.emit('auth');

    socket.on('auth', (payload) => {
        /**
         * payload内容
         * type 类型 create或join
         * bid 广播id
         * name 加入者名称
         */

        if (!payload.type || !payload.bid || !payload.name) {
            socket.emit('err_auth');
            return;
        }
        if (isAuthed) return;
        if (payload.type == 'create') {
            if (rooms.includes(payload.bid)) {
                socket.emit('room_using');
                return;
            }
            rooms.push(payload.bid);
        }
        if (payload.type == 'join' && !rooms.includes(payload.bid)) {
            socket.emit('room_not_found');
            return;
        }

        socket.join(payload.bid);
        socket.to(payload.bid).emit('user_join', payload.name);
        socket.emit('user_join', payload.name);

        socket.on('data', (data) => {
            if (payload.type != 'create') return;
            socket.to(payload.bid).emit('data', data);
        });
        socket.on('chat', (msg) => {
            socket.to(payload.bid).emit('message', { msg, name: payload.name });
        });
        socket.on('ping', () => {
            socket.emit('pong', (new Date()).valueOf());
        });
        socket.on('disconnect', (reason) => {
            console.log(chalk.grey(payload.name + ' disconnect'));

            var emitData = { reason, name: payload.name };
            if (payload.type == 'create') {
                emitData.quit = true;
                delete rooms[rooms.indexOf(payload.bid)];
            }

            socket.to(payload.bid).emit('user_leave', emitData);
        });

        socket.emit('authed');
    });
});

app.use(express.static(__staticPath));
app.get('/', (req, res) => {
    res.sendFile(getPageFilePath('index'));
});
app.get('/join', (req, res) => {
    res.sendFile(getPageFilePath('join'));
});
app.get('/create', (req, res) => {
    res.sendFile(getPageFilePath('create'));
});
app.get('/b', (req, res) => {
    res.sendFile(getPageFilePath('broadcast'));
});

server.listen(port, () => {
    console.log(chalk.cyan('App is listening on http://localhost:3000/'));
});