import express from 'express';
import cors from 'cors';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import db from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import checkAuth from './checkAuth.js';

import { regVal } from './auth.js';

const port = process.env.port || 3009;
const jwt_key = process.env.jwt_key;

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    try {
        res.json({
            server_is_working: true
        });
    } catch (err) {
        res.send('ERROR ON ROUTE /');
        console.log('ERROR ON ROUTE /: ', err);
    }
});

app.post('/reg', regVal, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json(errors.array());
        }
        else {
            switch(req.body.role) {
                case 0:
                await db.query('SELECT * FROM `participants` WHERE email=? OR phone=? OR login=?', [req.body.email, req.body.phone, req.body.login])
                .then(async result => {
                    if(result[0].length === 0) {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(req.body.password, salt);
                        await db.query('INSERT INTO `participants`(`login`, `passwordHash`, `fname`, `sname`, `phone`, `email`) VALUES (?, ?, ?, ?, ?, ?)', [req.body.login, hashedPassword, req.body.fname, req.body.sname, req.body.phone, req.body.email])
                        .then(async result => {
                            res.status(200).json({
                                success: true,
                                message: "User registered successfully!"
                            });
                        })
                        .catch(err => {
                            console.log('!!!POST /reg query 11 ERROR!!!: ' + err);
                        });
                    }
                    else {
                        res.status(409).json({
                            success: false,
                            message: "User already registered!"
                        });
                    }
                })
                .catch(err => {
                    console.log('!!!POST /reg query 1 ERROR!!!: ' + err);
                });
                break;
                case 1:
                    db.query('SELECT * FROM `creators` WHERE email=? OR phone=? OR login=?', [req.body.email, req.body.phone, req.body.login])
                    .then(async result => {
                        if(result[0].length === 0) {
                            const salt = await bcrypt.genSalt(10);
                            const hashedPassword = await bcrypt.hash(req.body.password, salt);
                            db.query('INSERT INTO `creators`(`login`, `passwordHash`, `fname`, `sname`, `phone`, `email`) VALUES (?, ?, ?, ?, ?, ?)', [req.body.login, hashedPassword, req.body.fname, req.body.sname, req.body.phone, req.body.email])
                            .then(async result => {
                                res.status(200).json({
                                    success: true,
                                    message: "User registered successfully!"
                                });
                            })
                            .catch(err => {
                                console.log('!!!POST /reg query 21 ERROR!!!: ' + err);
                            });
                        }
                        else {
                            res.status(409).json({
                                success: false,
                                message: "User already registered!"
                            });
                        }
                    })
                    .catch(err => {
                        console.log('!!!POST /reg query 2 ERROR!!!: ' + err);
                    });
                break;
            }
        }
    } catch (err) {
        res.send('ERROR ON ROUTE /reg');
        console.log('ERROR ON ROUTE /reg: ', err);
    }
});

app.post('/login', async (req, res) => {
    try {
        switch(req.body.role) {
            case 0:
                await db.query('SELECT * FROM `participants` WHERE login=?', [req.body.login])
                .then(async result => {
                    if (result[0].length !== 0) {
                        if (result[0][0].approved) {
                            await db.query('SELECT passwordHash FROM `participants` WHERE login=?', [req.body.login])
                            .then(async result2 => {
                                const isRightPassword = await bcrypt.compare(req.body.password, result2[0][0].passwordHash);
                                if (isRightPassword) {
                                    const token = jwt.sign({
                                        id: result[0][0].id,
                                        role: 0
                                    },
                                    jwt_key,
                                    {
                                        expiresIn: '1d'
                                    })
                                    res.status(200).json({
                                        token: token,
                                        success: true,
                                        msg: 'Logged in'
                                    });
                                }
                                else {
                                    res.status(401).json({
                                        msg: 'Wrong password or login'
                                    });
                                }
                            })
                            .catch(err => {
                                console.log('!!!POST /login query 2 ERROR!!!: ' + err);
                            })
                        }
                        else {
                            res.status(409).json({
                                success: false,
                                message: 'Unapproved yet account'
                            });
                        }
                    }
                    else {
                        res.status(401).json({
                            message: "Invalid credentials"
                        });
                    }
                })
                .catch(err => {
                    console.log('!!!POST /login query 1 ERROR!!!: ' + err);
                });
                break;
            case 1:
                await db.query('SELECT * FROM `creators` WHERE login=?', [req.body.login])
                .then(async result => {
                    if (result[0].length !== 0) {
                        if (result[0][0].approved) {
                            await db.query('SELECT passwordHash FROM `creators` WHERE login=?', [req.body.login])
                            .then(async result2 => {
                                const isRightPassword = await bcrypt.compare(req.body.password, result2[0][0].passwordHash);
                                if (isRightPassword) {
                                    const token = jwt.sign({
                                        id: result[0][0].id,
                                        role: 1
                                    },
                                    jwt_key,
                                    {
                                        expiresIn: '1d'
                                    })
                                    res.status(200).json({
                                        token: token,
                                        success: true,
                                        msg: 'Logged in'
                                    });
                                }
                                else {
                                    res.status(401).json({
                                        msg: 'Wrong password or login'
                                    });
                                }
                            })
                            .catch(err => {
                                console.log('!!!POST /login query 2 ERROR!!!: ' + err);
                            })
                        }
                        else {
                            res.status(409).json({
                                success: false,
                                message: 'Unapproved yet account'
                            });
                        }
                    }
                    else {
                        res.status(401).json({
                            message: "Invalid credentials"
                        });
                    }
                })
                .catch(err => {
                    console.log('!!!POST /login query 1 ERROR!!!: ' + err);
                });
                break;
        }
    } catch (err) {
        res.send('ERROR ON ROUTE /login');
        console.log('ERROR ON ROUTE /login: ', err);
    }
});

app.post('/create', checkAuth, async (req, res) => {
    try {
        await db.query('INSERT INTO `projects`(`name`, `skills`, `description`, `creator_id`) VALUES (?,?,?,?)', [req.body.name, req.body.skills, req.body.desc, req.body.id])
        .then(async result => {
            if (result[0].affectedRows !== 0) {
                res.status(200).json({
                    success: true
                });
            }
        })
        .catch(err => {
            res.status(400).send('ERROR ON ROUTE /create');
            console.log('ERROR ON ROUTE /create: ', err);
        });
    } catch (err) {
        res.status(400).send('ERROR ON ROUTE /create');
        console.log('ERROR ON ROUTE /create: ', err);
    }
})

app.get('/skills', async (req, res) => {
    try {
        await db.query('SELECT * FROM `skills`')
        .then(async result => {
            res.status(200).json(result[0]);
        })
        .catch(err => {
            res.send('ERROR ON ROUTE query /create');
            console.log('ERROR ON ROUTE query /create: ', err);
        });
    } catch (err) {
        res.send('ERROR ON ROUTE /create');
        console.log('ERROR ON ROUTE /create: ', err);
    }
})

app.listen(port, err => {
    if (err) {
        return console.log(err);
    }
    else {
        console.log(`Server: http://localhost:${port}`)
    }
});