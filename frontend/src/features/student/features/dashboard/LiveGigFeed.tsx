"use client";

import { Search, SlidersHorizontal, MapPin, Clock, Navigation } from "lucide-react";
import JobCard, { DashboardJob } from "./JobCard";
import { useState } from "react";

interface LiveGigFeedProps {
  jobs: DashboardJob[];
  onSelectJob: (job: DashboardJob) => void;
}

const QUICK_FILTERS = [
  { id: "dist_1km", label: "< 1km", icon: MapPin },
  { id: "time_1hr", label: "Ventana 1 hr", icon: Clock },
  { id: "cat_food", label: "Locales", icon: Navigation },
  { id: "cat_tutor", label: "Tutorías", icon: Navigation },
  { id: "cat_pickup", label: "Pick-up", icon: Navigation },
];

export default function LiveGigFeed({ jobs, onSelectJob }: LiveGigFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterClick = (id: string) => {
    setActiveFilter(activeFilter === id ? null : id);
  };

  // Basic frontend filtering for demo purposes
  const filteredJobs = jobs.filter((job) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!job.title.toLowerCase().includes(q) && !job.location?.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (activeFilter === "dist_1km" && (job.distance ?? 0) > 1000) return false;
    if (activeFilter === "time_1hr" && (job.duration_hours ?? 0) > 1) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-1">
          <span className="inline-block h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          Live Gig Feed
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Trabajos dinámicos cerca de ti. Actualizado en tiempo real.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar pegas por facultad, local o rol..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
        />
        <button className="absolute inset-y-2 right-2 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-transparent hover:border-slate-200">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Filters (Pills) */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar mask-edges">
        {QUICK_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-200" : "text-slate-400"}`} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onSelect={onSelectJob} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white/50 border border-slate-200 border-dashed rounded-2xl">
            <p className="text-slate-500 font-medium">No se encontraron trabajos con los filtros actuales.</p>
          </div>
        )}
      </div>
    </div>
  );
}
