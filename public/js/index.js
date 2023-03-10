window.onbeforeunload = function() {
  window.scrollTo(0, 0);
}

document.getElementById("help-nav").onclick = function(){
  window.location ="/info";
}
document.getElementById("login-nav").onclick = function(){
  window.scrollTo(0, 400);
}




