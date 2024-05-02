import { User } from '../user/models'
import { Post } from '../post/models'
import { Image } from '../image/models'
import { Video } from '../video/models'
import { Follower, Following } from '../follow/models'

export function deleteUserWithin30Days(){
	cron.schedule('*/5 * * * *', async () => {
		let date = new Date()
		date.setHours(date.getHours() + 5)
		date.setDate(date.getDate() - 30) // -30 days

		const users = await User.find({ deletedAt: { $lte: date }, active: false })

		for(let i = 0; i < users.length; i++){
			await User.findByIdAndDelete(users[i]._id);
			await Post.findOneAndDelete({ creatorId: users[i]._id })
			await Image.findOneAndDelete({ creatorId: users[i]._id })
			await Video.findOneAndDelete({ creatorId: users[i]._id })
			await Following.findOneAndDelete({ creatorId: users[i]._id })
			await Follower.findOneAndDelete({ userId: users[i]._id })


			const imageDir = path.resolve(path.join(process.cwd() + `/uploads/images/${users[i]._id}`))
			const videoDir = path.resolve(path.join(process.cwd() + `/uploads/videos/${users[i]._id}`))

			fs.rmSync(imageDir, { recursive: true, force: true })
			fs.rmSync(videoDir, { recursive: true, force: true })
		}
	});
}