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

async function setUser(email, password, name, birth) {
    let {records, summary} = await driver.executeQuery(
        'CREATE (u:User { email: $email, password: $password})-[:private]->(p:Profile {name: $name, birthday: date($birth)})',
        { email : email, password: password, name: name, birth: birth},
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
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:Profile) WHERE a.uuid = $uuid CREATE (a)-[:post]->(b:Poem {body: $body, title: $title}) return b',
        {uuid : uuid, body : post.body, title : post.title},
        { database : 'neo4j' }
    );

    return (summary.counters.updates().nodesCreated > 0);
}

module.exports = {
    getUser,
    setUser,
    setUserPrivateID,
    setPosts
}