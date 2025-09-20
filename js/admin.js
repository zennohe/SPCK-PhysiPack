import { db } from "./firebase/firebase-config.js";
import { collection, addDoc, getDocs, doc, getDocs as getDocsSub, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("lesson-form");
const lessonsList = document.getElementById("lessons-list");

// Add a lesson
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newLesson = {
    name: document.getElementById("lesson-name").value,
    desc: document.getElementById("lesson-desc").value,
    grade: parseInt(document.getElementById("lesson-grade").value) || null,
    XP: parseInt(document.getElementById("lesson-xp").value) || 0,
    tags: document.getElementById("lesson-tags").value.split(",").map(t => t.trim()).filter(Boolean),
    imgURL: document.getElementById("lesson-img").value,
    videoURL: document.getElementById("lesson-video").value,
    order: Date.now()
  };

  try {
    await addDoc(collection(db, "lessonPacks"), newLesson);
    alert("✅ Lesson created!");
    form.reset();
    loadLessons();
  } catch (err) {
    console.error("Error adding lesson:", err);
    alert("❌ Failed to add lesson.");
  }
});

// Load all lessons
async function loadLessons() {
  lessonsList.innerHTML = "";
  const querySnap = await getDocs(collection(db, "lessonPacks"));

  for (const lessonDoc of querySnap.docs) {
    const lesson = lessonDoc.data();
    const card = document.createElement("div");
    card.className = "bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition";

    card.innerHTML = `
      <img src="${lesson.imgURL || 'https://via.placeholder.com/300'}" alt="${lesson.name}" class="w-full h-32 object-cover rounded">
      <h3 class="mt-2 text-lg font-semibold">${lesson.name}</h3>
      <p class="text-sm text-gray-300">${lesson.desc || ""}</p>
      <p class="text-xs text-gray-400">Grade: ${lesson.grade || "?"} | XP: ${lesson.XP || 0}</p>
      <div class="flex justify-between items-center mt-2">
        <a href="lesson.html?lessonId=${lessonDoc.id}" class="text-purple-300 hover:underline">View</a>
        <button class="toggle-steps text-xs bg-purple-600 px-2 py-1 rounded hover:bg-purple-700" data-id="${lessonDoc.id}">
          Manage Steps
        </button>
      </div>
      <div class="steps-section hidden mt-4 border-t border-gray-600 pt-3 space-y-3"></div>
    `;

    lessonsList.appendChild(card);
  }

  // Attach listeners for step toggling
  document.querySelectorAll(".toggle-steps").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const lessonId = btn.dataset.id;
      const section = btn.closest("div").parentElement.querySelector(".steps-section");

      if (section.classList.contains("hidden")) {
        await loadSteps(lessonId, section);
        section.classList.remove("hidden");
      } else {
        section.classList.add("hidden");
      }
    });
  });
}

// Load steps for a lesson
async function loadSteps(lessonId, container) {
  container.innerHTML = `<p class="text-gray-400 text-sm">Loading steps...</p>`;

  const stepsRef = collection(db, "lessonPacks", lessonId, "content");
  const stepsSnap = await getDocsSub(stepsRef);

  container.innerHTML = "";

  // Existing steps
  stepsSnap.forEach((docSnap) => {
    const step = docSnap.data();
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-gray-600 p-3 rounded";
    stepDiv.innerHTML = `
      <p class="font-semibold">${docSnap.id}</p>
      <p>${step.textSummary || step.textFirstLaw || step.textSecondLaw || step.textThirdLaw || "No text"}</p>
      ${step.imgURL ? `<img src="${step.imgURL}" class="mt-2 w-full rounded">` : ""}
    `;
    container.appendChild(stepDiv);
  });

  // Add Step Form
  const form = document.createElement("form");
  form.className = "space-y-2 bg-gray-800 p-3 rounded";
  form.innerHTML = `
    <input type="text" name="stepId" placeholder="Step ID (e.g. step1)" class="w-full p-2 rounded bg-gray-700" required>
    <textarea name="stepText" placeholder="Step text" class="w-full p-2 rounded bg-gray-700"></textarea>
    <input type="text" name="stepImg" placeholder="Image URL (optional)" class="w-full p-2 rounded bg-gray-700">
    <button type="submit" class="w-full py-1 bg-purple-600 rounded hover:bg-purple-700">Add Step</button>
  `;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const stepId = form.stepId.value.trim();
    const stepText = form.stepText.value.trim();
    const stepImg = form.stepImg.value.trim();

    if (!stepId) return;

    try {
      await setDoc(doc(db, "lessonPacks", lessonId, "content", stepId), {
        textSummary: stepText || null,
        imgURL: stepImg || null
      });
      alert("✅ Step added!");
      loadSteps(lessonId, container);
    } catch (err) {
      console.error("Error adding step:", err);
      alert("❌ Failed to add step.");
    }
  });

  container.appendChild(form);
}

// Run once
loadLessons();
