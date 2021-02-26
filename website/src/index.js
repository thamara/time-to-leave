import "./styles.scss";
import ScrollReveal from './js/scrollreveal.js';
import imagesLoaded from 'imagesloaded';

gsap.registerPlugin(ScrollTrigger);

if (document.querySelectorAll('img')) {
  imagesLoaded(document.querySelectorAll('img'), () => {
      document.getElementById('loader').classList.add('closed');
      setTimeout(function () {
        const scrollReveal = new ScrollReveal();        
      }, 100);
  });
}

// customization timeline
let customizationTl = gsap.timeline({
  // yes, we can add it to an entire timeline!
  scrollTrigger: {
    trigger: ".js-customization--trigger",
    start: "top 90%", // when the top of the trigger hits the top of the viewport
    end: "+=500", // end after scrolling 500px beyond the start
    scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar

  }
});

customizationTl.addLabel("start")
  .from(".js-customization-image--3", { x: 0, y: 0 })
  .from(".js-customization-image--2", { x: 0, y: 0 }, "-=.3")
  .addLabel("end");

// notification timeline

let notificationTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".js-notification--trigger",
    start: "top 80%", // when the top of the trigger hits the top of the viewport
    end: "+=400", // end after scrolling 500px beyond the start
    scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar

  }
})

notificationTl.addLabel("start")
  .from(".js-notification-image--2", { x: 0, y: 0 })
  .addLabel("end");

// daysoff tl

let daysoffTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".js-daysoff--trigger",
    start: "top bottom", // when the top of the trigger hits the top of the viewport
    end: "+=400", // end after scrolling 500px beyond the start
    scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
  }
})


let i;
for(i = 1; i < 16; i++){
  daysoffTl.from("[data-daysoff='" + i + "']", { opacity: 0 })
}


// NAVBAR HIDDEN
/* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
let prevScrollpos = window.pageYOffset;
const navbar = document.getElementById("navbar");


window.onscroll = function () {
  let currentScrollPos = window.pageYOffset;

  if (prevScrollpos > currentScrollPos) {
    navbar.style.top = "0";
  } else {
    navbar.style.top = "-100px";
  }
 
  if (currentScrollPos > 1) {
    navbar.style.background = "#ffffff";
    navbar.style.boxShadow = "0 0 12px 0 #E0E6E8"
  } else {
    navbar.style.background = "transparent";
    navbar.style.boxShadow = "0 0 12px 0 transparent"
  }
  prevScrollpos = currentScrollPos;
}


document.getElementById('js-dropdown').addEventListener('click', function(e){
  e.preventDefault();
  let dropdown = e.target.nextSibling.nextSibling;
  if(dropdown.classList.contains('opened')){
    dropdown.classList.remove('opened');
  } else {
    dropdown.classList.add('opened');
  }
});