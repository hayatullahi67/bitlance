import { signOut } from "firebase/auth";
import { auth } from "./firebaseClient";

export const handleLogout = async () => {
  try {
    await signOut(auth);
    // Redirect to login page after successful logout
    window.location.href = "/login";
  } catch (error) {
    console.error("Error signing out:", error);
  }
}; 