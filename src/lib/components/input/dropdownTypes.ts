export interface Result {
    primary: string;
    secondary: string;
    id: string;
}

export interface DropdownConfiguration {
    dropdownResults: Result[];
    onSelect: (result: Result) => void;
    currentSelected: number;
}
