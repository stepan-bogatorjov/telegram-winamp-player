// src/main.ts
import "./style.css";
import Webamp from "webamp";
import {SKINS, defaultSkin} from "./skins";

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

function createSkinSelector() {
    if (SKINS.length <= 1) {
        return;
    }

    const select = document.createElement("select");
    select.style.position = "fixed";
    select.style.top = "8px";
    select.style.right = "8px";
    select.style.zIndex = "9999";
    select.style.fontSize = "12px";

    SKINS.forEach((skin) => {
        const option = document.createElement("option");
        option.value = skin.id;
        option.textContent = skin.name;
        if (defaultSkin && skin.id === defaultSkin.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
        const target = event.target as HTMLSelectElement;
        const skin = SKINS.find((s) => s.id === target.value);
        if (!skin) return;

        webamp.setSkinFromUrl(skin.url);
    });

    document.body.appendChild(select);
}

createSkinSelector();
