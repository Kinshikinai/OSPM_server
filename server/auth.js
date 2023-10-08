import { body } from 'express-validator';

export const regVal = [
    body('login', 'Login minimum length is 3').isLength({min: 3}),
    body('password', 'Password minimum length is 8').isLength({min: 8}),
    body('email', 'Email max length is 255').isLength({max: 255}),
    body('email', 'Not an email').isEmail(),
    body('phone', 'Not a mobile phone').isMobilePhone()
]