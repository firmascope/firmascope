import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Building2, Users, FolderOpen, FileText, Activity, Plus, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  companiesCount: number;
  contactsCount: number;
  projectsCount: number;
  documentsCount: number;
}

interface RecentActivity {
  id: number;
  type: string;
  subject: string;
  notes: string;
  activity_date: string;
  company_name?: string;
  contact_name?: string;
}

interface RecentCompany {
  id: number;
  name: string;
  sector: string;
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    companiesCount: 0,
    contactsCount: 0,
    projectsCount: 0,
    documentsCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<RecentCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load counts
      const [companies, contacts, projects, documents, activities] = await Promise.all([
        window.api.companies.getAll(),
        window.api.contacts.getAll(),
        window.api.projects.getAll(),
        window.api.documents.getAll(),
        window.api.activities.getAll(),
      ]);

      setStats({
        companiesCount: companies.length,
        contactsCount: contacts.length,
        projectsCount: projects.length,
        documentsCount: documents.length,
      });

      // Get recent activities (last 5)
      const sortedActivities = activities
        .sort((a: any, b: any) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
        .slice(0, 5);
      setRecentActivities(sortedActivities);

      // Get recent companies (last 5)
      const sortedCompanies = companies
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentCompanies(sortedCompanies);
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Firmalar', value: stats.companiesCount, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100', path: '/companies' },
    { title: 'Kişiler', value: stats.contactsCount, icon: Users, color: 'text-green-600', bg: 'bg-green-100', path: '/contacts' },
    { title: 'Projeler', value: stats.projectsCount, icon: FolderOpen, color: 'text-purple-600', bg: 'bg-purple-100', path: '/projects' },
    { title: 'Dökümanlar', value: stats.documentsCount, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', path: '/documents' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '🤝';
      case 'call': return '📞';
      case 'email': return '📧';
      case 'note': return '📝';
      default: return '📌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">FirmaScope'a hoş geldiniz</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/companies')} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Firma
          </Button>
          <Button onClick={() => navigate('/contacts')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kişi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(stat.path)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Son Aktiviteler
              </CardTitle>
              <CardDescription>Son eklenen aktiviteler</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/activities')}>
              Tümü <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz aktivite yok</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{activity.subject}</p>
                      <p className="text-sm text-gray-500 truncate">{activity.notes}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{formatDate(activity.activity_date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Son Eklenen Firmalar
              </CardTitle>
              <CardDescription>Yeni eklenen firmalar</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
              Tümü <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentCompanies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz firma yok</p>
            ) : (
              <div className="space-y-3">
                {recentCompanies.map((company) => (
                  <div 
                    key={company.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.sector || 'Sektör belirtilmemiş'}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(company.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/companies')}>
              <Building2 className="w-6 h-6" />
              <span>Firma Ekle</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/contacts')}>
              <Users className="w-6 h-6" />
              <span>Kişi Ekle</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/projects')}>
              <FolderOpen className="w-6 h-6" />
              <span>Proje Ekle</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/documents')}>
              <FileText className="w-6 h-6" />
              <span>Döküman Ekle</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
