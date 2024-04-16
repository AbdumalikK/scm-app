import Router from 'koa-router'

const multer = require('koa-multer')

import userController from './controllers/user-controller'
import checkUser from '../../handlers/checkUser'
import checkUserId from './handlers/check-user-id'
import checkCreatorId from './handlers/check-creator-id'
import checkId from './handlers/check-id'
import checkType from './handlers/check-type'
import checkUserBlockId from './handlers/check-user-block-id'
import { Image } from '../image/models'
import { Video } from '../video/models'

const random = (length = 10) => (Array(length).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join(''))

// ----- post image -----
const imageStorage = multer.diskStorage({
	destination: function (ctx, file, cb) {
        const {  state: { user: { _id } } } = ctx

        cb(null, `./uploads/images/${_id}`)
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
	destination: function (ctx, file, cb) {
        const {  state: { user: { _id } } } = ctx

        cb(null, `./uploads/videos/${_id}`) 
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
	destination: function (ctx, file, cb) {
        const {  state: { user: { _id } } } = ctx 

        cb(null, `./uploads/images/${_id}/ava`) 
    },

	filename: function (ctx, file, cb) { cb(null, `${random()}-${Date.now()}-${file.originalname}`) }
})

const avaFilter = (ctx, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') cb(null, true)
	else cb(null, false)	
}

const ava = multer({
	storage: imageStorage,
	limits: { maxFileSize: 1024 * 1024 * 5 }, // 50mb
	fileFilter: imageFilter
})
// -----


const router = new Router({ prefix: '/profile' })

router
    .param('id', checkId())
    .param('userId', checkUserId())
    .param('creatorId', checkCreatorId())
    .param('type', checkType())
    .param('userBlockId', checkUserBlockId())
    
    // user
    .get('/', checkUser(), userController.getUser)
    .put('/', checkUser(), userController.updateUser)
    .delete('/', checkUser(), userController.deleteUser)
    
    // following & followers
    .get('/follow', checkUser(), userController.getFollows)
    .post('/follow', checkUser(), userController.addFollow)
    .delete('/follow/:creatorId/:userId', checkUser(), userController.deleteFollow)

    // block & unblock
    .get('/block', checkUser(), userController.getBlockedUsers)
    .post('/block', checkUser(), userController.blockUser)
    .delete('/unblock/:userBlockId', checkUser(), userController.unblockUser)

    // ava
    .post('/upload/ava', checkUser(), ava.any('file'), async function (ctx){
        const {
            state: { user },
            req: { files }
        } = ctx

        const ava = null

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
                videos.push(newImage)
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