import {drive_v3} from "googleapis";
import {TrackInfo} from "./googleDrive";

export const EXTENSION_REGEX = /\.[^.]+$/i;
export const UNDERSCORES_REGEX = /_+/g;
export const ARTIST_TITLE_REGEX = /^(.*?)\s*-\s*(.+)$/;

interface ParsedName {
    artist: string | null;
    title: string;
}

export const mapFilesToTracks = (
    files: drive_v3.Schema$File[],
    album: string | null
): TrackInfo[] => files
    .filter((file) => file.id && file.name)
    .map((file) => {
        const {artist, title} = parseArtistAndTitle(file.name as string);

        return {
            id: file.id as string,
            title,
            artist,
            album,
            url: `/media/${file.id}`,
        };
    });

export const prettifyName = (raw: string): string => {
    const noExt = raw.replace(EXTENSION_REGEX, "");
    const spaced = noExt.replace(UNDERSCORES_REGEX, " ");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const parseArtistAndTitle = (fileName: string): ParsedName => {
    const noExt = fileName.replace(EXTENSION_REGEX, "");
    const cleaned = noExt.replace(UNDERSCORES_REGEX, " ");

    const match = cleaned.match(ARTIST_TITLE_REGEX);
    if (match) {
        const artistRaw = match[1].trim();
        const titleRaw = match[2].trim();

        return {
            artist: artistRaw || null,
            title: titleRaw || cleaned.trim(),
        };
    }

    return {
        artist: null,
        title: cleaned.trim(),
    };
};