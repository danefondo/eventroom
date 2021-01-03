The calendar-session mechanism uses 3 timers:

### BookingDashboard.vue
- Timer to periodically update



Ways to detect:

- User is idle
- User is in another program
- User is in another tab
- User leaves tab
- User minimizes window
- User returns to tab

Browser IDLE TIME
- https://stackoverflow.com/questions/9564602/how-to-know-browser-idle-time


ONLY RESOURCES NEEDED TO ANSWER ALL TAB HIDDEN/INACTIVE QUESTIONS FOR KNOWLEDGE COMPLETENESS:
- https://stackoverflow.com/a/1060034/8010396
- https://stackoverflow.com/a/65312550/8010396

Difference between visible & active: https://stackoverflow.com/a/29332519/8010396
Handle ALT+TAB


window.onfocus and window.onblur were the old ways: https://stackoverflow.com/a/7389367/8010396
var checkFocus = function() {
console.log(document.hasFocus());
}
checkFocus(); // init

window.addEventListener("focus", checkFocus);
window.addEventListener("blur", checkFocus);



(Safari needs special handling)



Implementation in the context of timers:
- https://stackoverflow.com/a/61683451/8010396

(function() {
  var time = 10000,
      delta = 100,
      tid;

  tid = setInterval(function() {
    if ( document.hidden || !document.hasFocus() ) { return; }    
    time -= delta;
    if ( time <= 0 ) {
      clearInterval(tid);
      myFunction(); // time passed - do your work
    }        
  }, delta);
})();
