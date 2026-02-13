import { promises as fs } from 'fs'; // ใช้ fs แบบ promise เพื่อให้ใช้ async/await ได้
import * as path from 'path'; // ใช้จัดการ path ให้ถูกต้องตามระบบปฏิบัติการ

// ฟังก์ชันลบไฟล์จาก relative path อย่างปลอดภัย
export async function safeUnlinkByRelativePath(relativePath: string) {
  // ถ้าไม่ได้ส่ง path มา → ไม่ต้องทำอะไร
  if (!relativePath) return;

  // ปรับ path ให้อยู่ในรูปแบบมาตรฐาน
  // และตัด ../ หรือ ..\ ด้านหน้าออก เพื่อป้องกัน path traversal
  const normalized = path
    .normalize(relativePath)
    .replace(/^(\.\.(\/|\\|$))+/, '');

  try {
    // พยายามลบไฟล์ตาม path ที่ผ่านการกรองแล้ว
    await fs.unlink(normalized);
  } catch (err: any) {
    // ถ้าไฟล์ไม่อยู่ (ENOENT) → ไม่ถือว่าเป็น error
    // แต่ถ้าเป็น error อื่น ๆ → โยนต่อ
    if (err?.code !== 'ENOENT') throw err;
  }
}
