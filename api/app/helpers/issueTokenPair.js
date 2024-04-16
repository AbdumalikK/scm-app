import jwtService from '../services/jwt';
import { TokenService } from '../modules/token/services';

export default async (phone, user) => {
    const token = await jwtService.genToken({ phone });
    const refreshToken = await jwtService.refreshToken();

    await TokenService.add({ phone, token: `${refreshToken}${user._id}` });

    return {
        token,
        refreshToken
    };
}