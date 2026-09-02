import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { REGISTER_MUTATION } from '../lib/mutations';

const FORBIDDEN_PASSWORDS = ['password', 'admin', 'qwerty', '123456', 'welcome', 'love'];

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const lowerPassword = password.toLowerCase();
    if (FORBIDDEN_PASSWORDS.some(word => lowerPassword.includes(word))) {
      setError('Votre mot de passe contient un mot anglais trop commun ou est trop faible.');
      return;
    }

    try {
      const { data } = await registerMutation({
        variables: { email, username, firstname, lastname, password }
      });

      if (data?.register?.user) {
        setSuccess('Inscription réussie ! Vous allez être redirigé vers la connexion.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data?.register?.message || "Erreur lors de l'inscription");
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
            👋 Bienvenue sur matcha
          </h1>
          <p className="mt-4 mb-4">
            Créez un compte pour rejoindre matcha.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-xl bg-red-100 p-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl bg-green-100 p-3 text-center text-sm font-medium text-green-600">
                {success}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <p className="mb-2 block">Email</p>
                <input
                  className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                  id="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
              <div>
                <p className="mb-2 block">Nom d'utilisateur</p>
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
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="mb-2 block">Prénom</p>
                  <input
                    className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                    id="firstname"
                    placeholder="John"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    type="text"
                  />
                </div>
                <div className="flex-1">
                  <p className="mb-2 block">Nom de famille</p>
                  <input
                    className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                    id="lastname"
                    placeholder="Doe"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    type="text"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 block">Mot de passe</p>
                <input
                  className="block h-12 w-full appearance-none rounded-xl bg-white px-4 py-2 font-medium text-neutral-600 placeholder-neutral-400 duration-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-300 sm:text-sm"
                  id="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  type="password"
                />
              </div>
              <div className="col-span-full pt-2">
                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 font-medium text-white duration-200 hover:bg-primary-hover focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'S\'inscrire'}
                </button>
              </div>
            </div>
            <Link to="/login" className="mx-auto mt-6 flex justify-center text-center font-medium text-neutral-600 hover:text-neutral-800 leading-tight">
              J'ai déjà un compte
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
