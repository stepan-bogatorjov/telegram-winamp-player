import "dotenv/config";
import express from "express";
import cors from "cors";
import {Telegraf, Markup} from "telegraf";
import {
    getAllTracksFromDrive,
    getAllSkinsFromDrive,
    getDriveFileStream,
    getFileMeta,
} from "./googleDrive";

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
const allowedOrigin = WEBAPP_URL.replace(/\/$/, "");

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(new Error("CORS blocked: no origin"), false);
            }

            if (origin === allowedOrigin) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked: ${origin} is not allowed`), false);
        },
    })
);

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    return ctx.reply(
        "Нажми кнопку, чтобы открыть.",
        Markup.inlineKeyboard([
            Markup.button.webApp("🎧", WEBAPP_URL),
        ])
    );
});

bot.command("player", (ctx) => {
    return ctx.reply(
        "Открыть плеер:",
        Markup.inlineKeyboard([
            Markup.button.webApp("🎧 Плеер", WEBAPP_URL),
        ])
    );
});

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/tracks", async (req, res) => {
    try {
        const tracks = await getAllTracksFromDrive();
        res.json(tracks);
    } catch (e) {
        console.error("Failed to get tracks from Drive:", e);
        res.status(500).json({error: "Failed to load tracks"});
    }
});

app.get("/api/skins", async (req, res) => {
    try {
        const skins = await getAllSkinsFromDrive();
        res.json(skins);
    } catch (e) {
        console.error("Failed to get skins from Drive:", e);
        res.status(500).json({error: "Failed to load skins"});
    }
});

app.get("/media/:fileId", async (req, res) => {
    const fileId = req.params.fileId;
    await streamDriveFile(fileId, res, {fallbackContentType: "audio/mpeg"});
});

app.get("/skin-file/:fileId", async (req, res) => {
    const fileId = req.params.fileId;
    await streamDriveFile(fileId, res, {
        fallbackContentType: "application/octet-stream",
    });
});

async function streamDriveFile(
    fileId: string,
    res: express.Response,
    options?: {
        fallbackContentType?: string;
    },
) {
    const fallbackContentType = options?.fallbackContentType ?? "application/octet-stream";

    try {
        const meta = await getFileMeta(fileId);
        const stream = await getDriveFileStream(fileId);

        if (meta?.mimeType) {
            res.setHeader("Content-Type", meta.mimeType);
        } else {
            res.setHeader("Content-Type", fallbackContentType);
        }

        if (meta?.name) {
            res.setHeader(
                "Content-Disposition",
                `inline; filename="${encodeURIComponent(meta.name)}"`
            );
        }
        stream.pipe(res);
    } catch (e) {
        console.error(`Failed to stream file ${fileId} from Drive:`, e);
        res.status(500).send("Failed to stream file");
    }
}

app.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});

bot.launch().then(() => {
    console.log("Bot started");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
