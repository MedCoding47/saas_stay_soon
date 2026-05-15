import ProfileCard from './profile-card';

export default function DemoOne() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ProfileCard
          imageUrl="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
          name="John Doe"
          subtitle="@johndoe"
          meta="12m ago"
          buttonLabel="+ Add member"
          buttonAction={() => console.log('Add member clicked')}
        />
      </div>
    </div>
  );
}
