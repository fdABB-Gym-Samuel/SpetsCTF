
// displayed_text is the text to be shown
// implied_text is the text to be copied, or the url to go to
// is_link is whether its a link and therefore should be rendered as an <a> tag
export interface resource {
    displayed_text: string,
    implied_text: string
    is_link: boolean,

}

export interface Challenge_data {
        name: string,   
        desc: string,
        resources: resource[],
        author: string,
        points: number,
        num_solves: number,
        main_category: string,
        sub_categories: string[],
}
