/*发布订阅模式*/
function Event() {
    this.events = {};
}
Event.prototype = {
    // 订阅事件
    on: function(attr, callback) {
        if (this.events[attr]) {
            this.events[attr].push(callback);
        } else {
            this.events[attr] = [callback];
        }
    },
    // 触发事件(发布事件)
    emit: function(path) {
        let keys = path.split(".");
        let depPaths = keys.map(function(key, index) {
            if (index == 0) {
                return key;
            } else {
                let str = "";
                while (index--) {
                    str = keys[index] + "." + str;
                }
                return str + key;
            }
        });
        depPaths.forEach(function(depPath) {
          let fns = this.events[depPath];
          if (fns) {
            fs.forEach(function(fn) {
              fn && fn(function  (depPath) {
                path = depPath.split(".");
                let val = this.data;
                path.forEach(function(elem) {
                  val = val[elm];
                });
                return val;
              });
            });
          }
        });
    }
};
/*
  监听一个对象的变化,观察器
*/
function Observer(data) {
    this.data = data;
    this.walk(data);
    this.eventsBus = new Event();
}

let p = Observer.prototype;

p.walk = function(obj, paths) {
    let val;
    for (var key in obj) {
        //forin循环会循环出所有可枚举类型，所以需要hasOwnProperty过滤出这个对象本身的属性
        if (obj.hasOwnProperty(key)) {
            val = obj[key];
            let path = "";
            if (!paths) {
                path = key;
            } else {
                path = paths + key;
            }

            //判断是否遍历到最底层，继续new Observer
            if (typeof val === 'object') {
                this.walk(val, path + ".");
            }
            this.convert(obj,key, val, path);
        }
    }
};

p.convert = function(obj,key, val, paths) {
    /*Object.defineProperty(obj, prop, descriptor)
  obj:需要定义属性的对象。prop:需定义或修改的属性的名字。
  descriptor:将被定义或修改的属性的描述符。*/
    let _this = this; //保存this指针
    Object.defineProperty(obj, key, {
        enumerable: true, //能出现在对象的枚举属性中
        configurable: true, //能被删除
        get: function() {
            console.log('你访问了' + key);
            return val;
        },
        set: function(newVal) {
            if (newVal === val)
                return;
            val = newVal;
            //更改后发布事件
            _this.eventsBus.emit(paths);
            if (typeof newVal === 'object') {
                if (paths) {
                    paths = paths + ".";
                }
                _this.walk(newVal, paths);
            }
            console.log('你设置了' + key);
            console.log('新的' + key + '=' + newVal);
        }
    })
};

p.$watch = function(attr, callback) {
    this.eventsBus.on(attr, callback);
}

let app = new Observer({
    name: {
        firstName: "yu",
        lastName: "weijie"
    },
    age: 25
});

app.$watch('name', function(newName) {
    console.log('我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。');
});
