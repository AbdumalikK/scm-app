import Router from 'koa-router'
import path from 'path'
import fs from 'fs'

const multer = require('koa-multer')

import userController from './controllers/user-controller'
import getUser from '../../handlers/get-user'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'
import checkHistoryId from './handlers/check-history-id'
import { Image } from '../image/models'
import { Video } from '../video/models'

const random = (length = 10) => (Array(length).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join(''))

// ----- post image -----
const imageStorage = multer.diskStorage({
	destination: async function (ctx, file, cb) {
        const user = await getUser(ctx)

        const imageDir = path.resolve(path.join(process.cwd() + `/uploads/images/${user._id}`))

        if (!fs.existsSync(imageDir)){
            fs.mkdirSync(imageDir, { recursive: true })
        }

        cb(null, `./uploads/images/${user._id}`)
    },

	filename: function (ctx, file, cb) { cb(null, `${random()}-${Date.now()}-${file.originalname}`) }
})

const imageFilter = (ctx, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') cb(null, true)
	else cb(null, false)	
}

const image = multer({
	storage: imageStorage,
	limits: { maxFileSize: 1024 * 1024 * 5 }, // 50mb
	fileFilter: imageFilter
})
// -----

// ----- post video -----
const videoStorage = multer.diskStorage({
	destination: async function (ctx, file, cb) {
        const user = await getUser(ctx)

        const videoDir = path.resolve(path.join(process.cwd() + `/uploads/videos/${user._id}`))

        if (!fs.existsSync(videoDir)){
            fs.mkdirSync(videoDir, { recursive: true })
        }

        cb(null, `./uploads/videos/${user._id}`) 
    },

	filename: function (ctx, file, cb) { cb(null, `${random()}-${Date.now()}-${file.originalname}`) }
})

const videoFilter = (ctx, file, cb) => {
	if (file.mimetype === 'video/webm' || file.mimetype === 'video/mp4' || file.mimetype === 'video/ogg') cb(null, true)
	else cb(null, false)
}

const video = multer({
	storage: videoStorage,
	limits: { maxFileSize: 1024 * 1024 * 100 }, // 1tb
	fileFilter: videoFilter
})
// -----

// ----- ava -----
const avaStorage = multer.diskStorage({
	destination: async function (ctx, file, cb) {
        const user = await getUser(ctx)

        const avaDir = path.resolve(path.join(process.cwd() + `/uploads/images/${user._id}/ava`))

        if (!fs.existsSync(avaDir)){
            fs.mkdirSync(avaDir, { recursive: true })
        }

        cb(null, `./uploads/images/${user._id}/ava`)
    },

	filename: function (ctx, file, cb) { cb(null, `${random()}-${Date.now()}-${file.originalname}`) }
})

const avaFilter = (ctx, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') cb(null, true)
	else cb(null, false)	
}

const ava = multer({
	storage: avaStorage,
	limits: { maxFileSize: 1024 * 1024 * 5 }, // 50mb
	fileFilter: avaFilter
})
// -----


const router = new Router({ prefix: '/profile' })

router
    .param('id', checkId())
    .param('historyId', checkHistoryId())
    
    // user
    .get('/', checkUser(), userController.getUser)
    .put('/:id', checkUser(), userController.updateUser)
    .delete('/:id', checkUser(), userController.deleteUser)

    // history
    .post('/history', checkUser(), userController.addHistory)
    .delete('/history/:historyId', checkUser(), userController.deleteHistory)

    // ava
    .post('/upload/ava', checkUser(), ava.any('file'), async function (ctx){
        const {
            state: { user },
            req: { files }
        } = ctx

        let ava = null

        try {
            for(let i = 0; i < files.length; i++){
                const newAva = await Image.create({
                    name: files[i].filename,
                    originalName: files[i].originalname,
                    data: files[i].path,
                    encoding: files[i].encoding,
                    size: files[i].size,
                    mimetype: files[i].mimetype,
                    creatorId: user._id
                })
    
                await newAva.save()
                ava = newAva
            }
        }catch(ex){
            ctx.status = 500
            return ctx.body = {
                success: false,
                message: ex.message
            }
        }

        return ctx.body = {
            success: true,
            message: {
                ava
            }
        }
    })

    // media
    .post('/upload/video', checkUser(), video.any('file'), async function (ctx){
        const {
            state: { user },
            req: { files }
        } = ctx

        const videos = []

        try {
            for(let i = 0; i < files.length; i++){
                const newVideo = await Video.create({
                    name: files[i].filename,
                    originalName: files[i].originalname,
                    data: files[i].path,
                    encoding: files[i].encoding,
                    size: files[i].size,
                    mimetype: files[i].mimetype,
                    creatorId: user._id
                })
    
                await newVideo.save()
                videos.push(newVideo)
            }
        }catch(ex){
            ctx.status = 500
            return ctx.body = {
                success: false,
                message: ex.message
            }
        }
        

        return ctx.body = {
            success: true,
            message: {
                videos
            }
        }
    })
    .post('/upload/image', checkUser(), image.any('file'), async function (ctx){
        const {
            state: { user },
            req: { files }
        } = ctx

        const images = []

        try {
            for(let i = 0; i < files.length; i++){
                const newImage = await Image.create({
                    name: files[i].filename,
                    originalName: files[i].originalname,
                    data: files[i].path,
                    encoding: files[i].encoding,
                    size: files[i].size,
                    mimetype: files[i].mimetype,
                    creatorId: user._id
                })
    
                await newImage.save()
                images.push(newImage)
            }
        }catch(ex){
            ctx.status = 500
            return ctx.body = {
                success: false,
                message: ex.message
            }
        }

        return ctx.body = {
            success: true,
            message: {
                images
            }
        }
    })

export default router.routes()