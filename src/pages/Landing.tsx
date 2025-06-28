import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, TrendingUp, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Vibe<span className="text-purple-600">Journal</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your daily thoughts into meaningful insights. Track your mood, 
            reflect on your day, and build better habits with our intelligent journaling platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              Start Journaling Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/vibe-journal')}
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Daily Journaling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Write rich, detailed entries with multimedia support</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>Mood Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Track emotions and discover patterns in your wellbeing</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Insights & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Get personalized insights about your mental health journey</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Private & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your thoughts are encrypted and completely private</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;