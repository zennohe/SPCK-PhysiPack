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

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const titleEl = document.getElementById("lesson-title");
const descEl = document.getElementById("lesson-description");
const contentEl = document.getElementById("lesson-content");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) currentUser = user;
  else window.location.href = "login2.html";
});

async function loadLesson() {
  if (!lessonId) {
    titleEl.textContent = "Lesson Not Found ❌";
    descEl.textContent = "No lesson ID was provided.";
    return;
  }

  try {
    const lessonRef = doc(db, "lessonPacks", lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      titleEl.textContent = "Lesson Not Found ❌";
      descEl.textContent = "This lesson doesn’t exist.";
      return;
    }

    const lesson = lessonSnap.data();
    titleEl.textContent = lesson.name || "Untitled Lesson";
    descEl.textContent = lesson.desc || "";

    // ✅ Load content
    const contentRef = collection(db, "lessonPacks", lessonId, "content");
    const contentSnap = await getDocs(contentRef);
    contentEl.innerHTML = "";

    if (contentSnap.empty) {
      contentEl.innerHTML = `<p class="text-gray-400">No content yet 🚧</p>`;
    } else {
      contentSnap.forEach((docSnap) => {
        const data = docSnap.data();
        Object.entries(data).forEach(([key, value]) => {
          let html = "";
          if (key.toLowerCase().includes("text")) {
            html = `<p class="text-gray-200 text-lg leading-relaxed mb-4">${value}</p>`;
          } else if (key.toLowerCase().includes("img")) {
            html = `<img src="${value}" class="rounded-xl shadow-lg mb-6 mx-auto">`;
          } else if (key.toLowerCase().includes("video")) {
            html = `<div class="aspect-w-16 aspect-h-9 mb-6"><iframe src="${value}" class="w-full h-64 rounded-xl shadow-lg" allowfullscreen></iframe></div>`;
          }
          const wrapper = document.createElement("div");
          wrapper.classList.add("mb-6");
          wrapper.innerHTML = html;
          contentEl.appendChild(wrapper);
        });
      });
    }

    // ✅ Create buttons container
    const btnContainer = document.createElement("div");
    btnContainer.className = "mt-6 flex gap-3 flex-wrap";
    contentEl.appendChild(btnContainer);

    const xpBtn = document.createElement("button");
    xpBtn.textContent = `+${lesson.XP || 100} XP`;
    xpBtn.className =
      "px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg font-semibold transition disabled:opacity-50";

    const actionBtn = document.createElement("button");
    actionBtn.className =
      "px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg font-semibold transition disabled:opacity-50";

    btnContainer.appendChild(xpBtn);
    btnContainer.appendChild(actionBtn);

    // ✅ Check user data
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const alreadyCompleted = userData.completedLessons?.includes(lessonId);
      const reviewedList = userData.recentlyReviewed || [];

      // ✅ If user has completed lesson before
      if (alreadyCompleted) {
        xpBtn.disabled = true;
        xpBtn.textContent = `XP Earned (+${lesson.XP || 100})`;
        actionBtn.textContent = "Review Lesson 🔁";
      } else {
        actionBtn.textContent = "Mark Lesson Complete ✅";
      }

      // ✅ Award XP + mark complete (first time)
      xpBtn.addEventListener("click", async () => {
        if (xpBtn.disabled) return;

        await updateDoc(userRef, {
          total_XP: increment(lesson.XP || 100),
          completedLessons: arrayUnion(lessonId),
        });

        xpBtn.disabled = true;
        xpBtn.textContent = `XP Earned (+${lesson.XP || 100})`;
        actionBtn.textContent = "Review Lesson 🔁";

        alert("Lesson completed and XP added!");
      });

      // ✅ Handle review action
      actionBtn.addEventListener("click", async () => {
        const reviewedLesson = {
          id: lessonId,
          title: lesson.name || "Untitled Lesson",
          date: new Date().toISOString(),
        };

        await updateDoc(userRef, {
          recentlyReviewed: arrayUnion(reviewedLesson),
        });

        actionBtn.disabled = true;
        actionBtn.textContent = "Lesson Reviewed ✅";

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
