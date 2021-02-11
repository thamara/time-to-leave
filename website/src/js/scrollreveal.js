import { gsap } from "gsap";
class ScrollReveal {
  constructor() {
      console.log('loaded');
    gsap.registerPlugin(ScrollTrigger);
    const reveal = gsap.utils.toArray('.js-reveal');
    
    reveal.forEach((text, i) => {
      ScrollTrigger.create({
        trigger: text,
        //toggleClass: 'shown',
        start: 'top 85%',
        end: 'top 20%',
        onEnter: () => text.classList.add('shown'),
        onLeaveBack: () => text.classList.remove('shown')
      })
    });
  }
}

export default ScrollReveal;

