'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, Users, Calendar, Filter } from "lucide-react";
import { getActiveSubscriptions, EmailSubscription } from "../../../../data/emailSubscriptionService";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'coming-soon-modal'>('all');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getActiveSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    filter === 'all' || sub.source === filter
  );

  const exportToCSV = () => {
    const headers = ['Email', 'Source', 'Subscribed At', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredSubscriptions.map(sub => [
        sub.email,
        sub.source,
        sub.subscribedAt?.toDate?.()?.toLocaleDateString() || 'N/A',
        sub.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  const stats = {
    total: subscriptions.length,
    comingSoon: subscriptions.filter(s => s.source === 'coming-soon-modal').length,
    recent: subscriptions.filter(s => {
      const date = s.subscribedAt?.toDate?.();
      return date && date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <p className="text-rose-700 dark:text-rose-300">Loading Email Subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                Email Subscriptions
              </h1>
              <p className="text-rose-600 dark:text-rose-400">
                Manage and view email subscriptions from your coming-soon modal
              </p>
            </div>
            <Button 
              onClick={exportToCSV} 
              className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>



          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Subscriptions</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Coming Soon Modal</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.comingSoon}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Recent (7 days)</p>
                    <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.recent}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-none ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white' 
                    : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'
                }`}
              >
                All Sources
              </Button>
              <Button
                variant={filter === 'coming-soon-modal' ? 'default' : 'outline'}
                onClick={() => setFilter('coming-soon-modal')}
                className={`flex-1 sm:flex-none ${
                  filter === 'coming-soon-modal' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white' 
                    : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300'
                }`}
              >
                Coming Soon Modal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions List */}
        <section className="pb-12">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Subscriptions ({filteredSubscriptions.length})</CardTitle>
              <CardDescription className="text-rose-600 dark:text-rose-400">
                {filter === 'all' ? 'All email subscriptions' : 'Subscriptions from coming-soon modal'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSubscriptions.length === 0 ? (
                <div className="text-center py-8 text-rose-500 dark:text-rose-400">
                  No subscriptions found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border border-rose-200 dark:border-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {subscription.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                              {subscription.source}
                            </Badge>
                            <span className="text-xs text-rose-500 dark:text-rose-400">
                              {subscription.subscribedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={subscription.status === 'active' ? 'default' : 'secondary'}
                        className={`${
                          subscription.status === 'active' 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        }`}
                      >
                        {subscription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
