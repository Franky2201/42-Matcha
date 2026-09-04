import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FilterSection } from '../components/Filter';
import { ProfileStack } from '../components/Stack';
import { useUser } from '../context/UserContext';
import type { MockProfile } from '../types/ui';

const mockProfile: MockProfile = {
  id: "1",
  name: "Sophie",
  age: 26,
  distance: 3,
  rating: 4.8,
  tags: ["vegan", "art", "voyage"],
  imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
};

export default function Home() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white bg-cover bg-center bg-fixed">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-8">
          <FilterSection />

          <div className="flex-1 flex items-center justify-center py-4">
            <ProfileStack profile={mockProfile} />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
