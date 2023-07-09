// const personFactory = (name, age) => {
//   const sayHello = () => console.log(`hello! I am ${name}. I am ${age} years old.`);
//   return { sayHello };
// };

// const jeff = personFactory('jeff', 27);



function Slideshow(opts) {
  console.log(opts)
  const defaultOptions = {
    carouselParentID: "#slideshow",
    carouselClass: ".slides-container",
    slidesClass: ".slide",
    controlsClass: ".controls",
    indicatorClass: ".indicator",
    keyPressEvents: false, // dont use this. if there are multiple slideshows, all slideshows will respond to keys.
    touchEvents: false, // broken?, was working before.
    autoplay: false,
    speed: 5000,
  };
  const options = Object.assign({}, defaultOptions, opts);
  
  console.log(`options: ${JSON.stringify(options)}`);
  
  // elements
  const parentEl = document.querySelector(`${options.carouselParentID}`);
  const carousel = parentEl.querySelector(options.carouselClass);
  const slides = Array.from(parentEl.querySelectorAll(options.slidesClass));
  const controls = parentEl.querySelector(options.controlsClass);
  
  const playToggle = parentEl.querySelector(".playToggle");
  const playTogglePlay = parentEl.querySelector(".playToggle .play");
  const playTogglePause = parentEl.querySelector(".playToggle .pause");  
  const nextButton = parentEl.querySelector(".nextButton");
  const prevButton = parentEl.querySelector(".prevButton");  
  const indicator = parentEl.querySelector(options.indicatorClass);
  const pagination = parentEl.querySelector('.pagination');

  // vars
  let currentSlide = 1;
  const totalSlides = slides.length;
  const transClass = `transition-duration:${ options.speed }ms; transition-timing-function: steps(${ options.speed / 1000 }, jump-none);`;
  let myInterval;
  // init();


  const init = () => {
    if (slides.length > 1) {
      slides[slides.length - 1].classList.add("is-ref");
      slides[slides.length - 1].style.order = "1";
      if (options.autoplay) {
        // playTogglePlay.classList.add('hideme');
        slidesStart();
      } else {
        playTogglePause.classList.add("hideme");
      }
    } else {
      carousel.classList.remove("is-set");
      controls.style.display = "none";
      playToggle.style.display = "none";
    }

    // update pagination
    updateCount(currentSlide);
    pagination.innerText = `1 of ${totalSlides}`;
    

    // next and prev buttons
    nextButton.addEventListener("click", () => {
      slidesPause();
      advanceSlides("next");
    });
    prevButton.addEventListener("click", () => {
      slidesPause();
      advanceSlides("prev")
    });

    // play toggle button
    playToggle.addEventListener("click", () => {
      if (options.autoplay) {
        slidesPause();
      } else {
        slidesStart();
      }
    });

    // key press events
    if (options.keyPressEvents) {
      const keyHandlerMap = {
        ArrowRight: () => advanceSlides("next"),
        ArrowLeft: () => advanceSlides("prev"),
      };
      document.addEventListener("keydown", function (ev) {
        let keyHandler = keyHandlerMap[ev.key];
        if (keyHandler) {
          keyHandler();
        }
      });
    }

    // touch events
    if (options.touchEvents) {
      console.log("touch events");
      // const _advance = advanceSlides.bind(this);
      let myTouchStartX,
        myTouchDdist = 0;
      carousel.addEventListener("touchstart", function (ev) {
        let touchobj = ev.changedTouches[0];
        myTouchStartX = parseInt(touchobj.clientX);
      });
      carousel.addEventListener("touchmove", function (ev) {
        let touchobj = ev.changedTouches[0];
        myTouchDdist = parseInt(touchobj.clientX) - myTouchStartX;
      });
      carousel.addEventListener(
        "touchend",
        function (ev) {
          // ev.preventDefault();
          if (myTouchDdist > 50) {
            _advance("prev");
          } else if (myTouchDdist < -50) {
            _advance("next");
          }
          myTouchDdist = 0;
        },
        false
        // { passive: false }
      );
    }
  }

  const updateCount = (c) => {
    pagination.innerText = `${c} of ${totalSlides}`;
  }

  const advanceSlides = (dir) => {
    // utils
    function nextEl(el, arr) {
      let idx = arr.indexOf(el) + 1;
      if (idx < arr.length) {
        return arr[idx];
      } else {
        return arr[0];
      }
    }

    function prevEl(el, arr) {
      let idx = arr.indexOf(el) - 1;
      if (idx >= 0) {
        return arr[idx];
      } else {
        return arr[arr.length - 1];
      }
    }

    indicator.style.cssText = "transition-duration:0; transition-timing-function: linear";
    indicator.classList.remove("progress");
    let el, i, j, new_slide, ref;
    el = parentEl.querySelector(".is-ref");
    el.classList.remove("is-ref");
    if (dir == "next") {
      new_slide = nextEl(el, slides);
      carousel.classList.remove("is-reversing");
    } else {
      new_slide = prevEl(el, slides);
      carousel.classList.add("is-reversing");
    }
    new_slide.classList.add("is-ref");
    new_slide.style.order = 1;
    for (
      i = j = 2, ref = slides.length;
      2 <= ref ? j <= ref : j >= ref;
      i = 2 <= ref ? ++j : --j
    ) {
      new_slide = nextEl(new_slide, slides);
      new_slide.style.order = i;
    }
    carousel.classList.remove("is-set");
    
    let foo = slides.indexOf(new_slide)+2;
    const c = (foo - 1 + (1 % totalSlides) + totalSlides) % totalSlides + 1;
    updateCount(c);
    
    return setTimeout(function () {
      return carousel.classList.add("is-set");
    }, 50);
  }

  const addTransitionClass = () => {
    indicator.style.cssText = transClass;
    indicator.classList.add("progress");
  }

  const slidesPause = () => {
    options.autoplay = false;
    playTogglePlay.classList.remove("hideme");
    playTogglePause.classList.add("hideme");
    
    carousel.removeEventListener("transitionend", addTransitionClass);
    indicator.style.cssText += "transition-duration:0";
    indicator.classList.remove("progress");
    clearInterval(myInterval);
  }
  
  const slidesStart = () => {
    options.autoplay = true;
    playTogglePlay.classList.add("hideme");
    playTogglePause.classList.remove("hideme");
    carousel.addEventListener("transitionend", addTransitionClass);
    indicator.style.cssText = transClass;
    indicator.classList.add("progress");
    myInterval = setInterval(() => {
        advanceSlides("next");
    }, options.speed);
  }

  return { init, getOptions }
} // end factory
