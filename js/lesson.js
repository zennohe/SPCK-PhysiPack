import { db, auth } from "./firebase/firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Get lesson ID from URL
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const titleEl = document.getElementById("lesson-title");
const descEl = document.getElementById("lesson-description");
const contentEl = document.getElementById("lesson-content");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    window.location.href = "login2.html";
  }
});

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

    // ✅ Add "Complete Lesson" button
    const completeBtn = document.createElement("button");
    completeBtn.textContent = `Complete Lesson (+${lesson.XP || 100} XP)`;
    completeBtn.className =
      "px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-50";
    contentEl.appendChild(completeBtn);

    // ✅ Check if user already completed
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.completedLessons?.includes(lessonId)) {
          completeBtn.disabled = true;
          completeBtn.textContent = `Lesson Completed ✅ (+${lesson.XP || 100} XP)`;
        }
      }

      // ✅ Button logic
      completeBtn.addEventListener("click", async () => {
        if (!currentUser || completeBtn.disabled) return;

        await updateDoc(userRef, {
          total_XP: increment(lesson.XP || 100),
          completedLessons: arrayUnion(lessonId),
        });

        completeBtn.disabled = true;
        completeBtn.textContent = `Lesson Completed ✅ (+${lesson.XP || 100} XP)`;

        // send back to lessons list
        setTimeout(() => {
          window.location.href = "lessons.html";
        }, 1200);
      });
    }
  } catch (err) {
    console.error("Error loading lesson:", err);
    titleEl.textContent = "Error ⚠️";
    descEl.textContent = "Something went wrong loading this lesson.";
  }
}

loadLesson();
