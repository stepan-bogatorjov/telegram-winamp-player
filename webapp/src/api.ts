export type ApiTrack = {
    id: string;
    title: string;
    artist: string | null;
    album: string | null;
    url: string;
};

export type ApiSkin = {
    id: string;
    name: string;
    url: string;
};

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function fetchTracks(): Promise<ApiTrack[]> {
    const res = await fetch(`${API_BASE_URL}/api/tracks`);
    if (!res.ok) {
        throw new Error(`Failed to load tracks: ${res.status}`);
    }
    return res.json();
}

export async function fetchSkins(): Promise<ApiSkin[]> {
    const res = await fetch(`${API_BASE_URL}/api/skins`);
    if (!res.ok) {
        throw new Error(`Failed to load skins: ${res.status}`);
    }
    return res.json();
}
