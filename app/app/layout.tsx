import BottomNav from '@/components/BottomNav'
import LevelUpModal from '@/components/LevelUpModal'
import NotifyGate from '@/components/NotifyGate'
import { ProfileProvider } from '@/lib/profile-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <div className="min-h-dvh pb-24">{children}</div>
      <BottomNav />
      <LevelUpModal />
      <NotifyGate />
    </ProfileProvider>
  )
}
