import { useProjects } from "@/hooks/use-api";
import { FolderKanban } from "lucide-react";
import { Loader2 } from "lucide-react";

export function ProjectsView() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B] p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-500/10 rounded-md">
          <FolderKanban className="w-5 h-5 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-semibold text-[#E8E8ED]">Projects</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.length === 0 && (
          <p className="text-sm text-[#9BA1A6]">No projects found.</p>
        )}
        {projects?.map((project) => (
          <div key={project.id} className="bg-[#1C1C1E] border border-[#27282b] rounded-lg p-5 hover:border-[#38393d] transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[#E8E8ED] group-hover:text-indigo-400 transition-colors">{project.name}</h3>
              <span className="text-xs font-mono text-[#696C75] bg-white/5 px-2 py-0.5 rounded">{project.projectKey}</span>
            </div>
            <div className="text-sm text-[#9BA1A6] mb-6">
              {project.issues?.length || 0} active issues
            </div>
            <div className="flex -space-x-2">
              {/* Mock avatars for now */}
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-[#1C1C1E] flex items-center justify-center text-[10px] text-indigo-400">A</div>
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-[#1C1C1E] flex items-center justify-center text-[10px] text-blue-400">B</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
