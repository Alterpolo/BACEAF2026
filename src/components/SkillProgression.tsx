import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Lock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  BookOpen,
  MessageSquare,
  Mic,
} from 'lucide-react';
import {
  getUserSkills,
  getProgressionStats,
  getUserAchievements,
  getRecommendations,
  UserSkill,
  ProgressionStats,
  UserAchievement,
  Recommendation,
} from '../services/progression';
import { ExerciseType } from '../types';

const TYPE_CONFIG = {
  [ExerciseType.DISSERTATION]: {
    icon: BookOpen,
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    progressColor: 'bg-indigo-500',
    label: 'Dissertation',
  },
  [ExerciseType.COMMENTAIRE]: {
    icon: MessageSquare,
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    progressColor: 'bg-emerald-500',
    label: 'Commentaire',
  },
  [ExerciseType.ORAL]: {
    icon: Mic,
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    progressColor: 'bg-amber-500',
    label: 'Oral',
  },
};

const STATUS_CONFIG = {
  locked: {
    icon: Lock,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-200',
    label: 'Verrouillé',
  },
  unlocked: {
    icon: Circle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-200',
    label: 'Débloqué',
  },
  in_progress: {
    icon: Target,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-500',
    borderColor: 'border-orange-200',
    label: 'En cours',
  },
  mastered: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    textColor: 'text-green-500',
    borderColor: 'border-green-200',
    label: 'Maîtrisé',
  },
};

export const SkillProgression: React.FC = () => {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [stats, setStats] = useState<ProgressionStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ExerciseType>(ExerciseType.DISSERTATION);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [skillsData, statsData, achievementsData, recommendationsData] = await Promise.all([
        getUserSkills(),
        getProgressionStats(),
        getUserAchievements(),
        getRecommendations(),
      ]);
      setUserSkills(skillsData);
      setStats(statsData);
      setAchievements(achievementsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading progression data:', error);
    } finally {
      setLoading(false);
    }
  };

  const skillsByType = userSkills.reduce((acc, us) => {
    const type = us.skill?.exercise_type as ExerciseType;
    if (!type) return acc;
    if (!acc[type]) acc[type] = [];
    acc[type].push(us);
    return acc;
  }, {} as Record<ExerciseType, UserSkill[]>);

  // Sort skills by order_index
  (Object.values(skillsByType) as UserSkill[][]).forEach((skills) => {
    skills.sort((a, b) => (a.skill?.order_index || 0) - (b.skill?.order_index || 0));
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Chargement de votre progression...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
          Ma progression méthodologique
        </h1>
        <p className="text-slate-600 mt-2">
          Maîtrisez chaque compétence pour devenir expert en dissertation, commentaire et oral.
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Compétences totales"
            value={stats.totalSkills}
            color="slate"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Maîtrisées"
            value={stats.masteredSkills}
            color="green"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="En cours"
            value={stats.inProgressSkills}
            color="orange"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Progression"
            value={`${stats.overallProgress}%`}
            color="indigo"
          />
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Recommandations personnalisées
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => {
              const config = TYPE_CONFIG[rec.skill.exercise_type as ExerciseType];
              return (
                <Link
                  key={rec.skillId}
                  to={`/entrainement?skill=${rec.skillId}`}
                  className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                      <config.icon className={`w-5 h-5 ${config.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{rec.skill.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{rec.reason}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Type Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => {
          const typeStats = stats?.byType[type as ExerciseType];
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type as ExerciseType)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === type
                  ? `${config.textColor} border-current`
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              <config.icon className="w-5 h-5" />
              <span>{config.label}</span>
              {typeStats && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
                  {typeStats.mastered}/{typeStats.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {(skillsByType[activeTab] || []).map((userSkill, index) => (
          <SkillCard
            key={userSkill.id}
            userSkill={userSkill}
            index={index + 1}
            typeConfig={TYPE_CONFIG[activeTab]}
          />
        ))}
        {(!skillsByType[activeTab] || skillsByType[activeTab].length === 0) && (
          <div className="text-center py-12 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Aucune compétence trouvée pour ce type.</p>
          </div>
        )}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            Badges obtenus ({achievements.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {achievements.map((ua) => (
              <div
                key={ua.id}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200"
                title={ua.achievement?.description}
              >
                <span className="text-xl">{ua.achievement?.icon}</span>
                <span className="text-sm font-medium text-amber-800">{ua.achievement?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponents
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface SkillCardProps {
  userSkill: UserSkill;
  index: number;
  typeConfig: typeof TYPE_CONFIG[ExerciseType];
}

const SkillCard: React.FC<SkillCardProps> = ({ userSkill, index, typeConfig }) => {
  const skill = userSkill.skill;
  if (!skill) return null;

  const statusConfig = STATUS_CONFIG[userSkill.status];
  const StatusIcon = statusConfig.icon;

  const progress = skill.exercises_to_master
    ? Math.min(100, (userSkill.exercises_completed / skill.exercises_to_master) * 100)
    : 0;

  const canPractice = userSkill.status !== 'locked';

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all ${
        canPractice ? 'hover:shadow-md' : 'opacity-60'
      } ${statusConfig.borderColor}`}
    >
      <div className="flex items-center gap-4">
        {/* Index / Status Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            userSkill.status === 'mastered'
              ? 'bg-green-100 text-green-600'
              : userSkill.status === 'locked'
              ? 'bg-slate-100 text-slate-400'
              : `${typeConfig.bgColor} ${typeConfig.textColor}`
          }`}
        >
          {userSkill.status === 'mastered' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : userSkill.status === 'locked' ? (
            <Lock className="w-5 h-5" />
          ) : (
            index
          )}
        </div>

        {/* Skill Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900">{skill.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate">{skill.description}</p>

          {/* Progress bar */}
          {userSkill.status !== 'locked' && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${typeConfig.progressColor} transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {userSkill.exercises_completed}/{skill.exercises_to_master}
              </span>
            </div>
          )}
        </div>

        {/* Score / Action */}
        <div className="flex items-center gap-3">
          {userSkill.average_score !== null && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Moyenne</p>
              <p className="font-bold text-slate-900">{userSkill.average_score.toFixed(1)}/20</p>
            </div>
          )}

          {canPractice && (
            <Link
              to={`/entrainement?skill=${skill.id}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                userSkill.status === 'mastered'
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : `${typeConfig.bgColor} ${typeConfig.textColor} hover:opacity-80`
              }`}
            >
              {userSkill.status === 'mastered' ? 'Réviser' : "S'entraîner"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillProgression;
