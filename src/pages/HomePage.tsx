import { useAppStore } from "../store/useAppStore";
import { useGroups } from "../hooks/useGroups";
import { useCards } from "../hooks/useCards";
import GroupList from "../components/groups/GroupList";
import CardGrid from "../components/cards/CardGrid";
import GroupFormModal from "../components/groups/GroupFormModal";
import CardFormModal from "../components/cards/CardFormModal";

export default function HomePage() {
  const selectedGroupId = useAppStore((s) => s.selectedGroupId);
  const { groups } = useGroups();
  const { cards } = useCards(selectedGroupId);

  return (
    <div className="flex flex-col gap-4 p-4">
      <GroupList groups={groups} />
      <CardGrid cards={cards} />
      <GroupFormModal />
      <CardFormModal groups={groups} />
    </div>
  );
}
