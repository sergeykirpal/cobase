export function itemPosition(i, length){
    if(i == 1){
        return 'first'
    }else if(i == length){
        return 'last'
    }
    return 'middle'
}