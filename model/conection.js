const neo4j = require('neo4j-driver');
require('dotenv').config();

let driver;

(async () => {
    const URI = process.env.NEO4J_URI;
    const USER = process.env.NEO4J_USERNAME;
    const PASSWORD = process.env.NEO4J_PASSWORD;

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
        'MATCH (p:Profile {uuid : $uuid}) RETURN p.name as name, p.foto as foto, p.background as background, p.created as created, p.description as description',
        {uuid : uuid},
        {database : 'neo4j'}
    )

    let user = null;

    for(let record of records) {
        user = {name: "", foto: "", uuid: "", background: "", created: "", description: ""};
        user.name = record.get('name');
        user.foto = record.get('foto');
        user.background = record.get('background');
        user.created = formatDate(record.get('created'));
        user.description = record.get('description') ? record.get('description') : null;
        user.uuid = uuid;
    }

    return user;
}

function formatDate(dataString) {
    const date = new Date(dataString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}/${month}/${year}`;
}

async function setUser(email, password, name, birth) {
    const date = new Date().toISOString().split('T')[0];
    const rand = Math.round(Math.random() * 4);
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
    const background = "imgs/backgrounds/default.jpg"
    let {records, summary} = await driver.executeQuery(
        'CREATE (u:User { email: $email, password: $password})-[:private]->(p:Profile {name: $name, birthday: date($birth), created: date($date), foto: $foto, background: $background})',
        { email : email, password: password, name: name, birth: birth, date : date, foto: foto, background: background},
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
        'MATCH (a:Profile) WHERE a.uuid = $uuid CREATE (a)-[:post]->(b:Poem {body: $body, title: $title, message: $message, created: datetime($date)}) return b',
        {uuid : uuid, body : post.body, title : post.title, message : post.message,  date: date},
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
        'MATCH (a:Poem)<-[:post]-(b:Profile) WHERE a.title CONTAINS $pattern OR a.body CONTAINS $pattern OR a.message CONTAINS $pattern return id(a) as id, a, b ORDER BY a.created DESC LIMIT 10',
        { pattern: pattern },
        { database : 'neo4j' }
    );

    let posts = [];

    for(let record of records) {
        let postFound = {};
        postFound.id = record.get('id');
        postFound.title = record.get('a').properties.title;
        postFound.message = record.get('a').properties.message;
        postFound.body = record.get('a').properties.body;
        postFound.autor = record.get('b').properties.name;
        postFound.foto = record.get('b').properties.foto;
        postFound.uuid = record.get('b').properties.uuid;
        posts.push(postFound);
    }

    return posts;
}

async function setFollow(origin, destiny) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (p:Profile {uuid: $org}), (b:Profile {uuid : $dest}) CREATE (p)-[:follow]->(b) RETURN p',
        { org: origin, dest: destiny },
        { database : 'neo4j' }
    );

    return (summary.counters.updates().relationshipsCreated > 0);
}

async function setFriendRequest(origin, destiny) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:Profile {uuid: $origin}), (b:Profile {uuid: $destiny}) CREATE (a)-[:friend_request]->(b)',
        { origin: origin, destiny: destiny },
        { database : 'neo4j' }
    );

    return (summary.counters.updates().relationshipsCreated > 0);
}

async function updateFriendRequest(destiny, origin) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:Profile {uuid: $destiny})<-[r:friend_request]-(b:Profile {uuid: $origin}) DELETE r CREATE (a)<-[:friend]-(b)',
        { destiny: destiny, origin: origin },
        { database: 'neo4j' }
    );

    return (summary.counters.updates().relationshipsCreated > 0);
}

async function deleteFriendRequest(destiny, origin) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (a:Profile {uuid: $destiny})<-[r:friend_request]-(b:Profile {uuid: $origin}) DELETE r',
        { destiny: destiny, origin: origin },
        { database: 'neo4j' }
    );

    return (summary.counters.updates().relationshipsDeleted > 0);
}

async function getPosts() {
    let {records, summary} = await driver.executeQuery(
        'MATCH (p:Poem)<-[:post]-(a:Profile) RETURN id(p) as id, p.title as title, p.body as body, p.message as message, a.name as autor, a.uuid as uuid, a.foto as foto ORDER BY p.created DESC LIMIT 15',
        {},
        { database: 'neo4j' }
    );

    let posts = [];

    for(let record of records) {
        let post = {
            id: 0,
            autor: "",
            uuid: "",
            foto: "",
            message: "",
            title: "",
            body: ""
        }

        post.id = record.get('id');
        post.autor = record.get('autor');
        post.uuid = record.get('uuid');
        post.foto = record.get('foto');
        post.message = record.get('message') ? record.get('message') : '';
        post.title = record.get('title');
        post.body = record.get('body');
        post.likes = await getLikes(post.id.low);
        posts.push(post);
    }

    //console.log(posts);

    return posts;
}

async function getLikes(id) {
    return 45;
}

async function countFollowers(uuid) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (p:Profile {uuid: $uuid})<-[r:follow]-(p2:Profile) return count(r) as num',
        { uuid : uuid},
        { database : 'neo4j'}
    );

    let num = 0;

    for(let record of records) {
        num = record.get('num') ? record.get('num') : 0;
    }

    return num;
}

async function getProfilePost(uuid) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (p:Profile {uuid: $uuid})-[:post]->(a:Poem) return id(a) as id, a.title as title, a.body as body, a.message as message, p.name as autor, p.uuid as uuid, p.foto as foto ORDER BY p.created LIMIT 15',
        { uuid : uuid },
        { database : 'neo4j' }
    );

    let posts = [];

    for(let record of records) {
        let post = {
            id: 0,
            autor: "",
            uuid: "",
            foto: "",
            message: "",
            title: "",
            body: ""
        }

        post.id = record.get('id').low;
        post.autor = record.get('autor');
        post.uuid = record.get('uuid');
        post.foto = record.get('foto');
        post.message = record.get('message');
        post.title = record.get('title');
        post.body = record.get('body')

        posts.push(post);
    }
    return posts;
}

async function getFeedbyUUID(uuid) {
    let {records, summary} = await driver.executeQuery(
        'MATCH (p2:Profile {uuid: $uuid})-[:follow]->(a:Profile)-[:post]->(p:Poem) return id(p) as id, p.title as title, p.body as body, p.message as message, a.name as autor, a.uuid as uuid, a.foto as foto ORDER BY p.created LIMIT 15',
        { uuid : uuid },
        { database : 'neo4j' }
    );
    console.log(uuid);

    let posts = [];

    for(let record of records) {
        let post = {
            id: 0,
            autor: "",
            uuid: "",
            foto: "",
            message: "",
            title: "",
            body: ""
        }

        post.id = record.get('id').low;
        post.autor = record.get('autor');
        post.uuid = record.get('uuid');
        post.foto = record.get('foto');
        post.message = record.get('message');
        post.title = record.get('title');
        post.body = record.get('body')

        posts.push(post);
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
    getProfile,
    setFollow,
    setFriendRequest,
    updateFriendRequest,
    deleteFriendRequest,
    getPosts,
    countFollowers,
    getProfilePost, 
    getFeedbyUUID
}