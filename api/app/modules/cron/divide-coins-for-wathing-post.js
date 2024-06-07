import { Boost } from '../boost/models'
import { Post } from '../post/models'
import { PostViewer } from '../post-viewer/models'
import { SystemWallet } from '../system-wallet/models'
import { User } from '../user/models'
import { Wallet } from '../wallet/models'

export function divideCoinsForWatchingPost(){
	cron.schedule('0 0 * * *', async () => { // every midnight
		let toDate = new Date()
		toDate.setHours(toDate.getHours() + 5) // gmt+5

        let fromDate = new Date(toDate)
        fromDate.setDate(fromDate.getDate() - 1)

        // boosted posts
		let boosted = await Boost.find({ active: true, deletedAt: { $eq: null } })

        for(let i = 0; i < boosted.length; i++){
            const post = await Post.findOne({ 
                _id: boosted[i].postId, 
                active: true,
                deletedAt: { $eq: null } 
            })

            if(post){
                const viewers = await PostViewer.find({ 
                    postId: boosted[i].postId, 
                    createdAt: { $gte: fromDate, $lte: toDate } 
                })

                const coinsPerUser = boosted[i].budget / viewers.length

                let systemWallet = await SystemWallet.findOne({ name: 'system' })

                for(let j = 0; j < viewers.length; j++){
                    let user = await User.findOne({ _id: viewers[j].creatorId })

                    if(!user)
                        continue

                    let userWallet = await Wallet.findOne({ creatorId: viewers[j].creatorId, active: true,  })
                    userWallet.coin += coinsPerUser

                    systemWallet.coin += -coinsPerUser

                    // save calculated coins
                    await userWallet.save()
                    await systemWallet.save()
                }
            }
        }

        // deactivate calculated boost
        boosted[i].active = false
        await boosted[i].save()
	});
}