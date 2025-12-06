import type Webamp from "webamp";
import type {ApiSkin} from "./api";

const SKIN_STORAGE_KEY = "opg-player-selected-skin-id";

export const attachSkinSelector = (
    webamp: Webamp,
    skins: ApiSkin[]
): HTMLSelectElement | null => {
    if (skins.length <= 1) {
        return null;
    }

    const currentSkin = loadSavedSkin(skins);

    const select = document.createElement("select");
    select.className = "skin-select";

    skins.forEach((skin) => {
        const option = document.createElement("option");
        option.value = skin.id;
        option.textContent = skin.name;
        if (currentSkin && skin.id === currentSkin.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    select.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLSelectElement;
        const skin = skins.find((s) => s.id === target.value);
        if (!skin) return;

        webamp.setSkinFromUrl(skin.url);
        saveSkin(skin.id);
    });

    document.body.appendChild(select);

    return select;
};

export const loadSavedSkin = (skins: ApiSkin[]): ApiSkin | null => {
    const savedId = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (!savedId) return null;
    return skins.find((s) => s.id === savedId) || null;
};

export const saveSkin = (skinId: string): void => {
    window.localStorage.setItem(SKIN_STORAGE_KEY, skinId);
};