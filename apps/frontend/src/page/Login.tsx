import { useState, type SVGProps } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../hooks/useAuth';
import { LOGIN_MUTATION } from '../lib/mutations';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await loginMutation({
        variables: { username, password }
      });

      if (data?.login?.token) {
        login(data.login.token);
        navigate('/');
      } else {
        setError(data?.login?.message || 'Erreur de connexion');
      }
    } catch {
      setError('Une erreur inattendue est survenue.');
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[url('https://images.pexels.com/photos/14208568/pexels-photo-14208568.jpeg')] bg-cover bg-center p-4">
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-3xl border border-white/50 bg-white/60 px-6 py-12 backdrop-blur-2xl sm:px-10">
        <div className="mx-auto w-full">
          <h1>
            👋  Connexion
          </h1>
          <p className="mt-4 mb-4 text-base">
            Connectez-vous pour accéder à votre compte.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-xl bg-red-100 p-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <p className="mb-2 block">
                  Nom d'utilisateur
                </p>
                <input
                  className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  type="text"
                />
              </div>
              <div className="col-span-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="block">
                    Mot de passe
                  </p>
                  <Link to="/forgot-password" className="text-base font-medium text-neutral-600 hover:text-neutral-800">
                    Oublié ?
                  </Link>
                </div>
                <input
                  className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                  id="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                />
              </div>
              <div className="col-span-full pt-2">
                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 font-medium text-white duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Se connecter'}
                </button>
              </div>
              <button
                aria-label="Se connecter avec Google"
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 font-medium duration-200 hover:bg-white/50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                type="button"
              >
                <GoogleIcon className="size-6" />
                <span className='text-black'>Se connecter avec Google</span>
              </button>
            </div>
            <Link to="/register" className="mx-auto mt-6 flex text-center font-medium text-neutral-600 hover:text-neutral-800 leading-tight">
              Pas encore de compte ?
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      height="100"
      viewBox="0 0 48 48"
      width="100"
      x="0px"
      xmlns="http://www.w3.org/2000/svg"
      y="0px"
      {...props}
    >
      <title>Google Logo</title>
      <path
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        fill="#FFC107"
      />
      <path
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        fill="#FF3D00"
      />
      <path
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        fill="#4CAF50"
      />
      <path
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        fill="#1976D2"
      />
    </svg>
  );
}
