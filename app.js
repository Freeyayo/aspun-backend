const {
    checkUser,
    checkStage,
    insertStageMaster,
    insertCategory,
    insertCategoryUserRoles,
    getStageMaster,
    getStageMasterByIds,
    checkCategory,
    getUserRoles,
    getUserRoleByIds,
    getCategory,
    getCategoryUserRoles,
    getParentCategoryById,
} = require('./database')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const { relationTree, rtchildren } = require('spurv');
const app = express()
const port = 8080

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const traverTree = (data, tree = []) => {
    if (data) {
        data.forEach(item => {
            if (item[rtchildren]) {
                item['children'] = traverTree(item[rtchildren]);
            }
            tree.push(item)
        })
    }
    return tree;
}

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

app.get('/get-dropdown-data', async (req, res) => {
    try {
        const [userRolesList] = await getUserRoles();
        const [stageMasterList] = await getStageMaster();
        const userRoles = userRolesList.map(userRole => {
            const { id, user_role } = userRole
            return { id, user_role };
        })
        const stageList = stageMasterList.map(stageData => {
            const { id, stage } = stageData;
            return { id, stage };
        })
        res.send({
            status: "success",
            result: {
                stageList,
                userRoles,
            },
        })
    } catch (e) {
        res.send({
            status: "failed",
            result: `error message: ${e}`,
        })
    }
})

app.get('/get-category', async (req, res) => {
    try {
        const [categoryList = []] = await getCategory();
        const [categoryUserRolesList] = await getCategoryUserRoles();
        const structuredCategoryTree = traverTree(relationTree(categoryList, { root: null, id: "category_id", parentId: "parent_category_id" }))
        const appendUserRolesAndStageMaster = (tree) => {
            const res = tree.map(item => {
                return new Promise((res, rej) => {
                    (async (item) => {
                        if (item.children) {
                            item.children = await appendUserRolesAndStageMaster(item.children);
                        }
                        const userRolesInfo = categoryUserRolesList.find(cuitem => cuitem.category === item.category);
                        const userRolesIds = userRolesInfo.user_roles_ids.split(',');
                        const userRoles = await getUserRoleByIds(userRolesIds);
                        const user_roles = userRoles[0].map(item => item.user_role);
                        const stageMasterIds = item.stage_ids.split(',');
                        const stageMasters = await getStageMasterByIds(stageMasterIds);
                        const stage_masters = stageMasters[0].map(item => item.stage)
                        res({ ...item, user_roles, stage_masters })
                    })(item)
                })
            })
            return res;
        }

        const unwrapNestedPromiseFields = (tree, unwrapped = []) => {
            unwrapped = tree.map(node => {
                return (async () => {
                    if (node.children) {
                        await Promise.all(node.children).then(async values => {
                            const _children = []
                            for await (let value of (unwrapNestedPromiseFields(values))) {
                                _children.push(value)
                            }
                            node.children = _children
                        })
                    }
                    if (node.then) {
                        node.then(res => {
                            return res;
                        })
                    }
                    return node;
                })(node)
            })
            return unwrapped;
        }

        Promise.all(appendUserRolesAndStageMaster(structuredCategoryTree)).then(async values => {
            const category = [];
            for await (let value of (unwrapNestedPromiseFields(values))) {
                category.push(value);
            }
            return category;
        }).then(categoryRes => {
            res.send({
                status: 'success',
                result: {
                    category: categoryRes
                }
            })
        })
    } catch (e) {
        res.send({
            status: "failed",
            result: `error message: ${e}`,
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

app.post("/insert-category", async (req, res) => {
    const body = req.body;
    const {
        category,
        categoryid,
        p_categoryid,
        sort,
        status,
        stagesIds,
        user_rolesIds
    } = body;
    try {
        const checkParentCategoryId = async (currentCategoryId, currentCategoryParentId) => {
            if (currentCategoryParentId === currentCategoryId) {
                return false;
            }
            const { parent_category_id } = await getParentCategoryById(currentCategoryParentId);
            if (parent_category_id) {
                if (parent_category_id === currentCategoryId) {
                    return false;
                }
                await checkParentCategoryId(currentCategoryId, parent_category_id)
            }
            return true;
        }

        const hasParentalCategoryId = !await checkParentCategoryId(categoryid, p_categoryid)
        if (hasParentalCategoryId) {
            res.send({
                status: 'failed',
                result: 'can not choose a parental id as categoryId ',
            })
            return;
        }
        const categoeyInfo = await checkCategory(category);
        const hasCategory = categoeyInfo.length > 0;
        if (hasCategory) {
            res.send({
                status: 'success',
                result: 'has_category',
            })
            return;
        }

        const categoryInsertionResult = await insertCategory(
            category,
            categoryid,
            stagesIds,
            p_categoryid,
            sort,
            status
        );
        const { affectedRows: categoryInsertionSuccess } = categoryInsertionResult;

        const userRolesInsertionResult = await insertCategoryUserRoles(
            category,
            user_rolesIds
        );
        const { affectedRows: userRolesInsertionSuccess } = userRolesInsertionResult;

        if (categoryInsertionSuccess && userRolesInsertionSuccess) {
            res.send({
                status: 'success',
                result: 'category inserted',
            })
            return;
        }

        res.send({
            status: 'failed',
            result: `failed params: category: ${category}, categoryid: ${categoryid}`,
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