import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Tag, 
  Smile, 
  Meh, 
  Frown, 
  Heart,
  Star,
  Target,
  BookOpen,
  TrendingUp,
  Edit,
  Trash2,
  Save,
  X,
  LogOut,
  User,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  gratitude: string[];
  goals: string[];
  highlights: string;
  created_at: string;
  entry_date: string;
}

const EnhancedJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    title: '',
    content: '',
    mood: 3,
    tags: [] as string[],
    gratitude: ['', '', ''],
    goals: [''],
    highlights: '',
    entry_date: format(new Date(), 'yyyy-MM-dd')
  });
  const { user } = supabase.auth;
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const moodEmojis = [
    { value: 1, icon: Frown, label: 'Terrible', color: 'text-red-500' },
    { value: 2, icon: Frown, label: 'Bad', color: 'text-orange-500' },
    { value: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
    { value: 4, icon: Smile, label: 'Good', color: 'text-green-500' },
    { value: 5, icon: Smile, label: 'Amazing', color: 'text-blue-500' },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };

  const handleSaveEntry = async () => {
    // Use currentEntry for both create and update operations
    const entryToSave = currentEntry;
    
    if (!entryToSave.title.trim() || !entryToSave.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (editingEntry) {
        // Update existing entry - use editingEntry.id but currentEntry data
        const { error } = await supabase
          .from('journal_entries')
          .update({
            title: entryToSave.title,
            content: entryToSave.content,
            mood: entryToSave.mood,
            tags: entryToSave.tags,
            gratitude: entryToSave.gratitude.filter(g => g.trim()),
            goals: entryToSave.goals.filter(g => g.trim()),
            highlights: entryToSave.highlights,
            entry_date: entryToSave.entry_date
          })
          .eq('id', editingEntry.id); // Use editingEntry.id for the WHERE clause

        if (error) throw error;

        toast({
          title: "Success",
          description: "Journal entry updated!"
        });
        
        // Clear editing state
        setEditingEntry(null);
        setIsEditMode(false);
      } else {
        // Create new entry
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('journal_entries')
          .insert([{
            ...entryToSave,
            user_id: user?.id,
            gratitude: entryToSave.gratitude.filter(g => g.trim()),
            goals: entryToSave.goals.filter(g => g.trim())
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Journal entry saved!"
        });
      }

      // Reset form to initial state
      setCurrentEntry({
        title: '',
        content: '',
        mood: 3,
        tags: [],
        gratitude: ['', '', ''],
        goals: [''],
        highlights: '',
        entry_date: format(new Date(), 'yyyy-MM-dd')
      });

      // Reset date picker
      setSelectedDate(new Date());

      // Refresh entries list
      fetchEntries();
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setIsEditMode(true);
    
    setCurrentEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      gratitude: entry.gratitude && entry.gratitude.length > 0 ? [...entry.gratitude, '', '', ''].slice(0, 3) : ['', '', ''],
      goals: entry.goals && entry.goals.length > 0 ? entry.goals : [''],
      highlights: entry.highlights || '',
      entry_date: entry.entry_date
    });
    setSelectedDate(new Date(entry.entry_date));
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingEntry(null);
    setCurrentEntry({
      title: '',
      content: '',
      mood: 3,
      tags: [],
      gratitude: ['', '', ''],
      goals: [''],
      highlights: '',
      entry_date: format(new Date(), 'yyyy-MM-dd')
    });
    setSelectedDate(new Date());
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Journal entry deleted!"
      });

      fetchEntries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive"
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !currentEntry.tags.includes(newTag.trim())) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch entries",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []); // Remove the user fetching part since you're using supabase.auth directly

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Logout */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Your Daily Reflection</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-4">Reflect on your day, track your growth, and capture meaningful moments</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {user && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>
            )}
            <Button 
              onClick={() => navigate('/analytics')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              {editingEntry ? 'Edit Entry' : 'Daily Reflection'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Date Selection */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start">
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setCurrentEntry(prev => ({
                          ...prev,
                          entry_date: format(date, 'yyyy-MM-dd')
                        }));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Title */}
            <Input
              placeholder="How would you describe your day?"
              value={currentEntry.title}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
              className="text-base sm:text-lg font-medium"
            />

            {/* Mood Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">How did you feel today?</label>
              <div className="grid grid-cols-2 sm:flex gap-2">
                {moodEmojis.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <Button
                      key={mood.value}
                      variant={currentEntry.mood === mood.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentEntry(prev => ({ ...prev, mood: mood.value }))}
                      className="flex flex-col gap-1 h-auto py-2 px-2 sm:px-3"
                    >
                      <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${mood.color}`} />
                      <span className="text-xs">{mood.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <Textarea
              placeholder="Reflect on your day... What happened? How did you feel? What did you learn?"
              value={currentEntry.content}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
            />

            {/* Gratitude Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                What were you grateful for today?
              </label>
              <div className="space-y-2">
                {currentEntry.gratitude.map((item, index) => (
                  <Input
                    key={index}
                    placeholder={`Gratitude ${index + 1} - What made you feel thankful today?`}
                    value={item}
                    onChange={(e) => {
                      const newGratitude = [...currentEntry.gratitude];
                      newGratitude[index] = e.target.value;
                      setCurrentEntry(prev => ({ ...prev, gratitude: newGratitude }));
                    }}
                    className="text-sm sm:text-base"
                  />
                ))}
              </div>
            </div>

            {/* Goals Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                What did you accomplish today? What goals did you work towards?
              </label>
              <div className="space-y-2">
                {currentEntry.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Achievement ${index + 1} - What did you accomplish?`}
                      value={goal}
                      onChange={(e) => {
                        const newGoals = [...currentEntry.goals];
                        newGoals[index] = e.target.value;
                        setCurrentEntry(prev => ({ ...prev, goals: newGoals }));
                      }}
                      className="text-sm sm:text-base"
                    />
                    {index === currentEntry.goals.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentEntry(prev => ({ 
                          ...prev, 
                          goals: [...prev.goals, ''] 
                        }))}
                        className="shrink-0"
                      >
                        +
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                What was the best part of your day?
              </label>
              <Input
                placeholder="What moment made today special or memorable?"
                value={currentEntry.highlights}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, highlights: e.target.value }))}
                className="text-sm sm:text-base"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (themes, activities, people):
              </label>
              <div className="flex gap-2 flex-wrap">
                {currentEntry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer text-xs" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Add tag (work, family, exercise, etc.)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="w-full sm:w-48 text-sm sm:text-base"
                  />
                  <Button type="button" size="sm" onClick={addTag} className="w-full sm:w-auto">Add</Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSaveEntry} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Reflection')}
              </Button>
              {editingEntry && (
                <Button onClick={handleCancelEdit} variant="outline" className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Your Journey
          </h2>
          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
                No reflections yet. Start writing to see your growth journey!
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className={editingEntry?.id === entry.id ? "ring-2 ring-blue-500" : ""}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      <h3 className="text-base sm:text-lg font-semibold break-words">{entry.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(entry.entry_date), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      {moodEmojis.find(m => m.value === entry.mood) && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          {React.createElement(moodEmojis.find(m => m.value === entry.mood)!.icon, {
                            className: `h-3 w-3 ${moodEmojis.find(m => m.value === entry.mood)!.color}`
                          })}
                          {moodEmojis.find(m => m.value === entry.mood)!.label}
                        </Badge>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEntry(entry)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4 line-clamp-3 break-words">{entry.content}</p>
                  
                  {entry.highlights && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Highlight:
                      </span>
                      <p className="text-sm text-muted-foreground mt-1 break-words">{entry.highlights}</p>
                    </div>
                  )}
                  
                  {entry.gratitude && entry.gratitude.length > 0 && entry.gratitude.some(item => item.trim()) && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        Grateful for:
                      </span>
                      <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                        {entry.gratitude.filter(item => item.trim()).map((item, index) => (
                          <li key={index} className="break-words">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* ADD THIS SECTION: Goals/Accomplishments Display */}
                  {entry.goals && entry.goals.length > 0 && entry.goals.some(goal => goal.trim()) && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Accomplishments:
                      </span>
                      <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                        {entry.goals.filter(goal => goal.trim()).map((goal, index) => (
                          <li key={index} className="break-words">{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs break-all">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedJournal;