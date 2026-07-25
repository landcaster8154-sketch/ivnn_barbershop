/* ============================================================
   CONFIGURACIÓN DE FIREBASE
   ============================================================
   Sigue las instrucciones de INSTRUCCIONES.md para crear tu
   proyecto gratuito en https://console.firebase.google.com

   Cuando tengas tus claves, sustituye los valores de abajo por
   los tuyos (Firebase te los da al crear la "app web").
   NO necesitas tocar ningún otro archivo.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyBIgGDJtyFCTmoFGpJHe17TsNPNbgb6aqg",
  authDomain: "ivnnbarbershop.firebaseapp.com",
  projectId: "ivnnbarbershop",
  storageBucket: "ivnnbarbershop.firebasestorage.app",
 messagingSenderId: "475118416238",

 

  appId: "1:475118416238:web:91ef1d0dab1b41bc0dd17f"
}; 

// No tocar a partir de aquí:
window.FIREBASE_CONFIGURED = firebaseConfig.apiKey !== "TU_API_KEY";
window.firebaseConfig = firebaseConfig;
