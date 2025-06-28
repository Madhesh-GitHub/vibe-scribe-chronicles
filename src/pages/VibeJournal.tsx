import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Edit, Trash2, Check, X } from 'lucide-react';

interface Vibe {
  id: string;
  text: string;
  mood: string;
  created_at: string;
}

const VibeJournal = () => {
  const [vibeText, setVibeText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editMood, setEditMood] = useState('');
  const { toast } = useToast();

  const moods = ['Happy', 'Sad', 'Chill', 'Angry'];

  useEffect(() => {
    fetchVibes();
  }, []);

  const fetchVibes = async () => {
    try {
      console.log('Fetching vibes from Supabase...');
      const { data, error } = await supabase
        .from('vibes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vibes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch vibes",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched vibes:', data);
      setVibes(data || []);
    } catch (error) {
      console.error('Error in fetchVibes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vibes",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vibeText.trim() || !selectedMood) {
      toast({
        title: "Error",
        description: "Please fill in both vibe text and mood",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting vibe:', { text: vibeText, mood: selectedMood });
      
      const { data, error } = await supabase
        .from('vibes')
        .insert([
          {
            text: vibeText,
            mood: selectedMood
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting vibe:', error);
        toast({
          title: "Error",
          description: "Failed to save vibe",
          variant: "destructive"
        });
        return;
      }

      console.log('Successfully saved vibe:', data);
      toast({
        title: "Success",
        description: "Vibe saved successfully!"
      });

      setVibeText('');
      setSelectedMood('');
      fetchVibes(); // Refresh the list
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to save vibe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vibe: Vibe) => {
    setEditingId(vibe.id);
    setEditText(vibe.text);
    setEditMood(vibe.mood);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      console.log('Updating vibe:', { id, text: editText, mood: editMood });
      
      const { error } = await supabase
        .from('vibes')
        .update({
          text: editText,
          mood: editMood
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating vibe:', error);
        toast({
          title: "Error",
          description: "Failed to update vibe",
          variant: "destructive"
        });
        return;
      }

      console.log('Successfully updated vibe');
      toast({
        title: "Success",
        description: "Vibe updated successfully!"
      });

      setEditingId(null);
      fetchVibes(); // Refresh the list
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      toast({
        title: "Error",
        description: "Failed to update vibe",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditMood('');
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting vibe:', id);
      
      const { error } = await supabase
        .from('vibes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vibe:', error);
        toast({
          title: "Error",
          description: "Failed to delete vibe",
          variant: "destructive"
        });
        return;
      }

      console.log('Successfully deleted vibe');
      toast({
        title: "Success",
        description: "Vibe deleted successfully!"
      });

      fetchVibes(); // Refresh the list
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "Error",
        description: "Failed to delete vibe",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Happy': return 'text-yellow-600 bg-yellow-100';
      case 'Sad': return 'text-blue-600 bg-blue-100';
      case 'Chill': return 'text-green-600 bg-green-100';
      case 'Angry': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">Vibe Journal</h1>
        
        {/* Entry Form */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  placeholder="How do you feel today?"
                  value={vibeText}
                  onChange={(e) => setVibeText(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                />
              </div>
              
              <div>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Vibe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Vibes List */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Your Vibes</h2>
          
          {vibes.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
                No vibes yet. Share how you're feeling!
              </CardContent>
            </Card>
          ) : (
            vibes.map((vibe) => (
              <Card key={vibe.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      {editingId === vibe.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                          />
                          <Select value={editMood} onValueChange={setEditMood}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {moods.map((mood) => (
                                <SelectItem key={mood} value={mood}>
                                  {mood}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <>
                          <p className="text-base sm:text-lg mb-2 break-words">{vibe.text}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getMoodColor(vibe.mood)}`}>
                              {vibe.mood}
                            </span>
                          </div>
                        </>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatDate(vibe.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      {editingId === vibe.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(vibe.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(vibe)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(vibe.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VibeJournal;
