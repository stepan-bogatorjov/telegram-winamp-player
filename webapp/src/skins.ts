export type SkinInfo = {
    id: string;
    name: string;
    url: string;
};

export type WebampInstance = {
    setSkinFromUrl: (url: string) => void;
};

const rawSkins = import.meta.glob("./skins/*.wsz", {
    as: "url",
    eager: true,
});

function prettifySkinName(raw: string): string {
    const noExt = raw.replace(/\.wsz$/i, "");
    const withSpaces = noExt.replace(/[_\-]+/g, " ");
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export const SKINS: SkinInfo[] = Object.entries(rawSkins).map(
    ([path, url], index) => {
        const fileName = path.split("/").pop() || `skin-${index}`;
        const id = fileName.replace(/\.wsz$/i, "");
        return {
            id,
            name: prettifySkinName(fileName),
            url: url as string,
        };
    }
);

export const defaultSkin: SkinInfo | null = SKINS[0] ?? null;

export function attachSkinSelector(webamp: WebampInstance): HTMLSelectElement | null {
    if (SKINS.length <= 1) {
        return null;
    }

    const select = document.createElement("select");
    select.className = "skin-select";

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

    return select;
}
