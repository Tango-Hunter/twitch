/**
 * Title: script.js
 * Author: Tango Hunter
 * Date Created: 4/1/26
 * Date Modified: 4/8/26
 * Description: Theme and Mobile Script
 */

// Theme Toggle
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

// Mobile Toggle

