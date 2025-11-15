import { protectServer } from "@/features/auth/utils";

import { Banner } from "./banner";
import { ProjectsSection } from "./projects-section";

export default async function Home() {
  await protectServer();

  return (
    <div className="flex flex-col gap-y-6 max-w-7xl mx-auto pb-10">
      <Banner />
      <ProjectsSection />
    </div>
  );
}
