
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const auth = getAuth();

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return auth.onAuthStateChanged(callback);
}

export { auth };
