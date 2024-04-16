import { reject } from 'lodash';
import { Token } from '../models';

export default {
    async findToken(query){
        return Token.findOne(query);
    },
    
    async add(entry){
        return Token.create(entry);
    },

    async removeToken(query){
        return Token.remove(query);
    },

    async removeTokens(query){
        return Token.remove(query);
    }
}


