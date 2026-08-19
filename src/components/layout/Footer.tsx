export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="text-sm font-semibold text-primary">
              Community Stray Pet Watch
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            แพลตฟอร์มแจ้งจุดสัตว์จรจัดป่วย/ดุร้าย และหาบ้าน เพื่อชุมชนที่ดีขึ้นสำหรับทุกชีวิต 🐶🐱
          </p>
          <p className="text-xs text-muted-foreground/60">
            © 2026 Community Stray Pet Watch
          </p>
        </div>
      </div>
    </footer>
  );
}
