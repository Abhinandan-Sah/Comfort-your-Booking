//Fixing navigation menu for mobile screen
let navBar = document.querySelectorAll(".nav-link");
let navCollapse = document.querySelector(".navbar-collapse.collapse");
navBar.forEach(function(a){
  a.addEventListener("click", function(){
    navCollapse.classList.remove("show")
  })
})
// Swiper Slider
var swiper = new Swiper(".mySwiper", {
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    autoplay: {
      delay: 3500,
    },
  });