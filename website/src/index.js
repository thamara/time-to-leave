import "./styles.scss";

gsap.registerPlugin(ScrollTrigger);



// customization tl
let tl = gsap.timeline({
    // yes, we can add it to an entire timeline!
    scrollTrigger: {
      trigger: ".js-customization--trigger",
      start: "top 90%", // when the top of the trigger hits the top of the viewport
      end: "+=500", // end after scrolling 500px beyond the start
      scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
      
    }
  });

  tl.addLabel("start")
    .from(".js-customization-image--3", {x:0, y:0})
    .from(".js-customization-image--2", {x:0, y:0}, "-=.3")
    .addLabel("end");
    

// notification tl

let nt = gsap.timeline({
    scrollTrigger: {
        trigger: ".js-notification--trigger",
        start: "top 80%", // when the top of the trigger hits the top of the viewport
        end: "+=400", // end after scrolling 500px beyond the start
        scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
        
      }
})

nt.addLabel("start")
    .from(".js-notification-image--2", {x:0, y:0})
    .addLabel("end");