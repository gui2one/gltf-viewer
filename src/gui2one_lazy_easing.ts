import { Object3D, Vector3}from "three"


function lerp(start : number, end : number, t : number) {
    return start + (end - start) * t;
}

export function gui2one_lazy_easing(start : number, end : number, t : number, exp : number, type: string = "ease-in-out") {
    let t2 = 0;
    if(type === "ease-in-out") {
        if( t < 0.5 ) t2 = (Math.pow(t, exp)* ( 1/(Math.pow(0.5, exp)) )) * 0.5 ;
        else t2 = ((1.0 - Math.pow(1.0-t, exp) * (1.0/(Math.pow(0.5, exp)))) * 0.5 + 0.5);
    }else if(type === "ease-in") {        
        t2 = Math.pow(t, exp);
    }else if(type === "ease-out") {
        t2 = 1.0 - Math.pow(1.0-t, exp);
    }
    return lerp(start, end, t2);
}

export function animateObject3D(object : Object3D, startPosition : Vector3, endPosition : Vector3, duration : number, easingExp : number, easingType = "ease-in-out", onComplete = ()=>{}) {
    const startTime = performance.now(); // Animation start time

    function animate() {
        const elapsed = performance.now() - startTime; // Time since animation started
        const t = Math.min(elapsed / duration, 1); // Normalize time to [0, 1]

        // Easing interpolation
        const x = gui2one_lazy_easing(startPosition.x, endPosition.x, t, easingExp, easingType);
        const y = gui2one_lazy_easing(startPosition.y, endPosition.y, t, easingExp, easingType);
        const z = gui2one_lazy_easing(startPosition.z, endPosition.z, t, easingExp, easingType);

        // Update object position
        object.position.set(x, y, z);

        // Continue or end animation
        if (t < 1) {
            requestAnimationFrame(animate); // Continue animating
        } else{
            if (onComplete !== null){

                onComplete(); // Call the completion callback, if any
            }
            return;
            
        }
    }
    animate(); // Start the animation
}