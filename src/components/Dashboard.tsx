import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  BarChart, 
  Calendar, 
  CheckCircle, 
  HelpCircle,
  Bell,
  Users
} from 'lucide-react';

const Dashboard = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary">Dashboard</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Track Your Progress</h2>
          <p className="text-muted-foreground">
            Monitor your learning journey, manage assignments, and stay on top of your studies with our intuitive dashboard.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Dashboard Preview */}
          <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-background p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-primary">LearnMate</span>
                <div className="hidden md:flex space-x-4">
                  <Button variant="ghost" size="sm">Home</Button>
                  <Button variant="ghost" size="sm">Courses</Button>
                  <Button variant="ghost" size="sm">Study Groups</Button>
                  <Button variant="ghost" size="sm">Resources</Button>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="icon" className="relative">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
                </Button>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">JS</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Welcome back, Jamie</h2>
                <Button size="sm">
                  <Calendar size={16} className="mr-2" /> 
                  September 2023
                </Button>
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                      <Clock size={16} className="mr-2" /> 
                      Study Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12.5 hrs</div>
                    <p className="text-xs text-muted-foreground">+2.7 hrs from last week</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                      <CheckCircle size={16} className="mr-2" /> 
                      Completed Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24/30</div>
                    <p className="text-xs text-muted-foreground">80% completion rate</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                      <BarChart size={16} className="mr-2" /> 
                      Quiz Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">+5% from last quiz</p>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Assignments */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                          <BookOpen size={18} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Physics Problem Set</h4>
                          <p className="text-xs text-muted-foreground">Due in 2 days</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Start</Button>
                    </div>
                    
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                          <BookOpen size={18} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">History Essay</h4>
                          <p className="text-xs text-muted-foreground">Due in 5 days</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Start</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                          <BookOpen size={18} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Math Quiz Preparation</h4>
                          <p className="text-xs text-muted-foreground">Due in 1 week</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Start</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-auto py-4 flex items-center justify-center">
                  <div>
                    <HelpCircle size={24} className="mx-auto mb-2" />
                    <span>Ask AI Assistant</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex items-center justify-center">
                  <div>
                    <Users size={24} className="mx-auto mb-2" />
                    <span>Join Study Group</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl -z-10"></div>
          <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl -z-10 dark:bg-blue-900/20"></div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
