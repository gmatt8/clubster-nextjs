import Link from "next/link";

export default function ManagerLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-gray-50">
      <h1 className="text-4xl font-bold">Welcome Manager</h1>
      <div className="flex flex-col space-y-4">
        <Link
          href="/auth/manager/signup"
          className="block px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 text-center"
        >
          Sign Up Manager
        </Link>
        <Link
          href="/auth/manager/login"
          className="block px-6 py-3 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-center"
        >
          Log In Manager
        </Link>
      </div>
    </div>
  );
}
