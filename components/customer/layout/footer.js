"use client";

export default function Footer() {
  return (
    <footer className="bg-purple-100 mt-auto w-full">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between gap-8">
          {/* Account */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Account</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-sm text-gray-700 hover:underline">
                  My tickets
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-700 hover:underline">
                  Settings
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Support</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-700 hover:underline"
                >
                  Contact Customer Service
                </a>
              </li>
            </ul>
          </div>

          {/* Become a partner */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Become a partner</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-700 hover:underline"
                >
                  List your club
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Legal</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-sm text-gray-700 hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-700 hover:underline">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500 mt-8">
          © 2025 Clubster
        </div>
      </div>
    </footer>
  );
}
