export function selectedCategoriesToBitset(
    standardCategories: string[],
    selectedCateories: string[]
) {
    let bitset = 0;
    standardCategories.forEach((category: string, index: number) => {
        if (selectedCateories.includes(category)) {
            bitset |= 1 << index;
        }
    });
    return bitset.toString(2).padStart(8, '0');
}

export function bitsetToSelectedCategories(
    standardCategories: string[],
    bitset: string | number
) {
    const bitsetNum = typeof bitset === 'string' ? parseInt(bitset, 2) : bitset;

    const selectedCategories: string[] = [];
    standardCategories.forEach((category: string, index: number) => {
        if (bitsetNum & (1 << index)) {
            selectedCategories.push(category);
        }
    });

    return selectedCategories;
}
