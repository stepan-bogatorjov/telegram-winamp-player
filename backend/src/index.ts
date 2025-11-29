import "dotenv/config";
import express from "express";
import {Telegraf, Markup} from "telegraf";

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN) {
    console.error("BOT_TOKEN is not set");
    process.exit(1);
}

if (!WEBAPP_URL) {
    console.error("WEBAPP_URL is not set");
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(
        "Привет! Это Winamp-плеер 🎶\nНажми кнопку, чтобы открыть.",
        Markup.inlineKeyboard([
            Markup.button.webApp("🟩 Открыть плеер", WEBAPP_URL)
        ])
    );
});

bot.command("player", (ctx) => {
    ctx.reply(
        "Открыть плеер:",
        Markup.inlineKeyboard([
            Markup.button.webApp("🎧 Плеер", WEBAPP_URL)
        ])
    );
});

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});

bot.launch().then(() => {
    console.log("Bot started");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
