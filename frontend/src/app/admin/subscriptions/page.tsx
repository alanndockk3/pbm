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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Email Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and view email subscriptions from your coming-soon modal
          </p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coming Soon Modal</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comingSoon}</div>
            <p className="text-xs text-muted-foreground">
              From coming-soon modal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
            <p className="text-xs text-muted-foreground">
              New subscriptions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Sources
            </Button>
            <Button
              variant={filter === 'coming-soon-modal' ? 'default' : 'outline'}
              onClick={() => setFilter('coming-soon-modal')}
            >
              Coming Soon Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>
            {filter === 'all' ? 'All email subscriptions' : 'Subscriptions from coming-soon modal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No subscriptions found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {subscription.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {subscription.source}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {subscription.subscribedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
