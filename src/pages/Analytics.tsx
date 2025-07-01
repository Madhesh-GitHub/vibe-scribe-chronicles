import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Target,
  BookOpen,
  ArrowLeft,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface AnalyticsData {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  avgMood: number;
  moodDistribution: { [key: number]: number };
  weeklyMoods: { date: string; mood: number }[];
  topTags: { tag: string; count: number }[];
  recentGratitudes: string[];
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const moodEmojis = [
    { value: 1, icon: Frown, label: 'Terrible', color: 'text-red-500' },
    { value: 2, icon: Frown, label: 'Bad', color: 'text-orange-500' },
    { value: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
    { value: 4, icon: Smile, label: 'Good', color: 'text-green-500' },
    { value: 5, icon: Smile, label: 'Amazing', color: 'text-blue-500' }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: true });

      if (error) throw error;

      if (!entries || entries.length === 0) {
        setAnalytics({
          totalEntries: 0,
          currentStreak: 0,
          longestStreak: 0,
          avgMood: 0,
          moodDistribution: {},
          weeklyMoods: [],
          topTags: [],
          recentGratitudes: []
        });
        setLoading(false);
        return;
      }

      // Calculate analytics
      const totalEntries = entries.length;
      const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries;

      // Mood distribution
      const moodDistribution = entries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });

      // Weekly moods (last 7 days)
      const weekStart = startOfWeek(new Date());
      const weeklyMoods = [];
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(weekStart, 6 - i), 'yyyy-MM-dd');
        const dayEntry = entries.find(entry => entry.entry_date === date);
        weeklyMoods.push({
          date: format(subDays(weekStart, 6 - i), 'EEE'),
          mood: dayEntry ? dayEntry.mood : 0
        });
      }

      // Top tags
      const allTags = entries.flatMap(entry => entry.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent gratitudes
      const recentGratitudes = entries
        .slice(-10)
        .flatMap(entry => entry.gratitude || [])
        .filter(g => g.trim())
        .slice(-6);

      // Calculate streaks
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );

      let currentStreak = 0;
      let longestStreak = 0;

      // Get unique dates in descending order (most recent first)
      const uniqueDates = [...new Set(sortedEntries.map(entry => entry.entry_date))]
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      console.log('Unique dates:', uniqueDates); // Debug log

      if (uniqueDates.length === 0) {
        currentStreak = 0;
        longestStreak = 0;
      } else {
        const today = new Date();
        const todayString = format(today, 'yyyy-MM-dd');
        const yesterdayString = format(subDays(today, 1), 'yyyy-MM-dd');
        
        // Check if user has entry today or yesterday (to allow for different time zones)
        const hasRecentEntry = uniqueDates[0] === todayString || uniqueDates[0] === yesterdayString;
        
        if (hasRecentEntry) {
          // Calculate current streak
          currentStreak = 1; // Start with the most recent entry
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i - 1]);
            const previousDate = new Date(uniqueDates[i]);
            
            // Calculate difference in days
            const diffTime = currentDate.getTime() - previousDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            console.log(`Comparing ${uniqueDates[i-1]} and ${uniqueDates[i]}: ${diffDays} days apart`); // Debug log
            
            if (diffDays === 1) {
              currentStreak++;
            } else {
              break; // Streak is broken
            }
          }
        } else {
          currentStreak = 0; // No recent entries
        }
        
        // Calculate longest streak
        let tempStreak = 1;
        longestStreak = 1;
        
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i - 1]);
          const previousDate = new Date(uniqueDates[i]);
          
          const diffTime = currentDate.getTime() - previousDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1; // Reset for new potential streak
          }
        }
        
        // Don't forget to check the final streak
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      console.log('Current streak:', currentStreak); // Debug log
      console.log('Longest streak:', longestStreak); // Debug log

      setAnalytics({
        totalEntries,
        currentStreak,
        longestStreak,
        avgMood: Math.round(avgMood * 10) / 10,
        moodDistribution,
        weeklyMoods,
        topTags,
        recentGratitudes
      });

    } catch (error: any) {
      console.error('Analytics error:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/journal')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Your Journey Analytics</h1>
            <p className="text-muted-foreground">Insights into your reflection journey</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalEntries}</p>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.longestStreak}</p>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                {moodEmojis.find(m => Math.round(analytics.avgMood) === m.value)?.icon && 
                  React.createElement(
                    moodEmojis.find(m => Math.round(analytics.avgMood) === m.value)!.icon,
                    { className: `h-5 w-5 ${moodEmojis.find(m => Math.round(analytics.avgMood) === m.value)!.color}` }
                  )
                }
                <div>
                  <p className="text-2xl font-bold">{analytics.avgMood}</p>
                  <p className="text-sm text-muted-foreground">Average Mood</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Mood Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              This Week's Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end h-32 gap-2">
              {analytics.weeklyMoods.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className="bg-purple-600 rounded-t w-full"
                    style={{ 
                      height: `${day.mood > 0 ? (day.mood / 5) * 80 : 4}px`,
                      backgroundColor: day.mood === 0 ? '#e5e7eb' : undefined
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {moodEmojis.map((mood) => {
                const count = analytics.moodDistribution[mood.value] || 0;
                const percentage = analytics.totalEntries > 0 ? (count / analytics.totalEntries) * 100 : 0;
                
                return (
                  <div key={mood.value} className="flex items-center gap-3">
                    <mood.icon className={`h-4 w-4 ${mood.color}`} />
                    <span className="text-sm w-16">{mood.label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Most Used Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topTags.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topTags.map((tag, index) => (
                    <div key={tag.tag} className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-sm">
                        #{tag.tag}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {tag.count} time{tag.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Start adding tags to your entries to see trends!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Gratitudes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Recent Gratitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentGratitudes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analytics.recentGratitudes.map((gratitude, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-800">"{gratitude}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start adding gratitudes to your daily reflections!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;