const neo4j = require('neo4j-driver');
require('dotenv').config();

let driver;

(async () => {
    const URI = 'neo4j://localhost';
    const USER = 'neo4j';
    const PASSWORD = process.env.DB_PASSWORD;

    try{
        driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
        const serverInfo = await driver.getServerInfo();
        console.log('Connection to the DB estabilished');
    }catch(err){
        console.log(`Connection error\n${err}\nCause: ${err.cause}`);
        await driver.close()
        return;
    }
})();

async function getUser(email) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (p:User {email : $email})-[:private]->(a:Profile) RETURN p.email as email, p.password as password, a',
        {email : email},
        {database : 'neo4j'}
    )

    let user = null;

    for(let record of records) {
        user = {email: "", password: "", uuid: ""};
        user.email = record.get('email');
        user.password = record.get('password');
        user.uuid = record.get('a').properties.uuid;
    }

    return user;
}

async function getProfile(uuid) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (p:Profile {uuid : $uuid}) RETURN p.name as name, p.foto as foto',
        {uuid : uuid},
        {database : 'neo4j'}
    )

    let user = null;

    for(let record of records) {
        user = {name: "", foto: "", uuid: ""};
        user.name = record.get('name');
        user.foto = record.get('foto');
        user.uuid = uuid;
    }

    return user;
}

async function setUser(email, password, name, birth) {
    const date = new Date().toISOString().split('T')[0];
    const rand = Math.floor(Math.random() * 4);
    let foto = "";
    switch (rand) {
        case 0:
            foto = "imgs/blueprofile.png";
            break;
        case 1:
            foto = "imgs/greenprofile.png";
            break;
        case 2:
            foto = "imgs/purpleprofile.png";
            break;
        default:
            foto = "imgs/redprofile.png";
            break;            
    }
    let {records, summary} = await driver.executeQuery(
        'CREATE (u:User { email: $email, password: $password})-[:private]->(p:Profile {name: $name, birthday: date($birth), created: date($date), foto: $foto})',
        { email : email, password: password, name: name, birth: birth, date : date, foto: foto},
        { database : 'neo4j'}
    );

    if(summary.counters.updates().nodesCreated > 0) {
        return true;
    }else{
        return false;
    }

}

async function setUserPrivateID(email, uuid) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:User)-[:private]->(b:Profile) WHERE a.email = $email SET b.uuid = $uuid return a',
        { email : email, uuid: uuid},
        { database : 'neo4j'}
    );

    return (summary.updateStatistics.updates().propertiesSet > 0);
}

async function setPosts(uuid, post) {
    const date = new Date().toISOString();
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:Profile) WHERE a.uuid = $uuid CREATE (a)-[:post]->(b:Poem {body: $body, title: $title, created: datetime($date)}) return b',
        {uuid : uuid, body : post.body, title : post.title, date: date},
        { database : 'neo4j' }
    );

    return (summary.counters.updates().nodesCreated > 0);
}

async function getRecentPosts() {

}

async function searchUsers(pattern) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:Profile) WHERE a.name CONTAINS $pattern OR a.uuid CONTAINS $pattern return a LIMIT 5',
        { pattern: pattern },
        { database : 'neo4j' }
    );

    let users = [];

    for(let record of records) {
        let userFound = {};
        userFound.name = record.get('a').properties.name;
        userFound.uuid = record.get('a').properties.uuid;
        userFound.foto = record.get('a').properties.foto;
        users.push(userFound);
    }

    return users;
}

async function seachPost(pattern) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:Poem) WHERE a.title CONTAINS $pattern OR a.body CONTAINS $pattern return a ORDER BY a.created LIMIT 10',
        { pattern: pattern },
        { database : 'neo4j' }
    );

    let posts = [];

    for(let record of records) {
        let postFound = {};
        postFound.title = record.get('a').properties.title;
        postFound.body = record.get('a').properties.body;
        posts.push(postFound);
    }

    return posts;
}

module.exports = {
    getUser,
    setUser,
    setUserPrivateID,
    setPosts,
    getRecentPosts,
    searchUsers,
    seachPost,
    getProfile
}