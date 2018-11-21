const express = require('express');

const app = express();

require('express-ws')(app);

app.use(express.static('build'));


app.use(function (req, res, next) {
    if (req.path !== '/publish') {
        next();
        return;
    }
    if (!req.query.target) {
        res.sendStatus(400)
        return;
    }
    data = [];
    req.on('data', function (chunk) {
        data = [...data, ...chunk]
    })
    req.on('end', function () {
        req.rawBody = new Uint8Array(data);
        next();
    });
});



const createRandomString = function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



let wsPool = [];



app.ws('/ws', function (ws, req) {
    do {
        ws.id = createRandomString(30);
    } while (wsPool.find(w => w.id === ws.id))

    ws.send(ws.id);

    wsPool.push(ws);
    const remove = () => {
        wsPool = wsPool.filter(w => w.id != ws.id);
    }

    ws.onerror = remove;
    ws.onclose = remove;
});


app.post('/publish', (req, res) => {
    const ws = wsPool.find(w => w.id === req.query.target)
    if (ws) {
        ws.send(req.rawBody)
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
})


app.use((req, res) => {
    res.sendStatus(404);
})

app.listen(3001);