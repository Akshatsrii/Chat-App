import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-void">
      
      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center px-10 md:px-20">
        <h1 className="text-5xl font-bold leading-tight">
          Real-time <br />
          <span className="text-cyan-400">conversations.</span> <br />
          Redefined.
        </h1>

        <p className="mt-4 text-gray-400 max-w-md">
          Join chat rooms, connect with people, and experience messaging built for the modern web.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

    </div>
  );
}