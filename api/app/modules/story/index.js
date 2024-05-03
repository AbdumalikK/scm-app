import Router from 'koa-router'
import path from 'path'
import fs from 'fs'

const multer = require('koa-multer')

import storyController from './controllers/story-controller'
import getUser from '../../handlers/get-user'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'
import checkLikeId from './handlers/check-like-id'
import { Image } from '../image/models'
import { Video } from '../video/models'
import { STORY } from './constants'

const random = (length = 10) => (Array(length).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join(''))


// ----- post image -----
const imageStorage = multer.diskStorage({
	destination: async function (ctx, file, cb) {
        const user = await getUser(ctx)

        const imageDir = path.resolve(path.join(process.cwd() + `/uploads/images/${user._id}/story`))

        if (!fs.existsSync(imageDir)){
            fs.mkdirSync(imageDir, { recursive: true })
        }

        cb(null, `./uploads/images/${user._id}/story`)
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

        const videoDir = path.resolve(path.join(process.cwd() + `/uploads/videos/${user._id}/story`))

        if (!fs.existsSync(videoDir)){
            fs.mkdirSync(videoDir, { recursive: true })
        }

        cb(null, `./uploads/videos/${user._id}/story`) 
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


const router = new Router({ prefix: '/story' })

router
    .param('id', checkId())
    .param('likeId', checkLikeId())
    
    .get('/', checkUser(), storyController.getStories)
    .post('/', checkUser(), storyController.addStory)
    // .put('/:id', checkUser(), storyController.updateStory)
    .delete('/:id', checkUser(), storyController.deleteStory)
    .post('/:id/like', checkUser(), storyController.updateStoryLike)
    .delete('/:id/like/:likeId', checkUser(), storyController.deleteStoryLike)

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
                    creatorId: user._id,
                    comment: STORY
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
                    creatorId: user._id,
                    comment: STORY
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