import React from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface IdeaCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    jobsRequired: Array<{
      id: string;
      role: string;
      skills: string[];
    }>;
  };
  matchScore: number;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ project, matchScore }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-stone-100 relative overflow-hidden group"
    >
      {/* Match Score Badge */}
      <div className={clsx(
        "absolute top-6 right-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg",
        matchScore >= 80 ? "bg-green-500 text-white shadow-green-500/20" :
        matchScore >= 50 ? "bg-amber-500 text-white shadow-amber-500/20" :
        "bg-stone-500 text-white shadow-stone-500/20"
      )}>
        <Target size={14} />
        Match Score: {matchScore}%
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-serif text-stone-900 mb-3 group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-stone-500 text-sm leading-relaxed font-light line-clamp-2">
          {project.description}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Required Roles</p>
        <div className="flex flex-wrap gap-2">
          {project.jobsRequired.map((job) => (
            <span key={job.id} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[10px] text-stone-600 font-medium">
              {job.role}
            </span>
          ))}
        </div>
      </div>

      <button className="w-full py-4 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.3em] group-hover:bg-primary transition-all flex items-center justify-center gap-2">
        View Project Details <ArrowRight size={14} />
      </button>
    </motion.div>
  );
};

export default IdeaCard;
