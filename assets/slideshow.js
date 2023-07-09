class Slideshow {
  constructor(options) {
    this.defaultOptions = {
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
    this.options = Object.assign({}, this.defaultOptions, options);
    
    console.log(`options: ${JSON.stringify(this.options)}`);
    
    // elements
    this.parentEl = document.querySelector(`${this.options.carouselParentID}`);
    this.carousel = this.parentEl.querySelector(this.options.carouselClass);
    this.slides = Array.from(this.parentEl.querySelectorAll(this.options.slidesClass));
    this.controls = this.parentEl.querySelector(this.options.controlsClass);
    
    this.playToggle = this.parentEl.querySelector(".playToggle");
    this.playTogglePlay = this.parentEl.querySelector(".playToggle .play");
    this.playTogglePause = this.parentEl.querySelector(".playToggle .pause");
      
    this.nextButton = this.parentEl.querySelector(".nextButton");
    this.prevButton = this.parentEl.querySelector(".prevButton");
    
    this.indicator = this.parentEl.querySelector(this.options.indicatorClass);

    this.pagination = this.parentEl.querySelector('.pagination');

    // vars
    this.currentSlide = 1;
    this.totalSlides = this.slides.length;
    this.transClass = `transition-duration:${ this.options.speed }ms; transition-timing-function: steps(${ this.options.speed / 1000 }, jump-none);`;
    this.atc = this.addTransitionClass.bind(this); // works, but is this a good way to do this?

    this.init();
  }

  init() {
    if (this.slides.length > 1) {
      this.slides[this.slides.length - 1].classList.add("is-ref");
      this.slides[this.slides.length - 1].style.order = "1";
      if (this.options.autoplay) {
        // this.playTogglePlay.classList.add('hideme');
        this.slidesStart();
      } else {
        this.playTogglePause.classList.add("hideme");
      }
    } else {
      this.carousel.classList.remove("is-set");
      this.controls.style.display = "none";
      this.playToggle.style.display = "none";
    }

    // update pagination
    this.updateCount(this.currentSlide);
    this.pagination.innerText = `1 of ${this.totalSlides}`;
    

    // next and prev buttons
    this.nextButton.addEventListener("click", () => {
      this.slidesPause();
      this.advanceSlides("next");
    });
    this.prevButton.addEventListener("click", () => {
      this.slidesPause();
      this.advanceSlides("prev")
    });

    // play toggle button
    this.playToggle.addEventListener("click", () => {
      if (this.options.autoplay) {
        this.slidesPause();
      } else {
        this.slidesStart();
      }
    });

    // key press events
    if (this.options.keyPressEvents) {
      const keyHandlerMap = {
        ArrowRight: () => this.advanceSlides("next"),
        ArrowLeft: () => this.advanceSlides("prev"),
      };
      document.addEventListener("keydown", function (ev) {
        let keyHandler = keyHandlerMap[ev.key];
        if (keyHandler) {
          keyHandler();
        }
      });
    }

    // touch events
    if (this.options.touchEvents) {
      console.log("touch events");
      const _advance = this.advanceSlides.bind(this);
      let myTouchStartX,
        myTouchDdist = 0;
      this.carousel.addEventListener("touchstart", function (ev) {
        let touchobj = ev.changedTouches[0];
        myTouchStartX = parseInt(touchobj.clientX);
      });
      this.carousel.addEventListener("touchmove", function (ev) {
        let touchobj = ev.changedTouches[0];
        myTouchDdist = parseInt(touchobj.clientX) - myTouchStartX;
      });
      this.carousel.addEventListener(
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

  updateCount(c) {
    this.pagination.innerText = `${c} of ${this.totalSlides}`;
  }

  advanceSlides(dir) {
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

    this.indicator.style.cssText = "transition-duration:0; transition-timing-function: linear";
    this.indicator.classList.remove("progress");
    let el, i, j, new_slide, ref;
    el = this.parentEl.querySelector(".is-ref");
    el.classList.remove("is-ref");
    if (dir == "next") {
      new_slide = nextEl(el, this.slides);
      this.carousel.classList.remove("is-reversing");
    } else {
      new_slide = prevEl(el, this.slides);
      this.carousel.classList.add("is-reversing");
    }
    new_slide.classList.add("is-ref");
    new_slide.style.order = 1;
    for (
      i = j = 2, ref = this.slides.length;
      2 <= ref ? j <= ref : j >= ref;
      i = 2 <= ref ? ++j : --j
    ) {
      new_slide = nextEl(new_slide, this.slides);
      new_slide.style.order = i;
    }
    this.carousel.classList.remove("is-set");
    
    let foo = this.slides.indexOf(new_slide)+2;
    const c = (foo - 1 + (1 % this.totalSlides) + this.totalSlides) % this.totalSlides + 1;
    console.log(`foo: ${foo} c: ${c}`);
    this.updateCount(c);
    
    const that = this;
    return setTimeout(function () {
      return that.carousel.classList.add("is-set");
    }, 50);
  }

  addTransitionClass() {
    this.indicator.style.cssText = this.transClass;
    this.indicator.classList.add("progress");
  }

  slidesPause() {
    this.options.autoplay = false;
    this.playTogglePlay.classList.remove("hideme");
    this.playTogglePause.classList.add("hideme");
    
    this.carousel.removeEventListener("transitionend", this.atc);
    this.indicator.style.cssText += "transition-duration:0";
    this.indicator.classList.remove("progress");
    clearInterval(this.myInterval);
  }
  
  slidesStart() {
    this.options.autoplay = true;
    this.playTogglePlay.classList.add("hideme");
    this.playTogglePause.classList.remove("hideme");
    this.carousel.addEventListener("transitionend", this.atc);
    this.indicator.style.cssText = this.transClass;
    this.indicator.classList.add("progress");
    this.myInterval = setInterval(() => {
        this.advanceSlides("next");
    }, this.options.speed);
  }
}


// const mySlideshow = new Slideshow({carouselParentID:"#slideshow"});

/* if you want to import like this:

<script type="module">
import {Slideshow} from "./assets/slideshow.js";
const options = {carouselParentID:"#slideshow"}
const mySlideshow = new Slideshow(options)
</script>

uncomment the following line */
// export {Slideshow};
