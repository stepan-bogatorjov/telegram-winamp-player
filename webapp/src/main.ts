import "./style.css";
import Webamp, {type Track} from "webamp";
import {
    fetchTracks,
    fetchSkins,
    type ApiSkin,
} from "./api";
import {
    attachSkinSelector,
    loadSavedSkin,
} from "./skins";
import {getFullUrl} from "./utils";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
    throw new Error("#app not found");
}

async function main() {
    try {
        const [apiTracks, apiSkins] = await Promise.all([
            fetchTracks(),
            fetchSkins(),
        ]);

        const savedSkin = loadSavedSkin(apiSkins);
        const webampTracks: Track[] = apiTracks.map(({title, artist, album, url}) => ({
            metaData: {
                title,
                artist: artist ?? "Unknown artist",
                album: album ?? "Unknown album",
            },
            url: getFullUrl(url),
        }));

        const skinInfos: ApiSkin[] = apiSkins.map(({id, name, url}) => ({
            id,
            name,
            url: getFullUrl(url),
        }));

        const webamp = new Webamp({
            initialTracks: webampTracks,
            initialSkin: savedSkin ? {url: getFullUrl(savedSkin.url)} : undefined,
        });

        webamp.renderWhenReady(app as HTMLElement);

        if (skinInfos.length > 0) {
            attachSkinSelector(webamp, skinInfos);
        }
    } catch (e) {
        console.error("Failed to load tracks/skins", e);
    }

}

main().catch((e) => console.error(e));
