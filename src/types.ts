// displayed_text is the text to be shown
// implied_text is the text to be copied, or the url to go to, this should mostly be the same as displayed_text
// type is what type the resource is, can be "link", "command", "file", will dictate how it renders
export interface resource {
    displayed_text: string;
    implied_text: string;
    type: string;
}

export interface solver {
    username: string;
    class: string;
}

export interface Challenge_data {
    name: string;
    id: string;
    description: string;
    resources: resource[];
    author: string;
    points: number;
    num_solves: number;
    main_category: string;
    sub_categories: string[];
    first_solvers: solver[];
}
