import { auth, db } from "./firebase-config.js"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js"
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js"
import { userSession } from "../userSession.js"

export async function signUp(email, password, role_id) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    )

    const userData = {
      email,
      password,
      role_id: role_id,
      balance: 0,
    }

    await addDoc(collection(db, "users"), userData)

    return userCredential.user
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message)
    throw error
  }
}

// Hàm lấy thông tin user từ Firestore
async function getUserInfoFromFirestore(email) {
  try {
    const q = query(collection(db, "users"), where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error.message)
    return null
  }
}

export async function signIn(email, password) {
  try {
    // Đăng nhập bằng firebase auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    )

    // Lấy thông tin user từ Firestore, bao gốm các trường như email, password, role_id
    const userInfo = await getUserInfoFromFirestore(email)

    // Sử dụng userSession để lưu thông tin phiên đăng nhập với data thực tế
    const additionalInfo = userInfo
      ? {
          role_id: userInfo.role_id,
          balance: userInfo.balance,
        }
      : {
          role_id: 2, // Mặc định là user nếu không tìm thấy
          balance: 0,
        }

    userSession.saveSession(userCredential.user, additionalInfo)

    // Lưu thông tin bổ sung vào session
    if (userInfo) {
      userSession.saveUserInfo(userInfo)
    }

    return userCredential.user
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message)
    throw error
  }
}

// Hàm đăng xuất
export async function signOutUser() {
  try {
    await signOut(auth)
    userSession.clearSession()
    console.log("Đăng xuất thành công!")
    return true
  } catch (error) {
    console.error("Lỗi đăng xuất:", error.message)
    throw error
  }
}