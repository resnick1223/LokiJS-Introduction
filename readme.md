<a href="http://lokijs.org/#/"><img src="https://resnick.files.wordpress.com/2017/06/screenshot-lokijs-org-1497884131557.png" alt="" width="600" class="aligncenter wp-image-722" /></a>

## 前言
在開發一些小型應用的時候，常會希望能有類似MongoDB的小型資料庫可以使用，因此有時候自己也會模仿MongoDB的API，設計一個類似的資料儲存類別來使用。
找了一些in-memory的資料庫，發現了[LokiJS](http://lokijs.org/#/)這個好用的輕量化輕量化的in-memory資料庫，不但可在Server端執行，也可在瀏覽器端執行，並支援LocalStorage與檔案，執行速度快，且也有類似MongoDB的API，讓我一用就愛上，由於中文的說明不多，因此本文就[LokiJS](http://lokijs.org/#/)做一個簡單的使用入門介紹，詳細的功能請參考[官方文件](https://rawgit.com/techfort/LokiJS/master/jsdoc/Loki.html)。

<!--more-->

## 安裝LokiJS
- 透過npm: `npm install lokijs`
- 透過bower: `bower install lokijs`

## 初始化資料庫
初始化資料庫物件僅需使用loki的建構式 `new loki('資料庫名稱', 初始化選項)`
初始化選項可以參考 [官方文件](https://rawgit.com/techfort/LokiJS/master/jsdoc/Loki.html)
```javascript
var loki = require('lokijs'),
    db = new loki('easy-notes.db');
```

## 儲存資料庫
- Loki可將記憶體的資料庫保存到檔案中，使用 `db.saveDatabase();` 即可。
- CRUD操作是在記憶體中執行，若*沒有呼叫* `saveDatabase` 則CRUD操作結果不會被保存。
- 為了避免頻繁地寫入檔案，應該在初始化選項中，啟用 `autosave` 和 `autosaveInterval` 設定以固定的時間來自動保存檔案。

範例：每隔1000ms自動存檔
```javascript
var loki = require('lokijs'),
    db = new loki('easy-notes.db', {
        autosave: true,
        autosaveInterval: 1000
    });
```

## 讀取和加入Collection
- 讀取Collection: `db.getCollection('Collection Name')`
- 加入Collection: `db.addCollection('Collection Name')`
- 取得Collection的內容陣列: `Collection.data`

範例：讀取notes資料集，若不存在，則新增一個
```javascript
var notes = db.getCollection('notes');
if(!notes)
    notes = db.addCollection('notes');

```

## 讀取已存檔的資料庫
- 初始化資料庫後，可以讀取原本保存的檔案到記憶體中，使用 `db.loadDatabase();`
- loadDatabase 是非同步作業，因此不能在 loadDatabase() 後立即執行getCollection 等操作。
- 若需在 loadDatabase 後執行 getCollection 等操作，則需使用callback。

範例：
```javascript
var loki = require('lokijs'),
    db = new loki('easy-notes.db', {
        autosave: true,
        autosaveInterval: 1000
    });
db.loadDatabase({}, function(error){
    if(!error){
        var notes = db.getCollection('notes');
        if(!notes)
            notes = db.addCollection('notes');
    }
});
```
可將loadDatabase加入初始化選項中

```javascript
var loki = require('lokijs'),
    notes,
    db = new loki('easy-notes.db', {
        autosave: true,
        autosaveInterval: 1000,
        autoload: true,
        autoloadCallback: function (error) {
            if (!error) {
                notes = db.getCollection('notes');
                if (!notes)
                    notes = db.addCollection('notes');
            }
        }
    });
```


## CRUD操作
本段用一個簡單的資料庫來儲存記事，記事的欄位為
|欄位|型別|說明|
|---|---|---|
|color|string|記事的顏色|
|text|string|記事的內容|

### Create
使用 `insert` 來新增資料

```javascript
notes.insert({
    color: 'red',
    text: '這是第一則筆記'
});
```

### Read
讀取和查詢資料有下列方法：
- `find(QueryObject)`: 得到查詢結果的陣列
- `findOne(QueryObject)`: 得到查詢結果的第一筆物件
- `findObject(QueryObject)`: 結果類似於findOne
- `Collection.data`: 取得資料集所有物件

使用find加上查詢條件，得到的是陣列
```javascript
notes.find({color: 'red'});

[{
    color: 'red',
    text: '這是第一則筆記',
    meta: {
        revision: 0,
        created: 1497926010359,
        version: 0,
    },
    '$loki': 1
}];
```

不設定條件，則得到資料及全部資料的陣列
```javascript
notes.find({});
 
[{
    color: 'red',
    text: '這是第一則筆記',
    meta: {
        revision: 0,
        created: 1497926010359,
        version: 0,
    },
    '$loki': 1
}];
```

notes.find({}) 等同於 notes.data


findOne與findObject得到的是物件，可將其保存到變數，以便於Update與Delete
```javascript
var note = notes.findOne({color: 'red'});

{
    color: 'red',
    text: '這是第一則筆記',
    meta: {
        revision: 0,
        created: 1497926010359,
        version: 0,
    },
    '$loki': 1
};
```

其他查詢方法，可以參閱官方文件的[Query Examples](https://rawgit.com/techfort/LokiJS/master/jsdoc/tutorial-Query%20Examples.html)

### Update
直接修改findOne或findObject結果的物件
透過 `資料集.update(結果物件)` 即可更新資料
```javascript
var note = notes.findOne({color: 'red'});
note.color = 'blue';
notes.update(note);

// 更新後，Loki會追加updated屬性與修改revision
{ color: 'blue',
    text: '這是第一則筆記',
    meta:
     { revision: 1,
       created: 1497926010359,
       version: 0,
       updated: 1497926354801 },
    '$loki': 1 
}
```

### Delete
透過 `資料集.remove(結果物件)` 即可刪除資料
```javascript
var note = notes.findOne({color: 'red'});
notes.remove(note);
```

## 結論
由這些例子來看，應該可以看出LokiJS的操作是相當簡潔的，除此之外，LokiJS也提供了View，可將查詢預先設計好用View來當作資料集，亦可透過Index加速查詢的結果，就功能面上已經是非常完整的資料庫了。下一回，將分享簡單的代辦事項作為LokiJS的資料庫練習。

## 範例下載

```
git clone https://github.com/resnick1223/LokiJS-Introduction.git
cd LokiJS-Introduction
npm install
node index.js
```

## 參考資料
- https://rawgit.com/techfort/LokiJS/master/jsdoc/index.html
- https://phchu.blogspot.tw/2016/05/basic-crud-operations-in-lokijs.html