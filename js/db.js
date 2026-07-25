/* ============================================================
   db.js — inicialización de Firebase y helpers de datos
   ============================================================ */

const DB = {
  ready: false,
  fs: null,

  async init() {
    if (!window.FIREBASE_CONFIGURED) {
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('setup-warning').style.display = 'block';
      throw new Error('Firebase no configurado');
    }
    firebase.initializeApp(window.firebaseConfig);
    this.fs = firebase.firestore();

    // Autenticación anónima: no hace falta usuario/contraseña,
    // solo sirve para que las reglas de seguridad de Firestore
    // permitan leer/escribir únicamente a esta app.
    await firebase.auth().signInAnonymously();
    this.ready = true;
  },

  // ---------- helpers genéricos ----------
  col(name) { return this.fs.collection(name); },

  async getAll(colName, orderField) {
    let q = this.col(colName);
    if (orderField) q = q.orderBy(orderField);
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async add(colName, data) {
    const ref = await this.col(colName).add({ ...data, creado: firebase.firestore.FieldValue.serverTimestamp() });
    return ref.id;
  },

  async update(colName, id, data) {
    await this.col(colName).doc(id).update(data);
  },

  async remove(colName, id) {
    await this.col(colName).doc(id).delete();
  },

  async get(colName, id) {
    const doc = await this.col(colName).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  // Escucha en tiempo real (para que PC y móvil se sincronicen solos)
  listen(colName, callback, orderField) {
    let q = this.col(colName);
    if (orderField) q = q.orderBy(orderField);
    return q.onSnapshot(snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error(`Error escuchando ${colName}:`, err));
  }
};
