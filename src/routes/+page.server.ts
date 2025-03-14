

export const load = ({params}) => {
    const num: number = Math.floor(Math.random()*100);
    console.log(num);

    return {
        num
    }
}