# catatan silakan

# 29-10-2025
1. tanya gpt, bikin api terpisah atau dalam project ini
2. bikin halaman profil user

# 30-10-2025
1. perbaiki judul halaman ketika theme dark dipilih

# 31-10-2025
1. ganti konfirmasi hapus di form kategori kegiatan dengan di form log aktivitas
2. hapus saja sweetalert
3. tanya claude.ai untuk bikin form atasan pegawai (sudah ditanyakan, tinggal tunggu limit selesai)

# 01-11-2025
1. tanya ini di claude
berikut adalah halaman login web saya menggunakan next js 16 app router (copy auth/login/page.tsx). dan berikut adalah halaman api nya (copy halaman api/login/route.ts). dan ini adalah halaman auth-helper nya (copy halaman auth-helper). tolong rekomendasikan keamanan pada kode saya agar lebih aman

# 02-11-2025
1. lihat hasil prompt https://claude.ai/chat/d747949a-2b35-495b-8c3d-6690d17a6b68 di claude untuk halaman detail pegawai

# 03-11-2025
1. lanjut bikin halaman detail/edit laporan. lihat chat di claude https://claude.ai/chat/d747949a-2b35-495b-8c3d-6690d17a6b68
2. cek ulang semua halaman
3. perbaiki sidebar
4. tes bikin laporan dengan upload file
5. tambahkan efek loading saat berpindah halaman.
6. ubah posisi animasi orang

# 05-11-2025
1. deploy ke debian 13 berhasil..
2. tanya ke ams agus soal alamat ip 118.98.121.67 tidak bisa akses ke server entago 118.98.121.85

# 06-11-2025
1. prompt ke chatgpt/codex :
saya sudah punya halaman dengan route app/(dashboard)/laporan-kegiatan/[id]/DetailEditClient.tsx dan menghasilkan halaman http://localhost:3000/laporan-kegiatan/21 untuk menampilkan detail laporan kegiatan. sekarang, tolong buatkan saya halaman dengan route app/(dashboard)/laporan-kegiatan/pegawai/[id]/_client.tsx yang akan menghasilkan halaman http://localhost:3000/laporan-kegiatan/pegawai/{pegawai_id}.

berikut rincian halamannya :

1. berisi daftar laporan kegiatan berdasarkan field pegawai_id (dalam bentuk tabel dengan pagination, filter tabel berdasarkan field kategori_id dan status_laporan serta input pencarian). halaman ini tampilannya mirip dengan halaman app/(dashboard)/dashboard/laporan-kegiatan/_client.tsx

# 07-11-2025
1. prompt ke chatgpt/codex : tambahkan filter periode untuk halaman http://localhost:3000/laporan-kegiatan/pegawai/49 agar bisa di-print bulanan

# 08-11-2025
1. perbaiki api https://dev.api.eabsen.merauke.go.id/api/checkin/today?pin=30649&scan_date=2025-11-06 agar yg success true hanya pas absen pagi saja
2. tanya gpt codex untuk menampilkan daftar laporan kegiatan berdasarkan atasan pegawai

# 09-11-2025
1. baca ulang ketentuan VERIFIKASI ULANG di AI https://chatgpt.com/c/69047f07-7250-8323-9b5b-0d2eae67ae6f dan https://chat.z.ai/c/27d0b07f-46a5-4c71-a267-ddb4953add9a
2. tambahkan batas waktu (batas_waktu_submit_laporan di tabel settings)
3. bikin form setting dari tabel settings
4. implementasikan halaman app/(dashboard)/laporan-kegiatan/[id]/DetailEditClient.tsx dari GPT CODEX

# 10-11-2025
1. perbaiki tombol tambah reminder dan style di input dan select filter di halaman reminder
2. pada halaman pegawai, ketika yang login ada NENI, daftar dirinya sendiri malah kosong

# 11-11-2025
1. saat buat laporan, tambahkan template utk mempermudah pegawai
2. ubah fetch notifikasi pakai SSE/WebSocket
3. saat buat reminder, buat juga notifikasinya

# 12-11-2025
1. tiap ada proses laporan oleh atasan, kirim notifikasi dan whatsapp ke nomor pegawai ybs.
2. pada file app/api/laporan-kegiatan/[id]/verifikasi/route.ts ketika berhasil kirim ke whatsapp, kirim juga ke tabel notifikasi
3. setiap pegawai buat laporan, kirim notifikasi dan whatsapp ke atasan. lihat contoh di file app/api/laporan-kegiatan/[id]/verifikasi/route.ts. lihat chat di z.ai https://chat.z.ai/c/ba9615dc-f990-45fe-b47d-6f0b4ae6951e
4. cek ulang pesan whatsapp sama notifikasi
5. tambah tabel pesan_whatsapp yang sudah dikirim
6. perbaiki semua tampilan agar sama semua

# 13-11-2025
1. kalau atasan mau verifikasi laporan, trus lupa isi rating, sayangnya masih tetap lolos. tambahkan validasi rating
2. ganti bg tabel reminder

# 14-11-2025
1. halaman http://localhost:3000/statistik/bulanan masih error

# 15-11-2025
1. kalo bukan admin yang login. maka, tampilkan cetak laporan hanya pegawai yang bersangkutan saja. kalau atasan pegawai yang login. maka, tampilkan laporan anak buahnya dan dirinya sendiri
2. saat halaman cetak laporan dibuka, kenapa halaman laporan kegiatan juga active di sidebar

# 16-11-2025
1. cek lagi tampilan http://localhost:3000/laporan-kegiatan/cetak saat dicetak

# 17-11-2025
1. minta buatkan halaman _client.tsx pada file app/(dashboard)/settings/app/page.tsx, percakapan ada di https://claude.ai/chat/2072e3ae-e1f4-4d9a-aa01-39e2b553acfd