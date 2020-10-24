// === slider ===
/*
* touchstart
* touchmove(zero or more, depends of finger moving)
* touchend
* mousemove
* mousedown
* mouseup
* click
* */
(function slide() {
    const fromSlide = 3;
    const dragThreshold = 60; //px

    let sliderList = document.querySelector('.slider__list');
    const slides = sliderList.querySelectorAll('.slider__item');
    // first slide number 3 with index 2
    let index = fromSlide - 1;
    let allowShift = true;
    let allowTouch = false;

    const firstSlide = slides[0];
    const lastSlide = slides[slides.length - 1];
    sliderList.appendChild(firstSlide.cloneNode(true));
    sliderList.insertBefore(lastSlide.cloneNode(true), firstSlide);

    // execute only after clone, clone can change width when casting fraction to unit
    sliderList.style.left = fromSlide * -firstSlide.offsetWidth + 'px';
    // changes dynamically when resize
    let slideSize = firstSlide.offsetWidth;

    let posX1 = 0,
        offset = 0;
    let posStart;

    window.addEventListener('resize', function () {
        sliderList.style.left = (index + 1) * -firstSlide.offsetWidth + 'px';
        slideSize = firstSlide.offsetWidth;
    });

    function dragStart(e) {
        e = e || window.event;
        /*  IMHO. Events execute asynchronous(i think so), and we don't specify default like
             document.onmousemove = dragAction;
             document.onmouseup = dragEnd;
            so we firstly need to prevent default execution.
            I think e.preventDefault(); interrupt default onmousemove and onmouseup execution.
             Before our moving mouse or upping and next we specify custom these events.
             On mouse moving or upping automatically (browser) create new true custom event.
        */

        posStart = sliderList.offsetLeft;
        // if block in progress of scrolling, we restrict touch
        if (posStart % slideSize !== 0) {
            allowTouch = false;
            return;
        }

        if (e.type === 'touchstart') {
            posX1 = e.touches[0].clientX;
            // touch check because touch events fixed to specified event(independent) listeners and don't execute one by one
            allowTouch = true;
        } else {
            // double click break scrolling without
            e.preventDefault();
            posX1 = e.clientX;
            document.onmousemove = dragAction;
            document.onmouseup = dragEnd;
        }
    }

    function dragAction(e) {
        e = e || window.event;
        let posX2;

        if (e.type === 'touchmove') {
            // touch check because touch events fixed to specified event(independent) listeners and don't execute one by one
            if (!allowTouch) {
                return
            }
            posX2 = e.touches[0].clientX;
        } else {
            posX2 = e.clientX;
        }
        // for example posX1 = 0. If posX2 > 0 => offset = posX2
        offset = posX2 - posX1;
        posX1 = posX2;
        // offset > 0 => slide to right, else offset < 0 slide to left
        sliderList.style.left = sliderList.offsetLeft + offset + "px";
    }

    function dragEnd(e) {
        e = e || window.event;
        // needs to stop executing queue after touch event(don't continue to mouse event)
        e.preventDefault();

        if (e.type === 'touchend') {
            // touch check because touch events fixed to specified event(independent) listeners and don't execute one by one
            if (!allowTouch) {
                return
            }
        }

        let posEnd = sliderList.offsetLeft;
        if (posEnd - posStart < -dragThreshold) {
            shiftSlide(1, true);
        } else if (posEnd - posStart > dragThreshold) {
            shiftSlide(-1, true);
        } else {
            sliderList.style.left = (posStart) + "px";
        }

        document.onmouseup = null;
        document.onmousemove = null;
    }

    sliderList.onmousedown = dragStart;

    //all touch events specified independent so they do not execute one by one and we don't need to e.preventDefault();
    sliderList.addEventListener('touchstart', dragStart, {passive: true});
    sliderList.addEventListener('touchmove', dragAction, {passive: true});
    sliderList.addEventListener('touchend', dragEnd);

    function shiftSlide(step, dragged) {
        sliderList.classList.add('slider__list--transitionend');

        if (allowShift) {
            // when drag dynamically change width
            if (!dragged) {
                posStart = sliderList.offsetLeft;
            }

            if (step > 0) {
                sliderList.style.left = (posStart - slideSize * step) + 'px';
            } else if (step < 0) {
                sliderList.style.left = (posStart + slideSize * Math.abs(step)) + 'px';
            } else if (step === 0) {
                return;
            }
            index += step;

            indicateRadio();
        }

        allowShift = false;
    }

    let sliderButtonPrev = document.querySelector('.slider__button--prev');
    let sliderButtonNext = document.querySelector('.slider__button--next');

    sliderButtonPrev.addEventListener('click', function () {
        shiftSlide(-1);
    });
    sliderButtonNext.addEventListener('click', function () {
        shiftSlide(1);
    });


    function checkIndex() {
        sliderList.classList.remove('slider__list--transitionend');
        const slidesLength = slides.length;

        if (index === -1) {
            sliderList.style.left = -(slidesLength * slideSize) + 'px';
            index = slidesLength - 1;
        } else if (index === slidesLength) {
            sliderList.style.left = -slideSize + 'px';
            index = 0;
        }

        allowShift = true;
    }

    sliderList.addEventListener('transitionend', checkIndex);

    const radio = document.querySelectorAll('.radio__input');

    function indicateRadio() {
        let tempIndex;
        const slidesLength = slides.length;

        if (index === -1) {
            tempIndex = slidesLength - 1;
        } else if (index === slidesLength) {
            tempIndex = 0;
        } else {
            tempIndex = index;
        }

        document.getElementById('radio-' + tempIndex).checked = true;
    }

    // put checked to current slide radio
    indicateRadio();

    radio.forEach(item => {
        item.addEventListener('click', function () {
            const markerIndex = +item.id.replace('radio-', '');
            shiftSlide(markerIndex - index);
        })
    });
})();

// === /slider ===