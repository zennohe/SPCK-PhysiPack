// lesson.js
import { db } from "./firebase/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Grab lessonId from query string (lesson.html?lessonId=xxxx)
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("lessonId");

// UI refs
const titleEl = document.getElementById("lesson-title");
const descEl = document.getElementById("lesson-desc");
const imgEl = document.getElementById("lesson-image");
const xpEl = document.getElementById("lesson-xp");
const gradeEl = document.getElementById("lesson-grade");
const tagsEl = document.getElementById("lesson-tags");
const videoContainer = document.getElementById("lesson-video");

async function loadLesson() {
  if (!lessonId) {
    titleEl.textContent = "Lesson not found ❌";
    return;
  }

  try {
    // Fetch the document from Firestore
    const lessonRef = doc(db, "lessonPacks", lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      titleEl.textContent = "Lesson not found ❌";
      return;
    }

    const data = lessonSnap.data();

    // Fill UI
    titleEl.textContent = data.name || "Untitled Lesson";
    descEl.textContent = data.desc || "No description available.";
    xpEl.textContent = `${data.XP || 0} XP`;
    gradeEl.textContent = `Grade ${data.grade || "?"}`;
    imgEl.src = data.imgURL || "https://via.placeholder.com/600x300";
    imgEl.alt = data.name || "Lesson image";

    // Tags
    tagsEl.innerHTML = "";
    if (Array.isArray(data.tags)) {
      data.tags.forEach(tag => {
        const span = document.createElement("span");
        span.className =
          "bg-purple-700 text-white text-xs px-2 py-1 rounded-full";
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
    }

    // Responsive YouTube video
    if (data.videoURL) {
      const videoId = data.videoURL.includes("watch?v=")
        ? data.videoURL.split("watch?v=")[1]
        : data.videoURL.split("/").pop();

      videoContainer.innerHTML = `
        <div class="relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-lg">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            class="absolute top-0 left-0 w-full h-full"
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }

  } catch (err) {
    console.error("Error loading lesson:", err);
    titleEl.textContent = "Error loading lesson ❌";
  }
}

// Run
loadLesson();
