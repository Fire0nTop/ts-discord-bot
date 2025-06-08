import {Client} from "discord.js";
import {Command} from "./command";

export interface BotClient extends Client {
    commands?: Map<string, Command>;
}