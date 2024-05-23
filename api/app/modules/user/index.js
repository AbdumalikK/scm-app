import Router from 'koa-router'
import path from 'path'
import fs from 'fs'

const multer = require('koa-multer')

import userController from './controllers/user-controller'
import getUser from '../../handlers/get-user'
import checkUser from '../../handlers/checkUser'
import checkId from './handlers/check-id'
import { Image } from '../image/models'
import { AVA } from './constants'

const random = (length = 10) => (Array(length).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join(''))


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

    // user
    .get('/:id', checkUser(), userController.getUser)
    .put('/:id', checkUser(), userController.updateUser)
    .delete('/:id', checkUser(), userController.deleteUser)

    // ava
    .post('/upload/image', checkUser(), ava.any('file'), async function (ctx){
        const {
            state: { user },
            req: { files, file }
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
                    creatorId: user._id,
                    comment: AVA
                })
    
                await newAva.save()
                ava = newAva
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
            message: `Ava uploaded`,
            data: {
                ava
            }
        }
    })

export default router.routes()