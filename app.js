const {
    checkUser,
    checkStage,
    insertStageMaster,
    getStageMaster,
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

app.get('/get-stage-master', async (req, res) => {
    try {
        const [stageMasterList] = await getStageMaster();
        res.send({
            status: "success",
            result: stageMasterList,
        })
    } catch (e) {
        res.send({
            status: "failed"
        })
    }
})

app.post('/insert-stage-master', async (req, res) => {
    const body = req.body;
    const { stage, sort, status } = body;

    try {
        const stageMasterInfo = await checkStage(stage);
        const hasCurrentStage = stageMasterInfo.length > 0;
        if (hasCurrentStage) {
            res.send({
                status: 'success',
                result: 'has_stage',
            })
            return;
        }

        const insertionResult = await insertStageMaster(stage, sort, status);
        const { affectedRows } = insertionResult;
        if (affectedRows) {
            res.send({
                status: 'success',
                result: 'inserted',
            })
            return;
        }

        res.send({
            status: 'failed',
            result: `failed params: stage: ${stage}, sort: ${sort}, status: ${status}`,
        })
        return;
    } catch (e) {
        res.send({
            status: 'failed',
            result: `error message: ${e}`,
        })
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})