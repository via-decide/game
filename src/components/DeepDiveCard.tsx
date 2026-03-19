import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { DeepDive } from '../types';

interface DeepDiveCardProps {
  dive: DeepDive;
  onClick: () => void;
}

const DeepDiveCard: React.FC<DeepDiveCardProps> = ({ dive, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-panel p-6 rounded-3xl cursor-pointer group hover:bg-white/10 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-via-accent/20 text-via-accent text-[10px] font-bold uppercase tracking-widest">
          <BookOpen size={12} />
          <span>Deep Dive</span>
        </div>
        <div className="text-via-gold text-xs font-bold tracking-widest uppercase">
          {dive.category}
        </div>
      </div>

      <h3 className="font-syne font-bold text-2xl leading-tight mb-3 group-hover:text-via-accent transition-colors">
        {dive.title}
      </h3>

      <p className="text-sm text-white/60 mb-6 line-clamp-3 leading-relaxed">
        {dive.summary}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{dive.readTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{dive.participants} joined</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-via-accent group-hover:text-white transition-all">
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  );
};

export default DeepDiveCard;
