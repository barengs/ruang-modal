# Ekosistem Alumni SMA Double Track — Google Apps Script

Aplikasi web sederhana berbasis Google Apps Script + Google Sheets untuk tiga layanan: **Ruang Modal**, **Ruang Tumbuh**, dan **Ruang Pasar**. UI responsif untuk ponsel dan desktop.

## Fitur
- Form pengajuan Ruang Modal (jalur kerja/usaha, kebutuhan alat/modal, estimasi biaya).
- Form permintaan mentoring Ruang Tumbuh.
- Pengajuan produk/jasa alumni ke Ruang Pasar; produk hanya tampil setelah admin memilih **Tayangkan**.
- Dashboard admin: jumlah data, daftar pengajuan, persetujuan/perbaikan, moderasi produk, dan input monitoring.
- Database Google Sheets otomatis dibuat saat setup.

## Instalasi (sekitar 10–15 menit)
1. Buka https://script.google.com/ dengan akun Google pengelola.
2. Klik **New project**. Beri nama `Ekosistem Alumni SMA Double Track`.
3. Buka file `Code.gs` bawaan, hapus isinya, lalu salin seluruh isi `Code.gs` dari paket ini.
4. Klik **+** di samping Files → **HTML**. Beri nama persis `Index`, lalu salin seluruh isi `Index.html`.
5. Simpan project.
6. Di dropdown fungsi pilih `setupApp`, lalu klik **Run**. Berikan izin akses Google Sheets saat diminta.
7. Buka **Execution log**. Catat URL database dan **PIN ADMIN AWAL** yang tampil. PIN awal hanya ditampilkan sekali. Jangan bagikan PIN kepada alumni.
8. (Disarankan) Ubah PIN awal: pilih fungsi `setAdminPin`, klik Run, lalu pada dialog **Execution log** tidak ada argumen. Cara paling mudah: pada editor tambahkan sementara fungsi berikut lalu jalankan, ganti PIN-nya, kemudian hapus fungsi sementara:

```javascript
function ubahPinSekali() {
  setAdminPin('GantiDenganPINUnikMinimal8Karakter');
}
```

9. Klik **Deploy → New deployment**. Pilih tipe **Web app**.
10. **Execute as:** Me. **Who has access:** Anyone (atau Anyone with Google account jika akses harus dibatasi ke pengguna login Google). Klik Deploy, berikan otorisasi, lalu salin URL Web App.
11. Buka URL Web App. Alumni dapat mengirim pengajuan tanpa login. Pengelola membuka menu **Admin** dan masuk menggunakan PIN.

## Struktur database
Script otomatis membuat spreadsheet `Database Ekosistem Alumni SMA Double Track` dengan tab `Modal`, `Tumbuh`, `Pasar`, dan `Monitoring`. URL spreadsheet tersedia di Execution log fungsi `setupApp`.

## Operasional admin
- **Ruang Modal:** klik Setujui atau Perlu Perbaikan pada baris pengajuan.
- **Ruang Tumbuh:** ubah status permintaan pendampingan.
- **Ruang Pasar:** klik Tayangkan setelah memeriksa konten. Status Tayangkan akan membuat produk muncul di etalase publik.
- **Monitoring:** pilih tab Monitoring dan isi formulir pencatatan hasil pendampingan.
- Status dan catatan admin disimpan pada spreadsheet.

## Pengamanan dan catatan penting
- Gunakan akun Google organisasi sebagai pemilik project dan spreadsheet.
- Batasi akses editor spreadsheet hanya kepada pengelola yang berwenang.
- PIN admin adalah gerbang panel pengelola sederhana, bukan sistem identitas tingkat tinggi. Ganti PIN awal dan jangan membagikannya.
- Jika memilih akses **Anyone**, form alumni dapat diakses publik. Hindari mengumpulkan NIK, data rekening, atau data sensitif yang tidak diperlukan. Cantumkan pemberitahuan privasi dan kontak pengelola sebelum digunakan secara luas.
- Lakukan uji coba pengajuan dan moderasi dengan data dummy sebelum peluncuran. Deploy ulang sebagai versi baru setelah mengubah kode: **Deploy → Manage deployments → Edit → New version → Deploy**.
- Aplikasi ini tidak melakukan pencairan dana, transfer bank, autentikasi alumni otomatis, atau pengiriman notifikasi email/WhatsApp. Penetapan bantuan tetap melalui proses verifikasi pengelola.

## Troubleshooting
- **Database belum dibuat:** jalankan `setupApp()` sekali dari editor.
- **Sesi admin berakhir:** login kembali; token admin berlaku maksimal 6 jam.
- **Perubahan kode tidak terlihat:** buat deployment versi baru, bukan hanya menyimpan file.
- **Produk tidak terlihat:** pastikan statusnya `Tayang` di tab Pasar.
