# TraceFun Numbers 🖐️✨

TraceFun Numbers adalah game edukasi interaktif berbasis web (mixed reality) untuk membantu anak-anak belajar menulis angka **1 sampai 9 dan 0** dengan cara menggerakkan ujung jari telunjuk di depan kamera / webcam.

Aplikasi ini menggunakan kamera laptop/PC Anda untuk mendeteksi sensor gerakan tangan secara real-time tanpa perlu mouse atau keyboard untuk gameplay utama.

---

## 🚀 Cara Menjalankan Project

1. **Install dependensi**:
   ```bash
   npm install
   ```
2. **Jalankan local development server**:
   ```bash
   npm run dev
   ```
3. **Buka di browser**: Akses link local yang muncul di terminal (biasanya `http://localhost:5173`).

---

## 🎮 Cara Bermain

1. Buka halaman utama dan klik **Mulai Main**.
2. Berikan izin akses kamera pada browser Anda.
3. Pilih webcam yang ingin digunakan pada menu dropdown yang tersedia.
4. Arahkan telapak tangan ke kamera. Pastikan skeleton/titik-titik tangan Anda muncul di layar.
5. Gunakan **ujung jari telunjuk** Anda sebagai penunjuk utama (kursor).
6. Ikuti jalur angka dengan menyentuh checkpoint bulat secara berurutan (dari nomor 1, 2, 3, dst).
7. Jangan terlalu jauh melenceng dari garis bantu. Jika melenceng, sistem akan memberi tahu untuk kembali ke jalur.

---

## 🛠️ Stack Teknologi

Project ini dibuat secara clean menggunakan:
* **Vue 3** (Composition API)
* **Vite** (Build tool)
* **Tailwind CSS v4** (Styling dengan palette pastel cerah)
* **Vue Router** (Navigasi halaman)
* **MediaPipe Hands** (Library AI pendeteksi gerakan tangan via CDN)
* **Web Audio API** (Sintesis efek suara langsung dari kode browser tanpa dependensi file audio eksternal)
