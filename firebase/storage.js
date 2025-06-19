import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export const uploadProfilePicture = async (uid, file) => {
  const storageRef = ref(storage, `profile pictures/${uid}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadProductImage = async (file) => {
  const storageRef = ref(storage, `products/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
