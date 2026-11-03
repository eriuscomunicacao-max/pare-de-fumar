import BottomNav from '@/components/BottomNav'
import FirstWinOffer from '@/components/FirstWinOffer'
import GiftBar from '@/components/GiftBar'
import LevelUpModal from '@/components/LevelUpModal'
import NotifyGate from '@/components/NotifyGate'
import { ProfileProvider } from '@/lib/profile-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <GiftBar />
      <div className="min-h-dvh pb-24">{children}</div>
      <BottomNav />
      <FirstWinOffer />
      <LevelUpModal />
      <NotifyGate />
    </ProfileProvider>
  )
}
