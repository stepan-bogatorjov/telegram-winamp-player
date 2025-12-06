import {google, drive_v3} from "googleapis";
import {mapFilesToTracks, prettifyName} from "./utils";

export interface TrackInfo {
    id: string;
    title: string;
    artist: string | null;
    album: string | null;
    url: string;
}

export interface SkinInfo {
    id: string;
    name: string;
    url: string;
}

const MUSIC_FOLDER_ID = process.env.GDRIVE_MUSIC_FOLDER_ID ?? null;
const SKINS_FOLDER_ID = process.env.GDRIVE_SKINS_FOLDER_ID ?? null;
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? null;

if (!MUSIC_FOLDER_ID) {
    throw new Error("GDRIVE_MUSIC_FOLDER_ID is not set – tracks from Drive will be empty");
}
if (!SKINS_FOLDER_ID) {
    throw new Error("GDRIVE_SKINS_FOLDER_ID is not set – skins from Drive will be empty");
}

let driveClient: drive_v3.Drive | null = null;

export const getAllTracksFromDrive = async (): Promise<TrackInfo[]> => {
    if (!MUSIC_FOLDER_ID) return [];

    const drive = getDrive();

    const rootRes = await drive.files.list({
        q: `'${MUSIC_FOLDER_ID}' in parents and trashed = false`,
        fields: "files(id,name,mimeType)",
    });

    const rootFiles = rootRes.data.files ?? [];

    const rootAudioFiles = rootFiles.filter(
        (f) => f.mimeType && f.mimeType.startsWith("audio/")
    );
    const rootTracks = mapFilesToTracks(rootAudioFiles, null);

    const albumFolders = rootFiles.filter(
        (f) => f.mimeType === "application/vnd.google-apps.folder"
    );

    const albumTracksArrays: TrackInfo[][] = [];

    for (const folder of albumFolders) {
        if (!folder.id || !folder.name) continue;

        const albumName = prettifyName(folder.name);
        const albumFiles = await listAudioFilesInFolder(drive, folder.id);
        albumTracksArrays.push(mapFilesToTracks(albumFiles, albumName));
    }

    return [...rootTracks, ...albumTracksArrays.flat()];
};

export const getAllSkinsFromDrive = async (): Promise<SkinInfo[]> => {
    if (!SKINS_FOLDER_ID) return [];

    const drive = getDrive();

    const res = await drive.files.list({
        q: `'${SKINS_FOLDER_ID}' in parents and trashed = false`,
        fields: "files(id,name,mimeType)",
    });

    const files = res.data.files ?? [];

    const skins: SkinInfo[] = [];

    for (const file of files) {
        if (!file.id || !file.name) continue;

        if (!file.name.toLowerCase().endsWith(".wsz")) {
            continue;
        }

        skins.push({
            id: file.id,
            name: prettifyName(file.name),
            url: `/skin-file/${file.id}`,
        });
    }

    return skins;
};

export const getDriveFileStream = async (
    fileId: string
): Promise<NodeJS.ReadableStream> => {
    const drive = getDrive();
    const res = await drive.files.get(
        {
            fileId,
            alt: "media",
        },
        {responseType: "stream"}
    );

    return res.data as NodeJS.ReadableStream;
};

export const getFileMeta = async (
    fileId: string
): Promise<drive_v3.Schema$File | undefined> => {
    const drive = getDrive();
    const res = await drive.files.get({
        fileId,
        fields: "id,name,mimeType",
    });
    return res.data;
};

const getDrive = (): drive_v3.Drive => {
    if (!driveClient) {
        driveClient = createDriveClient();
    }
    return driveClient;
};

const createDriveClient = (): drive_v3.Drive => {
    if (!SERVICE_ACCOUNT_JSON) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set – Google Drive client will not work");
    }

    try {
        const credentials = JSON.parse(SERVICE_ACCOUNT_JSON);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        return google.drive({version: "v3", auth});
    } catch (e) {
        throw new Error(`Invalid GOOGLE_SERVICE_ACCOUNT_JSON: ${JSON.stringify(e)}`);
    }
};

const listAudioFilesInFolder = async (
    drive: drive_v3.Drive,
    folderId: string
): Promise<drive_v3.Schema$File[]> => {
    const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false and mimeType contains 'audio/'`,
        fields: "files(id,name,mimeType)",
    });

    return (res.data.files ?? []).filter(
        (f) => f.id && f.name && f.mimeType && f.mimeType.startsWith("audio/")
    );
};
