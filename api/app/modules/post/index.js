import Router from 'koa-router'
import path from 'path'
import fs from 'fs'

const multer = require('koa-multer')

import postController from './controllers/post-controller'
import getUser from '../../handlers/get-user'
import checkUser from '../../handlers/checkUser'
import checkCommentId from './handlers/check-comment-id'
import checkLikeId from './handlers/check-like-id'
import checkReplyId from './handlers/check-reply-id'
import checkReplyLikeId from './handlers/check-reply-like-id'
import checkId from './handlers/check-id'

import { Image } from '../image/models'
import { Video } from '../video/models'

import { POST } from './constants'


const random = (length = 10) => (Array(length).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join(''))

// ----- post image -----
const imageStorage = multer.diskStorage({
	destination: async function (ctx, file, cb) {
        const user = await getUser(ctx)

        const imageDir = path.resolve(path.join(process.cwd() + `/uploads/images/${user._id}/post`))

        if (!fs.existsSync(imageDir)){
            fs.mkdirSync(imageDir, { recursive: true })
        }

        cb(null, `./uploads/images/${user._id}/post`)
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

        const videoDir = path.resolve(path.join(process.cwd() + `/uploads/videos/${user._id}/post`))

        if (!fs.existsSync(videoDir)){
            fs.mkdirSync(videoDir, { recursive: true })
        }

        cb(null, `./uploads/videos/${user._id}/post`) 
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

const router = new Router({ prefix: '/post' })

router
    .param('id', checkId())
    .param('commentId', checkCommentId())
    .param('likeId', checkLikeId())
    .param('replyId', checkReplyId())
    .param('replyLikeId', checkReplyLikeId())
    

    
    .get('/:id', checkUser(), postController.getPost)
    .get('/', checkUser(), postController.getPosts)
    .post('/', checkUser(), postController.addPost)
    .put('/:id', checkUser(), postController.updatePost)
    .delete('/:id', checkUser(), postController.deletePost)

    // comment
    .post('/:id/comment', checkUser(), postController.addPostComment)
    .patch('/:id/comment/:commentId', checkUser(), postController.updatePostComment)
    .delete('/:id/comment/:commentId', checkUser(), postController.deletePostComment)

    // comment likes
    .post('/:id/comment/:commentId/like', checkUser(), postController.addPostCommentLike)
    .delete('/:id/comment/:commentId/like/:likeId', checkUser(), postController.deletePostCommentLike)

    // reply on comment
    .post('/:id/comment/:commentId/reply', checkUser(), postController.addPostCommentReply)
    .patch('/:id/comment/:commentId/reply/:replyId', checkUser(), postController.updatePostCommentReply)
    .delete('/:id/comment/:commentId/reply/:replyId', checkUser(), postController.deletePostCommentReply)

    // reply likes
    .post('/:id/comment/:commentId/reply/:replyId/like', checkUser(), postController.addPostCommentReplyLike)
    .delete('/:id/comment/:commentId/reply/:replyId/like/:replyLikeId', checkUser(), postController.deletePostCommentReplyLike)

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
                    comment: POST
                })
    
                await newVideo.save()
                videos.push(newVideo)
            }
        }catch(ex){
            ctx.status = 500
            return ctx.body = {
                success: false,
                message: ex.message,
                data: null
            }
        }
        

        return ctx.body = {
            success: true,
            message: `Videos uploaded`,
            data: {
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
                    comment: POST
                })
    
                await newImage.save()
                images.push(newImage)
            }
        }catch(ex){
            ctx.status = 500
            return ctx.body = {
                success: false,
                message: ex.message,
                data: null
            }
        }

        return ctx.body = {
            success: true,
            message: `Images uploaded`,
            data: {
                images
            }
        }
    })
    
export default router.routes()