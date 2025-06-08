import {DiscordTimestampFormat} from "../types/discordTimestampFormat";

export class DiscordTimestampFormatter {
    static toDiscordTimestamp(
        time: Date | number,
        format: DiscordTimestampFormat = DiscordTimestampFormat.Relative
    ): string {
        const unix = typeof time === 'number'
            ? (time > 1e12 ? Math.floor(time / 1000) : time)
            : Math.floor(time.getTime() / 1000);

        return `<t:${unix}:${format}>`;
    }
}