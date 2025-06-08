import fs from 'fs';

export class env {

    static getToken(){
        const token = process.env.TOKEN

        if (token == undefined){
            return fs.readFileSync('/run/secrets/discord_token', 'utf8').trim();
        } else {
            return token;
        }
    }

    static getClientId(){
        const clientId = process.env.CLIENT_ID

        if (clientId == undefined){
            return fs.readFileSync('/run/secrets/discord_client_id', 'utf8').trim();
        } else {
            return clientId;
        }
    }

    static getGuildId(){
        const guildId = process.env.GUILD_ID

        if (guildId == undefined){
            return fs.readFileSync('/run/secrets/discord_guild_id', 'utf8').trim();
        } else {
            return guildId;
        }
    }
}