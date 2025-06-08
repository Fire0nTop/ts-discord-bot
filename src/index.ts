import { config } from 'dotenv';
import {Bot} from "./structures";

// Load environment variables
config();

// Initialize and start the bot
const bot = new Bot();

// Handle process termination
process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());

// Start the bot
bot.start();