import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-8 mt-8">
      {/* Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand + blurb */}
        <div>
          <div className="text-2xl font-black tracking-wide text-white">
            FundMyThesis
          </div>
          <p className="mt-6 text-sm leading-7 text-gray-300">
            Break Financial Barriers, Fuel Scientific Dreams. <br />
            Connecting underfunded researchers with a global community. <br />
            Even the smallest support can unlock the next breakthrough.
          </p>
        </div>

        {/* Official Account */}
        <div>
          <h3 className="text-white font-bold text-base md:text-lg tracking-widest">
            Official Account
          </h3>
          <div className="mt-4 flex items-center gap-4">
            {/* X (Twitter) */}
            <a href="#" aria-label="X (Twitter)" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="w-5 h-5 text-gray-200 fill-current">
                {/* Simple Icons の X ロゴパス（ブランド形状準拠） */}
                <path d="M18.244 2h3.513l-7.69 8.79L23.5 22h-7.31l-5.116-6.2L5.3 22H1.787l8.2-9.34L0.5 2h7.392l4.707 5.712L18.244 2Zm-1.28 18.2h2.02L7.122 3.7H5.05l11.914 16.5Z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="w-5 h-5 text-gray-200 fill-current">
                {/* Simple Icons の Instagram パス（公式グリフ準拠） */}
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.262 2.242 1.324 3.608.059 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.324 3.608-.975.975-2.242 1.262-3.608 1.324-1.266.059-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.324-.975-.975-1.262-2.242-1.324-3.608C2.175 15.784 2.163 15.404 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.324-3.608C4.532 1.567 5.799 1.28 7.165 1.218 8.431 1.16 8.811 1.149 12 1.149s3.569.012 4.835.07c1.366.062 2.633.35 3.608 1.325.975.975 1.262 2.242 1.324 3.608.059 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.324 3.608-.975.975-2.242 1.262-3.608 1.324-1.266.059-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.324-.975-.975-1.262-2.242-1.324-3.608C1.149 15.784 1.137 15.404 1.137 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.324-3.608.975-.975 2.242-1.262 3.608-1.324C8.416 2.175 8.796 2.163 12 2.163Zm0 3.257a6.58 6.58 0 1 0 0 13.16 6.58 6.58 0 0 0 0-13.16Zm0 10.857a4.277 4.277 0 1 1 0-8.554 4.277 4.277 0 0 1 0 8.554ZM18.406 5.594a1.531 1.531 0 1 1 0 3.062 1.531 1.531 0 0 1 0-3.062Z"/>
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" aria-label="Facebook" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="w-5 h-5 text-gray-200 fill-current">
                {/* Simple Icons の Facebook "f" ロゴ */}
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82V14.706h-3.13v-3.62h3.13V8.413c0-3.1 1.893-4.788 4.657-4.788 1.325 0 2.463.098 2.795.142v3.24h-1.918c-1.504 0-1.795.715-1.795 1.764v2.314h3.587l-.467 3.62h-3.12V24h6.116C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0Z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" aria-label="YouTube" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="w-5 h-5 text-gray-200 fill-current">
                {/* Simple Icons の YouTube ロゴ */}
                <path d="M23.498 6.186a3.01 3.01 0 0 0-2.119-2.129C19.664 3.5 12 3.5 12 3.5s-7.664 0-9.379.557A3.01 3.01 0 0 0 .502 6.186 31.49 31.49 0 0 0 0 12a31.49 31.49 0 0 0 .502 5.814 3.01 3.01 0 0 0 2.119 2.129C4.336 20.5 12 20.5 12 20.5s7.664 0 9.379-.557a3.01 3.01 0 0 0 2.119-2.129A31.49 31.49 0 0 0 24 12a31.49 31.49 0 0 0-.502-5.814ZM9.75 15.568V8.432L15.818 12 9.75 15.568Z"/>
              </svg>
            </a>

          </div>

          <div className="mt-6 text-sm">
            <div className="text-white">FundMyThesis Inc.</div>
            <div className="mt-2 leading-6 text-gray-300">
              4567 Innovation Avenue, Suite 210 <br />
              Redwood City, CA 94065, USA
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-gray-300">xxx-xxxx-xxxx</div>
            </div>
          </div>
        </div>

        {/* Guide & Help */}
        <div>
          <h3 className="text-white font-bold text-base md:text-lg tracking-widest">
            Guide &amp; Help
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link to="/" className="hover:text-white text-gray-300">About</Link></li>
            <li><Link to="/" className="hover:text-white text-gray-300">Terms of Service</Link></li>
            <li><Link to="/" className="hover:text-white text-gray-300">Privacy Policy</Link></li>
            <li><Link to="/" className="hover:text-white text-gray-300">Guidelines</Link></li>
            <li><Link to="/" className="hover:text-white text-gray-300">Help</Link></li>
          </ul>
        </div>

        {/* Feedback & Requests */}
        <div>
          <h3 className="text-white font-bold text-base md:text-lg tracking-widest">
            Feedback &amp; Requests
          </h3>
          <form
            className="mt-4 flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: submit to your API
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 h-11 rounded-md bg-white text-gray-900 px-3 text-sm placeholder:text-gray-400 outline-none ring-2 ring-transparent focus:ring-blue-400"
            />
            <Button type="submit" className="h-11 px-5 bg-blue-600 hover:bg-blue-700">
              Enter
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom */}
      <div className="" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-white">
        Copyright © {new Date().getFullYear()} FundMyThesis. All rights reserved.
      </div>
    </footer>
  );
}
