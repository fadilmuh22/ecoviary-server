import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";
import { firebaseConfig } from "./config";
import { CollectionKeys } from "./types";

const firebaseApp = initializeApp(firebaseConfig);

export const database = getDatabase(firebaseApp);

export const coopsRef = () => ref(database, CollectionKeys.COOPS);
export const usersRef = () => ref(database, CollectionKeys.USERS);
export const sensorsRef = () => ref(database, CollectionKeys.SENSORS);
export const controlsRef = () => ref(database, CollectionKeys.CONTROLS);
export const automationsRef = () => ref(database, CollectionKeys.AUTOMATIONS);
