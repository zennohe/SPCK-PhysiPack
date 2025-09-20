import { db } from "./firebase/firebase-config.js";
import {
  collection,
  getDocs,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const lessonsContainer = document.getElementById("lessons-container");
const gradeFilter = document.getElementById("grade-filter");
const typeFilter = document.getElementById("type-filter");

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
    const card = document.createElement("div");
    card.className =
      "bg-gray-800/70 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition transform duration-300";

    card.innerHTML = `
      <img src="${
        lesson.imgURL || "https://via.placeholder.com/400"
      }" class="w-full h-40 object-cover">
      <div class="p-4">
        <h2 class="text-lg font-bold text-purple-300">${lesson.name}</h2>
        <p class="text-gray-300 text-sm mt-1">${lesson.desc}</p>
        <div class="flex justify-between items-center mt-3 text-sm text-gray-400">
          <span>Grade: ${lesson.grade}</span>
          <span>XP: ${lesson.XP || 0}</span>
        </div>
        <button onclick="window.location.href='lesson.html?id=${lesson.id}'"
          class="mt-3 w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-2 text-white font-semibold">
          View Lesson
        </button>
      </div>
    `;
    lessonsContainer.appendChild(card);
  });
}

// Reload when filters change
gradeFilter.addEventListener("change", loadLessons);
typeFilter.addEventListener("change", loadLessons);

loadLessons();
