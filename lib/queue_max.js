function getTime() {
    return Math.floor(new Date().getTime()/1000);
}

var QueueMax = function(max, timeout) {
    var _stack = [];
    var _self = this;

    _self.add = function() {
        _stack.push(getTime());
        return _self;
    }

    _self.delete = function() {
        _stack.shift();
        return _self;
    }

    _self.length = function() {
        var current_time = getTime();

        var time;
        while(true) {
            time = _stack.shift();
            if(!time) {
                break;
            }
            else if(time+timeout>current_time) {
                _stack.unshift(time);
                break;
            }
        }

        return _stack.length;
    }

    _self.isFull = function() {
        return _self.length()>=max;
    }
}
exports.QueueMax = QueueMax;

