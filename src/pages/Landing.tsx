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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Vibe<span className="text-purple-600">Journal</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Transform your daily thoughts into meaningful insights. Track your mood, 
            reflect on your day, and build better habits with our intelligent journaling platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 w-full sm:w-auto"
            >
              Start Journaling Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/vibe-journal')}
              className="w-full sm:w-auto"
            >
              Try Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
          <Card className="text-center">
            <CardHeader className="pb-3">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Daily Journaling</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm sm:text-base text-gray-600">Write rich, detailed entries with multimedia support</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Mood Tracking</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm sm:text-base text-gray-600">Track emotions and discover patterns in your wellbeing</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Insights & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm sm:text-base text-gray-600">Get personalized insights about your mental health journey</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Private & Secure</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm sm:text-base text-gray-600">Your thoughts are encrypted and completely private</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;