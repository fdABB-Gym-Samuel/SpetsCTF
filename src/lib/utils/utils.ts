export function capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export const map = (
    x: number,
    originalMin: number,
    originalMax: number,
    newMin: number,
    newMax: number
) => {
    return (
        ((x - originalMin) * (newMax - newMin)) / (originalMax - originalMin) + newMin
    );
};

export const linkPattern =
    /\b(?:https?|ftp|mailto|tel|data:image\/[a-zA-Z]+)(?::\/\/)?[^\s<>"']+/gi;

export const formatRequestedName = (requestedName: string) =>
    requestedName
        .replaceAll(/\s+/g, '_')
        .replaceAll(/[^\w]/g, '')
        .replaceAll(/[^a-z0-9_]/gi, '')
        .toLowerCase();
