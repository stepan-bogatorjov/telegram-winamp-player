// src/skins.ts

export type SkinInfo = {
    id: string;
    name: string;
    url: string;
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
        return {
            id: fileName.replace(/\.wsz$/i, ""),
            name: prettifySkinName(fileName),
            url: url as string,
        };
    }
);

export const defaultSkin: SkinInfo | null = SKINS[0] ?? null;
