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
        'MATCH (p:User {email : $email}) RETURN p.email as email, p.password as password',
        {email : email},
        {database : 'neo4j'}
    )

    let user = null;

    for(let record of records) {
        user = {email: "", password: ""};
        user.email = record.get('email');
        user.password = record.get('password');
    }

    return user;
}

async function setUser(email, password) {
    let {records, summary} = await driver.executeQuery(
        'CREATE (u:User { email: $email, password: $password})',
        { email : email, password: password},
        { database : 'neo4j'}
    );

    if(summary.counters.updates().nodesCreated > 0) {
        return true;
    }else{
        return false;
    }

}

module.exports = {
    getUser,
    setUser
}