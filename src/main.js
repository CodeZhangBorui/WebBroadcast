import chalk from 'chalk';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { getPageFilePath, __staticPath } from './lib/path.js';

const app = express();
const server = http.createServer(app);
const port = 3000;
const io = new Server(server);

io.on('connection', (socket) => {
    console.log(chalk.grey('出现了新的连接'));
    socket.on('auth', (payload) => {
        console.log(payload);
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
app.post('/b', (req, res) => {
    res.sendFile(getPageFilePath('broadcast'));
});

server.listen(port, () => {
    console.log(chalk.cyan('App is listening on http://localhost:3000/'));
});