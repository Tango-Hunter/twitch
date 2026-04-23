/**
 * Title: main.js
 * Author: Tango Hunter
 * Date Created: 4/1/26
 * Date Modified: 4/20/26
 * Description: Theme and Mobile Script
 */

// ------------ Theme Toggle ------------
const toggle = document.getElementById("themeToggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function setTheme(theme){
document.documentElement.setAttribute("data-theme",theme);
localStorage.setItem("theme",theme);
toggle.checked = theme === "light";
}

const savedTheme = localStorage.getItem("theme");
if(savedTheme){
setTheme(savedTheme);
}else{
setTheme(prefersDark.matches ? "dark" : "light");
}

toggle.addEventListener("click",()=>{
const current = document.documentElement.getAttribute("data-theme");
setTheme(current === "dark" ? "light" : "dark");
});

// ----------- Mobile Toggle ------------
const mobileToggle = document.getElementById("mobileToggle");
const mainNav = document.getElementById("mainNav");
const overlay = document.getElementById("overlay");

mobileToggle.addEventListener("click",()=>{
  mobileToggle.classList.toggle("active");
  mainNav.classList.toggle("open");
  overlay.classList.toggle("show");
  mobileToggle.ariaExpanded = "true";
  overlay.setAttribute('aria-hidden', 'false');
});

overlay.addEventListener("click",closeMenu);

document.querySelectorAll(".nav-list a").forEach(link=>{
  link.addEventListener("click",closeMenu);
});

function closeMenu(){
  mobileToggle.classList.remove("active");
  mainNav.classList.remove("open");
  overlay.classList.remove("show");
  mobileToggle.ariaExpanded = "false";
overlay.setAttribute('aria-hidden', 'true');
}

// ---------- ScanLine Overlay ----------
const strength = 10; // lower = more subtle

document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * strength;
  const y = (e.clientY / window.innerHeight - 0.5) * strength;

  document.body.style.setProperty("--grid-x", `${x}px`);
  document.body.style.setProperty("--grid-y", `${y}px`);
});
