import { db } from "./firebase/firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Get lesson ID from URL
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const titleEl = document.getElementById("lesson-title");
const descEl = document.getElementById("lesson-description");
const contentEl = document.getElementById("lesson-content");

async function loadLesson() {
  if (!lessonId) {
    titleEl.textContent = "Lesson Not Found ❌";
    descEl.textContent = "No lesson ID was provided.";
    return;
  }

  try {
    // ✅ Fetch lesson doc
    const lessonRef = doc(db, "lessonPacks", lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      titleEl.textContent = "Lesson Not Found ❌";
      descEl.textContent = "This lesson doesn’t exist.";
      return;
    }

    const lesson = lessonSnap.data();

    // Fill in basic info
    titleEl.textContent = lesson.name || "Untitled Lesson";
    descEl.textContent = lesson.desc || "";

    // ✅ Load subcollection "content"
    const contentRef = collection(db, "lessonPacks", lessonId, "content");
    const contentSnap = await getDocs(contentRef);

    if (contentSnap.empty) {
      contentEl.innerHTML = `<p class="text-gray-400">No content yet 🚧</p>`;
    } else {
      contentEl.innerHTML = "";
      contentSnap.forEach((docSnap) => {
        const data = docSnap.data();

        // Loop through all fields in each step document
        Object.entries(data).forEach(([key, value]) => {
          let html = "";

          if (key.toLowerCase().includes("text")) {
            html = `<p class="text-gray-200 text-lg leading-relaxed mb-4">${value}</p>`;
          } else if (key.toLowerCase().includes("img")) {
            html = `<img src="${value}" alt="Lesson Image" class="rounded-xl shadow-lg mb-6 mx-auto">`;
          } else if (key.toLowerCase().includes("video")) {
            html = `
              <div class="aspect-w-16 aspect-h-9 mb-6">
                <iframe src="${value}" 
                        class="w-full h-64 rounded-xl shadow-lg"
                        frameborder="0" allowfullscreen></iframe>
              </div>`;
          } else {
            html = `<p class="text-gray-500 italic">⚠️ Unknown field: ${key}</p>`;
          }

          const wrapper = document.createElement("div");
          wrapper.classList.add("mb-6");
          wrapper.innerHTML = html;
          contentEl.appendChild(wrapper);
        });
      });
    }
  } catch (err) {
    console.error("Error loading lesson:", err);
    titleEl.textContent = "Error ⚠️";
    descEl.textContent = "Something went wrong loading this lesson.";
  }
}

loadLesson();
