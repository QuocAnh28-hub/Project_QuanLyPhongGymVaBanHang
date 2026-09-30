import TrainerPages from '../components/TrainerPages'

export default function TrainerManagementPage({
  onOpenRoster,
}: {
  onOpenRoster: () => void
}) {
  return <TrainerPages mode="trainers" onOpenRoster={onOpenRoster} />
}
