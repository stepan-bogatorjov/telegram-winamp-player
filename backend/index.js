require("dotenv").config();
const express = require("express");
const {Telegraf} = require("telegraf");

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error("BOT_TOKEN is not set");
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Привет! Плеер скоро будет 🎶"));

bot.launch().then(() => {
    console.log("Bot started");
});

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});
