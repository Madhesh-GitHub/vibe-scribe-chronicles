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
  User
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
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [newTag, setNewTag] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
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
    const entryToSave = editingEntry || currentEntry;
    
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (editingEntry) {
        // Update existing entry
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
          .eq('id', editingEntry.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Journal entry updated!"
        });
        setEditingEntry(null);
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert([{
            ...entryToSave,
            user_id: user.id,
            gratitude: entryToSave.gratitude.filter(g => g.trim()),
            goals: entryToSave.goals.filter(g => g.trim())
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Journal entry saved!"
        });
      }

      // Reset form
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

      fetchEntries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
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
    // Get user info
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2">Your Daily Reflection</h1>
            <p className="text-muted-foreground">Reflect on your day, track your growth, and capture meaningful moments</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            )}
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {editingEntry ? 'Edit Entry' : 'Daily Reflection'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
              className="text-lg font-medium"
            />

            {/* Mood Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">How did you feel today?</label>
              <div className="flex gap-2">
                {moodEmojis.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <Button
                      key={mood.value}
                      variant={currentEntry.mood === mood.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentEntry(prev => ({ ...prev, mood: mood.value }))}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <Icon className={`h-4 w-4 ${mood.color}`} />
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
              className="min-h-[200px]"
            />

            {/* Gratitude Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                What were you grateful for today?
              </label>
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
                />
              ))}
            </div>

            {/* Goals Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                What did you accomplish today? What goals did you work towards?
              </label>
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
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
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
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag (work, family, exercise, etc.)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="w-48"
                  />
                  <Button type="button" size="sm" onClick={addTag}>Add</Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEntry} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Reflection')}
              </Button>
              {editingEntry && (
                <Button onClick={handleCancelEdit} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Journey
          </h2>
          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reflections yet. Start writing to see your growth journey!
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className={editingEntry?.id === entry.id ? "ring-2 ring-blue-500" : ""}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.entry_date), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {moodEmojis.find(m => m.value === entry.mood) && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          {React.createElement(moodEmojis.find(m => m.value === entry.mood)!.icon, {
                            className: `h-3 w-3 ${moodEmojis.find(m => m.value === entry.mood)!.color}`
                          })}
                          {moodEmojis.find(m => m.value === entry.mood)!.label}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEntry(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4 line-clamp-3">{entry.content}</p>
                  
                  {entry.highlights && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Highlight:
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">{entry.highlights}</p>
                    </div>
                  )}
                  
                  {entry.gratitude && entry.gratitude.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        Grateful for:
                      </span>
                      <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                        {entry.gratitude.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
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