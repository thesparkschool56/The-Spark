import React from 'react';
import IdeaCard from '../../components/ui/IdeaCard';

interface Project {
  id: string;
  name: string;
  description: string;
  jobsRequired: Array<{
    id: string;
    role: string;
    skills: string[];
  }>;
}

interface UserProfile {
  skills: string[];
}

const HomePage: React.FC = () => {
  // Mock Data for Demonstration
  const userProfile: UserProfile = {
    skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Next.js']
  };

  const projects: Project[] = [
    {
      id: '1',
      name: 'Eco-Smart Home System',
      description: 'An AI-powered system for managing home energy efficiency using IoT devices and real-time monitoring.',
      jobsRequired: [
        { id: 'j1', role: 'Frontend Developer', skills: ['React', 'TypeScript', 'Tailwind CSS'] },
        { id: 'j2', role: 'IoT Engineer', skills: ['C++', 'Python', 'MQTT'] }
      ]
    },
    {
      id: '2',
      name: 'Neural Health Tracker',
      description: 'A mobile application that tracks cognitive health through daily interactive puzzles and biometrics.',
      jobsRequired: [
        { id: 'j3', role: 'Fullstack Architect', skills: ['Next.js', 'Node.js', 'Firebase', 'Python'] },
        { id: 'j4', role: 'UI/UX Designer', skills: ['Figma', 'Prototyping'] }
      ]
    }
  ];

  /**
   * Calculates a match score between a user's profile skills and a project's required skills.
   * Returns a number between 0 and 100.
   */
  const getProjectScore = (userSkills: string[], projectJobs: Project['jobsRequired']): number => {
    if (!projectJobs || projectJobs.length === 0) return 0;

    // Flatten all required skills for the project
    const requiredSkills = new Set(projectJobs.flatMap(job => job.skills));
    if (requiredSkills.size === 0) return 0;

    // Find overlapping skills
    const matchedSkills = userSkills.filter(skill => requiredSkills.has(skill));

    // Calculate percentage (0-100)
    const score = (matchedSkills.length / requiredSkills.size) * 100;
    
    return Math.round(score);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mb-4 uppercase tracking-tight">Project Matching</h1>
          <p className="text-stone-500 font-light max-w-2xl mx-auto">Discover projects that align with your technical expertise and professional skills.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map(project => {
            const score = getProjectScore(userProfile.skills, project.jobsRequired);
            return (
              <IdeaCard 
                key={project.id} 
                project={project} 
                matchScore={score} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
