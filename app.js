const {
    checkUser,
} = require('./database')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express()
const port = 8080

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/login', async (req, res) => {
    const body = req.body;
    const { username, password } = body;

    const hasUser = await checkUser(username, password);
    if (hasUser) {
        res.send({
            status: "success"
        });
    } else {
        res.send({
            status: "failed"
        });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})