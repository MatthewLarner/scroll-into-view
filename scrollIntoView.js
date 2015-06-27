var targetElement,
    animationId,
    Bezier = require('bezier-easing');

function getTargetScrollLocation(target, parent){
    var targetPosition = target.getBoundingClientRect(),
        parentPosition,
        x,
        y,
        differenceX,
        differenceY;

    if(parent === window){
        x = targetPosition.left + window.scrollX - window.innerWidth / 2 + Math.min(targetPosition.width, window.innerWidth) / 2;
        y = targetPosition.top + window.scrollY - window.innerHeight / 2 + Math.min(targetPosition.height, window.innerHeight) / 2;
        x = Math.max(Math.min(x, document.body.clientWidth - window.innerWidth / 2), 0);
        y = Math.max(Math.min(y, document.body.clientHeight - window.innerHeight / 2), 0);
        differenceX = x - window.scrollX;
        differenceY = y - window.scrollY;
    }else{
        parentPosition = parent.getBoundingClientRect();
        var offsetTop = targetPosition.top - (parentPosition.top - parent.scrollTop);
        var offsetLeft = targetPosition.left - (parentPosition.left - parent.scrollLeft);
        x = offsetLeft + (targetPosition.width / 2) - parent.clientWidth / 2;
        y = offsetTop + (targetPosition.height / 2) - parent.clientHeight / 2;
        x = Math.max(Math.min(x, parent.scrollWidth - parent.clientWidth), 0);
        y = Math.max(Math.min(y, parent.scrollHeight - parent.clientHeight), 0);
        differenceX = x - parent.scrollLeft;
        differenceY = y - parent.scrollTop;
    }

    return {
        x: x,
        y: y,
        differenceX: differenceX,
        differenceY: differenceY
    };
}

function setElementScroll(element, x, y){
    if(element === window){
        element.scrollTo(x, y);
    }else{

        element.scrollLeft = x;
        element.scrollTop = y;
    }
}

module.exports = function scrollTo(target, animationTime, curve){
    if(!target){
        return;
    }

    animationTime = animationTime || 2000;
    curve = curve || 'ease';

    var parent = target.parentElement;


    var endTime = Date.now() + animationTime,
        easing = Bezier.css[curve],
        differenceY = getTargetScrollLocation(target, parent).differenceY,
        positionY;

    targetElement = target;



    function run(parent, startTime){
        animationId = requestAnimationFrame(function(){
            if(target !== targetElement) {
                cancelAnimationFrame(animationId);
                target = targetElement;
                endTime = Date.now() + animationTime;
                differenceY = getTargetScrollLocation(target, parent).differenceY;
            }

            var location = getTargetScrollLocation(target, parent),
                currentTime = Date.now(),
                curvePosition = ((animationTime - (endTime - currentTime)) / animationTime);

            // console.log(location.y - (location.differenceY - location.differenceY * 0.05), location.y, location.differenceY);
            // console.log(location.y - (location.differenceY - location.differenceY * 0.05), location.y - (location.differenceY - location.differenceY * (easing(curvePosition))));
            // console.log(location.y, location.y * easing(curvePosition));
            // console.log(location.y, location.differenceY, location.y * easing(curvePosition));

            // positionY = location.y - (location.differenceY - location.differenceY * easing(curvePosition));
            positionY = location.y - (differenceY - differenceY * easing(curvePosition));
            // positionY = startPosition.differenceY - location.y * easing(curvePosition);
            console.log('actual', positionY, 'time left: ', endTime - currentTime, 'curve position:', curvePosition, 'location.y: ', location.y, 'differenceY:', location.differenceY);

            if(currentTime > endTime){
                // Give up
                return;
            }

            setElementScroll(parent,
                location.x,
                positionY
            );

            if(Math.abs(location.differenceY) > 1 || Math.abs(location.differenceX) > 1){
                run(parent, startTime);
            }
        });
    }

    function transitionScrollTo(parent){
        run(parent, +new Date());
    }

    while(parent && parent.tagName !== 'BODY'){
        if(
            parent.scrollHeight !== parent.clientHeight ||
            parent.scrollWidth !== parent.clientWidth
        ){
            transitionScrollTo(parent);
        }

        parent = parent.parentElement;
    }

    transitionScrollTo(window);
};