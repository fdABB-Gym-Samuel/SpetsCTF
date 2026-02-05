import sanitize from 'sanitize-filename';

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

export const linkPattern = /^(https?|ftp):\/\/[^\s]+|(mailto|tel):[^\s]+$/;

export const formatRequestedName = (requestedName: string) =>
    sanitize(
        requestedName
            .replaceAll(/\s+/g, '_')
            .replaceAll(/[^\w]/g, '')
            .replaceAll(/[^a-z0-9_]/gi, '')
            .toLowerCase()
    );

export function getPointBracket(points: number): number {
    if (points < 200) return 100;
    if (points < 300) return 200;
    if (points < 400) return 300;
    if (points < 500) return 400;
    return 500;
}
