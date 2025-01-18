
function lerp(start : number, end : number, t : number) {
    return start + (end - start) * t;
}
export default function gui2one_lazy_easing(start : number, end : number, t : number, exp : number) {
    let t2 = 0;
    if( t < 0.5 ) t2 = (Math.pow(t, exp)* ( 1/(Math.pow(0.5, exp)) )) * 0.5 ;
    else t2 = ((1.0 - Math.pow(1.0-t, exp) * (1.0/(Math.pow(0.5, exp)))) * 0.5 + 0.5);

    return lerp(start, end, t2);
}