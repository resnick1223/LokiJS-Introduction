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

                // 新增一則筆記
                notes.insert({
                    color: 'red',
                    text: '這是第一則筆記',
                });

                // 使用find，得到查詢結果的陣列
                console.log('notes.find({}) = ');
                console.log(notes.find({}));

                // notes.find({}) 等同於 notes.data
                console.log('notes.data = ');
                console.log(notes.data);

                // notes.findOne() 查詢第一筆符合條件的資料
                console.log('notes.findOne = ');
                console.log(notes.findOne({
                    color: 'red'
                }));


                var note = notes.findObject({
                    color: 'red'
                });

                // notes.findObject() 結果等同於 notes.findOne()
                console.log('notes.findObject = ');
                console.log(note);

                // 更新資料
                console.log('note.color = "blue"');
                note.color = 'blue';

                console.log('notes.update(note) =>');
                notes.update(note);
                console.log(notes.find({}));

                // 刪除資料
                console.log('notes.remove(note) =>');
                notes.remove(note);
                console.log(notes.find({}));

            }
        }
    });