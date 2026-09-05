import { Link } from 'react-router-dom';
import { MapPin, Clock, Banknote, Star, Building2, ArrowRight } from 'lucide-react';
import { Job } from '../../types';
import { cn, formatSalary, timeAgo, jobTypeBadgeColor, experienceBadgeColor, capitalize } from '../../utils';

interface Props {
  job: Job;
  compact?: boolean;
}

export const JobCard = ({ job, compact = false }: Props) => (
  <Link
    to={`/jobs/${job.id}`}
    className={cn(
      'card p-5 block group hover:-translate-y-0.5 transition-all duration-300',
      job.is_featured && 'ring-1 ring-brand-200 bg-gradient-to-br from-brand-50/50 to-white'
    )}
  >
    {/* Header */}
    <div className="flex items-start gap-3 mb-3">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 group-hover:border-brand-200 transition-colors">
        {job.company_logo ? (
          <img src={job.company_logo} alt={job.company} className="w-10 h-10 object-contain" />
        ) : (
          <Building2 className="w-6 h-6 text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-brand-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          {job.is_featured && (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{job.company}</p>
      </div>
    </div>

    {/* Meta */}
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      <span className={cn('badge', jobTypeBadgeColor(job.job_type))}>{capitalize(job.job_type)}</span>
      <span className={cn('badge', experienceBadgeColor(job.experience_level))}>{capitalize(job.experience_level)}</span>
      {job.category_name && (
        <span className="badge bg-slate-100 text-slate-600">{job.category_name}</span>
      )}
    </div>

    {/* Info row */}
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(job.created_at)}</span>
      {(job.salary_min || job.salary_max) && (
        <span className="flex items-center gap-1 text-brand-600 font-medium">
          <Banknote className="w-3.5 h-3.5" />
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>
      )}
    </div>

    {!compact && (
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex flex-wrap gap-1.5">
          {job.skills?.slice(0, 3).map(skill => (
            <span key={skill} className="text-xs px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
              {skill}
            </span>
          ))}
          {(job.skills?.length ?? 0) > 3 && (
            <span className="text-xs px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-400">
              +{(job.skills?.length ?? 0) - 3}
            </span>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    )}
  </Link>
);
