import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Phone, Mail, Users, FileText, Calendar, Building2, User } from 'lucide-react';

interface Activity {
  id: number;
  company_id?: number;
  contact_id?: number;
  type: string;
  subject: string;
  notes?: string;
  activity_date: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  company_id?: number;
}

export const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  const [newActivity, setNewActivity] = useState({
    type: 'note',
    subject: '',
    notes: '',
    activity_date: new Date().toISOString().split('T')[0],
    company_id: '',
    contact_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activitiesData, companiesData, contactsData] = await Promise.all([
        window.api.activities.getAll(),
        window.api.companies.getAll(),
        window.api.contacts.getAll(),
      ]);
      
      setActivities(activitiesData.sort((a: Activity, b: Activity) => 
        new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
      ));
      setCompanies(companiesData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newActivity.subject.trim()) return;
    
    try {
      await window.api.activities.create({
        ...newActivity,
        company_id: newActivity.company_id ? parseInt(newActivity.company_id) : null,
        contact_id: newActivity.contact_id ? parseInt(newActivity.contact_id) : null,
      });
      setIsDialogOpen(false);
      setNewActivity({
        type: 'note',
        subject: '',
        notes: '',
        activity_date: new Date().toISOString().split('T')[0],
        company_id: '',
        contact_id: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="w-5 h-5" />;
      case 'call': return <Phone className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'note': return <FileText className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'call': return 'bg-green-100 text-green-600 border-green-200';
      case 'email': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'note': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'meeting': return 'Toplantı';
      case 'call': return 'Arama';
      case 'email': return 'E-posta';
      case 'note': return 'Not';
      default: return type;
    }
  };

  const getCompanyName = (companyId?: number) => {
    if (!companyId) return null;
    const company = companies.find(c => c.id === companyId);
    return company?.name;
  };

  const getContactName = (contactId?: number) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups: Record<string, Activity[]>, activity) => {
    const date = activity.activity_date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

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
          <h1 className="text-3xl font-bold">Aktiviteler</h1>
          <p className="text-gray-500">Tüm aktivitelerin zaman çizelgesi</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Aktivite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Aktivite Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Tip</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                >
                  <option value="note">Not</option>
                  <option value="call">Arama</option>
                  <option value="email">E-posta</option>
                  <option value="meeting">Toplantı</option>
                </select>
              </div>
              <div>
                <Label>Konu *</Label>
                <Input
                  value={newActivity.subject}
                  onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
                  placeholder="Aktivite konusu"
                />
              </div>
              <div>
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={newActivity.activity_date}
                  onChange={(e) => setNewActivity({ ...newActivity, activity_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Firma</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newActivity.company_id}
                  onChange={(e) => setNewActivity({ ...newActivity, company_id: e.target.value })}
                >
                  <option value="">Firma Seçin (Opsiyonel)</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Kişi</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newActivity.contact_id}
                  onChange={(e) => setNewActivity({ ...newActivity, contact_id: e.target.value })}
                >
                  <option value="">Kişi Seçin (Opsiyonel)</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Notlar</Label>
                <Textarea
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  placeholder="Detaylı notlar..."
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Aktivite Ekle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tümü
        </Button>
        <Button 
          variant={filter === 'meeting' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('meeting')}
        >
          Toplantılar
        </Button>
        <Button 
          variant={filter === 'call' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('call')}
        >
          Aramalar
        </Button>
        <Button 
          variant={filter === 'email' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('email')}
        >
          E-postalar
        </Button>
        <Button 
          variant={filter === 'note' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('note')}
        >
          Notlar
        </Button>
      </div>

      {/* Timeline */}
      {Object.keys(groupedActivities).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz aktivite yok</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              İlk Aktiviteyi Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">{formatDate(date)}</h3>
              <div className="space-y-3">
                {dayActivities.map((activity) => (
                  <Card key={activity.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getActivityColor(activity.type)}`}>
                              {getActivityLabel(activity.type)}
                            </span>
                            {getCompanyName(activity.company_id) && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {getCompanyName(activity.company_id)}
                              </span>
                            )}
                            {getContactName(activity.contact_id) && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {getContactName(activity.contact_id)}
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium">{activity.subject}</h4>
                          {activity.notes && (
                            <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
