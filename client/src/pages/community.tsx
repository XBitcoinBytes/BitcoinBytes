import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LazyCommunityForumWrapper,
  LazyAchievementLeaderboardWrapper 
} from "@/components/lazy-components";

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      <Tabs defaultValue="forum" className="container mx-auto px-4 py-8">
        <TabsList className="grid w-full grid-cols-2 bg-dark-card mb-8">
          <TabsTrigger value="forum">Community Forum</TabsTrigger>
          <TabsTrigger value="leaderboard">Achievement Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="forum">
          <LazyCommunityForumWrapper />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LazyAchievementLeaderboardWrapper />
        </TabsContent>
      </Tabs>
    </div>
  );
}