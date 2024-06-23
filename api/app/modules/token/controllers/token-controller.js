import { User } from '../../user/models';
import issueTokenPair from '../../../helpers/issueTokenPair'; 
import { TokenService } from '../services';

export default {
    async refresh(ctx){
        const { refreshToken } = ctx.request.body;

        const dbToken = await TokenService.findToken({ token: refreshToken });
        if(!dbToken){
            return ctx.throw(400, 'Refresh token not found');
        }   
        const user = await User.findOne({ email: dbToken.email });
        await TokenService.removeToken({
            token: `${refreshToken}`
        });

        ctx.body = await issueTokenPair(dbToken.email, user);
    },

    async logout(ctx){
        const {
            state: {
                user: {
                    email
                }
            }
        } = ctx;
        
        if(!email){
            return ctx.throw(400, 'You are not authorized');
        }
        await TokenService.removeTokens({ email });
        await User.findOneAndUpdate({ email }, { status: 0 });

        ctx.body = { 
            success: true,
            message: 'Signed out',
            data: null 
        }
    }
}