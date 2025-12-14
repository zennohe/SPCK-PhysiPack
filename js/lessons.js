import { db, auth } from "./firebase/firebase-config.js";
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const lessonsContainer = document.getElementById("lessons-container");
const gradeFilter = document.getElementById("grade-filter");
const typeFilter = document.getElementById("type-filter");

let completedLessons = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login2.html";
    return;
  }

  // ✅ Fetch completed lessons from user profile
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    completedLessons = userSnap.data().completedLessons || [];
  }

  loadLessons();
});

async function loadLessons() {
  lessonsContainer.innerHTML = `<p class="col-span-full text-center text-gray-400">Loading lessons...</p>`;

  let lessonsRef = collection(db, "lessonPacks");
  let q = query(lessonsRef);

  const grade = gradeFilter.value;
  const type = typeFilter.value;

  let snapshot = await getDocs(q);
  let lessons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // ✅ Filtering manually
  if (grade) lessons = lessons.filter((l) => l.grade == grade);
  if (type) lessons = lessons.filter((l) => l.tags && l.tags.includes(type));

  if (lessons.length === 0) {
    lessonsContainer.innerHTML = `<p class="col-span-full text-center text-gray-400">No lessons found 🚫</p>`;
    return;
  }

  lessonsContainer.innerHTML = "";
  lessons.forEach((lesson) => {
    const isCompleted = completedLessons.includes(lesson.id);
    const fullDesc = lesson.desc || "";
    const shortDesc =
      fullDesc.length > 120 ? fullDesc.substring(0, 120) + "..." : fullDesc;

    const card = document.createElement("div");
    card.className =
      "bg-gray-800/70 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition transform duration-300";

    card.innerHTML = `
      <img src="${lesson.imgURL || "https://via.placeholder.com/400"}" 
           class="w-full h-40 object-cover">
      <div class="p-4">
        <h2 class="text-lg font-bold text-purple-300 flex items-center gap-2">
          ${lesson.name}
          ${isCompleted ? `<span class="text-green-400 text-sm">✅</span>` : ""}
        </h2>

        <p class="text-gray-300 text-sm mt-1 desc-text">${shortDesc}</p>
        ${
          fullDesc.length > 120
            ? `<button class="text-purple-400 text-xs mt-1 underline view-more-btn">View more</button>`
            : ""
        }

        <div class="flex justify-between items-center mt-3 text-sm text-gray-400">
          <span>Grade: ${lesson.grade}</span>
          <span>XP: ${lesson.XP || 0}</span>
        </div>

        <button onclick="window.location.href='lesson.html?id=${lesson.id}'"
          class="mt-3 w-full ${
            isCompleted
              ? "bg-green-700 hover:bg-green-800"
              : "bg-purple-600 hover:bg-purple-700"
          } rounded-lg py-2 text-white font-semibold">
          ${isCompleted ? "Review Lesson" : "View Lesson"}
        </button>
      </div>
    `;

    // ✅ Add popup logic for long descriptions
    const viewMoreBtn = card.querySelector(".view-more-btn");
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener("click", () => {
        showPopup(lesson.name, fullDesc);
      });
    }

    lessonsContainer.appendChild(card);
  });
}

// ✅ Create a popup for viewing full description
function showPopup(title, fullText) {
  // Remove old popup if any
  const existing = document.getElementById("desc-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "desc-popup";
  popup.className =
    "fixed inset-0 bg-black/60 flex items-center justify-center z-50";

  popup.innerHTML = `
    <div class="bg-gray-900 p-6 rounded-2xl max-w-lg w-[90%] text-gray-200 shadow-xl relative">
      <h2 class="text-xl font-semibold text-purple-300 mb-3">${title}</h2>
      <div class="max-h-60 overflow-y-auto text-sm leading-relaxed pr-2">
        ${fullText}
      </div>
      <button class="mt-4 bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg w-full text-white font-semibold close-popup">Close</button>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector(".close-popup").addEventListener("click", () => {
    popup.remove();
  });
}

// Reload when filters change
gradeFilter.addEventListener("change", loadLessons);
typeFilter.addEventListener("change", loadLessons);
