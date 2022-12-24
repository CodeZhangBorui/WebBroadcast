function Queue() {
    this.dataStore = [];
    this.push_back = push_back;
    this.pop = pop;
    this.front = front;
    this.back = back;
    this.toString = toString;
    this.empty = empty;
    this.length = length;
}

//向队末尾添加一个元素
function push_back(element) {
    this.dataStore.push(element);
}

//删除队首的元素
function pop() {
    return this.dataStore.shift();
}

function front() { //读取队首的元素
    return this.dataStore[0];
}
function back() { ////读取队末的元素
    return this.dataStore[this.dataStore.length - 1];
}

//显示队列内的所有元素
function toString() {
    var retStr = '';
    for (var i = 0; i < this.dataStore.length; ++i ) {
        retStr += this.dataStore[i] + '\n';
    }
    return retStr;
}

//队列是否为空
function empty() {
    if (this.dataStore.length == 0) {
        return true;
    } else {
        return false;
    }
}

function length() {
    return this.dataStore.length;
}