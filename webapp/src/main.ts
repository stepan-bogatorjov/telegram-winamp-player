import "./style.css";
import Webamp from "webamp";
import {defaultSkin, attachSkinSelector, type WebampInstance} from "./skins";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
    throw new Error("#app not found");
}

const webamp = new Webamp({
    initialTracks: [
        {
            metaData: {
                title: "Test Track",
                artist: "Winamp",
            },
            url: "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
        },
    ],
    initialSkin: defaultSkin ? {url: defaultSkin.url} : undefined,
});

webamp.renderWhenReady(app);

attachSkinSelector(webamp as WebampInstance);
