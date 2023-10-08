import mysql from "mysql2/promise";

var db = mysql.createPool({
    host: "localhost",
    user: "era",
    password: "bruh",
    database: 'OSPM'
});

export default db;