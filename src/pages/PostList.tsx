import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";

interface Post {
  title: string;
  description: string;
  icon: string;
  color: string;
  time: string;
  section: string; // Web3, dev, devops
}

const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch("https://inquiso-backend.onrender.com/posts");
  const data = await response.json();
  return data.map((post: any) => ({
    title: post.title,
    description: post.description,
    icon: "📝", // You can replace this with relevant icons for posts
    color: "#00C9A7", // You can use colors dynamically from posts if available
    time: new Date(post.createdAt).toLocaleTimeString(),
    section: post.section, // Assuming the post model includes section
  }));
};

const PostItem = ({ title, description, icon, color, time }: Post) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg">{title}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [activeSection, setActiveSection] = useState<string>("web3");

  useEffect(() => {
    const loadPosts = async () => {
      const allPosts = await fetchPosts();
      setPosts(allPosts);
      setFilteredPosts(allPosts.filter((post) => post.section === "web3"));
    };
    loadPosts();
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setFilteredPosts(posts.filter((post) => post.section === section));
  };

  return (
    <div className="p-6">
      {/* Section Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {["web3", "dev", "devops"].map((section) => (
          <button
            key={section}
            className={cn(
              "px-4 py-2 rounded-lg text-white font-semibold",
              activeSection === section ? "bg-blue-500" : "bg-gray-400"
            )}
            onClick={() => handleSectionChange(section)}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Animated List */}
      <div
        className={cn(
          "relative flex h-[500px] w-full flex-col p-6 overflow-hidden rounded-lg border bg-background md:shadow-xl"
        )}
      >
        <AnimatedList>
          {filteredPosts.map((post, idx) => (
            <PostItem {...post} key={idx} />
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
