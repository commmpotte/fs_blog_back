import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs'

import {
    registerValidation,
    loginValidation,
    postCreateValidation
} from './validations/validations.js'

import {
    checkAuth,
    handleValidationErrors
}
from './utils/index.js'
import {
    UserController,
    PostController
} from './controllers/index.js'

// mongodb+srv://admin:wwwwww@cluster0.z3xly8z.mongodb.net/blog?retryWrites=true&w=majority

mongoose.connect(process.env.MONGODB_URI).then(() => console.log('DB ok')).catch((err) => console.log('DB error', err))

const app = express()

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if(!fs.existsSync('uploads')){
            fs.mkdirSync('uploads')
        }
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({
    storage
})

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
    res.send('Hi there!')
})

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.get('/posts', PostController.getAll)
app.get('/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)


app.listen(process.env.PORT || 4444, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Server OK')
    }
})