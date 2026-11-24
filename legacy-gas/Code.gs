/** EKOSISTEM ALUMNI SMA DOUBLE TRACK
 * Backend Google Apps Script. Jalankan setupApp() sekali sebelum deploy.
 */
const APP = { TITLE: 'Ekosistem Alumni SMA Double Track', VERSION: '1.0.0', TZ: 'Asia/Jakarta' };
const SHEETS = {
  Modal: ['ID','Timestamp','Nama','Email','WhatsApp','Sekolah','Tahun Lulus','Kompetensi','Jalur','Status Aktivitas','Jenis Bantuan','Rincian Kebutuhan','Estimasi Biaya','Rencana/Deskripsi','Status Seleksi','Catatan Admin'],
  Tumbuh: ['ID','Timestamp','Nama','Email','WhatsApp','Sekolah','Bidang Minat','Topik Pendampingan','Kebutuhan/Jadwal','Status','Catatan Admin'],
  Pasar: ['ID','Timestamp','Nama Alumni','Email','WhatsApp','Sekolah','Nama Usaha/Produk','Kategori','Deskripsi','Harga','Kontak/Link Pemesanan','Status Publikasi','Catatan Admin'],
  Monitoring: ['ID','Timestamp','ID Alumni/Permohonan','Nama Alumni','Modul','Tanggal Pantau','Status Produktif','Pendapatan/Omzet','Catatan','Petugas']
};
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate().setTitle(APP.TITLE).addMetaTag('viewport','width=device-width, initial-scale=1');
}
function include(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }
function setupApp() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('DB_ID');
  let ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch(e) { ss = null; } }
  if (!ss) { ss = SpreadsheetApp.create('Database Ekosistem Alumni SMA Double Track'); props.setProperty('DB_ID', ss.getId()); }
  Object.keys(SHEETS).forEach(name => {
    let sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) { sh.getRange(1,1,1,SHEETS[name].length).setValues([SHEETS[name]]); sh.setFrozenRows(1); sh.getRange(1,1,1,SHEETS[name].length).setFontWeight('bold').setBackground('#173b64').setFontColor('#ffffff'); sh.autoResizeColumns(1,SHEETS[name].length); }
  });
  let first = ss.getSheetByName('Sheet1'); if (first && ss.getSheets().length > 1) ss.deleteSheet(first);
  if (!props.getProperty('ADMIN_PIN_HASH')) {
    const pin = String(Math.floor(100000 + Math.random()*900000));
    props.setProperty('ADMIN_PIN_HASH', hash_(pin));
    Logger.log('PIN ADMIN AWAL: ' + pin + ' — simpan dengan aman, PIN tidak ditampilkan kembali.');
  }
  Logger.log('DATABASE: ' + ss.getUrl());
  return {databaseUrl:ss.getUrl(), message:'Setup selesai. Salin URL database dan PIN admin dari Execution log.'};
}
function setAdminPin(pin) {
  if (!pin || String(pin).length < 8) throw new Error('PIN admin minimal 8 karakter.');
  PropertiesService.getScriptProperties().setProperty('ADMIN_PIN_HASH',hash_(String(pin)));
  return 'PIN admin berhasil diperbarui.';
}
function hash_(s) { const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8); return bytes.map(b=>(b<0?b+256:b).toString(16).padStart(2,'0')).join(''); }
function adminLogin(pin) {
  const saved=PropertiesService.getScriptProperties().getProperty('ADMIN_PIN_HASH');
  if (!saved || hash_(String(pin||''))!==saved) throw new Error('PIN admin tidak sesuai.');
  const token=Utilities.getUuid(); CacheService.getScriptCache().put('adm_'+token,'1',21600);
  return {token:token, expiresIn:'6 jam'};
}
function requireAdmin_(token) { if (!token || CacheService.getScriptCache().get('adm_'+token)!=='1') throw new Error('Sesi admin berakhir. Silakan login kembali.'); }
function db_() { const id=PropertiesService.getScriptProperties().getProperty('DB_ID'); if(!id) throw new Error('Database belum dibuat. Jalankan setupApp() terlebih dahulu.'); return SpreadsheetApp.openById(id); }
function clean_(v,max) { return String(v==null?'':v).trim().slice(0,max||1000); }
function append_(sheetName, row) { const lock=LockService.getScriptLock(); lock.waitLock(15000); try { db_().getSheetByName(sheetName).appendRow(row); } finally { lock.releaseLock(); } }
function newId_(prefix) { return prefix+'-'+Utilities.formatDate(new Date(),APP.TZ,'yyyyMMdd')+'-'+Utilities.getUuid().slice(0,8).toUpperCase(); }
function submitModal(d) {
  d=d||{}; const required=['nama','email','whatsapp','sekolah','tahun','kompetensi','jalur','bantuan','rincian','deskripsi']; required.forEach(k=>{if(!clean_(d[k],500)) throw new Error('Mohon lengkapi semua kolom wajib.');});
  if(!/^\S+@\S+\.\S+$/.test(clean_(d.email,150))) throw new Error('Format email tidak valid.');
  const biaya=Math.max(0,Number(d.biaya)||0); const id=newId_('RM');
  append_('Modal',[id,new Date(),clean_(d.nama,150),clean_(d.email,150),clean_(d.whatsapp,40),clean_(d.sekolah,180),clean_(d.tahun,10),clean_(d.kompetensi,120),clean_(d.jalur,30),clean_(d.aktivitas,80),clean_(d.bantuan,80),clean_(d.rincian,1000),biaya,clean_(d.deskripsi,2000),'Menunggu Seleksi','']);
  return {id:id,message:'Pengajuan berhasil dikirim. Simpan nomor pengajuan Anda.'};
}
function submitTumbuh(d) {
  d=d||{}; ['nama','email','whatsapp','sekolah','minat','topik','kebutuhan'].forEach(k=>{if(!clean_(d[k],500)) throw new Error('Mohon lengkapi semua kolom wajib.');});
  const id=newId_('RT'); append_('Tumbuh',[id,new Date(),clean_(d.nama,150),clean_(d.email,150),clean_(d.whatsapp,40),clean_(d.sekolah,180),clean_(d.minat,100),clean_(d.topik,500),clean_(d.kebutuhan,1000),'Menunggu','']);
  return {id:id,message:'Permintaan pendampingan berhasil dikirim.'};
}
function submitPasar(d) {
  d=d||{}; ['nama','email','whatsapp','sekolah','produk','kategori','deskripsi','kontak'].forEach(k=>{if(!clean_(d[k],500)) throw new Error('Mohon lengkapi semua kolom wajib.');});
  const id=newId_('RP'); append_('Pasar',[id,new Date(),clean_(d.nama,150),clean_(d.email,150),clean_(d.whatsapp,40),clean_(d.sekolah,180),clean_(d.produk,180),clean_(d.kategori,100),clean_(d.deskripsi,1500),clean_(d.harga,100),clean_(d.kontak,500),'Menunggu Moderasi','']);
  return {id:id,message:'Produk berhasil diajukan dan akan ditinjau sebelum ditampilkan.'};
}
function getPublicData() {
  const sh=db_().getSheetByName('Pasar'); const vals=sh.getDataRange().getValues();
  const products=vals.slice(1).filter(r=>r[11]==='Tayang').map(r=>({id:r[0],nama:r[6],kategori:r[7],deskripsi:r[8],harga:r[9],kontak:r[10],pemilik:r[2]}));
  return {products:products, counts:{products:products.length}};
}
function adminDashboard(token) {
  requireAdmin_(token); const ss=db_(); const counts={}; const rows={};
  Object.keys(SHEETS).forEach(n=>{const v=ss.getSheetByName(n).getDataRange().getValues(); rows[n]=v.slice(1).map(r=>({id:r[0],data:r.slice(2).map(x=>x instanceof Date?Utilities.formatDate(x,APP.TZ,'dd/MM/yyyy HH:mm'):x)})); counts[n]=Math.max(0,v.length-1);});
  return {counts:counts,rows:rows};
}
function adminUpdate(token,module,id,status,note) {
  requireAdmin_(token); if(!SHEETS[module]) throw new Error('Modul tidak dikenal.');
  const sh=db_().getSheetByName(module), data=sh.getDataRange().getValues();
  const statusCol= module==='Modal'?15:module==='Tumbuh'?10:module==='Pasar'?12:7;
  const noteCol= module==='Modal'?16:module==='Tumbuh'?11:module==='Pasar'?13:9;
  for(let i=1;i<data.length;i++) if(String(data[i][0])===String(id)) { sh.getRange(i+1,statusCol).setValue(clean_(status,80)); if(noteCol<=sh.getLastColumn()) sh.getRange(i+1,noteCol).setValue(clean_(note,1000)); return 'Data berhasil diperbarui.'; }
  throw new Error('Data tidak ditemukan.');
}
function adminAddMonitoring(token,d) {
  requireAdmin_(token); d=d||{}; ['alumni','modul','tanggal','status'].forEach(k=>{if(!clean_(d[k],300)) throw new Error('Lengkapi data monitoring.');});
  append_('Monitoring',[newId_('MON'),new Date(),clean_(d.ref,100),clean_(d.alumni,150),clean_(d.modul,50),clean_(d.tanggal,30),clean_(d.status,100),clean_(d.pendapatan,100),clean_(d.catatan,1000),clean_(d.petugas,150)]); return 'Monitoring tersimpan.';
}
